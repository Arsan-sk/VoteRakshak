/**
 * Landing Page for Voter Portal
 */

import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-6xl font-bold text-white mb-4">
                        VoteRakshak
                    </h1>
                    <p className="text-2xl text-purple-300 mb-8">
                        Secure Blockchain-Based E-Voting System
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
                        >
                            📝 Register to Vote
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
                        >
                            👤 View Profile
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
                        <div className="text-4xl mb-4">🔒</div>
                        <h3 className="text-xl font-bold text-white mb-2">Secure</h3>
                        <p className="text-gray-300">
                            Blockchain technology ensures your vote is tamper-proof and anonymous
                        </p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
                        <div className="text-4xl mb-4">👆</div>
                        <h3 className="text-xl font-bold text-white mb-2">Biometric</h3>
                        <p className="text-gray-300">
                            Fingerprint authentication prevents fraud and ensures one person, one vote
                        </p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
                        <div className="text-4xl mb-4">⚡</div>
                        <h3 className="text-xl font-bold text-white mb-2">Fast</h3>
                        <p className="text-gray-300">
                            Quick registration and voting process with instant blockchain confirmation
                        </p>
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-700 rounded-xl p-8 mb-16">
                    <h2 className="text-3xl font-bold text-white mb-6 text-center">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                                1
                            </div>
                            <h4 className="font-bold text-white mb-2">Register</h4>
                            <p className="text-sm text-gray-300">
                                Complete registration with Aadhaar and fingerprint
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                                2
                            </div>
                            <h4 className="font-bold text-white mb-2">Visit Booth</h4>
                            <p className="text-sm text-gray-300">
                                Go to your assigned polling booth on election day
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                                3
                            </div>
                            <h4 className="font-bold text-white mb-2">Verify</h4>
                            <p className="text-sm text-gray-300">
                                Officer verifies your identity and unlocks the booth
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                                4
                            </div>
                            <h4 className="font-bold text-white mb-2">Vote</h4>
                            <p className="text-sm text-gray-300">
                                Cast your vote securely with fingerprint confirmation
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 text-center">
                        <div className="text-4xl font-bold text-white mb-2">100%</div>
                        <p className="text-green-200">Secure & Transparent</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 text-center">
                        <div className="text-4xl font-bold text-white mb-2">⛓️</div>
                        <p className="text-blue-200">Blockchain Verified</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 text-center">
                        <div className="text-4xl font-bold text-white mb-2">🔐</div>
                        <p className="text-purple-200">Biometric Protected</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-700 py-8">
                <div className="container mx-auto px-4 text-center text-gray-400">
                    <p>© 2024 VoteRakshak - Secure Democratic Elections</p>
                </div>
            </div>
        </div>
    );
}

export default Home;
