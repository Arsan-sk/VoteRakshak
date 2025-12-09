/**
 * Polling Booth Application
 * Main component that manages booth state and WebSocket communication
 */

import { useState, useEffect } from 'react';
import IdleScreen from './components/IdleScreen';
import VotingScreen from './components/VotingScreen';
import SuccessModal from './components/SuccessModal';
import { initializeSocket, updateBoothStatus, disconnectSocket } from './utils/socket';

function App() {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [authorizedVoter, setAuthorizedVoter] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [transactionHash, setTransactionHash] = useState('');

    useEffect(() => {
        // Initialize WebSocket connection
        const socket = initializeSocket(
            // Callback when booth is unlocked
            (voterData) => {
                console.log('🔓 Booth unlocked for voter:', voterData);
                setAuthorizedVoter(voterData);
                setIsUnlocked(true);
                updateBoothStatus('active');
            },
            // Callback when booth is reset
            (data) => {
                console.log('🔄 Booth reset:', data);
                resetBooth();
            }
        );

        // Update status to idle
        updateBoothStatus('idle');

        // Cleanup on unmount
        return () => {
            disconnectSocket();
        };
    }, []);

    function handleVoteSuccess(txHash) {
        console.log('✅ Vote successful:', txHash);
        setTransactionHash(txHash);
        setShowSuccess(true);
        updateBoothStatus('voting_complete');
    }

    function resetBooth() {
        setIsUnlocked(false);
        setAuthorizedVoter(null);
        setShowSuccess(false);
        setTransactionHash('');
        updateBoothStatus('idle');
        console.log('🔄 Booth reset to idle state');
    }

    function handleSuccessClose() {
        setShowSuccess(false);
        // Reset booth after success modal closes
        setTimeout(() => {
            resetBooth();
        }, 500);
    }

    return (
        <div className="app">
            {!isUnlocked ? (
                <IdleScreen />
            ) : (
                <VotingScreen
                    authorizedVoter={authorizedVoter}
                    onVoteSuccess={handleVoteSuccess}
                />
            )}

            {showSuccess && (
                <SuccessModal
                    transactionHash={transactionHash}
                    onClose={handleSuccessClose}
                />
            )}
        </div>
    );
}

export default App;
