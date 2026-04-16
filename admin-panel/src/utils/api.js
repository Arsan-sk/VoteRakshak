/**
 * Admin Panel API utilities — Phase 2
 */

import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${BASE}/api`,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem('adminToken');
            window.location.href = '/';
        }
        return Promise.reject(err);
    }
);

// Auth
export const adminLogin = (u, p) => api.post('/auth/admin/login', { username: u, password: p });

// Dashboard
export const getDashboardStats = () => api.get('/admin/dashboard/stats');

// Students
export const getStudents = (params = {}) => api.get('/admin/students', { params });
export const searchStudents = (params) => api.get('/admin/students/search', { params });

// BLOs
export const getBLOs = () => api.get('/admin/blos');
export const reassignBLO = (id, boothId) => api.patch(`/admin/blos/${id}/assign-booth`, { boothId });

// Elections
export const getAllElections = () => api.get('/admin/elections');
export const getElection = (id) => api.get(`/admin/elections/${id}`);
export const initiateElection = (data) => api.post('/admin/elections/initiate', data);
export const endElection = (id) => api.post(`/admin/elections/${id}/end`);
export const getLiveResults = (id) => api.get(`/admin/results/live/${id}`);

// Public (no auth needed but available)
export const getElectedPositions = () => api.get('/public/elected-positions');

export const BACKEND_URL = BASE;
export default api;
