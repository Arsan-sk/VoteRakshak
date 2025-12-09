/**
 * Officer Dashboard - Voter Verification and Booth Unlock
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVoter, unlockBooth, getActiveBooths, getBooths } from '../utils/api';

function Dashboard() {
    const [aadhar, setAadhar] = useState('');
    const [voter, setVoter] = useState(null);
    const [selectedBooth, setSelectedBooth] = useState('');
    const [booths, setBooths] = useState([]);
    const [activeBooths, setActiveBooths] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const username = localStorage.getItem('username');

    useEffect(() => {
        // Check if logged in
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }

        loadBooths();
        loadActiveBooths();

        // Refresh active booths every 5 seconds
        const interval = setInterval(loadActiveBooths, 5000);
        return () => clearInterval(interval);
    }, [navigate]);

    async function loadBooths() {
        try {
            const result = await getBooths();
            setBooths(result.booths || []);
            if (result.booths?.length > 0) {
                setSelectedBooth(result.booths[0].id);
            }
        } catch (err) {
            console.error('Failed to load booths:', err);
        }
    }

    async function loadActiveBooths() {
        try {
            const result = await getActiveBooths();
            setActiveBooths(result.booths || []);
        } catch (err) {
            console.error('Failed to load active booths:', err);
        }
    }

    async function handleSearch(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setVoter(null);
        setLoading(true);

        try {
            const result = await getVoter(aadhar);
            setVoter(result.voter);
        } catch (err) {
            setError(err.response?.data?.error || 'Voter not found');
        } finally {
            setLoading(false);
        }
    }

    async function handleUnlockBooth() {
        if (!voter || !selectedBooth) {
            setError('Please select a booth and search for a voter first');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await unlockBooth(
                selectedBooth,
                aadhar,
                voter.fullName,
                voter.photo
            );

            setSuccess(`✅ Booth ${selectedBooth} unlocked successfully for ${voter.fullName}`);

            // Clear form after 3 seconds
            setTimeout(() => {
                setAadhar('');
                setVoter(null);
                setSuccess('');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to unlock booth');
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        localStorage.clear();
        navigate('/');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center border border-blue-700">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Officer Dashboard</h1>
                        <p className="text-blue-300">Welcome, {username}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Panel - Voter Verification */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search Form */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-blue-700">
                        <h2 className="text-xl font-bold text-white mb-4">Voter Verification</h2>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Aadhaar Number
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={aadhar}
                                        onChange={(e) => setAadhar(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter 12-digit Aadhaar"
                                        pattern="[0-9]{12}"
                                        maxLength="12"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mt-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mt-4 bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
                                {success}
                            </div>
                        )}
                    </div>

                    {/* Voter Details */}
                    {voter && (
                        <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
                            <h2 className="text-xl font-bold text-white mb-4">Voter Details</h2>

                            <div className="flex gap-6">
                                {voter.photo && (
                                    <img
                                        src={voter.photo}
                                        alt="Voter"
                                        className="w-32 h-32 rounded-lg border-4 border-green-500 object-cover"
                                    />
                                )}

                                <div className="flex-1 space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-400">Full Name</p>
                                        <p className="text-lg font-semibold text-white">{voter.fullName}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-400">Age</p>
                                            <p className="text-white">{voter.age} years</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Phone</p>
                                            <p className="text-white">{voter.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Voting Status</p>
                                        <p className={`font-bold ${voter.hasVoted ? 'text-red-400' : 'text-green-400'}`}>
                                            {voter.hasVoted ? '❌ Already Voted' : '✅ Not Voted'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Unlock Booth Section */}
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Select Polling Booth
                                        </label>
                                        <select
                                            value={selectedBooth}
                                            onChange={(e) => setSelectedBooth(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {booths.map((booth) => (
                                                <option key={booth.id} value={booth.id}>
                                                    {booth.id} - {booth.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleUnlockBooth}
                                        disabled={loading || voter.hasVoted}
                                        className="mt-7 bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        🔓 Unlock Booth
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Active Booths */}
                <div className="space-y-6">
                    <div className="bg-gray-800 rounded-lg p-6 border border-blue-700">
                        <h2 className="text-xl font-bold text-white mb-4">Active Booths</h2>

                        {activeBooths.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No booths connected</p>
                        ) : (
                            <div className="space-y-3">
                                {activeBooths.map((booth) => (
                                    <div
                                        key={booth.boothId}
                                        className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-white">{booth.boothId}</p>
                                                <p className="text-sm text-gray-400">{booth.status}</p>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${booth.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                                                }`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-blue-700">
                        <h2 className="text-xl font-bold text-white mb-4">Quick Info</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Connected Booths:</span>
                                <span className="text-white font-semibold">{activeBooths.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Booths:</span>
                                <span className="text-white font-semibold">{booths.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
