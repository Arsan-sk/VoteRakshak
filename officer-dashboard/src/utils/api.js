/**
 * API utility for Officer / BLO Dashboard — Phase 2
 * Updated: BLO login, roll-number voter search, dept-aware unlock
 * Network Support: Uses VITE_BACKEND_URL from .env for network deployments
 */

import axios from 'axios';

let baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
if (!baseUrl || baseUrl.trim() === '') {
    baseUrl = 'http://localhost:5000';
}
// Ensure protocol
if (!baseUrl.startsWith('http')) {
    baseUrl = `http://${baseUrl}`;
}
// Remove trailing slash
baseUrl = baseUrl.replace(/\/$/, '');

console.log(`🔌 Officer Dashboard API connecting to: ${baseUrl}`);

const api = axios.create({
    baseURL: `${baseUrl}/api`,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/** BLO login */
export async function login(username, password) {
    const response = await api.post('/auth/login', { username, password, role: 'officer' });
    return response.data;
}

/** Search voter by roll number (Phase 2) */
export async function searchVoterByRollNumber(rollNumber) {
    const response = await api.get('/officer/search-voter', { params: { rollNumber } });
    return response.data;
}

/** @deprecated Use searchVoterByRollNumber — kept for backward compat */
export async function getVoter(rollNumber) {
    return searchVoterByRollNumber(rollNumber);
}

/** Unlock booth for a verified voter (Phase 2 payload) */
export async function unlockBooth(boothId, voterRollNumber, voterName, voterPhoto, voterHash) {
    const response = await api.post('/officer/unlock-booth', {
        boothId,
        voterRollNumber,
        voterName,
        voterPhoto,
        voterHash,
    });
    return response.data;
}

/** Verify voter identity via PIN or fingerprint (biometric_mode flag) */
export async function verifyVoterIdentity(rollNumber, { pin, fingerprintTemplate } = {}) {
    const response = await api.post('/officer/verify-identity', {
        rollNumber,
        pin: pin || undefined,
        fingerprintTemplate: fingerprintTemplate || undefined,
    });
    return response.data;
}

/** Get system flags (public, no auth) */
export async function getFlags() {
    const response = await axios.get(`${baseUrl}/api/public/flags`);
    return response.data;
}

/** Set system flags (officer auth) */
export async function setOfficerFlag(key, value) {
    const response = await api.put(`/officer/flags/${key}`, { value });
    return response.data;
}

/** Reset booth */
export async function resetBooth(boothId) {
    const response = await api.post('/officer/reset-booth', { boothId });
    return response.data;
}

/** Audit logs (auto-scoped to BLO's booth by JWT) */
export async function getAuditLogs(filters = {}) {
    const response = await api.get('/officer/audit-logs', { params: filters });
    return response.data;
}

/** Officer stats */
export async function getStats() {
    const response = await api.get('/officer/stats');
    return response.data;
}

/** Get all booths */
export async function getBooths() {
    const response = await api.get('/voting/booths');
    return response.data;
}

/** Get active WebSocket-connected booths */
export async function getActiveBooths() {
    const response = await api.get('/booths/active');
    return response.data;
}

/** Get active election */
export async function getActiveElection() {
    const response = await api.get('/voting/active-election');
    return response.data;
}

export default { login, searchVoterByRollNumber, getVoter, unlockBooth, verifyVoterIdentity, getFlags, setOfficerFlag, resetBooth, getAuditLogs, getStats, getBooths, getActiveBooths, getActiveElection };
