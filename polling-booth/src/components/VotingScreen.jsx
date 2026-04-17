/**
 * VotingScreen Component — Phase 2
 * Confirmation mode switches based on biometricMode flag from server:
 *   biometricMode=true  → fingerprint scanner (SecuGen)
 *   biometricMode=false → 4-digit PIN (3 attempts → booth locked)
 */

import { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ELECTION_LABELS = {
    ER: 'Engineering Representative',
    DR: 'Department Representative',
    CR: 'Class Representative',
};

function VotingScreen({ authorizedVoter, activeElection, candidates, onVoteSuccess, onBoothLocked }) {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    // PIN flow state
    const [pin, setPin] = useState('');
    const [pinAttempts, setPinAttempts] = useState(0);
    const [pinError, setPinError] = useState('');
    const MAX_PIN_ATTEMPTS = 3;

    // Fingerprint flow state
    const [fpImage, setFpImage] = useState('');

    // Read mode from server-sent flag (comes in authorizedVoter from allow_vote event)
    // Falls back to VITE_BIOMETRIC_MODE env
    const biometricMode = authorizedVoter?.biometricMode
        ?? (import.meta.env.VITE_BIOMETRIC_MODE === 'true');

    // ── Candidate Selection ─────────────────────────────────────
    function handleSelectCandidate(candidate) {
        setSelectedCandidate(candidate);
        setError('');
    }

    function handleProceedToConfirm() {
        if (!selectedCandidate) { setError('Please select a candidate'); return; }
        setError('');
        setPin('');
        setPinAttempts(0);
        setPinError('');
        setFpImage('');
        setShowConfirmation(true);
    }

    // ── Fingerprint capture (SecuGen) ───────────────────────────
    function captureFingerprint() {
        setIsProcessing(true);
        setPinError('');
        const xhr = new XMLHttpRequest();
        const timeout = setTimeout(() => {
            xhr.abort();
            setPinError('⏱️ Fingerprint scan timeout. Service may not be responding.');
            setIsProcessing(false);
        }, 15000); // 15 second timeout
        
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                clearTimeout(timeout);
                if (xhr.status === 200) {
                    try {
                        const result = JSON.parse(xhr.responseText);
                        if (result.ErrorCode === 0) {
                            if (result.BMPBase64?.length > 0) setFpImage('data:image/bmp;base64,' + result.BMPBase64);
                            setIsProcessing(false);
                            submitVote({ fingerprintTemplate: result.TemplateBase64 });
                        } else {
                            setPinError('Fingerprint error code: ' + result.ErrorCode + '. Try again.');
                            setIsProcessing(false);
                        }
                    } catch (parseErr) {
                        setPinError('⚠️ Fingerprint scanner returned invalid response. Try again.');
                        setIsProcessing(false);
                    }
                } else if (xhr.status === 0) {
                    setPinError('❌ Cannot reach SGIBioSrv on port 8443. Service not running or CORS issue.');
                    setIsProcessing(false);
                } else {
                    setPinError(`❌ Scanner service error (${xhr.status}). Try again.`);
                    setIsProcessing(false);
                }
            }
        };
        xhr.onerror = () => {
            clearTimeout(timeout);
            setPinError('❌ Connection failed: ERR_CONNECTION_CLOSED. Check if sgibiosrv.exe is running on port 8443.');
            setIsProcessing(false);
        };
        xhr.onabort = () => {
            clearTimeout(timeout);
            setIsProcessing(false);
        };
        try {
            xhr.open('POST', 'https://localhost:8443/SGIFPCapture', true);
            xhr.send();
        } catch (err) {
            clearTimeout(timeout);
            setPinError('⚠️ Failed to initiate scan: ' + err.message);
            setIsProcessing(false);
        }
    }

    // ── PIN submit ──────────────────────────────────────────────
    async function handlePinSubmit(e) {
        e.preventDefault();
        if (!/^\d{4}$/.test(pin)) { setPinError('Enter a 4-digit PIN'); return; }
        if (isProcessing) return;

        // Incrementally track attempts
        const attempt = pinAttempts + 1;
        setPinAttempts(attempt);
        setPinError('');
        setIsProcessing(true);

        try {
            await submitVote({ pin });
        } catch {
            // submitVote handles specific error messages
            // If locked, submitVote calls onBoothLocked
        }
    }

    // ── Core vote submit ────────────────────────────────────────
    async function submitVote({ fingerprintTemplate = null, pin = null } = {}) {
        try {
            setIsProcessing(true);
            const payload = {
                electionId: activeElection.id,
                candidateId: selectedCandidate.id,
                voterHash: authorizedVoter.voterHash,
            };
            if (fingerprintTemplate) payload.fingerprintTemplate = fingerprintTemplate;
            if (pin) payload.pin = pin;

            const response = await axios.post(`${BACKEND_URL}/api/voting/cast`, payload);
            onVoteSuccess(response.data.transactionHash);
        } catch (err) {
            setIsProcessing(false);
            const data = err.response?.data;
            const isWrongAuth = data?.wrongAuth;

            if (isWrongAuth && !biometricMode) {
                // Wrong PIN — count attempts
                const currentAttempts = pinAttempts; // already incremented above

                if (currentAttempts >= MAX_PIN_ATTEMPTS) {
                    // Lock the booth
                    setPinError(`❌ ${MAX_PIN_ATTEMPTS} incorrect PINs — Booth locked. Please call the BLO.`);
                    setTimeout(() => {
                        if (onBoothLocked) onBoothLocked('Max PIN attempts exceeded');
                    }, 2500);
                } else {
                    const remaining = MAX_PIN_ATTEMPTS - currentAttempts;
                    setPinError(`❌ ${data?.error || 'Incorrect PIN'} — ${remaining} attempt${remaining > 1 ? 's' : ''} remaining`);
                    setPin('');
                }
            } else {
                setPinError(data?.error || err.message || 'Failed to cast vote');
            }
        }
    }

    // ── Guard: no election or candidates ───────────────────────
    if (!activeElection || candidates.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-xl mb-4">No active election for this booth</p>
                    <p className="text-gray-600 text-sm">Wait for an election to be started by the admin.</p>
                </div>
            </div>
        );
    }

    const selectedObj = candidates.find(c => c.id === selectedCandidate?.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 p-6">
            <div className="max-w-5xl mx-auto">

                {/* Header strip */}
                <div className="bg-gradient-to-r from-green-700 to-teal-700 rounded-t-2xl px-6 py-5 shadow-lg">
                    <h1 className="text-2xl font-bold text-white text-center">Cast Your Vote</h1>
                    <p className="text-green-200 text-sm text-center mt-0.5">
                        {ELECTION_LABELS[activeElection.type] || activeElection.type} Election
                        {activeElection.department ? ` · ${activeElection.department}` : ''}
                        {activeElection.year ? ` · Year ${activeElection.year}` : ''}
                    </p>
                </div>

                {/* Voter identity banner */}
                <div className="bg-gray-800 border-x-2 border-green-500 px-6 py-4 flex items-center gap-4">
                    {authorizedVoter.voterPhoto && (
                        <img src={authorizedVoter.voterPhoto} alt="Voter"
                            className="w-16 h-16 rounded-full border-2 border-green-500 object-cover flex-shrink-0" />
                    )}
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Authorized Voter</p>
                        <p className="text-xl font-bold text-white">{authorizedVoter.voterName}</p>
                        <p className="text-sm text-green-400">
                            Roll: {authorizedVoter.voterRollNumber}
                            {authorizedVoter.voterDept ? ` · ${authorizedVoter.voterDept}` : ''}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border"
                        style={biometricMode
                            ? { background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)', color: '#6ee7b7' }
                            : { background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.4)', color: '#a5b4fc' }}>
                        {biometricMode ? '👆 Fingerprint Mode' : '🔢 PIN Mode'}
                    </div>
                </div>

                {/* Candidate grid */}
                <div className="bg-gray-800 border-x-2 border-green-500 px-6 py-6">
                    <h2 className="text-lg font-bold text-white mb-4">Select Your Candidate</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {candidates.map((candidate) => (
                            <button key={candidate.id}
                                onClick={() => handleSelectCandidate(candidate)}
                                className={`p-5 rounded-xl border-2 text-left transition-all duration-150 ${selectedCandidate?.id === candidate.id
                                    ? 'border-green-500 bg-green-900/40 scale-[1.02]'
                                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-400'}`}>
                                <div className="flex items-start gap-3">
                                    <div className="relative flex-shrink-0">
                                        <img src={candidate.imageUrl || 'https://via.placeholder.com/64'}
                                            alt={candidate.name}
                                            className="w-16 h-16 rounded-lg object-cover border-2 border-gray-600" />
                                        <span className="absolute -top-2 -left-2 bg-indigo-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                            {candidate.serialNo}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm leading-tight">{candidate.name}</p>
                                        <p className="text-gray-400 text-xs mt-0.5">{candidate.department}</p>
                                        <p className="text-gray-400 text-xs">Year {candidate.year}</p>
                                        {selectedCandidate?.id === candidate.id && (
                                            <p className="text-green-400 text-xs mt-1 font-medium">✓ Selected</p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error + Proceed button */}
                {error && (
                    <div className="bg-red-900/40 border-x-2 border-green-500 px-6 py-3">
                        <p className="text-red-300 text-sm text-center">{error}</p>
                    </div>
                )}
                <div className="bg-gray-800 border-2 border-green-500 rounded-b-2xl px-6 py-5 shadow-lg">
                    <button onClick={handleProceedToConfirm}
                        disabled={!selectedCandidate || isProcessing}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedCandidate && !isProcessing
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
                        {isProcessing ? 'Processing...' : 'Proceed to Confirm →'}
                    </button>
                </div>
            </div>

            {/* ── Confirmation Modal ── */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-green-500 shadow-2xl">

                        <h3 className="text-2xl font-bold text-white mb-4 text-center">Confirm Your Vote</h3>

                        {/* Who you're voting for */}
                        {selectedObj && (
                            <div className="bg-gray-700 rounded-xl p-4 mb-5 flex items-center gap-4">
                                <img src={selectedObj.imageUrl || 'https://via.placeholder.com/60'}
                                    alt="Candidate"
                                    className="w-16 h-16 rounded-lg object-cover border-2 border-green-500" />
                                <div>
                                    <p className="text-xs text-gray-400">Your vote goes to:</p>
                                    <p className="text-xl font-bold text-green-400">{selectedObj.name}</p>
                                    <p className="text-sm text-gray-300">{selectedObj.department} · Year {selectedObj.year}</p>
                                </div>
                            </div>
                        )}

                        {/* ── BIOMETRIC MODE: Fingerprint ── */}
                        {biometricMode ? (
                            <div className="text-center">
                                {fpImage && (
                                    <img src={fpImage} alt="FP" className="border-2 border-green-500 rounded-lg mx-auto mb-4" width={120} />
                                )}
                                {pinError && <p className="text-red-300 text-sm mb-3">{pinError}</p>}
                                <p className="text-gray-300 text-sm mb-5">
                                    Place your finger on the scanner to confirm vote.
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowConfirmation(false)} disabled={isProcessing}
                                        className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={captureFingerprint} disabled={isProcessing}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors">
                                        {isProcessing ? 'Scanning...' : '👆 Scan Fingerprint'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── PIN MODE ── */
                            <form onSubmit={handlePinSubmit}>
                                <p className="text-gray-300 text-sm text-center mb-4">
                                    Enter your <strong className="text-white">4-digit PIN</strong> to confirm.
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        {MAX_PIN_ATTEMPTS - pinAttempts} attempt{MAX_PIN_ATTEMPTS - pinAttempts !== 1 ? 's' : ''} remaining
                                    </span>
                                </p>

                                {/* PIN dots display */}
                                <div className="flex justify-center gap-3 mb-4">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i}
                                            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${pin.length > i
                                                ? 'border-green-500 bg-gray-700 text-white'
                                                : 'border-gray-600 bg-gray-700/50 text-transparent'}`}>
                                            {pin.length > i ? '•' : '○'}
                                        </div>
                                    ))}
                                </div>

                                {/* Numpad */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map(key => (
                                        <button
                                            key={key}
                                            type="button"
                                            disabled={isProcessing}
                                            onClick={() => {
                                                if (key === '⌫') {
                                                    setPin(p => p.slice(0, -1));
                                                } else if (key === '✓') {
                                                    if (pin.length === 4) handlePinSubmit({ preventDefault: () => {} });
                                                } else if (pin.length < 4) {
                                                    setPin(p => p + key);
                                                }
                                            }}
                                            className={`py-3 rounded-xl font-bold text-lg transition-all
                                                ${key === '✓'
                                                    ? 'bg-green-600 hover:bg-green-500 text-white'
                                                    : key === '⌫'
                                                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                                }
                                                disabled:opacity-50`}>
                                            {key}
                                        </button>
                                    ))}
                                </div>

                                {pinError && (
                                    <div className="bg-red-900/40 border border-red-600 text-red-300 px-3 py-2.5 rounded-lg text-sm text-center mb-4">
                                        {pinError}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => { setShowConfirmation(false); setPin(''); setPinError(''); }}
                                        disabled={isProcessing}
                                        className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={pin.length !== 4 || isProcessing}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors">
                                        {isProcessing ? 'Verifying...' : '🔢 Submit PIN'}
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

export default VotingScreen;
