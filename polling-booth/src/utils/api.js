/**
 * API utility for polling booth
 * Handles HTTP requests to backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Cast a vote
 * @param {string} aadhar - Voter's Aadhaar number
 * @param {number} partyId - Selected party ID
 * @param {string} fingerprintTemplate - Captured fingerprint template
 */
export async function castVote(aadhar, partyId, fingerprintTemplate) {
    try {
        const response = await api.post('/voting/cast', {
            aadhar,
            partyId,
            fingerprintTemplate,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to cast vote');
    }
}

export default {
    castVote,
};
