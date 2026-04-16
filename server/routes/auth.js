/**
 * Authentication Routes — Phase 2 (Updated)
 * - Voter registration with roll number + 4-digit PIN
 * - Voter login: roll number + PIN
 * - BLO login (from DB, bcrypt)
 * - Admin login (separate JWT)
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { registerFingerprint, validateTemplate } from '../utils/biometric.js';
import { hashRollNumber } from '../utils/blockchain.js';
import * as db from '../utils/supabaseClient.js';
import { getFlag } from '../utils/flagsManager.js';

const router = express.Router();

const DEPARTMENTS = ['CO', 'AI', 'DS', 'ECS', 'ME', 'CE', 'EE'];
const YEARS = ['1', '2', '3', '4'];

function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
}
function generateAdminToken(payload) {
    return jwt.sign(payload, process.env.ADMIN_JWT_SECRET || 'admin_fallback_secret', { expiresIn: '12h' });
}

// =================== Voter Registration ===================

/**
 * POST /api/auth/register
 * Fields: firstName, middleName, lastName, rollNumber, phone, department, year, imageUrl, pin, fingerprintTemplate
 */
router.post('/register', async (req, res) => {
    try {
        const {
            firstName, middleName, lastName,
            rollNumber, phone, department, year,
            imageUrl, fingerprintTemplate,
            pin,  // 4-digit PIN (new field)
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !rollNumber || !phone || !department || !year) {
            return res.status(400).json({
                error: 'Missing required fields: firstName, lastName, rollNumber, phone, department, year',
            });
        }

        // Validate PIN
        if (!pin || !/^\d{4}$/.test(String(pin))) {
            return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
        }

        if (!DEPARTMENTS.includes(department)) {
            return res.status(400).json({ error: `Invalid department. Must be one of: ${DEPARTMENTS.join(', ')}` });
        }
        if (!YEARS.includes(String(year))) {
            return res.status(400).json({ error: 'Invalid year. Must be 1, 2, 3, or 4' });
        }
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: 'Phone number must be 10 digits' });
        }

        const normalizedRoll = rollNumber.toUpperCase();

        const existing = await db.getStudentByRollNumber(normalizedRoll);
        if (existing) {
            return res.status(409).json({ error: 'Roll number already registered' });
        }

        // Hash the PIN
        const pinHash = await bcrypt.hash(String(pin), 10);

        // Handle fingerprint (optional in dev — controlled by DB flag)
        let fingerprintId = null;
        const fingerprintRequired = await getFlag('fingerprint_required');
        if (fingerprintRequired) {
            if (!fingerprintTemplate) return res.status(400).json({ error: 'Fingerprint is required' });
            if (!validateTemplate(fingerprintTemplate)) return res.status(400).json({ error: 'Invalid fingerprint template' });
            const voterHash = hashRollNumber(normalizedRoll);
            const biometricResult = await registerFingerprint(fingerprintTemplate, voterHash);
            fingerprintId = biometricResult.templateId;
        } else if (fingerprintTemplate) {
            try {
                if (validateTemplate(fingerprintTemplate)) {
                    const voterHash = hashRollNumber(normalizedRoll);
                    const biometricResult = await registerFingerprint(fingerprintTemplate, voterHash);
                    fingerprintId = biometricResult.templateId;
                }
            } catch (err) {
                console.warn('⚠️ Fingerprint registration skipped (dev mode):', err.message);
            }
        }

        const booth = await db.getBoothByDept(department);
        if (!booth) {
            return res.status(500).json({ error: `No booth found for department ${department}` });
        }

        const voterHash = hashRollNumber(normalizedRoll);

        const newStudent = {
            first_name: firstName,
            middle_name: middleName || null,
            last_name: lastName,
            roll_number: normalizedRoll,
            phone,
            department,
            year: String(year),
            image_url: imageUrl || null,
            fingerprint_id: fingerprintId,
            voter_hash: voterHash,
            booth_id: booth.id,
            pin_hash: pinHash,
        };

        const created = await db.createStudent(newStudent);

        const token = generateToken({
            userId: created.id,
            rollNumber: normalizedRoll,
            voterHash,
            department,
            year: String(year),
            boothId: booth.id,
            role: 'voter',
        });

        console.log(`✅ Student registered: ${normalizedRoll} → ${booth.id}`);

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: created.id,
                name: `${firstName} ${lastName}`,
                rollNumber: normalizedRoll,
                department,
                year: String(year),
                boothId: booth.id,
                boothAddress: booth.address,
            },
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Registration failed', message: error.message });
    }
});

// =================== Login ===================

/**
 * POST /api/auth/login
 * - Voter: roll number + 4-digit PIN
 * - BLO/Officer: username + password
 */
router.post('/login', async (req, res) => {
    try {
        const { role, rollNumber, pin, username, password } = req.body;

        // ----- BLO Login -----
        if (role === 'officer' || role === 'blo') {
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password required' });
            }
            const blo = await db.getBLOByUsername(username);
            if (!blo) return res.status(401).json({ error: 'Invalid credentials' });

            const passwordMatch = await bcrypt.compare(password, blo.password_hash);
            if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

            const token = generateToken({
                userId: blo.id,
                username: blo.username,
                boothId: blo.booth_id,
                department: blo.booths?.department || null,
                role: 'officer',
            });

            console.log(`✅ BLO logged in: ${username} → ${blo.booth_id}`);

            return res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: blo.id,
                    username: blo.username,
                    displayName: blo.display_name,
                    boothId: blo.booth_id,
                    boothName: blo.booths?.name,
                    boothAddress: blo.booths?.address,
                    department: blo.booths?.department,
                    role: 'officer',
                },
            });
        }

        // ----- Voter Login: roll number + PIN -----
        if (role === 'voter') {
            if (!rollNumber || !pin) {
                return res.status(400).json({ error: 'Roll number and PIN required' });
            }
            if (!/^\d{4}$/.test(String(pin))) {
                return res.status(400).json({ error: 'PIN must be 4 digits' });
            }

            const student = await db.getStudentByRollNumber(rollNumber.toUpperCase());
            if (!student) {
                return res.status(404).json({ error: 'Roll number not found. Please register first.' });
            }

            // Verify PIN
            if (!student.pin_hash) {
                // Legacy fallback: if no pin_hash, accept default '1234'
                if (String(pin) !== '1234') {
                    return res.status(401).json({ error: 'Invalid PIN' });
                }
            } else {
                const pinMatch = await bcrypt.compare(String(pin), student.pin_hash);
                if (!pinMatch) {
                    return res.status(401).json({ error: 'Invalid PIN' });
                }
            }

            const token = generateToken({
                userId: student.id,
                rollNumber: student.roll_number,
                voterHash: student.voter_hash,
                department: student.department,
                year: student.year,
                boothId: student.booth_id,
                role: 'voter',
            });

            console.log(`✅ Voter logged in: ${student.roll_number}`);

            return res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: student.id,
                    name: `${student.first_name} ${student.last_name}`,
                    rollNumber: student.roll_number,
                    department: student.department,
                    year: student.year,
                    boothId: student.booth_id,
                    boothAddress: student.booths?.address,
                },
            });
        }

        return res.status(400).json({ error: 'Invalid role. Must be "voter", "officer", or "blo".' });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Login failed', message: error.message });
    }
});

// =================== Admin Login ===================

router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@vote.rakshak';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@secure123';

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        const token = generateAdminToken({ username, role: 'admin' });
        console.log(`✅ Admin logged in: ${username}`);

        return res.json({
            success: true,
            message: 'Admin login successful',
            token,
            user: { username, role: 'admin' },
        });
    } catch (error) {
        console.error('❌ Admin login error:', error);
        res.status(500).json({ error: 'Admin login failed', message: error.message });
    }
});

// =================== Auth Middleware ===================

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) return res.status(401).json({ error: 'Your session has expired. Please logout and login again.', code: 'TOKEN_INVALID' });
        req.user = user;
        next();
    });
}

export default router;
