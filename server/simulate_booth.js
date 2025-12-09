import { io } from 'socket.io-client';

const URL = 'http://localhost:5000';
const BOOTH_ID = 'BOOTH_TEST_001';

console.log(`🔌 Connecting to ${URL}...`);

const socket = io(URL, {
    transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
    console.log(`✅ Connected! Socket ID: ${socket.id}`);
    console.log(`📡 Registering as ${BOOTH_ID}...`);
    socket.emit('register_booth', BOOTH_ID);
});

socket.on('registration_confirmed', (data) => {
    console.log(`🎉 Registration Confirmed:`, data);
    console.log('✅ TEST PASSED: Server is accepting connections.');

    // Keep alive for a bit then exit
    setTimeout(() => {
        console.log('👋 Exiting simulation.');
        process.exit(0);
    }, 2000);
});

socket.on('connect_error', (err) => {
    console.error(`❌ Connection Error:`, err.message);
    process.exit(1);
});

// Timeout if not connected
setTimeout(() => {
    console.error('❌ TIMEOUT: Failed to connect or register in 5 seconds.');
    process.exit(1);
}, 5000);
