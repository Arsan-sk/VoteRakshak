/**
 * Voter Profile Page — Phase 2
 * Shows booth address, notification bell, elected position badge
 * WebSocket listener for election_started events
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function Profile() {
    const [voter, setVoter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const [electedPosition, setElectedPosition] = useState(null);
    const navigate = useNavigate();
    const socketRef = useRef(null);

    const rollNumber = localStorage.getItem('voterRollNumber');
    const studentId = localStorage.getItem('voterId');
    const token = localStorage.getItem('voterToken');

    useEffect(() => {
        if (!rollNumber) { navigate('/'); return; }
        loadProfile();
        if (studentId) loadNotifications();
    }, [rollNumber, studentId]);

    // WebSocket — listen for election_started
    useEffect(() => {
        if (!studentId) return;
        const socket = io(BACKEND_URL);
        socketRef.current = socket;

        socket.emit('register_voter_portal', studentId);

        socket.on('election_started', async () => {
            console.log('📬 Election started! Refreshing notifications...');
            await loadNotifications();
        });

        return () => socket.disconnect();
    }, [studentId]);

    async function loadProfile() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/voting/voter/${rollNumber}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setVoter(data.voter);
            setUnreadCount(data.unreadNotifications || 0);
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }

    async function loadNotifications() {
        if (!studentId || !token) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/voting/notifications/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setNotifications(data.notifications || []);
                setUnreadCount((data.notifications || []).filter(n => !n.is_read).length);
            }
        } catch {}
    }

    async function markRead(notifId) {
        try {
            await fetch(`${BACKEND_URL}/api/voting/notifications/${notifId}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {}
    }

    async function loadElectedPositions() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/public/elected-positions`);
            const data = await res.json();
            if (res.ok && voter) {
                const pos = data.positions?.find(p => p.student_id === voter.id);
                if (pos) setElectedPosition(pos);
            }
        } catch {}
    }

    useEffect(() => {
        if (voter) loadElectedPositions();
    }, [voter]);

    function handleLogout() {
        localStorage.removeItem('voterToken');
        localStorage.removeItem('voterRollNumber');
        localStorage.removeItem('voterId');
        navigate('/');
    }

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900 flex items-center justify-center">
            <div className="text-white text-xl animate-pulse">Loading profile...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900 flex items-center justify-center p-4">
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-xl">{error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900 p-4 md:p-6">
            {/* Notification Panel Overlay */}
            {notifOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setNotifOpen(false)} />
                    <div className="relative w-full max-w-md bg-gray-900 border-l border-indigo-700 h-full overflow-y-auto p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-white">🔔 Notifications</h2>
                            <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>
                        {notifications.length === 0 ? (
                            <p className="text-gray-500 text-center mt-8">No notifications yet</p>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map(n => (
                                    <div key={n.id}
                                        onClick={() => !n.is_read && markRead(n.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${n.is_read ? 'bg-gray-800/50 border-gray-700 opacity-70' : 'bg-indigo-900/50 border-indigo-600 hover:bg-indigo-900/70'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-semibold text-white text-sm">{n.title}</p>
                                            {!n.is_read && <span className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0 mt-1" />}
                                        </div>
                                        <p className="text-gray-300 text-xs leading-relaxed">{n.message}</p>
                                        <p className="text-gray-500 text-xs mt-2">{new Date(n.created_at).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Header Bar */}
                <div className="bg-gray-800/70 backdrop-blur-md rounded-xl p-4 mb-6 flex justify-between items-center border border-indigo-700/50">
                    <div>
                        <h1 className="text-xl font-bold text-white">Voter Profile</h1>
                        <p className="text-indigo-300 text-sm">VoteRakshak — Phase 2</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        {/* Notification Bell */}
                        <button
                            onClick={() => { setNotifOpen(true); loadNotifications(); }}
                            className="relative p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            title="Notifications"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Home</button>
                        <button onClick={handleLogout} className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Logout</button>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 border border-indigo-700/50 shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Photo */}
                        <div className="flex-shrink-0 text-center">
                            {voter.imageUrl ? (
                                <img src={voter.imageUrl} alt="Profile"
                                    className="w-44 h-44 rounded-xl border-4 border-indigo-500 object-cover mx-auto" />
                            ) : (
                                <div className="w-44 h-44 rounded-xl border-4 border-indigo-500 bg-gray-700 flex items-center justify-center mx-auto">
                                    <svg className="w-20 h-20 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                            {/* Elected badge */}
                            {electedPosition && (
                                <div className="mt-3 inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500 text-yellow-300 px-3 py-1.5 rounded-lg text-sm font-bold">
                                    🏆 Elected {electedPosition.position}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-5">
                            <div>
                                <h2 className="text-3xl font-extrabold text-white mb-1">{voter.fullName}</h2>
                                <p className="text-indigo-300 font-medium">Registered Student Voter</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Roll Number', value: voter.rollNumber },
                                    { label: 'Department', value: voter.department },
                                    { label: 'Year', value: `Year ${voter.year}` },
                                    { label: 'Phone', value: voter.phone || '—' },
                                    { label: 'Voter ID', value: voter.id?.slice(0, 8) + '...' },
                                    { label: 'Registered', value: new Date(voter.registeredAt).toLocaleDateString() },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                                        <p className="text-sm font-semibold text-white">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Booth info */}
                            {voter.boothAddress && (
                                <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-xl p-4">
                                    <p className="text-xs text-indigo-400 mb-1 font-medium uppercase tracking-wide">Your Assigned Polling Booth</p>
                                    <p className="text-white font-semibold">{voter.boothName || voter.boothId}</p>
                                    <p className="text-indigo-300 text-sm mt-0.5">📍 {voter.boothAddress}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="mt-6 bg-gray-800/40 border border-indigo-700/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-3">📋 How to Vote</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {['Check notifications for active elections', 'Visit your department booth', 'BLO verifies your identity', 'Cast your vote on the booth device'].map((step, i) => (
                            <div key={i} className="space-y-2">
                                <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center mx-auto font-bold text-white text-sm">{i + 1}</div>
                                <p className="text-gray-300 text-xs">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
