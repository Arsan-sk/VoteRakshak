/**
 * Admin Dashboard Page — Stats + Active Election Overview
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getAllElections, endElection } from '../utils/api';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [activeElection, setActiveElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ending, setEnding] = useState(false);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 15000);
        return () => clearInterval(interval);
    }, []);

    async function loadData() {
        try {
            const [statsRes, elecRes] = await Promise.all([
                getDashboardStats(),
                getAllElections(),
            ]);
            setStats(statsRes.data.stats);
            const active = elecRes.data.elections?.find(e => e.status === 'active');
            setActiveElection(active || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleEndElection() {
        if (!activeElection) return;
        if (!window.confirm('End this election and declare results?')) return;
        setEnding(true);
        try {
            await endElection(activeElection.id);
            setMsg('✅ Election ended. Results declared.');
            await loadData();
        } catch (err) {
            setMsg('❌ ' + (err.response?.data?.error || 'Failed to end election'));
        } finally {
            setEnding(false);
        }
    }

    const ELECTION_LABELS = { ER: 'Engineering Representative', DR: 'Department Representative', CR: 'Class Representative' };

    if (loading) return (
        <div className="page-content">
            <div className="spinner" />
        </div>
    );

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">VoteRakshak Phase 2 — Admin Overview</p>
            </div>

            <div className="page-content">
                {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

                {/* Stat Cards */}
                <div className="stat-grid">
                    {[
                        { icon: '👥', value: stats?.totalStudents || 0, label: 'Registered Students' },
                        { icon: '🗳️', value: stats?.totalElections || 0, label: 'Total Elections' },
                        { icon: '🏢', value: stats?.onlineBooths || 0, label: 'Booths Online' },
                        { icon: activeElection ? '🟢' : '⚪', value: activeElection ? 'ACTIVE' : 'NONE', label: 'Current Election' },
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className="stat-icon">{s.icon}</div>
                            <div className="stat-value" style={{ fontSize: typeof s.value === 'string' ? '1.25rem' : '2rem' }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Active Election Card */}
                {activeElection ? (
                    <div className="card" style={{ borderColor: '#10b981', marginBottom: '1.5rem' }}>
                        <div className="flex-between mb-4">
                            <div>
                                <div className="flex-between gap-2" style={{ marginBottom: '4px' }}>
                                    <span className="badge badge-active">● Active</span>
                                    <span className="badge badge-dept">{activeElection.election_type}</span>
                                </div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '6px' }}>
                                    {ELECTION_LABELS[activeElection.election_type]} Election
                                </h2>
                                {activeElection.department && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '3px' }}>
                                        {activeElection.department}{activeElection.year ? ` · Year ${activeElection.year}` : ''}
                                    </p>
                                )}
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                                    Ends: {new Date(activeElection.ends_at).toLocaleString()}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/elections')}>View Details</button>
                                <button className="btn btn-danger btn-sm" onClick={handleEndElection} disabled={ending}>
                                    {ending ? 'Ending...' : '🔴 End Election'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No election is currently active</p>
                        <button className="btn btn-primary" onClick={() => navigate('/admin/elections')}>
                            ➕ Start New Election
                        </button>
                    </div>
                )}

                {/* Quick Links */}
                <div className="section-title">Quick Actions</div>
                <div className="grid-3" style={{ gap: '0.75rem' }}>
                    {[
                        { icon: '🗳️', label: 'Initiate Election', path: '/admin/elections' },
                        { icon: '👥', label: 'Manage Students', path: '/admin/students' },
                        { icon: '🏢', label: 'BLO Management', path: '/admin/blos' },
                        { icon: '🏆', label: 'View Results', path: '/admin/results' },
                    ].map((a) => (
                        <button key={a.path} className="card" onClick={() => navigate(a.path)}
                            style={{ cursor: 'pointer', textAlign: 'center', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{a.icon}</div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>{a.label}</p>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Dashboard;
