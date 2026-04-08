/**
 * Elections Page — Phase 2
 * Three tabs: ER / DR / CR. Election initiation flow & live results.
 */

import { useState, useEffect, useRef } from 'react';
import { getAllElections, initiateElection, endElection, getLiveResults, searchStudents, getElection, getBLOs } from '../utils/api';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../utils/api';

const ELECTION_LABELS = { ER: 'Engineering Representative', DR: 'Department Representative', CR: 'Class Representative' };
const DEPARTMENTS = ['CO', 'AI', 'DS', 'ECS', 'ME', 'CE', 'EE'];

function Elections() {
    const [activeTab, setActiveTab] = useState('ER');
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInitiator, setShowInitiator] = useState(false);
    const [msg, setMsg] = useState('');
    const [activeElection, setActiveElection] = useState(null);
    const [liveResults, setLiveResults] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        loadElections();
        // Connect to admin WS room
        const socket = io(BACKEND_URL);
        socket.emit('register_admin');
        socket.on('live_vote_update', () => loadLiveResults());
        socket.on('election_started', loadElections);
        socket.on('election_ended', loadElections);
        socketRef.current = socket;
        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (activeElection) loadLiveResults();
    }, [activeElection]);

    async function loadElections() {
        try {
            const { data } = await getAllElections();
            setElections(data.elections || []);
            const active = (data.elections || []).find(e => e.status === 'active');
            setActiveElection(active || null);
        } finally {
            setLoading(false);
        }
    }

    async function loadLiveResults() {
        if (!activeElection) return;
        try {
            const { data } = await getLiveResults(activeElection.id);
            setLiveResults(data.results || []);
        } catch {}
    }

    const filtered = elections.filter(e => e.election_type === activeTab);
    const currentActive = elections.find(e => e.status === 'active');

    return (
        <>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Elections</h1>
                        <p className="page-subtitle">Manage ER, DR, and CR elections</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowInitiator(true)} disabled={!!currentActive}>
                        {currentActive ? '⚠️ Election Active' : '➕ New Election'}
                    </button>
                </div>
            </div>

            <div className="page-content">
                {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

                {/* Active Election Live Results */}
                {activeElection && liveResults.length > 0 && (
                    <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(99,102,241,0.4)' }}>
                        <div className="flex-between mb-4">
                            <h2 className="section-title" style={{ margin: 0 }}>
                                🔴 Live Results — {ELECTION_LABELS[activeElection.election_type]}
                            </h2>
                            <span className="badge badge-active">● Live</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {liveResults.sort((a, b) => b.voteCount - a.voteCount).map((r, i) => {
                                const maxV = Math.max(...liveResults.map(x => x.voteCount), 1);
                                return (
                                    <div key={r.candidateId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ width: '20px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{i + 1}</span>
                                        <img src={r.imageUrl || 'https://via.placeholder.com/36'} alt={r.name}
                                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{r.name}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '700' }}>{r.voteCount}</span>
                                            </div>
                                            <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px' }}>
                                                <div style={{
                                                    height: '100%', background: i === 0 ? 'var(--success)' : 'var(--accent)',
                                                    borderRadius: '3px', width: `${(r.voteCount / maxV) * 100}%`, transition: 'width 0.5s'
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="btn btn-danger" style={{ marginTop: '1rem', width: '100%' }}
                            onClick={async () => {
                                if (!window.confirm('End election and declare winner?')) return;
                                try { await endElection(activeElection.id); setMsg('✅ Election ended'); await loadElections(); }
                                catch (e) { setMsg('❌ ' + e.response?.data?.error); }
                            }}>
                            🔴 End Election & Declare Winner
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="tabs">
                    {['ER', 'DR', 'CR'].map(t => (
                        <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                            {t} — {ELECTION_LABELS[t]}
                        </button>
                    ))}
                </div>

                {/* Elections Table */}
                {loading ? <div className="spinner" /> : filtered.length === 0 ? (
                    <div className="empty-state">No {activeTab} elections found</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Dept / Year</th>
                                    <th>Started</th>
                                    <th>Ends At</th>
                                    <th>Winner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(e => (
                                    <tr key={e.id}>
                                        <td><span className={`badge badge-${e.status}`}>{e.status.toUpperCase()}</span></td>
                                        <td>{e.department || 'All'}{e.year ? ` · Y${e.year}` : ''}</td>
                                        <td>{e.started_at ? new Date(e.started_at).toLocaleDateString() : '—'}</td>
                                        <td>{new Date(e.ends_at).toLocaleString()}</td>
                                        <td style={{ color: 'var(--success)' }}>
                                            {e.students ? `${e.students.first_name} ${e.students.last_name}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Election Initiator Modal */}
            {showInitiator && (
                <ElectionInitiator
                    defaultType={activeTab}
                    onClose={() => setShowInitiator(false)}
                    onSuccess={(msg) => { setMsg(msg); setShowInitiator(false); loadElections(); }}
                />
            )}
        </>
    );
}

// ── Election Initiator Component ──────────────────────────────

function ElectionInitiator({ defaultType, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [type, setType] = useState(defaultType || 'ER');
    const [dept, setDept] = useState('');
    const [year, setYear] = useState('');
    const [endsAt, setEndsAt] = useState('');
    const [searchQ, setSearchQ] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function doSearch() {
        if (!searchQ) return;
        setSearching(true);
        try {
            const { data } = await searchStudents({ q: searchQ, electionType: type, dept: dept || undefined, year: year || undefined });
            setSearchResults(data.students || []);
        } finally {
            setSearching(false);
        }
    }

    function addCandidate(student) {
        if (selectedCandidates.length >= 10) { setError('Max 10 candidates'); return; }
        if (selectedCandidates.find(c => c.id === student.id)) { setError('Already added'); return; }
        if (student.isCurrentlyElected) { setError(`${student.first_name} ${student.last_name} currently holds an elected position`); return; }
        setError('');
        setSelectedCandidates(prev => [...prev, { ...student, serialNo: prev.length + 1 }]);
    }

    async function handleSubmit() {
        if (selectedCandidates.length < 2) { setError('At least 2 candidates required'); return; }
        if (!endsAt) { setError('End date required'); return; }
        if (type === 'DR' && !dept) { setError('Department required for DR'); return; }
        if (type === 'CR' && (!dept || !year)) { setError('Department and year required for CR'); return; }

        setSubmitting(true);
        try {
            await initiateElection({
                electionType: type,
                department: dept || undefined,
                year: year || undefined,
                endsAt,
                candidates: selectedCandidates.map(c => ({ studentId: c.id, serialNo: c.serialNo })),
            });
            onSuccess('✅ Election initiated successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to initiate');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
                <div className="flex-between mb-4">
                    <h2 style={{ fontWeight: '700', fontSize: '1.1rem' }}>🗳️ Initiate Election — Step {step}/3</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label>Election Type</label>
                            <select className="input" value={type} onChange={e => setType(e.target.value)}>
                                <option value="ER">ER — Engineering Representative (all depts)</option>
                                <option value="DR">DR — Department Representative</option>
                                <option value="CR">CR — Class Representative (dept + year)</option>
                            </select>
                        </div>
                        {(type === 'DR' || type === 'CR') && (
                            <div>
                                <label>Department</label>
                                <select className="input" value={dept} onChange={e => setDept(e.target.value)} required>
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        )}
                        {type === 'CR' && (
                            <div>
                                <label>Year</label>
                                <select className="input" value={year} onChange={e => setYear(e.target.value)} required>
                                    <option value="">Select Year</option>
                                    {['1', '2', '3', '4'].map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label>Election End Date & Time</label>
                            <input className="input" type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" onClick={() => setStep(2)}>Next: Add Candidates →</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input className="input" placeholder="Search by roll number..." value={searchQ}
                                onChange={e => setSearchQ(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && doSearch()} style={{ flex: 1 }} />
                            <button className="btn btn-primary btn-sm" onClick={doSearch} disabled={searching}>
                                {searching ? '...' : '🔍'}
                            </button>
                        </div>

                        {searchResults.length > 0 && (
                            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px', marginBottom: '1rem' }}>
                                {searchResults.map(s => (
                                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{s.first_name} {s.last_name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.roll_number} · {s.department} · Y{s.year}</p>
                                            {s.isCurrentlyElected && <span className="badge badge-pending">Currently Elected</span>}
                                        </div>
                                        <button className="btn btn-primary btn-sm" onClick={() => addCandidate(s)} disabled={!s.canBeNominated}>Add</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="card-title">Selected Candidates ({selectedCandidates.length}/10)</p>
                        {selectedCandidates.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No candidates added yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {selectedCandidates.map((c, i) => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '0.875rem' }}>#{c.serialNo} {c.first_name} {c.last_name} — {c.roll_number}</span>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedCandidates(prev => prev.filter(x => x.id !== c.id))}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(3)} disabled={selectedCandidates.length < 2}>Review →</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                            <p><strong>Type:</strong> {type} — {ELECTION_LABELS[type]}</p>
                            {dept && <p><strong>Department:</strong> {dept}</p>}
                            {year && <p><strong>Year:</strong> Year {year}</p>}
                            <p><strong>Ends At:</strong> {new Date(endsAt).toLocaleString()}</p>
                            <p><strong>Candidates:</strong> {selectedCandidates.length}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Initiating...' : '🚀 Initiate Election'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Elections;
