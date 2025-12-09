/**
 * API utility for Officer Dashboard
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Officer login
 */
export async function login(username, password) {
    const response = await api.post('/auth/login', {
        username,
        password,
        role: 'officer',
    });
    return response.data;
}

/**
 * Get voter information by Aadhaar
 */
export async function getVoter(aadhar) {
    const response = await api.get(`/voting/voter/${aadhar}`);
    return response.data;
}

/**
 * Unlock a polling booth for a voter
 */
export async function unlockBooth(boothId, voterAadhar, voterName, voterPhoto) {
    const response = await api.post('/officer/unlock-booth', {
        boothId,
        voterAadhar,
        voterName,
        voterPhoto,
        officerId: localStorage.getItem('officerId') || 'OFFICER_001',
    });
    return response.data;
}

/**
 * Reset a booth to idle state
 */
export async function resetBooth(boothId) {
    const response = await api.post('/officer/reset-booth', {
        boothId,
        officerId: localStorage.getItem('officerId') || 'OFFICER_001',
    });
    return response.data;
}

/**
 * Get audit logs
 */
export async function getAuditLogs(filters = {}) {
    const response = await api.get('/officer/audit-logs', { params: filters });
    return response.data;
}

/**
 * Get dashboard statistics
 */
export async function getStats() {
    const response = await api.get('/officer/stats');
    return response.data;
}

/**
 * Get list of polling booths
 */
export async function getBooths() {
    const response = await api.get('/voting/booths');
    return response.data;
}

/**
 * Get active booths
 */
export async function getActiveBooths() {
    const response = await api.get('/booths/active', {
        baseURL: API_BASE_URL,
    });
    return response.data;
}

export default {
    login,
    getVoter,
    unlockBooth,
    resetBooth,
    getAuditLogs,
    getStats,
    getBooths,
    getActiveBooths,
};
