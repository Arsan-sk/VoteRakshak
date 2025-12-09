/**
 * Socket.io client for Polling Booth
 * Handles WebSocket communication with backend server
 */

import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const BOOTH_ID = import.meta.env.VITE_BOOTH_ID || 'BOOTH_001';

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

    console.log(`🔌 Connecting to ${BACKEND_URL}...`);

    socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
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
