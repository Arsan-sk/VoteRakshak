/**
 * Main Backend Server — Phase 2
 * Updated route registrations, WebSocket events, CORS
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
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import debugRoutes from './routes/debug.js';
import { initFlags } from './utils/flagsManager.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET not set');
}
if (!process.env.ADMIN_JWT_SECRET) {
    console.warn('⚠️  ADMIN_JWT_SECRET not set — using fallback');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// ─── CORS ────────────────────────────────────────────────────
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            'http://localhost:5173', // voter-portal / landing-page
            'http://localhost:5174', // officer-dashboard
            'http://localhost:5175', // CO booth
            'http://localhost:5176', // admin-panel
            'http://localhost:5177', // AI/ML booth
            'http://localhost:5178', // DS booth
            'http://localhost:5179', // ECS booth
            'http://localhost:5180', // ME booth
            'http://localhost:5181', // CE booth
            'http://localhost:5182', // EE booth
        ];
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.endsWith('.railway.app')
        ) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── SOCKET.IO ────────────────────────────────────────────────
const io = new Server(httpServer, { cors: corsOptions });
const activeBooths = new Map();

io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // Booth registration
    socket.on('register_booth', (boothId) => {
        console.log(`🏢 Booth registered: ${boothId} (Socket: ${socket.id})`);
        socket.join(`booth_${boothId}`);
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

    // Voter portal clients join voter_portal room for notifications
    socket.on('register_voter_portal', (studentId) => {
        socket.join(`voter_${studentId}`);
        console.log(`👤 Voter portal registered: student ${studentId}`);
    });

    // Admin panel joins admin room for live updates
    socket.on('register_admin', () => {
        socket.join('admin_panel');
        console.log(`🛡️ Admin panel connected: ${socket.id}`);
    });

    // Booth status updates
    socket.on('booth_status', ({ boothId, status }) => {
        if (activeBooths.has(boothId)) {
            activeBooths.get(boothId).status = status;
            console.log(`📊 Booth ${boothId} status: ${status}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`❌ Disconnected: ${socket.id}`);
        for (const [boothId, info] of activeBooths.entries()) {
            if (info.socketId === socket.id) {
                activeBooths.delete(boothId);
                console.log(`🏢 Booth ${boothId} removed`);
                break;
            }
        }
    });
});

app.set('io', io);
app.set('activeBooths', activeBooths);

// ─── API ROUTES ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/voting', votingRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

if (process.env.ENABLE_DEBUG === 'true') {
    console.warn('⚠️  Debug routes enabled');
    app.use('/api/debug', debugRoutes);
}

// ─── UTILITY ENDPOINTS ────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        phase: 2,
        timestamp: new Date().toISOString(),
        activeBooths: Array.from(activeBooths.keys()),
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'VoteRakshak Phase 2 Backend',
        phase: 2,
        routes: ['/api/auth', '/api/voting', '/api/officer', '/api/admin', '/api/public'],
    });
});

app.get('/api/booths/active', (req, res) => {
    const booths = Array.from(activeBooths.entries()).map(([id, info]) => ({
        boothId: id,
        status: info.status,
        connectedAt: info.connectedAt,
    }));
    res.json({ booths });
});

// ─── ERROR HANDLING ───────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
});

app.use((req, res) => {
    res.status(404).json({ error: { message: 'Route not found', path: req.path } });
});

// ─── START ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 VoteRakshak Backend — PHASE 2');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📡 HTTP:      http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log(`🌍 Env:       ${process.env.NODE_ENV || 'development'}`);
    console.log('═══════════════════════════════════════════════════');

    // Pre-warm system flags from DB
    try {
        await initFlags();
    } catch (err) {
        console.warn('⚠️ System flags init failed (DB may not be ready):', err.message);
    }

    try {
        const { initializeBlockchain, listenForVotes } = await import('./utils/blockchain.js');
        await initializeBlockchain();
        console.log('🔗 Blockchain initialized');
        listenForVotes((voteData) => {
            io.to('admin_panel').emit('live_vote_update', voteData);
            io.emit('new_block', voteData);
        });
    } catch (err) {
        console.warn('⚠️ Blockchain init failed (Ganache may not be running):', err.message);
    }
});

process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM — shutting down...');
    httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

export { io, activeBooths };
