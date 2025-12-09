/**
 * Success Modal Component
 * Displayed after successful vote casting
 */

import React, { useEffect } from 'react';

function SuccessModal({ transactionHash, onClose }) {
    useEffect(() => {
        // Auto-close after 5 seconds
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-8 max-w-md w-full border-2 border-green-500 shadow-2xl">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-green-500 rounded-full p-4">
                            <svg
                                className="w-16 h-16 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                <h2 className="text-3xl font-bold text-white text-center mb-2">
                    Vote Cast Successfully!
                </h2>
                <p className="text-green-200 text-center mb-6">
                    Your vote has been recorded on the blockchain
                </p>

                {/* Transaction Hash */}
                <div className="bg-black/30 rounded-lg p-4 mb-6">
                    <p className="text-xs text-green-300 mb-2 font-semibold">
                        Transaction Hash
                    </p>
                    <p className="text-sm text-white font-mono break-all">
                        {transactionHash}
                    </p>
                </div>

                {/* Thank You Message */}
                <div className="text-center">
                    <p className="text-white font-semibold mb-2">
                        Thank you for participating in democracy!
                    </p>
                    <p className="text-green-200 text-sm">
                        Booth will reset in a few seconds...
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 h-1 bg-green-950 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 animate-progress"></div>
                </div>
            </div>
        </div>
    );
}

export default SuccessModal;
