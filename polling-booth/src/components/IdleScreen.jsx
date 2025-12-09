/**
 * Idle Screen Component
 * Displayed when booth is waiting for officer authorization
 */

import React from 'react';
import { getBoothId } from '../utils/socket';

function IdleScreen() {
    const boothId = getBoothId();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
                {/* Animated Lock Icon */}
                <div className="mb-8 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-yellow-500/20 rounded-full animate-ping"></div>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <svg
                            className="w-32 h-32 text-yellow-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Status Text */}
                <h1 className="text-4xl font-bold text-white mb-4">
                    Booth Locked
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                    Waiting for Officer Authorization...
                </p>

                {/* Booth ID */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-8">
                    <p className="text-sm text-gray-400 mb-2">Booth ID</p>
                    <p className="text-2xl font-mono font-bold text-green-400">
                        {boothId}
                    </p>
                </div>

                {/* Loading Animation */}
                <div className="flex justify-center items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                {/* Instructions */}
                <div className="mt-12 text-gray-400 text-sm">
                    <p>Please wait for an election officer to verify your identity</p>
                    <p>and authorize this booth for voting.</p>
                </div>
            </div>
        </div>
    );
}

export default IdleScreen;
