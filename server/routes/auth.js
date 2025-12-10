/**
 * Authentication Routes
 * Handles voter registration and login
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerFingerprint, validateTemplate } from '../utils/biometric.js';
import { hashAadhaar } from '../utils/blockchain.js';
import * as supabaseClient from '../utils/supabaseClient.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to users database
const USERS_DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

// =================== Helper Functions ===================

function readUsers() {
    try {
        if (!fs.existsSync(USERS_DB_PATH)) {
            try {
                fs.mkdirSync(path.dirname(USERS_DB_PATH), { recursive: true });
                fs.writeFileSync(USERS_DB_PATH, JSON.stringify([], null, 2));
            } catch (err) {
                console.warn('⚠️ Cannot create local users file (likely read-only FS). Returning empty list.');
                return [];
            }
        }
        return JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
    } catch (err) {
        console.error('❌ Failed to read local users:', err.message);
        return [];
    }
}

function writeUsers(users) {
    try {
        fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('❌ Failed to write local users (likely read-only FS):', err.message);
    }
}

function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// =================== Routes ===================

/**
 * POST /api/auth/register
 * Register a new voter with biometric data
 */
router.post('/register', async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            age,
            aadhar,
            phone,
            phone,
            photo = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmwCmC6pZjmJZsvvNufFvqxJf7_C73ff3_Bg&s', // Default image
            fingerprintTemplate,
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !age || !aadhar || !fingerprintTemplate) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }

        // Validate Aadhaar format (12 digits)
        if (!/^\d{12}$/.test(aadhar)) {
            return res.status(400).json({
                error: 'Invalid Aadhaar number format',
            });
        }

        // Validate fingerprint template
        if (!validateTemplate(fingerprintTemplate)) {
            return res.status(400).json({
                error: 'Invalid fingerprint template',
            });
        }

        // Prepare hashed aadhaar and check existing user in Supabase first
        const aadharHash = hashAadhaar(aadhar);

        try {
            const existing = await supabaseClient.getUserByAadharHash(aadharHash);
            if (existing) {
                return res.status(409).json({ error: 'Aadhaar number already registered' });
            }

            // Register fingerprint (get templateId)
            const biometricResult = await registerFingerprint(fingerprintTemplate, aadharHash);

            // Create new user object
            const newUser = {
                id: `USER_${Date.now()}`,
                aadhar_hash: aadharHash,
                raw_aadhaar: aadhar, // kept for testing fallback
                name_first: firstName,
                name_middle: middleName || '',
                name_last: lastName,
                age: parseInt(age),
                phone: phone || '',
                photo: photo || '',
                biometric: {
                    template_id: biometricResult.templateId,
                    template: fingerprintTemplate,
                },
                has_voted: false,
                registered_at: new Date().toISOString(),
            };

            // Try to create in Supabase
            const created = await supabaseClient.createUser(newUser);

            // Generate JWT token
            const token = generateToken({
                userId: created.id,
                aadharHash: aadharHash,
                role: 'voter',
            });

            console.log(`✅ New voter registered (supabase): ${created.id}`);

            return res.status(201).json({
                success: true,
                message: 'Registration successful',
                token,
                user: {
                    id: created.id,
                    name: `${firstName} ${lastName}`,
                    hasVoted: created.has_voted,
                },
            });
        } catch (err) {
            console.error('❌ Supabase registration failed, falling back to local JSON:', err.message);

            // Fallback to file-based storage
            const users = readUsers();
            const existingUser = users.find(u => u.aadharHash === aadharHash || u.rawAadhaar === aadhar);
            if (existingUser) {
                return res.status(409).json({ error: 'Aadhaar number already registered' });
            }

            const biometricResult = await registerFingerprint(fingerprintTemplate, aadharHash);

            const newUser = {
                id: `USER_${Date.now()}`,
                aadharHash,
                rawAadhaar: aadhar,
                name: {
                    first: firstName,
                    middle: middleName || '',
                    last: lastName,
                },
                age: parseInt(age),
                phone: phone || '',
                photo: photo || '',
                biometric: {
                    templateId: biometricResult.templateId,
                    template: fingerprintTemplate,
                },
                hasVoted: false,
                registeredAt: new Date().toISOString(),
            };

            users.push(newUser);
            writeUsers(users);

            const token = generateToken({ userId: newUser.id, aadharHash: newUser.aadharHash, role: 'voter' });

            console.log(`✅ New voter registered (local fallback): ${newUser.id}`);

            return res.status(201).json({ success: true, message: 'Registration successful', token, user: { id: newUser.id, name: `${newUser.name.first} ${newUser.name.last}`, hasVoted: newUser.hasVoted } });
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: error.message,
        });
    }
});

/**
 * POST /api/auth/login
 * Login for voters and officers
 */

/**
 * POST /api/auth/login
 * Login for voters and officers
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Officer login
        if (role === 'officer') {
            // Simple hardcoded credentials for development
            const OFFICER_CREDENTIALS = {
                username: 'admin',
                password: 'admin', // In production, use hashed passwords
            };

            if (
                username === OFFICER_CREDENTIALS.username &&
                password === OFFICER_CREDENTIALS.password
            ) {
                const token = generateToken({
                    userId: 'OFFICER_001',
                    username,
                    role: 'officer',
                });

                console.log(`✅ Officer logged in: ${username}`);

                return res.json({
                    success: true,
                    message: 'Login successful',
                    token,
                    user: {
                        id: 'OFFICER_001',
                        username,
                        role: 'officer',
                    },
                });
            } else {
                return res.status(401).json({
                    error: 'Invalid credentials',
                });
            }
        }

        // Voter login (by Aadhaar)
        if (role === 'voter') {
            const { aadhar } = req.body;

            if (!aadhar) {
                return res.status(400).json({
                    error: 'Aadhaar number required for voter login',
                });
            }

            // 1. Try Supabase first (Primary Source of Truth)
            let user = null;
            try {
                const aadharHash = hashAadhaar(aadhar);
                user = await supabaseClient.getUserByAadharHash(aadharHash);

                // Fallback (DEV ONLY): Check raw aadhaar if hash lookup fails
                if (!user && process.env.NODE_ENV === 'development') {
                    user = await supabaseClient.getUserByRawAadhaar(aadhar);
                }

                if (user) {
                    // Normalize Supabase user object to frontend expectation
                    const token = generateToken({
                        userId: user.id,
                        aadharHash: user.aadhar_hash,
                        role: 'voter',
                    });

                    console.log(`✅ Voter logged in (Supabase): ${user.id}`);

                    return res.json({
                        success: true,
                        message: 'Login successful',
                        token,
                        user: {
                            id: user.id,
                            name: `${user.name_first} ${user.name_last}`,
                            hasVoted: user.has_voted,
                        },
                    });
                }
            } catch (err) {
                console.error('⚠️ Supabase login check failed, falling back to local:', err.message);
            }

            // 2. Fallback to Local JSON (Secondary/Legacy)
            const users = readUsers();
            const aadharHash = hashAadhaar(aadhar);
            user = users.find(u => u.aadharHash === aadharHash);

            if (!user) {
                return res.status(404).json({
                    error: 'Voter not found. Please register first.',
                });
            }

            const token = generateToken({
                userId: user.id,
                aadharHash: user.aadharHash,
                role: 'voter',
            });

            console.log(`✅ Voter logged in (Local): ${user.id}`);

            return res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: `${user.name.first} ${user.name.last}`,
                    hasVoted: user.hasVoted,
                },
            });
        }

        res.status(400).json({
            error: 'Invalid role specified',
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: error.message,
        });
    }
});

/**
 * Middleware to verify JWT token
 */
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: 'Invalid or expired token',
            });
        }

        req.user = user;
        next();
    });
}

export default router;
