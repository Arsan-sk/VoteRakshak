/**
 * Admin Login Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../utils/api';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await adminLogin(username, password);
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUsername', data.user.username);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '380px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🛡️</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '4px' }}>Admin Panel</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>VoteRakshak · Phase 2</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label>Admin Username</label>
                        <input className="input" type="text" value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin@vote.rakshak" required />
                    </div>
                    <div>
                        <label>Password</label>
                        <input className="input" type="password" value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter admin password" required />
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                        {loading ? 'Logging in...' : '🔐 Login'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Dev credentials:<br />
                    <strong style={{ color: 'var(--accent)' }}>admin@vote.rakshak</strong> / <strong style={{ color: 'var(--accent)' }}>admin@secure123</strong>
                </div>
            </div>
        </div>
    );
}

export default Login;
