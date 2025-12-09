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

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to users database
const USERS_DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

// =================== Helper Functions ===================

function readUsers() {
    if (!fs.existsSync(USERS_DB_PATH)) {
        fs.mkdirSync(path.dirname(USERS_DB_PATH), { recursive: true });
        fs.writeFileSync(USERS_DB_PATH, JSON.stringify([], null, 2));
    }
    return JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
}

function writeUsers(users) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
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
            photo,
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

        // Read existing users
        const users = readUsers();

        // Check if Aadhaar already registered
        const aadharHash = hashAadhaar(aadhar);
        const existingUser = users.find(u => u.aadharHash === aadharHash);

        if (existingUser) {
            return res.status(409).json({
                error: 'Aadhaar number already registered',
            });
        }

        // Register fingerprint (get templateId)
        const biometricResult = await registerFingerprint(fingerprintTemplate, aadharHash);

        // Create new user object
        const newUser = {
            id: `USER_${Date.now()}`,
            aadharHash, // Store ONLY the hash, never plaintext
            name: {
                first: firstName,
                middle: middleName || '',
                last: lastName,
            },
            age: parseInt(age),
            phone: phone || '',
            photo: photo || '', // Base64 encoded photo
            biometric: {
                templateId: biometricResult.templateId,
                template: fingerprintTemplate, // Store template for verification
            },
            hasVoted: false,
            registeredAt: new Date().toISOString(),
        };

        // Add to users array
        users.push(newUser);
        writeUsers(users);

        // Generate JWT token
        const token = generateToken({
            userId: newUser.id,
            aadharHash: newUser.aadharHash,
            role: 'voter',
        });

        console.log(`✅ New voter registered: ${newUser.id}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: newUser.id,
                name: `${newUser.name.first} ${newUser.name.last}`,
                hasVoted: newUser.hasVoted,
            },
        });
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

            const users = readUsers();
            const aadharHash = hashAadhaar(aadhar);
            const user = users.find(u => u.aadharHash === aadharHash);

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

            console.log(`✅ Voter logged in: ${user.id}`);

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
