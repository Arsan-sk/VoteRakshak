/**
 * Officer / BLO Dashboard — Phase 2
 * Flow: Search → Verify Identity (PIN/fingerprint) → Unlock Booth
 * - Search voter by ROLL NUMBER
 * - Verify identity: biometric_mode=true → fingerprint | biometric_mode=false → PIN
 * - Only after verified + not already voted → Unlock button active
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchVoterByRollNumber, verifyVoterIdentity, unlockBooth, getActiveBooths, getFlags, getActiveElection, setOfficerFlag } from '../utils/api';
import { io } from 'socket.io-client';

let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
if (!BACKEND_URL || BACKEND_URL.trim() === '') {
    BACKEND_URL = 'http://localhost:5000';
}
if (!BACKEND_URL.startsWith('http')) {
    BACKEND_URL = `http://${BACKEND_URL}`;
}
BACKEND_URL = BACKEND_URL.replace(/\/$/, '');

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

    // Identity verification state
    const [isVerified, setIsVerified] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyPin, setVerifyPin] = useState('');
    const [verifyError, setVerifyError] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [biometricMode, setBiometricMode] = useState(false);

    const socketRef = useRef(null);
    const navigate = useNavigate();

    // BLO's credentials from localStorage
    const username = localStorage.getItem('username') || 'BLO';
    const displayName = localStorage.getItem('displayName') || username;
    const boothId = localStorage.getItem('boothId');
    const boothName = localStorage.getItem('boothName') || boothId;
    const boothAddress = localStorage.getItem('boothAddress') || '—';
    const department = localStorage.getItem('department') || '—';

    const [activeElection, setActiveElection] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/'); return; }
        loadActiveBooths();
        loadFlags();
        loadActiveElection();

        const socket = io(BACKEND_URL);
        socketRef.current = socket;
        socket.on('booth_status_update', () => loadActiveBooths());
        socket.on('election_started', () => loadActiveElection());
        socket.on('election_ended', () => { loadActiveElection(); setVoter(null); });
        const interval = setInterval(loadActiveBooths, 5000);
        return () => { clearInterval(interval); socket.disconnect(); };
    }, [navigate]);

    async function loadActiveElection() {
        try {
            const res = await getActiveElection();
            setActiveElection(res.election || null);
        } catch {
            setActiveElection(null);
        }
    }

    async function loadActiveBooths() {
        try {
            const result = await getActiveBooths();
            const booths = result.booths || [];
            setActiveBooths(booths);
            setMyBoothOnline(booths.some(b => b.boothId === boothId));
        } catch (err) {
            console.warn('Could not load active booths:', err.message);
        }
    }

    async function loadFlags() {
        try {
            const result = await getFlags();
            setBiometricMode(result.flags?.biometric_mode ?? false);
        } catch {
            setBiometricMode(false);
        }
    }

    async function handleToggleBiometric(newMode) {
        if (newMode === biometricMode) return;
        try {
            setBiometricMode(newMode);
            await setOfficerFlag('biometric_mode', newMode);
            setSuccess(`✅ Verification mode switched to ${newMode ? 'Fingerprint' : 'PIN'}`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update verification mode');
            setBiometricMode(!newMode); // Revert on failure
        }
    }

    // ── Search ──────────────────────────────────────────────
    async function handleSearch(e) {
        e.preventDefault();
        setError(''); setSuccess(''); setVoter(null);
        setIsVerified(false); setHasVoted(false);
        if (!rollNumber.trim()) { setError('Please enter a roll number'); return; }
        setLoading(true);
        try {
            const result = await searchVoterByRollNumber(rollNumber.toUpperCase());
            const v = result.voter;
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

    // ── Verify Identity ─────────────────────────────────────
    function openVerifyModal() {
        setShowVerifyModal(true);
        setVerifyPin('');
        setVerifyError('');
    }

    async function handleVerifyPin(e) {
        e.preventDefault();
        if (!/^\d{4}$/.test(verifyPin)) { setVerifyError('Enter a 4-digit PIN'); return; }
        setVerifyLoading(true);
        setVerifyError('');
        try {
            const result = await verifyVoterIdentity(voter.rollNumber, { pin: verifyPin });
            setIsVerified(true);
            setHasVoted(result.hasVoted || false);
            setShowVerifyModal(false);
            if (result.hasVoted) {
                setError(`❌ ${voter.fullName} has already voted in this election. Cannot unlock booth.`);
            } else {
                setSuccess(`✅ Identity verified for ${voter.fullName}`);
            }
        } catch (err) {
            setVerifyError(err.response?.data?.error || 'Verification failed');
        } finally {
            setVerifyLoading(false);
        }
    }

    async function handleVerifyFingerprint() {
        setVerifyLoading(true);
        setVerifyError('');
        try {
            // SecuGen capture
            const xhr = new XMLHttpRequest();
            const fpPromise = new Promise((resolve, reject) => {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            const result = JSON.parse(xhr.responseText);
                            if (result.ErrorCode === 0) resolve(result.TemplateBase64);
                            else reject(new Error('Scan error code: ' + result.ErrorCode));
                        } else reject(new Error('Scanner not responding'));
                    }
                };
                xhr.onerror = () => reject(new Error('Fingerprint scanner not reachable'));
                xhr.open('POST', 'https://localhost:8000/SGIFPCapture', true);
                xhr.send();
            });

            const template = await fpPromise;
            const result = await verifyVoterIdentity(voter.rollNumber, { fingerprintTemplate: template });
            setIsVerified(true);
            setHasVoted(result.hasVoted || false);
            setShowVerifyModal(false);
            if (result.hasVoted) {
                setError(`❌ ${voter.fullName} has already voted in this election. Cannot unlock booth.`);
            } else {
                setSuccess(`✅ Identity verified for ${voter.fullName}`);
            }
        } catch (err) {
            setVerifyError(err.response?.data?.error || err.message || 'Fingerprint verification failed');
        } finally {
            setVerifyLoading(false);
        }
    }

    // ── Unlock Booth ────────────────────────────────────────
    async function handleUnlockBooth() {
        if (!voter || !isVerified || hasVoted) return;
        if (!boothId) { setError('No booth assigned to your account'); return; }
        if (!myBoothOnline) {
            if (!window.confirm(`⚠️ ${boothName} does not appear to be online. Unlock anyway?`)) return;
        }

        setError(''); setSuccess(''); setLoading(true);
        try {
            await unlockBooth(boothId, voter.rollNumber, voter.fullName, voter.imageUrl, voter.voterHash);
            setSuccess(`✅ ${boothName} unlocked for ${voter.fullName} (${voter.rollNumber})`);
            setTimeout(() => { setRollNumber(''); setVoter(null); setIsVerified(false); setHasVoted(false); setSuccess(''); }, 4000);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to unlock booth';
            setError(msg);
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

                    {!activeElection && (
                        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-6 text-center">
                            <span className="text-4xl block mb-3">😴</span>
                            <h2 className="text-xl font-bold text-yellow-500 mb-2">No Active Election</h2>
                            <p className="text-gray-300">
                                There are no elections currently running. Voter verification and booth unlocking are disabled until an election begins.
                            </p>
                        </div>
                    )}

                    {activeElection && (
                        <>
                            {/* Search */}
                            <div className="bg-gray-800/80 rounded-xl p-6 border border-blue-700/50">
                                <h2 className="text-xl font-bold text-white mb-4">🔍 Voter Verification</h2>
                                <form onSubmit={handleSearch} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Student Roll Number</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={rollNumber}
                                                onChange={e => setRollNumber(e.target.value.toUpperCase())}
                                                className={`flex-1 ${inputCls}`}
                                                placeholder="e.g. 23CO12" autoFocus required />
                                            <button type="submit" disabled={loading}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
                                                {loading ? 'Searching...' : 'Search'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                                {error && <div className="mt-4 bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>}
                                {success && <div className="mt-4 bg-green-900/40 border border-green-600 text-green-200 px-4 py-3 rounded-lg text-sm">{success}</div>}
                            </div>

                            {/* Voter Details Card */}
                            {voter && (
                                <div className={`bg-gray-800/80 rounded-xl p-6 border ${isVerified && !hasVoted ? 'border-green-600/60' : 'border-yellow-600/60'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-white">
                                            {isVerified ? (hasVoted ? '❌ Already Voted' : '✅ Verified Voter') : '⏳ Pending Verification'}
                                        </h2>
                                        {isVerified && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${hasVoted ? 'bg-red-500/20 text-red-300 border border-red-500' : 'bg-green-500/20 text-green-300 border border-green-500'}`}>
                                                {hasVoted ? 'VOTED' : 'VERIFIED'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-5 mb-5">
                                        {voter.imageUrl ? (
                                            <img src={voter.imageUrl} alt="Voter"
                                                className={`w-28 h-28 rounded-xl border-4 object-cover flex-shrink-0 ${isVerified && !hasVoted ? 'border-green-500' : 'border-gray-600'}`} />
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
                                            ].map(item => (
                                                <div key={item.label}>
                                                    <p className="text-gray-400 text-xs">{item.label}</p>
                                                    <p className="text-white font-semibold">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {!isVerified && (
                                            <button onClick={openVerifyModal} disabled={loading}
                                                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg">
                                                {biometricMode ? '👆 Verify Identity (Fingerprint)' : '🔢 Verify Identity (PIN)'}
                                            </button>
                                        )}

                                        {isVerified && !hasVoted && (
                                            <button onClick={handleUnlockBooth} disabled={loading}
                                                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg">
                                                {loading ? 'Unlocking...' : `🔓 Unlock ${boothName || boothId} for ${voter.fullName}`}
                                            </button>
                                        )}

                                        {isVerified && hasVoted && (
                                            <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-4 rounded-xl text-center font-bold">
                                                ❌ This voter has already cast their vote. Booth cannot be unlocked.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
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

                    {/* Auth Mode */}
                    <div className="bg-gray-800/80 rounded-xl p-5 border border-blue-700/50">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-white">🔐 Auth Mode</h2>
                        </div>
                        <div className="flex bg-gray-700 p-1 rounded-lg">
                            <button
                                onClick={() => handleToggleBiometric(true)}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${biometricMode ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                👆 Fingerprint
                            </button>
                            <button
                                onClick={() => handleToggleBiometric(false)}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!biometricMode ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                🔢 PIN
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">Toggle to switch verification for the current voter</p>
                    </div>

                    {/* Active Booths */}
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
                                        <div className={`w-2.5 h-2.5 rounded-full ${booth.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-green-500'}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Verify Identity Modal ── */}
            {showVerifyModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-yellow-500 shadow-2xl">
                        <h3 className="text-2xl font-bold text-white mb-2 text-center">Verify Identity</h3>
                        <p className="text-gray-400 text-sm text-center mb-6">
                            Confirm <strong className="text-white">{voter?.fullName}</strong> ({voter?.rollNumber})
                        </p>

                        {biometricMode ? (
                            /* ── Fingerprint Mode ── */
                            <div className="text-center">
                                {verifyError && <div className="bg-red-900/40 border border-red-600 text-red-300 px-3 py-2 rounded-lg text-sm mb-4">{verifyError}</div>}
                                <p className="text-gray-300 text-sm mb-5">Ask the voter to place their finger on the scanner.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowVerifyModal(false)} disabled={verifyLoading}
                                        className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold">Cancel</button>
                                    <button onClick={handleVerifyFingerprint} disabled={verifyLoading}
                                        className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-semibold">
                                        {verifyLoading ? 'Scanning...' : '👆 Scan Fingerprint'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── PIN Mode ── */
                            <form onSubmit={handleVerifyPin}>
                                <p className="text-gray-300 text-sm text-center mb-4">
                                    Ask the voter to enter their <strong className="text-white">4-digit PIN</strong>
                                </p>

                                {/* PIN dots */}
                                <div className="flex justify-center gap-3 mb-4">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i}
                                            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${verifyPin.length > i
                                                ? 'border-yellow-500 bg-gray-700 text-white'
                                                : 'border-gray-600 bg-gray-700/50 text-transparent'}`}>
                                            {verifyPin.length > i ? '•' : '○'}
                                        </div>
                                    ))}
                                </div>

                                {/* Numpad */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map(key => (
                                        <button key={key} type="button" disabled={verifyLoading}
                                            onClick={() => {
                                                if (key === '⌫') setVerifyPin(p => p.slice(0, -1));
                                                else if (key === '✓') { if (verifyPin.length === 4) handleVerifyPin({ preventDefault: () => {} }); }
                                                else if (verifyPin.length < 4) setVerifyPin(p => p + key);
                                            }}
                                            className={`py-3 rounded-xl font-bold text-lg transition-all disabled:opacity-50
                                                ${key === '✓' ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                                                    : key === '⌫' ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                                        : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
                                            {key}
                                        </button>
                                    ))}
                                </div>

                                {verifyError && (
                                    <div className="bg-red-900/40 border border-red-600 text-red-300 px-3 py-2 rounded-lg text-sm text-center mb-4">{verifyError}</div>
                                )}

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowVerifyModal(false)} disabled={verifyLoading}
                                        className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold">Cancel</button>
                                    <button type="submit" disabled={verifyPin.length !== 4 || verifyLoading}
                                        className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white rounded-lg font-semibold">
                                        {verifyLoading ? 'Verifying...' : '🔢 Verify PIN'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
