/**
 * Officer / BLO Dashboard — Phase 2
 * - Search voter by ROLL NUMBER (not Aadhaar)
 * - Shows BLO's OWN booth only (from JWT / localStorage)
 * - Locks unlock to the BLO's assigned booth
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchVoterByRollNumber, unlockBooth, getActiveBooths } from '../utils/api';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const DEPT_NAMES = {
    CO: 'Computer Engineering', AI: 'AI / ML', DS: 'Data Science',
    ECS: 'Electronics & CS', ME: 'Mechanical', CE: 'Civil', EE: 'Electrical',
};

function Dashboard() {
    const [rollNumber, setRollNumber] = useState('');
    const [voter, setVoter] = useState(null);
    const [activeBooths, setActiveBooths] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [myBoothOnline, setMyBoothOnline] = useState(false);
    const socketRef = useRef(null);
    const navigate = useNavigate();

    // BLO's credentials from localStorage (set during login)
    const username = localStorage.getItem('username') || 'BLO';
    const displayName = localStorage.getItem('displayName') || username;
    const boothId = localStorage.getItem('boothId');
    const boothName = localStorage.getItem('boothName') || boothId;
    const boothAddress = localStorage.getItem('boothAddress') || '—';
    const department = localStorage.getItem('department') || '—';

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/'); return; }
        loadActiveBooths();

        // WebSocket — track which booths are online
        const socket = io(BACKEND_URL);
        socketRef.current = socket;
        socket.on('booth_status_update', (data) => {
            loadActiveBooths();
        });
        const interval = setInterval(loadActiveBooths, 5000);
        return () => { clearInterval(interval); socket.disconnect(); };
    }, [navigate]);

    async function loadActiveBooths() {
        try {
            const result = await getActiveBooths();
            const booths = result.booths || [];
            setActiveBooths(booths);
            // Check if MY booth specifically is online
            setMyBoothOnline(booths.some(b => b.boothId === boothId));
        } catch (err) {
            console.warn('Could not load active booths:', err.message);
        }
    }

    async function handleSearch(e) {
        e.preventDefault();
        setError(''); setSuccess(''); setVoter(null);
        if (!rollNumber.trim()) { setError('Please enter a roll number'); return; }
        setLoading(true);
        try {
            const result = await searchVoterByRollNumber(rollNumber.toUpperCase());
            const v = result.voter;

            // Dept mismatch check: BLO's dept must match voter's dept for DR/CR elections
            if (department && v.department && v.department !== department) {
                setError(
                    `⚠️ Department mismatch: ${v.fullName} is from ${v.department} dept but this booth (${boothId}) serves ${department} dept. ` +
                    `For ER elections this is OK, but they should go to the ${v.department} booth for dept elections.`
                );
            }
            setVoter(v);
        } catch (err) {
            setError(err.response?.data?.error || 'Voter not found');
        } finally {
            setLoading(false);
        }
    }

    async function handleUnlockBooth() {
        if (!voter) { setError('Search for a voter first'); return; }
        if (!boothId) { setError('No booth assigned to your account'); return; }
        if (!myBoothOnline) {
            if (!window.confirm(`⚠️ ${boothName} does not appear to be online. Unlock anyway?`)) return;
        }

        setError(''); setSuccess(''); setLoading(true);
        try {
            await unlockBooth(boothId, voter.rollNumber, voter.fullName, voter.imageUrl, voter.voterHash);
            setSuccess(`✅ ${boothName} unlocked for ${voter.fullName} (${voter.rollNumber})`);
            setTimeout(() => { setRollNumber(''); setVoter(null); setSuccess(''); }, 4000);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to unlock booth';
            setError(msg);
            if (msg.includes('not currently connected')) {
                alert(`⚠️ ${msg}\nAsk the polling booth PC to refresh its page.`);
            }
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        localStorage.clear();
        navigate('/');
    }

    const inputCls = 'px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 p-4 md:p-6">

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="bg-gray-800/80 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4 border border-blue-700/50">
                    <div>
                        <h1 className="text-2xl font-bold text-white">BLO Dashboard</h1>
                        <p className="text-blue-300 text-sm">Welcome, {displayName}</p>
                    </div>
                    {/* Booth Badge */}
                    <div className="flex items-center gap-3 bg-gray-700/60 px-4 py-2 rounded-lg border border-gray-600">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Your Assigned Booth</p>
                            <p className="text-white font-bold">{boothName || boothId}</p>
                            <p className="text-gray-300 text-xs">{boothAddress}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${myBoothOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} title={myBoothOnline ? 'Booth Online' : 'Booth Offline'} />
                    </div>
                    <button onClick={handleLogout} className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main — Voter Verification */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Search by Roll Number */}
                    <div className="bg-gray-800/80 rounded-xl p-6 border border-blue-700/50">
                        <h2 className="text-xl font-bold text-white mb-4">🔍 Voter Verification</h2>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Student Roll Number
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={rollNumber}
                                        onChange={e => setRollNumber(e.target.value.toUpperCase())}
                                        className={`flex-1 ${inputCls}`}
                                        placeholder="e.g. 23CO12"
                                        autoFocus
                                        required
                                    />
                                    <button type="submit" disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
                                        {loading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {error && (
                            <div className="mt-4 bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>
                        )}
                        {success && (
                            <div className="mt-4 bg-green-900/40 border border-green-600 text-green-200 px-4 py-3 rounded-lg text-sm">{success}</div>
                        )}
                    </div>

                    {/* Voter Details Card */}
                    {voter && (
                        <div className="bg-gray-800/80 rounded-xl p-6 border border-green-600/60">
                            <h2 className="text-xl font-bold text-white mb-4">✅ Voter Details</h2>

                            <div className="flex flex-wrap gap-5 mb-5">
                                {voter.imageUrl ? (
                                    <img src={voter.imageUrl} alt="Voter"
                                        className="w-28 h-28 rounded-xl border-4 border-green-500 object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-28 h-28 rounded-xl border-4 border-gray-600 bg-gray-700 flex items-center justify-center flex-shrink-0">
                                        <span className="text-4xl">👤</span>
                                    </div>
                                )}

                                <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
                                    {[
                                        { label: 'Full Name', value: voter.fullName },
                                        { label: 'Roll Number', value: voter.rollNumber },
                                        { label: 'Department', value: `${voter.department} — ${DEPT_NAMES[voter.department] || ''}` },
                                        { label: 'Year', value: `Year ${voter.year}` },
                                        { label: 'Phone', value: voter.phone || '—' },
                                        { label: 'Assigned Booth', value: voter.boothId || '—' },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <p className="text-gray-400 text-xs">{item.label}</p>
                                            <p className="text-white font-semibold">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vote Status */}
                            <div className={`px-4 py-3 rounded-lg mb-5 border ${voter.hasVoted ? 'bg-red-900/30 border-red-600 text-red-300' : 'bg-green-900/30 border-green-600 text-green-300'}`}>
                                <p className="font-bold">{voter.hasVoted ? '❌ Already Voted — Cannot vote again' : '✅ Eligible to Vote'}</p>
                            </div>

                            {/* Dept match warning */}
                            {voter.department && department && voter.department !== department && (
                                <div className="bg-yellow-900/30 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-lg mb-5 text-sm">
                                    ⚠️ This voter belongs to <strong>{voter.department}</strong> dept, your booth serves <strong>{department}</strong>.
                                    Verify: Is this an ER election (all depts OK) or DR/CR (must match)?
                                </div>
                            )}

                            {/* Unlock Button */}
                            <button
                                onClick={handleUnlockBooth}
                                disabled={loading || voter.hasVoted}
                                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
                            >
                                {loading ? 'Unlocking...' : `🔓 Unlock ${boothName || boothId} for ${voter.fullName}`}
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-5">

                    {/* My Booth Status */}
                    <div className="bg-gray-800/80 rounded-xl p-5 border border-blue-700/50">
                        <h2 className="text-lg font-bold text-white mb-4">🏢 My Booth</h2>
                        <div className={`rounded-xl p-4 border ${myBoothOnline ? 'bg-green-900/20 border-green-600' : 'bg-gray-700/50 border-gray-600'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-white">{boothName || boothId}</p>
                                <div className={`w-3 h-3 rounded-full ${myBoothOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                            </div>
                            <p className="text-xs text-gray-400">{boothAddress}</p>
                            <p className="text-xs text-gray-400 mt-1">Dept: {DEPT_NAMES[department] || department}</p>
                            <p className={`text-xs font-semibold mt-2 ${myBoothOnline ? 'text-green-400' : 'text-red-400'}`}>
                                {myBoothOnline ? '● Online' : '● Offline — Check booth PC'}
                            </p>
                        </div>
                    </div>

                    {/* All Active Booths */}
                    <div className="bg-gray-800/80 rounded-xl p-5 border border-blue-700/50">
                        <h2 className="text-lg font-bold text-white mb-3">
                            Active Booths
                            <span className="ml-2 text-sm font-normal text-gray-400">({activeBooths.length} online)</span>
                        </h2>
                        {activeBooths.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-3">No booths connected</p>
                        ) : (
                            <div className="space-y-2">
                                {activeBooths.map(booth => (
                                    <div key={booth.boothId}
                                        className={`flex items-center justify-between rounded-lg px-3 py-2 border ${booth.boothId === boothId ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-700/50 border-gray-600'}`}>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{booth.boothId}</p>
                                            <p className="text-xs text-gray-400">{booth.status}</p>
                                        </div>
                                        <div className={`w-2.5 h-2.5 rounded-full ${booth.status === 'active' ? 'bg-green-400 animate-pulse' : booth.status === 'voting_complete' ? 'bg-yellow-400' : 'bg-green-500'}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Info */}
                    <div className="bg-gray-800/80 rounded-xl p-5 border border-blue-700/50">
                        <h2 className="text-lg font-bold text-white mb-3">Quick Info</h2>
                        <div className="space-y-2 text-sm">
                            {[
                                { label: 'My Booth', value: boothId },
                                { label: 'Department', value: DEPT_NAMES[department] || department },
                                { label: 'Online Booths', value: activeBooths.length },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between">
                                    <span className="text-gray-400">{item.label}:</span>
                                    <span className="text-white font-semibold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
