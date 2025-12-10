/**
 * Voting Screen Component
 * Displayed when booth is unlocked and ready for voting
 */

import React, { useState } from 'react';
import { castVote } from '../utils/api';

const PARTIES = [
    { id: 1, name: 'ABC', symbol: '🗽', color: 'blue' },
    { id: 2, name: 'XYZ', symbol: '🌍', color: 'green' },
    { id: 3, name: 'PQR', symbol: '⚡', color: 'purple' },
    { id: 4, name: 'LMN', symbol: '🚀', color: 'orange' },
];

function VotingScreen({ authorizedVoter, onVoteSuccess }) {
    const [selectedParty, setSelectedParty] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [fpImage, setFpImage] = useState('');
    const [fingerprint, setFingerprint] = useState('');

    // SecuGen fingerprint capture
    function callSGIFPGetData(successCall, failCall) {
        const uri = 'https://localhost:8000/SGIFPCapture';
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                const fpobject = JSON.parse(xmlhttp.responseText);
                successCall(fpobject);
            } else if (xmlhttp.status === 404) {
                failCall(xmlhttp.status);
            }
        };
        xmlhttp.onerror = function () {
            failCall(xmlhttp.status);
        };
        xmlhttp.open('POST', uri, true);
        xmlhttp.send();
    }

    function captureFingerprint() {
        setError('');
        setIsProcessing(true);

        callSGIFPGetData(
            (result) => {
                if (result.ErrorCode === 0) {
                    if (result.BMPBase64?.length > 0) {
                        setFpImage('data:image/bmp;base64,' + result.BMPBase64);
                    }
                    setFingerprint(result.TemplateBase64);
                    setIsProcessing(false);

                    // Automatically submit vote after fingerprint capture
                    submitVote(result.TemplateBase64);
                } else {
                    setError('Error capturing fingerprint: ' + result.ErrorCode);
                    setIsProcessing(false);
                }
            },
            () => {
                setError('Check if SGIBioSrv is running on port 8000');
                setIsProcessing(false);
            }
        );
    }

    async function submitVote(fingerprintTemplate) {
        try {
            console.log("Submitting vote with template length:", fingerprintTemplate?.length);
            const voteResult = await castVote(
                authorizedVoter.voterAadhar,
                selectedParty,
                fingerprintTemplate
            );

            console.log('✅ Vote cast successfully:', voteResult);

            // Show success modal
            onVoteSuccess(voteResult.transactionHash);
        } catch (err) {
            console.error('❌ Vote casting failed:', err);
            setError(err.message || 'Failed to cast vote. Please try again.');
            setIsProcessing(false);
            setShowConfirmation(false);
        }
    }

    function handleConfirmVote() {
        if (!selectedParty) {
            setError('Please select a party');
            return;
        }

        setShowConfirmation(true);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-t-2xl p-6 shadow-lg">
                    <h1 className="text-3xl font-bold text-white text-center">
                        Cast Your Vote
                    </h1>
                </div>

                {/* Voter Info */}
                <div className="bg-gray-800 border-x-2 border-green-500 p-6">
                    <div className="flex items-center space-x-4">
                        {authorizedVoter.voterPhoto && (
                            <img
                                src={authorizedVoter.voterPhoto}
                                alt="Voter"
                                className="w-20 h-20 rounded-full border-4 border-green-500 object-cover"
                            />
                        )}
                        <div>
                            <p className="text-sm text-gray-400">Authorized Voter</p>
                            <p className="text-2xl font-bold text-white">
                                {authorizedVoter.voterName}
                            </p>
                            <p className="text-sm text-green-400">
                                Authorized at: {new Date(authorizedVoter.authorizedAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Party Selection */}
                <div className="bg-gray-800 border-x-2 border-green-500 p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                        Select Your Party
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PARTIES.map((party) => (
                            <button
                                key={party.id}
                                onClick={() => setSelectedParty(party.id)}
                                className={`p-6 rounded-xl border-2 transition-all duration-200 ${selectedParty === party.id
                                    ? 'border-green-500 bg-green-900/50 scale-105'
                                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <span className="text-5xl">{party.symbol}</span>
                                    <div className="text-left">
                                        <p className="text-xl font-bold text-white">
                                            {party.name}
                                        </p>
                                        {selectedParty === party.id && (
                                            <p className="text-sm text-green-400 mt-1">
                                                ✓ Selected
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/50 border-x-2 border-green-500 p-4">
                        <p className="text-red-200 text-center">{error}</p>
                    </div>
                )}

                {/* Confirm Button */}
                <div className="bg-gray-800 border-2 border-green-500 rounded-b-2xl p-6 shadow-lg">
                    <button
                        onClick={handleConfirmVote}
                        disabled={!selectedParty || isProcessing}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedParty && !isProcessing
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/50'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? 'Processing...' : 'Confirm Vote'}
                    </button>
                </div>
            </div>

            {/* Fingerprint Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-green-500">
                        <h3 className="text-2xl font-bold text-white mb-4 text-center">
                            Confirm Your Vote
                        </h3>

                        <div className="bg-gray-700 rounded-lg p-4 mb-6">
                            <p className="text-gray-300 text-center">
                                You selected:
                            </p>
                            <p className="text-2xl font-bold text-green-400 text-center mt-2">
                                {PARTIES.find(p => p.id === selectedParty)?.name}
                            </p>
                        </div>

                        {fpImage && (
                            <div className="flex justify-center mb-4">
                                <img
                                    src={fpImage}
                                    alt="Fingerprint"
                                    className="border-2 border-green-500 rounded-lg"
                                    width={150}
                                />
                            </div>
                        )}

                        <p className="text-white text-center mb-6">
                            Please scan your fingerprint to confirm
                        </p>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                disabled={isProcessing}
                                className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={captureFingerprint}
                                disabled={isProcessing}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold"
                            >
                                {isProcessing ? 'Scanning...' : 'Scan Fingerprint'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VotingScreen;
