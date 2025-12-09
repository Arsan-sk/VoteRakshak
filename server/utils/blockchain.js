/**
 * Blockchain utility functions for interacting with DecentralizedVoting contract
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =================== Configuration ===================

const GANACHE_URL = process.env.GANACHE_URL || 'http://127.0.0.1:7545';
let contractConfig = null;
let provider = null;
let contract = null;
let wallet = null;

// =================== Initialize Connection ===================

/**
 * Initialize blockchain connection and contract instance
 */
export async function initializeBlockchain() {
    try {
        console.log('🔗 Connecting to Ganache...');

        // Create provider
        provider = new ethers.JsonRpcProvider(GANACHE_URL);

        // Test connection
        const network = await provider.getNetwork();
        console.log(`✅ Connected to network: ${network.chainId}`);

        // Load contract configuration
        const configPath = path.join(__dirname, '..', 'contract-config.json');

        if (!fs.existsSync(configPath)) {
            throw new Error('Contract config not found. Please deploy the contract first.');
        }

        contractConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(`📄 Contract loaded: ${contractConfig.contractAddress}`);

        // Get first account from Ganache as server wallet
        const accounts = await provider.listAccounts();
        if (accounts.length === 0) {
            throw new Error('No accounts available in Ganache');
        }

        wallet = await provider.getSigner(accounts[0].address);
        console.log(`👤 Using wallet: ${await wallet.getAddress()}`);

        // Create contract instance
        contract = new ethers.Contract(
            contractConfig.contractAddress,
            contractConfig.abi,
            wallet
        );

        // Verify contract is accessible
        const admin = await contract.admin();
        console.log(`✅ Contract admin: ${admin}`);

        return true;
    } catch (error) {
        console.error('❌ Blockchain initialization failed:', error.message);
        throw error;
    }
}

// =================== Contract Interaction Functions ===================

/**
 * Cast a vote on the blockchain
 * @param {string} aadharHash - Keccak256 hash of voter's Aadhaar
 * @param {number} partyId - ID of the party (1-based)
 * @returns {Object} Transaction receipt with hash
 */
export async function castVote(aadharHash, partyId) {
    try {
        if (!contract) {
            await initializeBlockchain();
        }

        console.log(`🗳️  Casting vote for party ${partyId}...`);

        // Convert hash to bytes32 format
        const voterHash = ethers.keccak256(ethers.toUtf8Bytes(aadharHash));

        // Execute transaction
        const tx = await contract.castVote(voterHash, partyId);
        console.log(`📝 Transaction sent: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`✅ Vote recorded in block ${receipt.blockNumber}`);

        return {
            success: true,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        };
    } catch (error) {
        console.error('❌ Vote casting failed:', error.message);

        // Parse error message for user-friendly response
        if (error.message.includes('already cast their vote')) {
            throw new Error('Voter has already voted');
        } else if (error.message.includes('not started yet')) {
            throw new Error('Voting has not started yet');
        } else if (error.message.includes('has ended')) {
            throw new Error('Voting period has ended');
        }

        throw error;
    }
}

/**
 * Check if a voter has already voted
 * @param {string} aadharHash - Keccak256 hash of voter's Aadhaar
 * @returns {boolean} True if voted, false otherwise
 */
export async function hasVoted(aadharHash) {
    try {
        if (!contract) {
            await initializeBlockchain();
        }

        const voterHash = ethers.keccak256(ethers.toUtf8Bytes(aadharHash));
        const voted = await contract.hasVoted(voterHash);

        return voted;
    } catch (error) {
        console.error('❌ Error checking vote status:', error.message);
        throw error;
    }
}

/**
 * Get vote count for a specific party
 * @param {number} partyId - ID of the party
 * @returns {number} Vote count
 */
export async function getVoteCount(partyId) {
    try {
        if (!contract) {
            await initializeBlockchain();
        }

        const count = await contract.voteCounts(partyId);
        return Number(count);
    } catch (error) {
        console.error('❌ Error getting vote count:', error.message);
        throw error;
    }
}

/**
 * Get voting status (active/inactive and time remaining)
 * @returns {Object} Voting status information
 */
export async function getVotingStatus() {
    try {
        if (!contract) {
            await initializeBlockchain();
        }

        const [isActive, timeRemaining] = await contract.getVotingStatus();
        const totalVotes = await contract.totalVotes();

        return {
            isActive,
            timeRemaining: Number(timeRemaining),
            totalVotes: Number(totalVotes),
        };
    } catch (error) {
        console.error('❌ Error getting voting status:', error.message);
        throw error;
    }
}

/**
 * Get total votes cast
 * @returns {number} Total votes
 */
export async function getTotalVotes() {
    try {
        if (!contract) {
            await initializeBlockchain();
        }

        const total = await contract.getTotalVotes();
        return Number(total);
    } catch (error) {
        console.error('❌ Error getting total votes:', error.message);
        throw error;
    }
}

/**
 * Hash Aadhaar number with salt for privacy
 * @param {string} aadhar - Plain Aadhaar number
 * @returns {string} Hashed Aadhaar
 */
export function hashAadhaar(aadhar) {
    const salt = process.env.AADHAAR_SALT || 'voting_system_salt_2024';
    const combined = `${aadhar}_${salt}`;
    return ethers.keccak256(ethers.toUtf8Bytes(combined));
}

/**
 * Listen for VoteCast events
 * @param {Function} callback - Callback function to handle events
 */
export function listenForVotes(callback) {
    if (!contract) {
        throw new Error('Contract not initialized');
    }

    contract.on('VoteCast', (voterHash, partyId, timestamp, event) => {
        console.log(`📢 Vote event: Party ${partyId} at ${new Date(Number(timestamp) * 1000)}`);

        callback({
            voterHash,
            partyId: Number(partyId),
            timestamp: Number(timestamp),
            transactionHash: event.log.transactionHash,
        });
    });
}

// Export provider for external use
export { provider, contract };
