#!/usr/bin/env node
/*
  simulate_booth.js
  Simple script to simulate a polling booth connecting to the VoteRakshak server

  Usage:
    node scripts/simulate_booth.js BOOTH_ID SERVER_URL

  Example:
    node scripts/simulate_booth.js BOOTH_001 https://server-voterakshak-production.up.railway.app

  This connects using socket.io-client, emits `register_booth`, and listens for `allow_vote` and `reset_booth`.
*/

import { io } from 'socket.io-client';

const [,, boothId, serverUrl] = process.argv;

if (!boothId || !serverUrl) {
  console.error('Usage: node scripts/simulate_booth.js BOOTH_ID SERVER_URL');
  process.exit(1);
}

console.log(`Connecting as ${boothId} to ${serverUrl}...`);

const socket = io(serverUrl, {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log(`Connected (socket id: ${socket.id})`);
  socket.emit('register_booth', boothId);
  console.log(`Registered booth: ${boothId}`);
});

socket.on('registration_confirmed', (data) => {
  console.log('Registration confirmed:', data);
});

socket.on('allow_vote', (data) => {
  console.log('ALLOW_VOTE received:', data);
});

socket.on('reset_booth', (data) => {
  console.log('RESET_BOOTH received:', data);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('Connect error:', err.message);
});

// Keep process running
process.on('SIGINT', () => {
  console.log('Disconnecting...');
  socket.disconnect();
  process.exit(0);
});
