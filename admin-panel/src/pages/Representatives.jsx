/**
 * Admin Panel — Representatives Tab
 * Shows current elected reps (ER / DR / CR) and past holders
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ELECTION_TYPE_LABELS = {
    ER: 'Engineering Representative',
    DR: 'Department Representative',
    CR: 'Class Representative',
};

const DEPARTMENTS = ['CO', 'AI', 'DS', 'ECS', 'ME', 'CE', 'EE'];
const DEPT_NAMES = {
    CO: 'Computer Engineering', AI: 'AI / ML', DS: 'Data Science',
    ECS: 'Electronics & CS', ME: 'Mechanical', CE: 'Civil', EE: 'Electrical',
};

function Representatives() {
    const [current, setCurrent] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRepresentatives();
    }, []);

    async function loadRepresentatives() {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${BACKEND_URL}/api/admin/representatives`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCurrent(res.data.current || []);
            setHistory(res.data.history || []);
        } catch (err) {
            console.error('Failed to load representatives:', err);
        } finally {
            setLoading(false);
        }
    }

    // Group current by position type
    const currentER = current.find(p => p.position === 'ER');
    const currentDR = current.filter(p => p.position === 'DR');
    const currentCR = current.filter(p => p.position === 'CR');

    if (loading) {
        return (
            <div className="admin-page">
                <div className="page-header"><h1>🏛️ Representatives</h1></div>
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading representatives...</div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>🏛️ Representatives</h1>
                <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Current and past elected student representatives</p>
            </div>

            {/* ── Engineering Representative (single seat) ── */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem' }}>ER</span>
                    Engineering Representative
                </h2>
                {currentER ? (
                    <RepCard position={currentER} />
                ) : (
                    <VacantCard label="Engineering Representative" />
                )}
            </section>

            {/* ── Department Representatives (per dept) ── */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem' }}>DR</span>
                    Department Representatives
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {DEPARTMENTS.map(dept => {
                        const holder = currentDR.find(p => p.department === dept);
                        return holder ? (
                            <RepCard key={dept} position={holder} showDept />
                        ) : (
                            <VacantCard key={dept} label={`${DEPT_NAMES[dept]} (${dept})`} />
                        );
                    })}
                </div>
            </section>

            {/* ── Class Representatives (per dept+year) ── */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem' }}>CR</span>
                    Class Representatives
                </h2>
                {currentCR.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {currentCR.map(p => (
                            <RepCard key={p.id} position={p} showDept showYear />
                        ))}
                    </div>
                ) : (
                    <VacantCard label="Class Representatives — No CR elections held yet" />
                )}
            </section>

            {/* ── Past Representatives ── */}
            <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                    📜 Election History
                </h2>
                {history.length === 0 ? (
                    <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid #334155', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        No election records yet
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #334155' }}>
                                    {['Position', 'Name', 'Roll No', 'Dept', 'Year', 'Election', 'Date'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(row => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <span style={{
                                                background: row.position === 'ER' ? '#4f46e5' : row.position === 'DR' ? '#0284c7' : '#d97706',
                                                color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                                            }}>{row.position}</span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#fff', fontWeight: 600 }}>
                                            {row.students ? `${row.students.first_name} ${row.students.last_name}` : '—'}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{row.students?.roll_number || '—'}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{row.department || row.students?.department || '—'}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{row.year || row.students?.year || '—'}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                                            {ELECTION_TYPE_LABELS[row.elections?.election_type] || '—'}
                                            {row.elections?.status === 'ended' && <span style={{ color: '#64748b', marginLeft: 4 }}>(ended)</span>}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                            {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

// ── Rep Card Component ──
function RepCard({ position, showDept = false, showYear = false }) {
    const s = position.students;
    if (!s) return null;
    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(51,65,85,0.6))',
            border: '1px solid rgba(250,204,21,0.3)',
            borderRadius: '16px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center',
        }}>
            <img src={s.image_url || 'https://via.placeholder.com/64'} alt={s.first_name}
                style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '3px solid #facc15' }} />
            <div>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{s.first_name} {s.last_name}</p>
                <p style={{ color: '#facc15', fontSize: '0.8rem', fontWeight: 600 }}>
                    {ELECTION_TYPE_LABELS[position.position]}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    {s.roll_number}
                    {showDept && ` · ${DEPT_NAMES[s.department] || s.department}`}
                    {showYear && ` · Year ${s.year}`}
                </p>
            </div>
        </div>
    );
}

// ── Vacant Card Component ──
function VacantCard({ label }) {
    return (
        <div style={{
            background: 'rgba(30,41,59,0.4)',
            border: '1px dashed #475569',
            borderRadius: '16px', padding: '1.5rem', textAlign: 'center',
        }}>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>—</span>
                {label}
            </p>
            <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.25rem' }}>Position currently vacant</p>
        </div>
    );
}

export default Representatives;
