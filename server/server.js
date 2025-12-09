/**
 * Main Backend Server for Distributed E-Voting System
 * Handles API requests, WebSocket communication, and blockchain integration
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import votingRoutes from './routes/voting.js';
import officerRoutes from './routes/officer.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =================== Server Configuration ===================

const app = express();
const httpServer = createServer(app);

// CORS configuration for three frontend origins
const corsOptions = {
    origin: [
        process.env.VOTER_PORTAL_URL || 'http://localhost:5173',
        process.env.OFFICER_DASHBOARD_URL || 'http://localhost:5174',
        process.env.POLLING_BOOTH_URL || 'http://localhost:5175',
        'https://vote-rakshak-4yld.vercel.app',
        'https://vote-rakshak-git-main-mohd-arsans-projects.vercel.app',
        'https://vote-rakshak.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =================== Socket.io Setup ===================

const io = new Server(httpServer, {
    cors: corsOptions,
});

// Store active booth connections
const activeBooths = new Map();

io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // Handle booth registration
    socket.on('register_booth', (boothId) => {
        console.log(`🏢 Booth registered: ${boothId} (Socket: ${socket.id})`);

        // Join room for this specific booth
        socket.join(`booth_${boothId}`);

        // Store booth info
        activeBooths.set(boothId, {
            socketId: socket.id,
            connectedAt: new Date(),
            status: 'idle',
        });

        socket.emit('registration_confirmed', {
            boothId,
            message: 'Booth registered successfully',
        });
    });

    // Handle booth status updates
    socket.on('booth_status', ({ boothId, status }) => {
        if (activeBooths.has(boothId)) {
            activeBooths.get(boothId).status = status;
            console.log(`📊 Booth ${boothId} status: ${status}`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`❌ Disconnected: ${socket.id}`);

        // Remove booth from active list
        for (const [boothId, info] of activeBooths.entries()) {
            if (info.socketId === socket.id) {
                activeBooths.delete(boothId);
                console.log(`🏢 Booth ${boothId} removed from active list`);
                break;
            }
        }
    });
});

// Make io accessible to routes
app.set('io', io);
app.set('activeBooths', activeBooths);

// =================== API Routes ===================

app.use('/api/auth', authRoutes);
app.use('/api/voting', votingRoutes);
app.use('/api/officer', officerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        activeBooths: Array.from(activeBooths.keys()),
    });
});

// Get active booths (for officer dashboard)
app.get('/api/booths/active', (req, res) => {
    const booths = Array.from(activeBooths.entries()).map(([id, info]) => ({
        boothId: id,
        status: info.status,
        connectedAt: info.connectedAt,
    }));

    res.json({ booths });
});

// =================== Error Handling ===================

app.use((err, req, res, next) => {
    console.error('❌ Error:', err);

    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            path: req.path,
        },
    });
});

// =================== Start Server ===================

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 VoteRakshak Backend Server');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📡 HTTP Server: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📋 Available Routes:');
    console.log('   POST   /api/auth/register');
    console.log('   POST   /api/auth/login');
    console.log('   POST   /api/voting/cast');
    console.log('   GET    /api/voting/voter/:aadhar');
    console.log('   GET    /api/voting/booths');
    console.log('   POST   /api/officer/unlock-booth');
    console.log('   GET    /api/officer/audit-logs');
    console.log('   GET    /api/booths/active');
    console.log('   GET    /api/health');
    console.log('═══════════════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM received, shutting down gracefully...');
    httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

export { io, activeBooths };
