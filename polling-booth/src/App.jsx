/**
 * Polling Booth Application — Phase 2
 * Fetches active election on boot. Passes election data + candidates to VotingScreen.
 */

import { useState, useEffect } from 'react';
import IdleScreen from './components/IdleScreen';
import VotingScreen from './components/VotingScreen';
import SuccessModal from './components/SuccessModal';
import { initializeSocket, updateBoothStatus, disconnectSocket } from './utils/socket';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const BOOTH_ID = import.meta.env.VITE_BOOTH_ID || 'BOOTH_001';

function App() {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [authorizedVoter, setAuthorizedVoter] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [transactionHash, setTransactionHash] = useState('');
    const [activeElection, setActiveElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [electionLoading, setElectionLoading] = useState(true);

    // Fetch active election on mount
    useEffect(() => {
        fetchActiveElection();
        // Refresh election every 30s
        const interval = setInterval(fetchActiveElection, 30000);
        return () => clearInterval(interval);
    }, []);

    async function fetchActiveElection() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/voting/active-election`);
            const data = await res.json();
            if (data.election) {
                setActiveElection(data.election);
                setCandidates(data.candidates || []);
            } else {
                setActiveElection(null);
                setCandidates([]);
            }
        } catch (err) {
            console.warn('⚠️ Could not fetch active election:', err.message);
        } finally {
            setElectionLoading(false);
        }
    }

    useEffect(() => {
        const socket = initializeSocket(
            // Voter unlocked — now includes electionId + candidates from server
            (voterData) => {
                console.log('🔓 Booth unlocked for voter:', voterData);

                // If server sent updated candidates, use them; otherwise use current state
                if (voterData.candidates && voterData.candidates.length > 0) {
                    setCandidates(voterData.candidates);
                }
                if (voterData.electionId) {
                    setActiveElection(prev => ({
                        ...prev,
                        id: voterData.electionId,
                        blockchainElectionId: voterData.blockchainElectionId,
                        type: voterData.electionType || prev?.type,
                    }));
                }
                setAuthorizedVoter(voterData);
                setIsUnlocked(true);
                updateBoothStatus('active');
            },
            // Booth reset
            () => {
                resetBooth();
            }
        );

        updateBoothStatus('idle');
        return () => disconnectSocket();
    }, []);

    function handleVoteSuccess(txHash) {
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
        // Refresh election state
        fetchActiveElection();
    }

    function handleBoothLocked(reason) {
        console.warn('🔒 Booth locked:', reason);
        updateBoothStatus('locked');
        // Reset to idle after showing message for 2s
        setTimeout(() => {
            setIsUnlocked(false);
            setAuthorizedVoter(null);
            setShowSuccess(false);
            setTransactionHash('');
            updateBoothStatus('idle');
            fetchActiveElection();
        }, 2000);
    }

    function handleSuccessClose() {
        setShowSuccess(false);
        setTimeout(resetBooth, 500);
    }

    return (
        <div className="app">
            {!isUnlocked ? (
                <IdleScreen
                    activeElection={activeElection}
                    boothId={BOOTH_ID}
                    electionLoading={electionLoading}
                />
            ) : (
                <VotingScreen
                    authorizedVoter={authorizedVoter}
                    activeElection={activeElection}
                    candidates={candidates}
                    onVoteSuccess={handleVoteSuccess}
                    onBoothLocked={handleBoothLocked}
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
