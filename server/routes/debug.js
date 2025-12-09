/**
 * Debug Routes (disabled by default)
 * Exposes limited debug endpoints to inspect server-side data.
 * Enabled only when ENABLE_DEBUG=true in env.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from './auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

function readUsersSafe() {
    if (!fs.existsSync(USERS_DB_PATH)) return [];
    try {
        return JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
    } catch (e) {
        console.error('❌ Failed to parse users.json:', e.message);
        return [];
    }
}

// GET /api/debug/users
// Protected: requires officer JWT (role: 'officer')
router.get('/users', authenticateToken, (req, res) => {
    try {
        // Only allow officer role to access this endpoint
        if (!req.user || req.user.role !== 'officer') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const users = readUsersSafe();
        // Do not return full biometric template by default
        const safeUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            age: u.age,
            registeredAt: u.registeredAt,
            hasVoted: u.hasVoted,
        }));

        res.json({ success: true, count: safeUsers.length, users: safeUsers });
    } catch (error) {
        console.error('❌ Debug/users error:', error.message);
        res.status(500).json({ error: 'Failed to read users' });
    }
});

export default router;
