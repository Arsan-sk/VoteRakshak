/**
 * Voter Login Page — Phase 2
 * Roll number + 4-digit PIN
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function LoginPage() {
    const [rollNumber, setRollNumber] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError('');

        if (!/^\d{4}$/.test(pin)) {
            setError('PIN must be exactly 4 digits');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'voter', rollNumber: rollNumber.toUpperCase(), pin }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            localStorage.setItem('voterToken', data.token);
            localStorage.setItem('voterRollNumber', data.user.rollNumber);
            localStorage.setItem('voterId', data.user.id);

            navigate('/profile');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const inputCls = 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all';

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-indigo-700/50">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🗳️</div>
                    <h1 className="text-3xl font-extrabold text-white mb-1">Voter Login</h1>
                    <p className="text-indigo-300 text-sm">VoteRakshak — Phase 2</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Roll Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Roll Number
                        </label>
                        <input
                            type="text"
                            className={inputCls}
                            placeholder="e.g. 23CO12"
                            value={rollNumber}
                            onChange={e => setRollNumber(e.target.value.toUpperCase())}
                            required
                            autoFocus
                        />
                    </div>

                    {/* 4-digit PIN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            4-Digit PIN
                        </label>
                        <input
                            type="password"
                            className={inputCls}
                            placeholder="••••"
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            pattern="\d{4}"
                            inputMode="numeric"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            New users: use the PIN you set during registration.<br />
                            Default PIN for existing accounts: <strong className="text-indigo-400">1234</strong>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-900/40 border border-red-600 text-red-300 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
                    >
                        {loading ? 'Logging in...' : '🔐 Login'}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-2">
                    <p className="text-gray-400 text-sm">
                        Not registered yet?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-indigo-400 hover:underline font-medium"
                        >
                            Register here
                        </button>
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
