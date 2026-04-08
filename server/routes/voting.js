/**
 * Voting Routes — Phase 2
 * Election-scoped vote casting, notifications, active election endpoint
 */

import express from 'express';
import { authenticateToken } from './auth.js';
import { verifyFingerprint } from '../utils/biometric.js';
import {
    castVote as blockchainCastVote,
    checkIfVoted,
    hashRollNumber,
} from '../utils/blockchain.js';
import {
    getStudentByRollNumber,
    getStudentByVoterHash,
    getActiveElection,
    getCandidatesByElection,
    getCandidateById,
    recordVote,
    hasStudentVoted,
    incrementCandidateVoteCount,
    getStudentNotifications,
    markNotificationRead,
    getUnreadNotificationCount,
    addAuditLog,
} from '../utils/supabaseClient.js';

const router = express.Router();

// ─── ACTIVE ELECTION ──────────────────────────────────────────

/**
 * GET /api/voting/active-election
 * Returns current active election with dynamic candidate list
 * No auth required (booths and voter portal both use this)
 */
router.get('/active-election', async (req, res) => {
    try {
        const election = await getActiveElection();

        if (!election) {
            return res.json({ success: true, election: null, candidates: [] });
        }

        const candidates = await getCandidatesByElection(election.id);

        const candidateList = candidates.map(c => ({
            id: c.id,
            serialNo: c.serial_no,
            name: `${c.students.first_name} ${c.students.last_name}`,
            firstName: c.students.first_name,
            lastName: c.students.last_name,
            department: c.students.department,
            year: c.students.year,
            imageUrl: c.students.image_url || 'https://via.placeholder.com/150',
            voteCount: c.vote_count,
        }));

        res.json({
            success: true,
            election: {
                id: election.id,
                blockchainElectionId: election.blockchain_election_id,
                type: election.election_type,
                department: election.department || null,
                year: election.year || null,
                status: election.status,
                endsAt: election.ends_at,
            },
            candidates: candidateList,
        });
    } catch (error) {
        console.error('❌ Get active election error:', error);
        res.status(500).json({ error: 'Failed to get active election', message: error.message });
    }
});

// ─── VOTER PROFILE ────────────────────────────────────────────

/**
 * GET /api/voting/voter/:rollNumber
 * Get student profile, booth info, voted elections
 */
router.get('/voter/:rollNumber', async (req, res) => {
    try {
        const { rollNumber } = req.params;
        const student = await getStudentByRollNumber(rollNumber.toUpperCase());

        if (!student) {
            return res.status(404).json({ error: 'Voter not found' });
        }

        // Get unread notification count
        const unreadCount = await getUnreadNotificationCount(student.id);

        res.json({
            success: true,
            voter: {
                id: student.id,
                name: {
                    first: student.first_name,
                    middle: student.middle_name,
                    last: student.last_name,
                },
                fullName: `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.trim(),
                rollNumber: student.roll_number,
                phone: student.phone,
                department: student.department,
                year: student.year,
                imageUrl: student.image_url,
                boothId: student.booth_id,
                boothName: student.booths?.name,
                boothAddress: student.booths?.address,
                registeredAt: student.created_at,
            },
            unreadNotifications: unreadCount,
        });
    } catch (error) {
        console.error('❌ Get voter error:', error);
        res.status(500).json({ error: 'Failed to get voter', message: error.message });
    }
});

// ─── VOTE CASTING ─────────────────────────────────────────────

/**
 * POST /api/voting/cast
 * Cast a vote in the active election
 * Body: { electionId, candidateId, voterHash, fingerprintTemplate }
 */
router.post('/cast', async (req, res) => {
    try {
        const { electionId, candidateId, voterHash, fingerprintTemplate } = req.body;

        if (!electionId || !candidateId || !voterHash) {
            return res.status(400).json({
                error: 'Missing required fields: electionId, candidateId, voterHash',
            });
        }

        // Verify election is still active
        const election = await getActiveElection();
        if (!election || election.id !== electionId) {
            return res.status(409).json({ error: 'No active election matching the provided ID' });
        }

        // Find student by voterHash
        const student = await getStudentByVoterHash(voterHash);
        if (!student) {
            return res.status(404).json({ error: 'Voter not found' });
        }

        // DR/CR scoping checks
        if (election.election_type === 'DR') {
            if (student.department !== election.department) {
                return res.status(403).json({
                    error: `This is a ${election.department} department election. You are registered in ${student.department}.`,
                });
            }
        }
        if (election.election_type === 'CR') {
            if (student.department !== election.department) {
                return res.status(403).json({
                    error: `This election is for ${election.department} department only.`,
                });
            }
            if (String(student.year) !== String(election.year)) {
                return res.status(403).json({
                    error: `This election is for Year ${election.year} only. You are in Year ${student.year}.`,
                });
            }
        }

        // Check double-vote in DB
        const alreadyVotedDB = await hasStudentVoted(electionId, student.id);
        if (alreadyVotedDB) {
            return res.status(403).json({ error: 'You have already voted in this election' });
        }

        // Check double-vote on blockchain
        try {
            const alreadyVotedChain = await checkIfVoted(election.blockchain_election_id, voterHash);
            if (alreadyVotedChain) {
                return res.status(403).json({ error: 'Vote already recorded on blockchain' });
            }
        } catch (chainErr) {
            console.warn('⚠️ Blockchain double-vote check failed (continuing):', chainErr.message);
        }

        // Get candidate details
        const candidate = await getCandidateById(candidateId);
        if (!candidate || candidate.election_id !== electionId) {
            return res.status(400).json({ error: 'Invalid candidate for this election' });
        }

        // Verify fingerprint (if provided and required)
        const fingerprintRequired = process.env.FINGERPRINT_REQUIRED === 'true';
        if (fingerprintRequired && student.fingerprint_id) {
            if (!fingerprintTemplate) {
                return res.status(400).json({ error: 'Fingerprint required' });
            }
            const verification = await verifyFingerprint(student.fingerprint_id, fingerprintTemplate);
            if (!verification.verified) {
                return res.status(401).json({ error: 'Fingerprint verification failed', score: verification.score });
            }
        }

        // Cast vote on blockchain
        let txResult = { transactionHash: `DEV_${Date.now()}`, blockNumber: 0 };
        try {
            txResult = await blockchainCastVote(
                election.blockchain_election_id,
                voterHash,
                candidate.serial_no
            );
        } catch (chainErr) {
            console.warn('⚠️ Blockchain castVote failed (dev mode, continuing):', chainErr.message);
        }

        // Record vote in DB
        await recordVote({
            election_id: electionId,
            student_id: student.id,
            candidate_id: candidateId,
            tx_hash: txResult.transactionHash,
            block_number: txResult.blockNumber,
        });

        // Increment candidate vote count in DB
        await incrementCandidateVoteCount(candidateId);

        // Emit live vote update to admin panel
        const io = req.app.get('io');
        if (io) {
            io.emit('live_vote_update', {
                electionId,
                candidateId,
                studentDept: student.department,
            });
        }

        // Audit log
        await addAuditLog({
            event_type: 'VOTE_CAST',
            student_id: student.id,
            election_id: electionId,
            details: {
                candidateId,
                txHash: txResult.transactionHash,
                blockNumber: txResult.blockNumber,
            },
        }).catch(err => console.warn('Audit log failed:', err.message));

        console.log(`✅ Vote cast: ${student.roll_number} → candidate ${candidate.serial_no} (${election.election_type})`);

        res.json({
            success: true,
            message: 'Vote cast successfully',
            transactionHash: txResult.transactionHash,
            blockNumber: txResult.blockNumber,
        });
    } catch (error) {
        console.error('❌ Vote casting error:', error);
        res.status(500).json({ error: 'Failed to cast vote', message: error.message });
    }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────

/**
 * GET /api/voting/notifications/:studentId
 * Returns all notifications for a student
 */
router.get('/notifications/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { unreadOnly } = req.query;

        const notifications = await getStudentNotifications(studentId, {
            unreadOnly: unreadOnly === 'true',
        });

        res.json({ success: true, notifications });
    } catch (error) {
        console.error('❌ Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications', message: error.message });
    }
});

/**
 * PATCH /api/voting/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        const notification = await markNotificationRead(req.params.id);
        res.json({ success: true, notification });
    } catch (error) {
        console.error('❌ Mark notification read error:', error);
        res.status(500).json({ error: 'Failed to mark notification', message: error.message });
    }
});

// ─── BOOTHS (kept for Phase 1 compat) ─────────────────────────

router.get('/booths', async (req, res) => {
    try {
        const { getBooths } = await import('../utils/supabaseClient.js');
        const booths = await getBooths();
        res.json({ success: true, booths });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch booths', message: error.message });
    }
});

export default router;
