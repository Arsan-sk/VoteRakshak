/**
 * Admin Routes — Phase 2 (New File)
 * All election management, student data, and BLO admin operations
 * Protected by adminAuth middleware
 */

import express from 'express';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import {
    getAllStudents,
    getStudentByRollNumber,
    isStudentCurrentlyElected,
    getAllBLOs,
    getBLOById,
    reassignBLO,
    createElection,
    getActiveElection,
    getElectionById,
    getAllElections,
    updateElectionStatus,
    setElectionWinner,
    addCandidate,
    getCandidatesByElection,
    recordVote,
    getVotesByElection,
    createNotifications,
    recordElectedPosition,
    getDashboardStats,
    getBoothByDept,
    getBooths,
} from '../utils/supabaseClient.js';
import {
    openElection,
    closeElection,
    getVoteCount,
    generateElectionId,
} from '../utils/blockchain.js';
import { getAllFlags, refreshFlags } from '../utils/flagsManager.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const _supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
);

const router = express.Router();

// All admin routes require admin JWT
router.use(authenticateAdmin);

// ─── DASHBOARD ────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard/stats
 * System stats: total students, active election, booths online
 */
router.get('/dashboard/stats', async (req, res) => {
    try {
        const activeBooths = req.app.get('activeBooths');
        const stats = await getDashboardStats();
        stats.onlineBoothsWS = activeBooths ? activeBooths.size : 0;
        res.json({ success: true, stats });
    } catch (error) {
        console.error('❌ Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to get stats', message: error.message });
    }
});

// ─── STUDENTS ─────────────────────────────────────────────────

/**
 * GET /api/admin/students
 * All students with filters: dept, year, search (roll number)
 */
router.get('/students', async (req, res) => {
    try {
        const { dept, year, search, limit = 50, offset = 0 } = req.query;
        const { students, total } = await getAllStudents({
            dept,
            year,
            search,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.json({ success: true, students, total });
    } catch (error) {
        console.error('❌ Get students error:', error);
        res.status(500).json({ error: 'Failed to get students', message: error.message });
    }
});

/**
 * GET /api/admin/students/search
 * Search students by roll number for candidate nomination.
 * Scoped by election type (ER=all, DR=dept, CR=dept+year).
 * Also blocks students currently holding an elected position.
 */
router.get('/students/search', async (req, res) => {
    try {
        const { q, electionType, dept, year } = req.query;

        if (!q) return res.status(400).json({ error: 'Search query required' });

        let filters = { search: q, limit: 20 };
        if (electionType === 'DR' && dept) filters.dept = dept;
        if (electionType === 'CR') {
            if (dept) filters.dept = dept;
            if (year) filters.year = year;
        }

        const { students } = await getAllStudents(filters);

        // Annotate each student with election eligibility
        const annotated = await Promise.all(
            students.map(async (s) => {
                const isElected = await isStudentCurrentlyElected(s.id);
                return { ...s, isCurrentlyElected: isElected, canBeNominated: !isElected };
            })
        );

        res.json({ success: true, students: annotated });
    } catch (error) {
        console.error('❌ Student search error:', error);
        res.status(500).json({ error: 'Failed to search students', message: error.message });
    }
});

// ─── BLOS ─────────────────────────────────────────────────────

/**
 * GET /api/admin/blos
 * List all BLOs with their assigned booth info
 */
router.get('/blos', async (req, res) => {
    try {
        const blos = await getAllBLOs();
        // Strip password hashes from response
        const safe = blos.map(({ password_hash, ...rest }) => rest);
        res.json({ success: true, blos: safe });
    } catch (error) {
        console.error('❌ Get BLOs error:', error);
        res.status(500).json({ error: 'Failed to get BLOs', message: error.message });
    }
});

/**
 * PATCH /api/admin/blos/:id/assign-booth
 * Reassign a BLO to a different booth.
 * BLOCKED if any election is currently active.
 */
router.patch('/blos/:id/assign-booth', async (req, res) => {
    try {
        const { id } = req.params;
        const { boothId } = req.body;

        if (!boothId) return res.status(400).json({ error: 'boothId required' });

        // Block reassignment during active election
        const activeElection = await getActiveElection();
        if (activeElection) {
            return res.status(409).json({
                error: 'BLO reassignment is blocked while an election is active',
                activeElectionId: activeElection.id,
            });
        }

        const updated = await reassignBLO(id, boothId);
        res.json({ success: true, blo: updated });
    } catch (error) {
        console.error('❌ BLO reassign error:', error);
        res.status(500).json({ error: 'Failed to reassign BLO', message: error.message });
    }
});

// ─── ELECTIONS ────────────────────────────────────────────────

/**
 * GET /api/admin/elections
 * List all elections with status
 */
router.get('/elections', async (req, res) => {
    try {
        const elections = await getAllElections();
        res.json({ success: true, elections });
    } catch (error) {
        console.error('❌ Get elections error:', error);
        res.status(500).json({ error: 'Failed to get elections', message: error.message });
    }
});

/**
 * GET /api/admin/elections/:id
 * Full election detail: candidates, live vote counts
 */
router.get('/elections/:id', async (req, res) => {
    try {
        const election = await getElectionById(req.params.id);
        if (!election) return res.status(404).json({ error: 'Election not found' });

        const candidates = await getCandidatesByElection(election.id);
        res.json({ success: true, election, candidates });
    } catch (error) {
        console.error('❌ Get election detail error:', error);
        res.status(500).json({ error: 'Failed to get election', message: error.message });
    }
});

/**
 * POST /api/admin/elections/initiate
 * Initiate a new election (ER / DR / CR) with candidates and end date.
 *
 * Body: {
 *   electionType: 'ER' | 'DR' | 'CR',
 *   department?: string,   // required for DR and CR
 *   year?: string,         // required for CR
 *   candidates: [{ studentId, serialNo }],  // up to 10
 *   endsAt: ISO date string
 * }
 */
router.post('/elections/initiate', async (req, res) => {
    try {
        const { electionType, department, year, candidates: candidateList, endsAt } = req.body;

        if (!electionType || !endsAt || !candidateList?.length) {
            return res.status(400).json({ error: 'electionType, endsAt, and candidates are required' });
        }
        if (!['ER', 'DR', 'CR'].includes(electionType)) {
            return res.status(400).json({ error: 'electionType must be ER, DR, or CR' });
        }
        if (electionType === 'DR' && !department) {
            return res.status(400).json({ error: 'department required for DR election' });
        }
        if (electionType === 'CR' && (!department || !year)) {
            return res.status(400).json({ error: 'department and year required for CR election' });
        }
        if (candidateList.length > 10) {
            return res.status(400).json({ error: 'Maximum 10 candidates allowed' });
        }

        // Check no active election
        const activeElection = await getActiveElection();
        if (activeElection) {
            return res.status(409).json({
                error: 'An election is already active. End it before starting a new one.',
                activeElectionId: activeElection.id,
            });
        }

        // Validate all candidates are eligible (not currently elected)
        for (const c of candidateList) {
            const isElected = await isStudentCurrentlyElected(c.studentId);
            if (isElected) {
                return res.status(400).json({
                    error: `Student ${c.studentId} currently holds an elected position and cannot be nominated`,
                });
            }
        }

        const now = new Date();

        // Create election record
        const electionData = {
            election_type: electionType,
            department: department || null,
            year: year ? String(year) : null,
            status: 'active',
            started_at: now.toISOString(),
            ends_at: new Date(endsAt).toISOString(),
            created_by: req.admin.username,
        };

        const election = await createElection(electionData);

        // Generate blockchain election ID
        const blockchainElectionId = generateElectionId(election.id);

        // Update with blockchain ID
        await updateElectionStatus(election.id, 'active', {
            blockchain_election_id: blockchainElectionId,
        });

        // Add candidates to DB
        const addedCandidates = [];
        for (const c of candidateList) {
            const added = await addCandidate({
                election_id: election.id,
                student_id: c.studentId,
                serial_no: c.serialNo,
            });
            addedCandidates.push(added);
        }

        // Open election on blockchain
        try {
            await openElection(blockchainElectionId);
            console.log(`🔗 Election opened on blockchain: ${blockchainElectionId}`);
        } catch (chainErr) {
            console.warn('⚠️ Blockchain openElection failed (continuing):', chainErr.message);
        }

        // Build notification payload for eligible students
        const candidatesForNotif = await getCandidatesByElection(election.id);
        const candidateNames = candidatesForNotif
            .map(c => `${c.students.first_name} ${c.students.last_name} (${c.students.department})`)
            .join(', ');

        // Determine eligible students for notifications
        let eligibleQuery = { limit: 10000 };
        if (electionType === 'DR') eligibleQuery.dept = department;
        if (electionType === 'CR') { eligibleQuery.dept = department; eligibleQuery.year = String(year); }

        const { students: eligibleStudents } = await getAllStudents(eligibleQuery);

        // Get booth info for notification
        const boothForNotif = department ? await getBoothByDept(department) : null;
        const boothAddress = boothForNotif?.address || 'Your assigned department booth';

        // Create notifications
        const notificationRows = eligibleStudents.map(student => ({
            student_id: student.id,
            election_id: election.id,
            title: `${electionType === 'ER' ? 'Engineering Representative' : electionType === 'DR' ? 'Department Representative' : 'Class Representative'} Election — Vote Now!`,
            message: `An election has started. Candidates: ${candidateNames}. Vote at: ${boothAddress}. Ends: ${new Date(endsAt).toLocaleString()}`,
            is_read: false,
        }));

        if (notificationRows.length > 0) {
            try {
                await createNotifications(notificationRows);
                console.log(`📬 Notifications sent to ${notificationRows.length} students`);
            } catch (notifErr) {
                console.warn('⚠️ Notification creation failed:', notifErr.message);
            }
        }

        // Emit WebSocket event to voter portal clients
        const io = req.app.get('io');
        if (io) {
            io.emit('election_started', {
                electionId: election.id,
                blockchainElectionId,
                type: electionType,
                title: `New ${electionType} Election Started`,
                department: department || null,
                year: year || null,
                boothAddress,
                endsAt,
            });
            // Also notify all booths with candidate list and election info
            const boothCandidates = candidatesForNotif.map(c => ({
                id: c.id,
                serialNo: c.serial_no,
                name: `${c.students.first_name} ${c.students.last_name}`,
                department: c.students.department,
                year: c.students.year,
                imageUrl: c.students.image_url,
            }));
            io.emit('allow_vote_update', {
                electionId: election.id,
                blockchainElectionId,
                electionType,
                department: department || null,
                year: year || null,
                candidates: boothCandidates,
            });
        }

        console.log(`✅ Election ${election.id} (${electionType}) initiated by ${req.admin.username}`);

        res.status(201).json({
            success: true,
            message: 'Election initiated successfully',
            election: { ...election, blockchain_election_id: blockchainElectionId },
            candidates: addedCandidates,
            notifiedStudents: eligibleStudents.length,
        });
    } catch (error) {
        console.error('❌ Election initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate election', message: error.message });
    }
});

/**
 * POST /api/admin/elections/:id/end
 * Manually end an active election, declare winner
 */
router.post('/elections/:id/end', async (req, res) => {
    try {
        const { id } = req.params;

        const election = await getElectionById(id);
        if (!election) return res.status(404).json({ error: 'Election not found' });
        if (election.status !== 'active') {
            return res.status(400).json({ error: 'Election is not active' });
        }

        const candidates = await getCandidatesByElection(id);
        if (candidates.length === 0) {
            return res.status(400).json({ error: 'No candidates found for this election' });
        }

        // Close election on blockchain
        try {
            await closeElection(election.blockchain_election_id);
        } catch (chainErr) {
            console.warn('⚠️ Blockchain closeElection failed (continuing):', chainErr.message);
        }

        // Read final vote counts from blockchain
        let winnerId = null;
        let maxVotes = -1;

        for (const c of candidates) {
            let votes = c.vote_count;
            try {
                votes = await getVoteCount(election.blockchain_election_id, c.serial_no);
            } catch (e) {
                console.warn(`⚠️ Could not get blockchain count for candidate ${c.id}:`, e.message);
            }

            if (votes > maxVotes) {
                maxVotes = votes;
                winnerId = c.student_id;
            }
        }

        // Declare winner
        const updatedElection = await setElectionWinner(id, winnerId);

        // Record elected position
        if (winnerId) {
            await recordElectedPosition({
                student_id: winnerId,
                position: election.election_type,
                department: election.department || null,
                year: election.year || null,
                election_id: id,
            });
        }

        // Emit WebSocket event
        const io = req.app.get('io');
        if (io) {
            io.emit('election_ended', {
                electionId: id,
                winnerId,
                electionType: election.election_type,
            });
        }

        console.log(`✅ Election ${id} ended. Winner: ${winnerId} (${maxVotes} votes)`);

        res.json({
            success: true,
            message: 'Election ended and winner declared',
            election: updatedElection,
            winnerId,
            totalVotes: maxVotes,
        });
    } catch (error) {
        console.error('❌ End election error:', error);
        res.status(500).json({ error: 'Failed to end election', message: error.message });
    }
});

// ─── LIVE RESULTS ─────────────────────────────────────────────

/**
 * GET /api/admin/results/live/:electionId
 * Live vote counts from blockchain for active election
 */
router.get('/results/live/:electionId', async (req, res) => {
    try {
        const election = await getElectionById(req.params.electionId);
        if (!election) return res.status(404).json({ error: 'Election not found' });

        const candidates = await getCandidatesByElection(election.id);

        // Fetch live counts from blockchain
        const liveResults = await Promise.all(
            candidates.map(async (c) => {
                let liveCount = c.vote_count;
                try {
                    liveCount = await getVoteCount(election.blockchain_election_id, c.serial_no);
                } catch (e) {
                    // Use DB count as fallback
                }
                return {
                    candidateId: c.id,
                    studentId: c.student_id,
                    name: `${c.students.first_name} ${c.students.last_name}`,
                    department: c.students.department,
                    year: c.students.year,
                    serialNo: c.serial_no,
                    imageUrl: c.students.image_url,
                    voteCount: liveCount,
                };
            })
        );

        res.json({ success: true, electionId: election.id, results: liveResults });
    } catch (error) {
        console.error('❌ Live results error:', error);
        res.status(500).json({ error: 'Failed to get live results', message: error.message });
    }
});

// ─── SYSTEM FLAGS ───────────────────────────────────────────────────

/**
 * GET /api/admin/flags
 * Read all system flags
 */
router.get('/flags', async (req, res) => {
    try {
        const flags = await getAllFlags();
        res.json({ success: true, flags });
    } catch (error) {
        console.error('❌ Get flags error:', error);
        res.status(500).json({ error: 'Failed to get flags', message: error.message });
    }
});

/**
 * PUT /api/admin/flags/:key
 * Set a single flag value (true/false)
 * Body: { value: boolean }
 * Immediately refreshes the in-memory cache.
 */
router.put('/flags/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        if (typeof value !== 'boolean') {
            return res.status(400).json({ error: '"value" must be a boolean (true or false)' });
        }

        const { data, error } = await _supabase
            .from('system_flags')
            .update({ value })
            .eq('key', key)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({ error: `Flag "${key}" not found or update failed`, detail: error?.message });
        }

        // Force refresh the cache so next request picks up new value immediately
        const newFlags = await refreshFlags();

        console.log(`🏁 [Admin] Flag "${key}" set to ${value} by ${req.admin.username}`);

        res.json({
            success: true,
            message: `Flag "${key}" updated to ${value}`,
            flag: data,
            allFlags: newFlags,
        });
    } catch (error) {
        console.error('❌ Update flag error:', error);
        res.status(500).json({ error: 'Failed to update flag', message: error.message });
    }
});

export default router;
