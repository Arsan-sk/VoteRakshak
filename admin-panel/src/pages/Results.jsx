/**
 * Results Page — Admin Panel Phase 2
 * Historical declared results with winner cards
 */

import { useState, useEffect } from 'react';
import { getAllElections, getElection } from '../utils/api';

const ELECTION_LABELS = { ER: 'Engineering Representative', DR: 'Department Representative', CR: 'Class Representative' };

function Results() {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedElection, setSelectedElection] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        getAllElections().then(({ data }) => {
            const ended = (data.elections || []).filter(e => e.status === 'ended');
            setElections(ended);
        }).finally(() => setLoading(false));
    }, []);

    async function loadDetail(election) {
        setSelectedElection(election);
        setDetailLoading(true);
        try {
            const { data } = await getElection(election.id);
            setCandidates(data.candidates || []);
        } finally {
            setDetailLoading(false);
        }
    }

    const maxVotes = candidates.length > 0 ? Math.max(...candidates.map(c => c.vote_count), 1) : 1;

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Results</h1>
                <p className="page-subtitle">Declared election results — {elections.length} elections completed</p>
            </div>

            <div className="page-content">
                {loading ? <div className="spinner" /> : elections.length === 0 ? (
                    <div className="empty-state">No declared results yet. End an election to see results here.</div>
                ) : (
                    <div className="grid-2" style={{ gap: '1rem' }}>
                        {/* List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {elections.map(e => (
                                <div key={e.id} className="card" style={{ cursor: 'pointer', borderColor: selectedElection?.id === e.id ? 'var(--accent)' : 'var(--border-subtle)' }}
                                    onClick={() => loadDetail(e)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <span className="badge badge-dept" style={{ marginBottom: '6px', display: 'inline-block' }}>{e.election_type}</span>
                                            <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{ELECTION_LABELS[e.election_type]}</p>
                                            {e.department && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{e.department}{e.year ? ` · Y${e.year}` : ''}</p>}
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                                                Ended: {new Date(e.ended_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="badge badge-ended">ENDED</span>
                                    </div>
                                    {e.students && (
                                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>🏆</span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--success)' }}>
                                                {e.students.first_name} {e.students.last_name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Detail */}
                        <div>
                            {!selectedElection ? (
                                <div className="card empty-state">Select an election to see detailed results</div>
                            ) : detailLoading ? (
                                <div className="card"><div className="spinner" /></div>
                            ) : (
                                <div className="card">
                                    <h2 style={{ fontWeight: '700', marginBottom: '1rem' }}>
                                        {ELECTION_LABELS[selectedElection.election_type]}
                                        {selectedElection.department ? ` — ${selectedElection.department}` : ''}
                                    </h2>

                                    {/* Winner */}
                                    {selectedElection.students && (
                                        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginBottom: '4px' }}>🏆 WINNER</p>
                                            <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedElection.students.first_name} {selectedElection.students.last_name}</p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{selectedElection.students.roll_number} · {selectedElection.students.department}</p>
                                        </div>
                                    )}

                                    {/* All results */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {candidates.sort((a, b) => b.vote_count - a.vote_count).map((c, i) => (
                                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ width: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>#{i + 1}</span>
                                                <img src={c.students?.image_url || 'https://via.placeholder.com/36'} alt={c.students?.first_name}
                                                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${i === 0 ? 'var(--success)' : 'var(--border)'}` }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{c.students?.first_name} {c.students?.last_name}</span>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: i === 0 ? 'var(--success)' : 'var(--text-secondary)' }}>{c.vote_count}v</span>
                                                    </div>
                                                    <div style={{ height: '5px', background: 'var(--bg-secondary)', borderRadius: '3px' }}>
                                                        <div style={{ height: '100%', background: i === 0 ? 'var(--success)' : 'var(--accent)', borderRadius: '3px', width: `${(c.vote_count / maxVotes) * 100}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Results;
