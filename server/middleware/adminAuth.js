/**
 * Admin Authentication Middleware (Phase 2)
 * Verifies JWT tokens signed with ADMIN_JWT_SECRET for admin-only routes
 */

import jwt from 'jsonwebtoken';

export function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Admin access token required' });
    }

    jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin_fallback_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired admin token' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin role required' });
        }
        req.admin = user;
        next();
    });
}
