/**
 * Landing Page / Home — Phase 2
 * Dynamic: shows active election, provisional live counts, declared results, elected representatives
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ELECTION_TYPE_LABELS = {
    ER: 'Engineering Representative',
    DR: 'Department Representative',
    CR: 'Class Representative',
};

function Home() {
    const navigate = useNavigate();
    const [activeElection, setActiveElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [results, setResults] = useState([]);
    const [electedPositions, setElectedPositions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${BACKEND_URL}/api/public/active-election`).then(r => r.json()),
            fetch(`${BACKEND_URL}/api/public/results`).then(r => r.json()),
            fetch(`${BACKEND_URL}/api/public/elected-positions`).then(r => r.json()),
        ]).then(([activeData, resultsData, positionsData]) => {
            if (activeData.election) { setActiveElection(activeData.election); setCandidates(activeData.candidates || []); }
            setResults(resultsData.results || []);
            setElectedPositions(positionsData.positions || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const maxVotes = candidates.length > 0 ? Math.max(...candidates.map(c => c.voteCount), 1) : 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900">

            {/* Hero */}
            <section className="container mx-auto px-4 pt-16 pb-8 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                    <span className="text-5xl">🗳️</span>
                    <h1 className="text-6xl font-extrabold text-white tracking-tight">VoteRakshak</h1>
                </div>
                <p className="text-xl text-purple-300 mb-2 font-medium">College Election Management System</p>
                <p className="text-gray-400 mb-8">Blockchain-Secured · Biometric-Protected · Transparent</p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <button onClick={() => navigate('/register')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5">
                        📝 Register to Vote
                    </button>
                    <button onClick={() => navigate('/login')}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg">
                        🔐 Login
                    </button>
                </div>
            </section>

            {/* Active Election Panel */}
            {!loading && activeElection && (
                <section className="container mx-auto px-4 py-8">
                    <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-md border border-indigo-500/50 rounded-2xl p-8 shadow-2xl">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 text-green-300 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    Election Active
                                </div>
                                <h2 className="text-2xl font-bold text-white">{ELECTION_TYPE_LABELS[activeElection.type]} Election</h2>
                                {activeElection.department && <p className="text-indigo-300 text-sm mt-1">Department: {activeElection.department}{activeElection.year ? ` · Year ${activeElection.year}` : ''}</p>}
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-xs mb-1">Election Ends</p>
                                <p className="text-white font-semibold">{new Date(activeElection.endsAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <p className="text-yellow-300 text-sm font-medium mb-4">📊 Provisional Results — Voting in Progress</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {candidates.map((c, i) => (
                                <div key={c.id} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="relative">
                                            <img src={c.imageUrl || 'https://via.placeholder.com/60'} alt={c.name}
                                                className="w-14 h-14 rounded-lg object-cover border-2 border-indigo-500" />
                                            <span className="absolute -top-2 -left-2 bg-indigo-700 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{c.serialNo}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">{c.name}</p>
                                            <p className="text-gray-400 text-xs">{c.department} · Yr {c.year}</p>
                                        </div>
                                    </div>
                                    <div className="relative h-2 bg-gray-700 rounded-full">
                                        <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.round((c.voteCount / maxVotes) * 100)}%` }} />
                                    </div>
                                    <p className="text-indigo-300 text-xs mt-1.5 font-medium">{c.voteCount} votes</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* No active election notice */}
            {!loading && !activeElection && (
                <section className="container mx-auto px-4 py-6">
                    <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center">
                        <p className="text-gray-400">No election is currently active. Results will appear here when an election is declared.</p>
                    </div>
                </section>
            )}

            {/* Elected Positions */}
            {electedPositions.length > 0 && (
                <section className="container mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">🏆 Current Elected Representatives</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {electedPositions.map((pos) => (
                            <div key={pos.id} className="bg-gradient-to-br from-yellow-900/40 to-amber-900/30 border border-yellow-600/50 rounded-2xl p-6 text-center">
                                <img src={pos.students?.image_url || 'https://via.placeholder.com/80'} alt={pos.students?.first_name}
                                    className="w-20 h-20 rounded-full border-4 border-yellow-500 object-cover mx-auto mb-3" />
                                <p className="font-bold text-white text-lg">{pos.students ? `${pos.students.first_name} ${pos.students.last_name}` : '—'}</p>
                                <p className="text-yellow-300 text-sm mb-1">{ELECTION_TYPE_LABELS[pos.position]}</p>
                                <p className="text-gray-400 text-xs">{pos.students?.department}{pos.students?.roll_number ? ` · ${pos.students.roll_number}` : ''}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Past Results */}
            {results.length > 0 && (
                <section className="container mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">📜 Past Election Results</h2>
                    <div className="space-y-4">
                        {results.map((r) => (
                            <div key={r.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                                <div className="flex flex-wrap justify-between items-center mb-4">
                                    <div>
                                        <span className="text-xs text-indigo-400 font-medium uppercase tracking-wide">{r.type} Election</span>
                                        {r.department && <span className="ml-2 text-xs text-gray-400">· {r.department}{r.year ? ` Year ${r.year}` : ''}</span>}
                                        <p className="text-sm text-gray-400 mt-0.5">Ended: {new Date(r.endedAt).toLocaleDateString()}</p>
                                    </div>
                                    {r.winner && (
                                        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-600/30 px-4 py-2 rounded-lg">
                                            <span>🏆</span>
                                            <div>
                                                <p className="text-yellow-300 font-semibold text-sm">{r.winner.name}</p>
                                                <p className="text-gray-400 text-xs">{r.winner.department}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {r.candidates.map((c, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-lg text-xs">
                                            <span className="text-gray-300 font-medium">{c.name}</span>
                                            <span className="text-indigo-300 font-bold">{c.voteCount}v</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Features */}
            <section className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: '🔒', title: 'Blockchain Secured', desc: 'Every vote is recorded immutably on a distributed blockchain' },
                        { icon: '👆', title: 'Biometric Auth', desc: 'Fingerprint scanner prevents duplicate votes and fraud' },
                        { icon: '🏛️', title: 'Dept-Scoped', desc: '7 booths — each scoped to their department for fair representation' },
                    ].map(f => (
                        <div key={f.title} className="bg-gray-800/40 backdrop-blur border border-gray-700 rounded-xl p-6 hover:border-indigo-600 transition-colors">
                            <div className="text-3xl mb-3">{f.icon}</div>
                            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-gray-400 text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
                <p>© 2025 VoteRakshak — Blockchain College Election Management System · Phase 2</p>
            </footer>
        </div>
    );
}

export default Home;
