/**
 * Officer Login Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/api';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(username, password);

            // Store token and user info
            localStorage.setItem('token', result.token);
            localStorage.setItem('officerId', result.user.id);
            localStorage.setItem('username', result.user.username);

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-700">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Officer Dashboard</h1>
                    <p className="text-blue-300">VoteRakshak E-Voting System</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* Dev Credentials Hint */}
                <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-xs text-gray-400 text-center">
                        <strong className="text-blue-400">Dev Credentials:</strong><br />
                        Username: admin | Password: admin
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
