/**
 * Students Page — Admin Panel Phase 2
 */

import { useState, useEffect } from 'react';
import { getStudents } from '../utils/api';

const DEPARTMENTS = ['', 'CO', 'AI', 'DS', 'ECS', 'ME', 'CE', 'EE'];

function Students() {
    const [students, setStudents] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [dept, setDept] = useState('');
    const [year, setYear] = useState('');
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const LIMIT = 20;

    useEffect(() => { loadStudents(); }, [dept, year, offset]);

    async function loadStudents() {
        setLoading(true);
        try {
            const { data } = await getStudents({ dept: dept || undefined, year: year || undefined, search: search || undefined, limit: LIMIT, offset });
            setStudents(data.students || []);
            setTotal(data.total || 0);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Students</h1>
                <p className="page-subtitle">Registered voters · Total: {total}</p>
            </div>

            <div className="page-content">
                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <input className="input" placeholder="Search by roll number..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && loadStudents()}
                        style={{ flex: '1', minWidth: '180px' }} />
                    <select className="input" value={dept} onChange={e => { setDept(e.target.value); setOffset(0); }} style={{ width: '140px' }}>
                        <option value="">All Depts</option>
                        {DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className="input" value={year} onChange={e => { setYear(e.target.value); setOffset(0); }} style={{ width: '120px' }}>
                        <option value="">All Years</option>
                        {['1', '2', '3', '4'].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => { setOffset(0); loadStudents(); }}>🔍 Search</button>
                </div>

                {loading ? <div className="spinner" /> : (
                    <>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Photo</th>
                                        <th>Name</th>
                                        <th>Roll Number</th>
                                        <th>Dept</th>
                                        <th>Year</th>
                                        <th>Phone</th>
                                        <th>Booth</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No students found</td></tr>
                                    ) : students.map(s => (
                                        <tr key={s.id}>
                                            <td>
                                                <img src={s.image_url || 'https://via.placeholder.com/36'} alt={s.first_name}
                                                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                                            </td>
                                            <td style={{ fontWeight: '600' }}>{s.first_name} {s.last_name}</td>
                                            <td><code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{s.roll_number}</code></td>
                                            <td><span className="badge badge-dept">{s.department}</span></td>
                                            <td>Yr {s.year}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{s.phone || '—'}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.booth_id || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0}>← Prev</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setOffset(offset + LIMIT)} disabled={offset + LIMIT >= total}>Next →</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default Students;
