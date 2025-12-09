/**
 * Voter Profile Page
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVoterInfo } from '../utils/api';

function Profile() {
    const [voter, setVoter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const aadhar = localStorage.getItem('voterAadhar');

    useEffect(() => {
        if (!aadhar) {
            navigate('/');
            return;
        }

        loadVoterInfo();
    }, [aadhar, navigate]);

    async function loadVoterInfo() {
        try {
            const result = await getVoterInfo(aadhar);
            setVoter(result.voter);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load voter information');
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem('voterToken');
        localStorage.removeItem('voterAadhar');
        navigate('/');
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center p-4">
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center border border-blue-700">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Voter Profile</h1>
                        <p className="text-blue-300">VoteRakshak E-Voting System</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            Home
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-gray-800 rounded-2xl p-8 border border-blue-700 shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Photo */}
                        {voter.photo ? (
                            <img
                                src={voter.photo}
                                alt="Voter"
                                className="w-48 h-48 rounded-lg border-4 border-blue-500 object-cover mx-auto md:mx-0"
                            />
                        ) : (
                            <div className="w-48 h-48 rounded-lg border-4 border-blue-500 bg-gray-700 flex items-center justify-center mx-auto md:mx-0">
                                <svg className="w-24 h-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}

                        {/* Details */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{voter.fullName}</h2>
                                <p className="text-blue-300">Registered Voter</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Age</p>
                                    <p className="text-xl font-semibold text-white">{voter.age} years</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Phone</p>
                                    <p className="text-xl font-semibold text-white">{voter.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Registered On</p>
                                    <p className="text-xl font-semibold text-white">
                                        {new Date(voter.registeredAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Voter ID</p>
                                    <p className="text-xl font-semibold text-white">{voter.id}</p>
                                </div>
                            </div>

                            {/* Voting Status */}
                            <div className="border-t border-gray-700 pt-6">
                                <p className="text-sm text-gray-400 mb-2">Voting Status</p>
                                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-lg ${voter.hasVoted
                                        ? 'bg-red-900/50 border-2 border-red-500 text-red-200'
                                        : 'bg-green-900/50 border-2 border-green-500 text-green-200'
                                    }`}>
                                    {voter.hasVoted ? (
                                        <>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Vote Cast Successfully
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Not Voted Yet
                                        </>
                                    )}
                                </div>
                                {voter.votedAt && (
                                    <p className="text-sm text-gray-400 mt-2">
                                        Voted on: {new Date(voter.votedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-3">📍 Next Steps</h3>
                    <div className="space-y-2 text-blue-200">
                        {!voter.hasVoted ? (
                            <>
                                <p>✓ Your registration is complete</p>
                                <p>✓ Visit your assigned polling booth on election day</p>
                                <p>✓ An election officer will verify your identity</p>
                                <p>✓ You'll be able to cast your vote securely</p>
                            </>
                        ) : (
                            <>
                                <p>✓ Thank you for participating in democracy!</p>
                                <p>✓ Your vote has been recorded on the blockchain</p>
                                <p>✓ Your vote is secure and anonymous</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
