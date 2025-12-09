/**
 * Voting Routes
 * Handles vote casting and voter information retrieval
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from './auth.js';
import { verifyFingerprint } from '../utils/biometric.js';
import { castVote as blockchainCastVote, hasVoted, hashAadhaar } from '../utils/blockchain.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_DB_PATH = path.join(__dirname, '..', 'data', 'users.json');
const BOOTHS_DB_PATH = path.join(__dirname, '..', 'data', 'booths.json');

// =================== Helper Functions ===================

function readUsers() {
    if (!fs.existsSync(USERS_DB_PATH)) {
        return [];
    }
    return JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
}

function writeUsers(users) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
}

function readBooths() {
    if (!fs.existsSync(BOOTHS_DB_PATH)) {
        // Create default booths data
        const defaultBooths = [
            {
                id: 'BOOTH_001',
                name: 'Central Polling Station',
                address: '123 Main Street, Mumbai, Maharashtra',
                coordinates: { lat: 19.0760, lng: 72.8777 },
            },
            {
                id: 'BOOTH_002',
                name: 'North District Center',
                address: '456 Park Avenue, Mumbai, Maharashtra',
                coordinates: { lat: 19.1136, lng: 72.8697 },
            },
            {
                id: 'BOOTH_003',
                name: 'South Community Hall',
                address: '789 Beach Road, Mumbai, Maharashtra',
                coordinates: { lat: 18.9220, lng: 72.8347 },
            },
        ];

        fs.mkdirSync(path.dirname(BOOTHS_DB_PATH), { recursive: true });
        fs.writeFileSync(BOOTHS_DB_PATH, JSON.stringify(defaultBooths, null, 2));
        return defaultBooths;
    }
    return JSON.parse(fs.readFileSync(BOOTHS_DB_PATH, 'utf8'));
}



// =================== Routes ===================

/**
 * POST /api/voting/cast
 * Cast a vote on the blockchain
 */
router.post('/cast', async (req, res) => {
    try {
        const { aadhar, partyId, fingerprintTemplate } = req.body;

        // Validate inputs
        if (!aadhar || !partyId || !fingerprintTemplate) {
            return res.status(400).json({
                error: 'Missing required fields: aadhar, partyId, fingerprintTemplate',
            });
        }

        // Validate party ID
        if (partyId < 1 || partyId > 10) {
            return res.status(400).json({
                error: 'Invalid party ID',
            });
        }

        // Find user
        const aadharHash = hashAadhaar(aadhar);

        // Try Supabase first, then fall back to local JSON
        let user = null;
        try {
            user = await (await import('../utils/supabaseClient.js')).getUserByAadharHash(aadharHash);
            if (!user) {
                user = await (await import('../utils/supabaseClient.js')).getUserByRawAadhaar(aadhar);
            }
        } catch (err) {
            console.error('❌ Supabase lookup failed, falling back to local JSON:', err.message);
        }

        if (!user) {
            const users = readUsers();
            // Try to find by hashed Aadhaar first, then fall back to raw Aadhaar (test/dev only)
            let userIndex = users.findIndex(u => u.aadharHash === aadharHash);
            if (userIndex === -1) {
                userIndex = users.findIndex(u => u.rawAadhaar === aadhar);
            }

            if (userIndex === -1) {
                return res.status(404).json({ error: 'Voter not found' });
            }

            user = users[userIndex];
        }

        // Check if already voted (blockchain check)
        const alreadyVoted = await hasVoted(aadharHash);
        if (alreadyVoted) {
            return res.status(403).json({
                error: 'Voter has already cast their vote',
            });
        }

        // Verify fingerprint
        console.log(`🔍 Verifying fingerprint for voter: ${user.id}`);
        const verificationResult = await verifyFingerprint(
            user.biometric.templateId,
            fingerprintTemplate,
            user.biometric.template
        );

        if (!verificationResult.verified) {
            return res.status(401).json({
                error: 'Fingerprint verification failed',
                score: verificationResult.score,
            });
        }

        console.log(`✅ Fingerprint verified (Score: ${verificationResult.score})`);

        // Cast vote on blockchain
        const txResult = await blockchainCastVote(aadharHash, partyId);

        // Update user's voted status
        try {
            await (await import('../utils/supabaseClient.js')).markUserVoted(aadharHash);
            console.log('✅ Marked user as voted in Supabase');
        } catch (err) {
            console.error('❌ Failed to update Supabase status, falling back to local file:', err.message);
            if (userIndex !== -1) {
                users[userIndex].hasVoted = true;
                users[userIndex].votedAt = new Date().toISOString();
                writeUsers(users);
            }
        }

        console.log(`🗳️  Vote cast successfully: ${user.id} -> Party ${partyId}`);

        res.json({
            success: true,
            message: 'Vote cast successfully',
            transactionHash: txResult.transactionHash,
            blockNumber: txResult.blockNumber,
        });
    } catch (error) {
        console.error('❌ Vote casting error:', error);
        res.status(500).json({
            error: 'Failed to cast vote',
            message: error.message,
        });
    }
});

/**
 * GET /api/voting/voter/:aadhar
 * Get voter information and voting status
 */
router.get('/voter/:aadhar', async (req, res) => {
    try {
        const { aadhar } = req.params;

        if (!aadhar || !/^\d{12}$/.test(aadhar)) {
            return res.status(400).json({
                error: 'Invalid Aadhaar number',
            });
        }

        const users = readUsers();
        const aadharHash = hashAadhaar(aadhar);
        let user = users.find(u => u.aadharHash === aadharHash);

        // Check blockchain for voting status
        const votedOnChain = await hasVoted(aadharHash);

        // Try to get user from Supabase first
        try {
            let sbUser = await (await import('../utils/supabaseClient.js')).getUserByAadharHash(aadharHash);

            // If not found by hash, try raw Aadhaar (handling Salt mismatches)
            if (!sbUser) {
                console.log('⚠️ Voter not found by hash, trying raw Aadhaar...');
                sbUser = await (await import('../utils/supabaseClient.js')).getUserByRawAadhaar(aadhar);
            }

            if (sbUser) {
                return res.json({
                    success: true,
                    voter: {
                        id: sbUser.id,
                        name: {
                            first: sbUser.name_first,
                            middle: sbUser.name_middle,
                            last: sbUser.name_last,
                        },
                        fullName: `${sbUser.name_first} ${sbUser.name_middle || ''} ${sbUser.name_last}`.trim(),
                        age: sbUser.age,
                        phone: sbUser.phone,
                        photo: sbUser.photo,
                        hasVoted: votedOnChain || sbUser.has_voted,
                        registeredAt: sbUser.registered_at,
                        votedAt: sbUser.voted_at || null,
                    },
                });
            }
        } catch (err) {
            console.warn('Supabase fetch failed (voter lookup), using local fallback:', err.message);
        }

        if (!user) {
            return res.status(404).json({
                error: 'Voter not found',
            });
        }

        res.json({
            success: true,
            voter: {
                id: user.id,
                name: {
                    first: user.name.first,
                    middle: user.name.middle,
                    last: user.name.last,
                },
                fullName: `${user.name.first} ${user.name.middle} ${user.name.last}`.trim(),
                age: user.age,
                phone: user.phone,
                photo: user.photo,
                hasVoted: votedOnChain || user.hasVoted,
                registeredAt: user.registeredAt,
                votedAt: user.votedAt || null,
            },
        });
    } catch (error) {
        console.error('❌ Error fetching voter:', error);
        res.status(500).json({
            error: 'Failed to fetch voter information',
            message: error.message,
        });
    }
});

/**
 * GET /api/voting/booths
 * Get list of polling booths
 */
router.get('/booths', async (req, res) => {
    try {
        let booths = [];
        try {
            booths = await (await import('../utils/supabaseClient.js')).getBooths();
            if (!booths || booths.length === 0) throw new Error("No booths in DB");
        } catch (err) {
            console.warn('Supabase booth fetch failed, using local fallback:', err.message);
            // Fallback to local
            // We can just reuse readBooths helper but it might need to be exported or available in scope. 
            // readBooths is in scope.
            booths = readBooths();
        }

        res.json({
            success: true,
            booths,
        });
    } catch (error) {
        console.error('❌ Error fetching booths:', error);
        res.status(500).json({
            error: 'Failed to fetch booths',
            message: error.message,
        });
    }
});

export default router;
