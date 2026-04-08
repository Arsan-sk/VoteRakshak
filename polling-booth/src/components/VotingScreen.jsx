/**
 * VotingScreen Component — Phase 2
 * Dynamic candidates from API instead of static PARTIES array.
 * Vote payload: { electionId, candidateId, voterHash, fingerprintTemplate }
 */

import { useState } from 'react';
import { castVote } from '../utils/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function VotingScreen({ authorizedVoter, activeElection, candidates, onVoteSuccess }) {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [fpImage, setFpImage] = useState('');
    const [fingerprint, setFingerprint] = useState('');

    const ELECTION_LABELS = {
        ER: 'Engineering Representative',
        DR: 'Department Representative',
        CR: 'Class Representative',
    };

    // SecuGen fingerprint capture
    function captureFingerprint() {
        setError('');
        setIsProcessing(true);
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                if (result.ErrorCode === 0) {
                    if (result.BMPBase64?.length > 0) setFpImage('data:image/bmp;base64,' + result.BMPBase64);
                    setFingerprint(result.TemplateBase64);
                    setIsProcessing(false);
                    submitVote(result.TemplateBase64);
                } else {
                    setError('Fingerprint error: ' + result.ErrorCode);
                    setIsProcessing(false);
                }
            }
        };
        xhr.onerror = () => {
            // Dev mode: submit without fingerprint
            console.warn('⚠️ SGIBioSrv unreachable — dev mode: submitting without fingerprint');
            setIsProcessing(false);
            submitVote(null);
        };
        xhr.open('POST', 'https://localhost:8000/SGIFPCapture', true);
        xhr.send();
    }

    async function submitVote(fingerprintTemplate) {
        try {
            setIsProcessing(true);
            const voteResult = await castVote(
                activeElection.id,
                selectedCandidate.id,
                authorizedVoter.voterHash,
                fingerprintTemplate
            );
            onVoteSuccess(voteResult.transactionHash);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to cast vote');
            setIsProcessing(false);
            setShowConfirmation(false);
        }
    }

    if (!activeElection || candidates.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-xl">No active election for this booth</p>
                </div>
            </div>
        );
    }

    const selectedCandidateObj = candidates.find(c => c.id === selectedCandidate?.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-t-2xl px-6 py-5 shadow-lg">
                    <h1 className="text-2xl font-bold text-white text-center">Cast Your Vote</h1>
                    <p className="text-green-200 text-sm text-center mt-1">
                        {ELECTION_LABELS[activeElection.type]} Election
                        {activeElection.department ? ` · ${activeElection.department}` : ''}
                        {activeElection.year ? ` · Year ${activeElection.year}` : ''}
                    </p>
                </div>

                {/* Voter Info */}
                <div className="bg-gray-800 border-x-2 border-green-500 px-6 py-4">
                    <div className="flex items-center gap-4">
                        {authorizedVoter.voterPhoto && (
                            <img src={authorizedVoter.voterPhoto} alt="Voter"
                                className="w-16 h-16 rounded-full border-3 border-green-500 object-cover flex-shrink-0" />
                        )}
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Authorized Voter</p>
                            <p className="text-xl font-bold text-white">{authorizedVoter.voterName}</p>
                            <p className="text-sm text-green-400">
                                Roll: {authorizedVoter.voterRollNumber}
                                {authorizedVoter.voterDept ? ` · ${authorizedVoter.voterDept}` : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Candidate Selection */}
                <div className="bg-gray-800 border-x-2 border-green-500 px-6 py-6">
                    <h2 className="text-lg font-bold text-white mb-4">Select Your Candidate</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {candidates.map((candidate) => (
                            <button
                                key={candidate.id}
                                onClick={() => setSelectedCandidate(candidate)}
                                className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${selectedCandidate?.id === candidate.id
                                    ? 'border-green-500 bg-green-900/40 scale-[1.02]'
                                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={candidate.imageUrl || 'https://via.placeholder.com/64'}
                                            alt={candidate.name}
                                            className="w-16 h-16 rounded-lg object-cover border-2 border-gray-600"
                                        />
                                        <span className="absolute -top-2 -left-2 bg-indigo-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                            {candidate.serialNo}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
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

                {/* Error */}
                {error && (
                    <div className="bg-red-900/50 border-x-2 border-green-500 px-6 py-3">
                        <p className="text-red-200 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Confirm Button */}
                <div className="bg-gray-800 border-2 border-green-500 rounded-b-2xl px-6 py-5 shadow-lg">
                    <button
                        onClick={() => { if (!selectedCandidate) { setError('Please select a candidate'); return; } setError(''); setShowConfirmation(true); }}
                        disabled={!selectedCandidate || isProcessing}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedCandidate && !isProcessing
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/30'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? 'Processing...' : 'Confirm Vote →'}
                    </button>
                </div>
            </div>

            {/* Fingerprint Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-green-500 shadow-2xl">
                        <h3 className="text-2xl font-bold text-white mb-4 text-center">Confirm Your Vote</h3>

                        {selectedCandidateObj && (
                            <div className="bg-gray-700 rounded-xl p-4 mb-5 flex items-center gap-4">
                                <img src={selectedCandidateObj.imageUrl || 'https://via.placeholder.com/60'} alt="Candidate"
                                    className="w-16 h-16 rounded-lg object-cover border-2 border-green-500" />
                                <div>
                                    <p className="text-xs text-gray-400">You selected:</p>
                                    <p className="text-xl font-bold text-green-400">{selectedCandidateObj.name}</p>
                                    <p className="text-sm text-gray-300">{selectedCandidateObj.department} · Year {selectedCandidateObj.year}</p>
                                </div>
                            </div>
                        )}

                        {fpImage && <img src={fpImage} alt="FP" className="border-2 border-green-500 rounded-lg mx-auto mb-4" width={120} />}

                        <p className="text-white text-center mb-6 text-sm">
                            Scan your fingerprint to confirm, or click cast in dev mode.
                        </p>

                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmation(false)} disabled={isProcessing}
                                className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-colors">
                                Cancel
                            </button>
                            <button onClick={captureFingerprint} disabled={isProcessing}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors">
                                {isProcessing ? 'Submitting...' : '👆 Scan & Cast Vote'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VotingScreen;
