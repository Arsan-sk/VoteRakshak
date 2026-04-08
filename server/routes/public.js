/**
 * Public Routes — Phase 2 (No authentication required)
 * Landing page data endpoints
 */

import express from 'express';
import {
    getActiveElection,
    getAllElections,
    getCandidatesByElection,
    getElectedPositions,
} from '../utils/supabaseClient.js';
import { getVoteCount } from '../utils/blockchain.js';
import { getAllFlags } from '../utils/flagsManager.js';

const router = express.Router();

/**
 * GET /api/public/active-election
 * Returns the current active election with candidates and provisional vote counts
 */
router.get('/active-election', async (req, res) => {
    try {
        const election = await getActiveElection();

        if (!election) {
            return res.json({ success: true, election: null, message: 'No active election' });
        }

        const candidates = await getCandidatesByElection(election.id);

        // Get live vote counts
        const candidatesWithCounts = await Promise.all(
            candidates.map(async (c) => {
                let liveVotes = c.vote_count;
                try {
                    liveVotes = await getVoteCount(election.blockchain_election_id, c.serial_no);
                } catch {
                    // Use DB count as fallback
                }
                return {
                    id: c.id,
                    serialNo: c.serial_no,
                    name: `${c.students.first_name} ${c.students.last_name}`,
                    department: c.students.department,
                    year: c.students.year,
                    imageUrl: c.students.image_url,
                    voteCount: liveVotes,
                };
            })
        );

        res.json({
            success: true,
            election: {
                id: election.id,
                type: election.election_type,
                department: election.department,
                year: election.year,
                status: election.status,
                endsAt: election.ends_at,
                startedAt: election.started_at,
            },
            candidates: candidatesWithCounts,
            label: 'Provisional Results — Voting in Progress',
        });
    } catch (error) {
        console.error('❌ Public active-election error:', error);
        res.status(500).json({ error: 'Failed to get active election', message: error.message });
    }
});

/**
 * GET /api/public/results
 * Declared election results (ended elections)
 */
router.get('/results', async (req, res) => {
    try {
        const elections = await getAllElections();
        const ended = elections.filter(e => e.status === 'ended');

        // For each ended election, attach candidate results
        const withResults = await Promise.all(
            ended.slice(0, 10).map(async (election) => {
                const candidates = await getCandidatesByElection(election.id);
                return {
                    id: election.id,
                    type: election.election_type,
                    department: election.department,
                    year: election.year,
                    endedAt: election.ended_at,
                    winner: election.students
                        ? {
                              name: `${election.students.first_name} ${election.students.last_name}`,
                              rollNumber: election.students.roll_number,
                              department: election.students.department,
                          }
                        : null,
                    candidates: candidates.map(c => ({
                        name: `${c.students.first_name} ${c.students.last_name}`,
                        department: c.students.department,
                        year: c.students.year,
                        imageUrl: c.students.image_url,
                        voteCount: c.vote_count,
                        serialNo: c.serial_no,
                    })),
                };
            })
        );

        res.json({ success: true, results: withResults });
    } catch (error) {
        console.error('❌ Public results error:', error);
        res.status(500).json({ error: 'Failed to get results', message: error.message });
    }
});

/**
 * GET /api/public/elected-positions
 * Current holders of ER / DR / CR positions
 */
router.get('/elected-positions', async (req, res) => {
    try {
        const positions = await getElectedPositions();
        res.json({ success: true, positions });
    } catch (error) {
        console.error('❌ Public elected-positions error:', error);
        res.status(500).json({ error: 'Failed to get elected positions', message: error.message });
    }
});

/**
 * GET /api/public/flags
 * Returns all system flags (read-only, no auth)
 * Used by booth and voter portal to pick up flag changes dynamically
 */
router.get('/flags', async (req, res) => {
    try {
        const flags = await getAllFlags();
        res.json({ success: true, flags });
    } catch (error) {
        console.error('❌ Public flags error:', error);
        res.status(500).json({ error: 'Failed to get flags', message: error.message });
    }
});

export default router;
