/**
 * Officer Routes
 * Handles officer operations including booth unlocking and audit logs
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from './auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGS_DB_PATH = path.join(__dirname, '..', 'data', 'logs.json');

// =================== Helper Functions ===================

function readLogs() {
    if (!fs.existsSync(LOGS_DB_PATH)) {
        fs.mkdirSync(path.dirname(LOGS_DB_PATH), { recursive: true });
        fs.writeFileSync(LOGS_DB_PATH, JSON.stringify([], null, 2));
    }
    return JSON.parse(fs.readFileSync(LOGS_DB_PATH, 'utf8'));
}

function writeLogs(logs) {
    fs.writeFileSync(LOGS_DB_PATH, JSON.stringify(logs, null, 2));
}

function addLog(logEntry) {
    const logs = readLogs();
    logs.push({
        ...logEntry,
        timestamp: new Date().toISOString(),
        id: `LOG_${Date.now()}`,
    });
    writeLogs(logs);
}

// =================== Routes ===================

/**
 * POST /api/officer/unlock-booth
 * Unlock a polling booth for a specific voter via WebSocket
 */
router.post('/unlock-booth', async (req, res) => {
    try {
        const { boothId, voterAadhar, voterName, voterPhoto, officerId } = req.body;

        // Validate inputs
        if (!boothId || !voterAadhar) {
            return res.status(400).json({
                error: 'Missing required fields: boothId, voterAadhar',
            });
        }

        // Get Socket.io instance from app
        const io = req.app.get('io');
        const activeBooths = req.app.get('activeBooths');

        // Check if booth is connected
        if (!activeBooths.has(boothId)) {
            return res.status(404).json({
                error: `Booth ${boothId} is not currently connected`,
                availableBooths: Array.from(activeBooths.keys()),
            });
        }

        // Emit WebSocket event to specific booth room
        const eventData = {
            voterAadhar,
            voterName: voterName || 'Authorized Voter',
            voterPhoto: voterPhoto || '',
            authorizedBy: officerId || 'OFFICER_001',
            authorizedAt: new Date().toISOString(),
        };

        io.to(`booth_${boothId}`).emit('allow_vote', eventData);

        console.log(`🔓 Booth ${boothId} unlocked for voter: ${voterAadhar}`);

        // Log the unlock event for audit trail
        addLog({
            action: 'UNLOCK_BOOTH',
            boothId,
            voterAadhar,
            voterName,
            officerId: officerId || 'OFFICER_001',
            status: 'success',
        });

        // Update booth status
        const boothInfo = activeBooths.get(boothId);
        boothInfo.status = 'active';
        boothInfo.lastUnlocked = new Date();
        activeBooths.set(boothId, boothInfo);

        res.json({
            success: true,
            message: `Booth ${boothId} unlocked successfully`,
            boothId,
            voterAadhar,
        });
    } catch (error) {
        console.error('❌ Unlock booth error:', error);

        // Log the failed attempt
        addLog({
            action: 'UNLOCK_BOOTH',
            boothId: req.body.boothId,
            voterAadhar: req.body.voterAadhar,
            officerId: req.body.officerId || 'OFFICER_001',
            status: 'failed',
            error: error.message,
        });

        res.status(500).json({
            error: 'Failed to unlock booth',
            message: error.message,
        });
    }
});

/**
 * POST /api/officer/reset-booth
 * Reset a booth back to idle state
 */
router.post('/reset-booth', (req, res) => {
    try {
        const { boothId, officerId } = req.body;

        if (!boothId) {
            return res.status(400).json({
                error: 'Booth ID required',
            });
        }

        const io = req.app.get('io');
        const activeBooths = req.app.get('activeBooths');

        if (!activeBooths.has(boothId)) {
            return res.status(404).json({
                error: `Booth ${boothId} is not connected`,
            });
        }

        // Emit reset event
        io.to(`booth_${boothId}`).emit('reset_booth', {
            message: 'Booth reset by officer',
            resetBy: officerId || 'OFFICER_001',
        });

        // Update booth status
        const boothInfo = activeBooths.get(boothId);
        boothInfo.status = 'idle';
        activeBooths.set(boothId, boothInfo);

        // Log the action
        addLog({
            action: 'RESET_BOOTH',
            boothId,
            officerId: officerId || 'OFFICER_001',
            status: 'success',
        });

        console.log(`🔄 Booth ${boothId} reset to idle`);

        res.json({
            success: true,
            message: `Booth ${boothId} reset successfully`,
        });
    } catch (error) {
        console.error('❌ Reset booth error:', error);
        res.status(500).json({
            error: 'Failed to reset booth',
            message: error.message,
        });
    }
});

/**
 * GET /api/officer/audit-logs
 * Get audit logs for all booth operations
 */
router.get('/audit-logs', (req, res) => {
    try {
        const logs = readLogs();

        // Optional filtering by date range
        const { startDate, endDate, boothId, action } = req.query;

        let filteredLogs = logs;

        if (startDate) {
            filteredLogs = filteredLogs.filter(
                log => new Date(log.timestamp) >= new Date(startDate)
            );
        }

        if (endDate) {
            filteredLogs = filteredLogs.filter(
                log => new Date(log.timestamp) <= new Date(endDate)
            );
        }

        if (boothId) {
            filteredLogs = filteredLogs.filter(log => log.boothId === boothId);
        }

        if (action) {
            filteredLogs = filteredLogs.filter(log => log.action === action);
        }

        // Sort by timestamp descending (newest first)
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            count: filteredLogs.length,
            logs: filteredLogs,
        });
    } catch (error) {
        console.error('❌ Error fetching audit logs:', error);
        res.status(500).json({
            error: 'Failed to fetch audit logs',
            message: error.message,
        });
    }
});

/**
 * GET /api/officer/stats
 * Get statistics for officer dashboard
 */
router.get('/stats', (req, res) => {
    try {
        const logs = readLogs();
        const activeBooths = req.app.get('activeBooths');

        const stats = {
            totalUnlocks: logs.filter(l => l.action === 'UNLOCK_BOOTH').length,
            successfulUnlocks: logs.filter(
                l => l.action === 'UNLOCK_BOOTH' && l.status === 'success'
            ).length,
            failedUnlocks: logs.filter(
                l => l.action === 'UNLOCK_BOOTH' && l.status === 'failed'
            ).length,
            activeBooths: activeBooths.size,
            boothStatuses: Array.from(activeBooths.entries()).map(([id, info]) => ({
                boothId: id,
                status: info.status,
                connectedAt: info.connectedAt,
                lastUnlocked: info.lastUnlocked || null,
            })),
        };

        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({
            error: 'Failed to fetch statistics',
            message: error.message,
        });
    }
});

export default router;
