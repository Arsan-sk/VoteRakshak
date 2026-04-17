/**
 * Socket.io client for Polling Booth
 * Handles WebSocket communication with backend server
 */

import { io } from 'socket.io-client';

// Robust URL handling
let backendUrl = import.meta.env.VITE_BACKEND_URL;
if (!backendUrl || backendUrl.trim() === '') {
    backendUrl = 'http://localhost:5000';
}
// Ensure protocol
if (!backendUrl.startsWith('http')) {
    backendUrl = `http://${backendUrl}`;
}
// Remove trailing slash
backendUrl = backendUrl.replace(/\/$/, '');

const BOOTH_ID = import.meta.env.VITE_BOOTH_ID || 'BOOTH_001';

console.log(`🔌 Initializing socket for ${BOOTH_ID} to ${backendUrl}`);

let socket = null;

/**
 * Initialize WebSocket connection
 * @param {Function} onAllowVote - Callback when booth is unlocked
 * @param {Function} onReset - Callback when booth is reset
 */
export function initializeSocket(onAllowVote, onReset) {
    if (socket) {
        console.warn('Socket already initialized');
        return socket;
    }

    console.log(`🔌 Connecting to ${backendUrl}...`);

    socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: Infinity, // Keep trying
    });

    // Connection established
    socket.on('connect', () => {
        console.log(`✅ Connected to server (Socket ID: ${socket.id})`);

        // Register this booth
        socket.emit('register_booth', BOOTH_ID);
        console.log(`📡 Registering as ${BOOTH_ID}...`);
    });

    // Registration confirmed
    socket.on('registration_confirmed', (data) => {
        console.log(`✅ Booth registered:`, data);
    });

    // Listen for allow_vote event from officer
    socket.on('allow_vote', (data) => {
        console.log(`🔓 Booth unlocked! Voter authorized:`, data);

        if (onAllowVote) {
            onAllowVote(data);
        }
    });

    // Listen for reset event
    socket.on('reset_booth', (data) => {
        console.log(`🔄 Booth reset:`, data);

        if (onReset) {
            onReset(data);
        }
    });

    // Connection error
    socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message);
        console.error('   Backend URL:', backendUrl);
        console.error('   Make sure:');
        console.error('   1. Backend server is running on:', backendUrl);
        console.error('   2. VITE_BACKEND_URL in .env is correct');
        console.error('   3. Network connectivity is working');
        console.error('   4. Firewall allows port 5000');
        if (error.data?.content) {
            console.error('   Server response:', error.data.content);
        }
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
        console.warn(`⚠️  Disconnected: ${reason}`);
    });

    // Reconnection attempt
    socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    // Reconnected
    socket.on('reconnect', () => {
        console.log('✅ Reconnected to server');
        // Re-register booth after reconnection
        socket.emit('register_booth', BOOTH_ID);
    });

    return socket;
}

/**
 * Update booth status
 * @param {string} status - Current booth status (idle, active, voting)
 */
export function updateBoothStatus(status) {
    if (socket && socket.connected) {
        socket.emit('booth_status', {
            boothId: BOOTH_ID,
            status,
        });
    }
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('🔌 Socket disconnected');
    }
}

/**
 * Get booth ID
 */
export function getBoothId() {
    return BOOTH_ID;
}

export default {
    initializeSocket,
    updateBoothStatus,
    disconnectSocket,
    getBoothId,
};
