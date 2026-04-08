/**
 * Officer / BLO Routes — Phase 2
 * Dept-scope validation, roll-number voter search, audit logs scoped to BLO's booth
 */

import express from 'express';
import { authenticateToken } from './auth.js';
import {
    getStudentByRollNumber,
    getBLOById,
    getActiveElection,
    hasStudentVoted,
    addAuditLog,
    getAuditLogs,
} from '../utils/supabaseClient.js';
import { getFlag } from '../utils/flagsManager.js';

const router = express.Router();

// ─── VOTER SEARCH ─────────────────────────────────────────────

/**
 * GET /api/officer/search-voter?rollNumber=...
 * Search voter by roll number. Validates dept match with BLO's assigned booth.
 */
router.get('/search-voter', authenticateToken, async (req, res) => {
    try {
        const { rollNumber } = req.query;
        if (!rollNumber) {
            return res.status(400).json({ error: 'rollNumber query parameter required' });
        }

        const student = await getStudentByRollNumber(rollNumber.toUpperCase());
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get BLO's department scope from JWT
        const bloDepart = req.user.department;

        // If BLO has a department (i.e., not admin), check dept match
        if (bloDepart && student.department !== bloDepart) {
            const correctBooth = student.booths;
            return res.status(403).json({
                error: `This student belongs to ${student.department} department.`,
                redirectMessage: `Please direct them to ${student.department} Booth${correctBooth ? ': ' + correctBooth.address : ''}.`,
                studentDepartment: student.department,
                correctBoothAddress: correctBooth?.address || null,
            });
        }

        res.json({
            success: true,
            voter: {
                id: student.id,
                fullName: `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.trim(),
                rollNumber: student.roll_number,
                department: student.department,
                year: student.year,
                imageUrl: student.image_url,
                boothId: student.booth_id,
                boothAddress: student.booths?.address,
                voterHash: student.voter_hash,
            },
        });
    } catch (error) {
        console.error('❌ Search voter error:', error);
        res.status(500).json({ error: 'Failed to search voter', message: error.message });
    }
});

// ─── UNLOCK BOOTH ─────────────────────────────────────────────

/**
 * POST /api/officer/unlock-booth
 * Unlock booth for a verified student. Validates:
 * 1. Student dept matches BLO's booth dept
 * 2. Active election scope allows this booth
 * 3. Booth is connected
 */
router.post('/unlock-booth', authenticateToken, async (req, res) => {
    try {
        const {
            boothId,
            voterRollNumber,
            voterName,
            voterPhoto,
            voterHash,
        } = req.body;

        if (!boothId || !voterRollNumber) {
            return res.status(400).json({ error: 'boothId and voterRollNumber required' });
        }

        const io = req.app.get('io');
        const activeBooths = req.app.get('activeBooths');

        // Validate booth is connected
        if (!activeBooths.has(boothId)) {
            return res.status(404).json({
                error: `Booth ${boothId} is not currently connected`,
                availableBooths: Array.from(activeBooths.keys()),
            });
        }

        const student = await getStudentByRollNumber(voterRollNumber.toUpperCase());
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // ── ALREADY VOTED CHECK (block at BLO side, not booth side) ──
        const activeElection = await getActiveElection();
        if (activeElection) {
            const alreadyVoted = await hasStudentVoted(activeElection.id, student.id);
            if (alreadyVoted) {
                await addAuditLog({
                    event_type: 'ALREADY_VOTED_BLOCKED',
                    blo_id: req.user.userId,
                    booth_id: boothId,
                    student_id: student.id,
                    election_id: activeElection.id,
                    details: { reason: 'BLO tried to unlock booth for already-voted student' },
                }).catch(() => {});
                return res.status(403).json({
                    error: `❌ ${student.first_name} ${student.last_name} (${student.roll_number}) has already voted in this election.`,
                    alreadyVoted: true,
                });
            }
        }
        const bloDepart = req.user.department;
        if (bloDepart && student.department !== bloDepart) {
            await addAuditLog({
                event_type: 'DEPT_MISMATCH',
                blo_id: req.user.userId,
                booth_id: boothId,
                student_id: student.id,
                details: {
                    studentDept: student.department,
                    bloDept: bloDepart,
                    reason: 'Department mismatch — unlock blocked',
                },
            }).catch(() => {});

            return res.status(403).json({
                error: `Student belongs to ${student.department} department, not ${bloDepart}.`,
                redirectMessage: `Direct student to ${student.department} Booth at: ${student.booths?.address || 'their department booth'}`,
            });
        }

        // Active election scope validation (activeElection already fetched in vote-check above)
        if (activeElection) {
            // DR: only the specific dept booth can be unlocked
            if (activeElection.election_type === 'DR' && activeElection.department) {
                if (student.department !== activeElection.department) {
                    return res.status(403).json({
                        error: `Current election is for ${activeElection.department} department only. This student is not eligible to vote.`,
                    });
                }
            }
            // CR: dept + year check
            if (activeElection.election_type === 'CR') {
                if (student.department !== activeElection.department) {
                    return res.status(403).json({
                        error: `Current election is for ${activeElection.department} department only.`,
                    });
                }
                if (String(student.year) !== String(activeElection.year)) {
                    return res.status(403).json({
                        error: `Current election is for Year ${activeElection.year} only. Student is in Year ${student.year}.`,
                    });
                }
            }
        }

        // Get active election candidates for the booth
        let candidateList = [];
        if (activeElection) {
            const candidates = await (await import('../utils/supabaseClient.js')).getCandidatesByElection(activeElection.id);
            candidateList = candidates.map(c => ({
                id: c.id,
                serialNo: c.serial_no,
                name: `${c.students.first_name} ${c.students.last_name}`,
                department: c.students.department,
                year: c.students.year,
                imageUrl: c.students.image_url,
            }));
        }

        // Emit allow_vote to booth
        const eventData = {
            voterRollNumber: student.roll_number,
            voterHash: student.voter_hash,
            voterName: voterName || `${student.first_name} ${student.last_name}`,
            voterPhoto: voterPhoto || student.image_url || '',
            voterDept: student.department,
            voterYear: student.year,
            authorizedBy: req.user.userId,
            authorizedAt: new Date().toISOString(),
            electionId: activeElection?.id || null,
            blockchainElectionId: activeElection?.blockchain_election_id || null,
            electionType: activeElection?.election_type || null,
            candidates: candidateList,
            // Auth mode: booth uses this to decide fingerprint vs PIN confirmation
            biometricMode: await getFlag('biometric_mode'),
        };

        io.to(`booth_${boothId}`).emit('allow_vote', eventData);

        // Audit log
        await addAuditLog({
            event_type: 'UNLOCK_BOOTH',
            blo_id: req.user.userId,
            booth_id: boothId,
            student_id: student.id,
            election_id: activeElection?.id || null,
            details: { status: 'success', voterRollNumber },
        }).catch(() => {});

        // Update booth status in-memory
        const boothInfo = activeBooths.get(boothId);
        boothInfo.status = 'active';
        boothInfo.lastUnlocked = new Date();
        activeBooths.set(boothId, boothInfo);

        console.log(`🔓 Booth ${boothId} unlocked for: ${student.roll_number}`);

        res.json({
            success: true,
            message: `Booth ${boothId} unlocked for ${student.roll_number}`,
            boothId,
            voterRollNumber: student.roll_number,
        });
    } catch (error) {
        console.error('❌ Unlock booth error:', error);
        await addAuditLog({
            event_type: 'UNLOCK_BOOTH',
            booth_id: req.body.boothId,
            details: { status: 'failed', error: error.message },
        }).catch(() => {});

        res.status(500).json({ error: 'Failed to unlock booth', message: error.message });
    }
});

// ─── RESET BOOTH ──────────────────────────────────────────────

/**
 * POST /api/officer/reset-booth
 * Reset a booth to idle state
 */
router.post('/reset-booth', authenticateToken, (req, res) => {
    try {
        const { boothId } = req.body;
        if (!boothId) return res.status(400).json({ error: 'boothId required' });

        const io = req.app.get('io');
        const activeBooths = req.app.get('activeBooths');

        if (!activeBooths.has(boothId)) {
            return res.status(404).json({ error: `Booth ${boothId} is not connected` });
        }

        io.to(`booth_${boothId}`).emit('reset_booth', {
            message: 'Booth reset by BLO',
            resetBy: req.user.userId,
        });

        const boothInfo = activeBooths.get(boothId);
        boothInfo.status = 'idle';
        activeBooths.set(boothId, boothInfo);

        addAuditLog({
            event_type: 'RESET_BOOTH',
            blo_id: req.user.userId,
            booth_id: boothId,
            details: { status: 'success' },
        }).catch(() => {});

        console.log(`🔄 Booth ${boothId} reset to idle`);
        res.json({ success: true, message: `Booth ${boothId} reset successfully` });
    } catch (error) {
        console.error('❌ Reset booth error:', error);
        res.status(500).json({ error: 'Failed to reset booth', message: error.message });
    }
});

// ─── AUDIT LOGS ───────────────────────────────────────────────

/**
 * GET /api/officer/audit-logs
 * Audit logs scoped to BLO's assigned booth
 */
router.get('/audit-logs', authenticateToken, async (req, res) => {
    try {
        // Scope logs to BLO's assigned booth
        const boothId = req.user.boothId || req.query.boothId;
        const logs = await getAuditLogs({ boothId, limit: 100 });

        res.json({ success: true, count: logs.length, logs });
    } catch (error) {
        console.error('❌ Audit logs error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs', message: error.message });
    }
});

// Stats endpoint (kept for backward compat)
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const activeBooths = req.app.get('activeBooths');
        const boothId = req.user.boothId;
        const logs = await getAuditLogs({ boothId, limit: 500 });

        const stats = {
            totalUnlocks: logs.filter(l => l.event_type === 'UNLOCK_BOOTH').length,
            successfulUnlocks: logs.filter(l => l.event_type === 'UNLOCK_BOOTH' && l.details?.status === 'success').length,
            failedUnlocks: logs.filter(l => l.event_type === 'UNLOCK_BOOTH' && l.details?.status === 'failed').length,
            activeBooths: activeBooths.size,
        };

        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
    }
});

export default router;
