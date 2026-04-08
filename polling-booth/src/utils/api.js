/**
 * API utility for Polling Booth — Phase 2
 * castVote now uses electionId, candidateId, voterHash
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Cast a vote — Phase 2
 * @param {string} electionId - Active election UUID from DB
 * @param {string} candidateId - Candidate UUID from candidates table
 * @param {string} voterHash - keccak256 hash of voter roll number
 * @param {string|null} fingerprintTemplate - SecuGen template (optional in dev)
 */
export async function castVote(electionId, candidateId, voterHash, fingerprintTemplate = null) {
    const response = await api.post('/voting/cast', {
        electionId,
        candidateId,
        voterHash,
        fingerprintTemplate,
    });
    return response.data;
}

export default { castVote };
