/**
 * API utility for Voter Portal — Phase 2
 * Network Support: Uses VITE_BACKEND_URL from .env for network deployments
 */

import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
if (!API_BASE_URL || API_BASE_URL.trim() === '') {
    API_BASE_URL = 'http://localhost:5000';
}
if (!API_BASE_URL.startsWith('http')) {
    API_BASE_URL = `http://${API_BASE_URL}`;
}
API_BASE_URL = API_BASE_URL.replace(/\/$/, '');

console.log(`🔌 Voter Portal API connecting to: ${API_BASE_URL}`);

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('voterToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Register a new voter
 */
export async function registerVoter(voterData) {
    const response = await api.post('/auth/register', voterData);
    return response.data;
}

/**
 * Voter login
 */
export async function voterLogin(aadhar) {
    const response = await api.post('/auth/login', {
        aadhar,
        role: 'voter',
    });
    return response.data;
}

/**
 * Get voter information
 */
export async function getVoterInfo(aadhar) {
    const response = await api.get(`/voting/voter/${aadhar}`);
    return response.data;
}

/**
 * Get list of polling booths
 */
export async function getBooths() {
    const response = await api.get('/voting/booths');
    return response.data;
}

export default {
    registerVoter,
    voterLogin,
    getVoterInfo,
    getBooths,
};
