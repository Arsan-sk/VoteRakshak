/**
 * Blockchain utility functions for interacting with DecentralizedVoting contract (Phase 2)
 * Election-scoped voting — all functions take electionId as first argument.
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

        provider = new ethers.JsonRpcProvider(GANACHE_URL);
        const network = await provider.getNetwork();
        console.log(`✅ Connected to network: ${network.chainId}`);

        const configPath = path.join(__dirname, '..', 'contract-config.json');
        if (!fs.existsSync(configPath)) {
            throw new Error('Contract config not found. Please deploy the contract first.');
        }

        contractConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(`📄 Contract loaded: ${contractConfig.contractAddress}`);

        const accounts = await provider.listAccounts();
        if (accounts.length === 0) {
            throw new Error('No accounts available in Ganache');
        }

        wallet = await provider.getSigner(accounts[0].address);
        console.log(`👤 Using wallet: ${await wallet.getAddress()}`);

        contract = new ethers.Contract(
            contractConfig.contractAddress,
            contractConfig.abi,
            wallet
        );

        // Verify contract by calling owner()
        const owner = await contract.owner();
        console.log(`✅ Contract owner: ${owner}`);

        return true;
    } catch (error) {
        console.error('❌ Blockchain initialization failed:', error.message);
        throw error;
    }
}

// =================== Election Management ===================

/**
 * Open a new election on the blockchain
 * @param {string} electionId - The blockchain election ID (hex string from keccak256)
 */
export async function openElection(electionId) {
    try {
        if (!contract) await initializeBlockchain();

        console.log(`🗳️  Opening election: ${electionId}`);
        const tx = await contract.openElection(electionId);
        const receipt = await tx.wait();
        console.log(`✅ Election opened in block ${receipt.blockNumber}`);
        return { success: true, transactionHash: tx.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
        console.error('❌ openElection failed:', error.message);
        throw error;
    }
}

/**
 * Close an active election on the blockchain
 * @param {string} electionId - The blockchain election ID (hex string)
 */
export async function closeElection(electionId) {
    try {
        if (!contract) await initializeBlockchain();

        console.log(`🔒 Closing election: ${electionId}`);
        const tx = await contract.closeElection(electionId);
        const receipt = await tx.wait();
        console.log(`✅ Election closed in block ${receipt.blockNumber}`);
        return { success: true, transactionHash: tx.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
        console.error('❌ closeElection failed:', error.message);
        throw error;
    }
}

// =================== Voting Functions ===================

/**
 * Cast a vote on the blockchain
 * @param {string} electionId - Blockchain election ID (hex bytes32)
 * @param {string} voterHash - Keccak256 hash of voter's roll number
 * @param {number} candidateId - Serial number of the candidate (1-based)
 */
export async function castVote(electionId, voterHash, candidateId) {
    try {
        if (!contract) await initializeBlockchain();

        console.log(`🗳️  Casting vote: election=${electionId} candidate=${candidateId}`);

        // voterHash is already a keccak256 hex string from hashRollNumber()
        // Ensure it's bytes32 format
        const voterHashBytes32 = voterHash.startsWith('0x') ? voterHash : `0x${voterHash}`;

        const tx = await contract.castVote(electionId, voterHashBytes32, candidateId);
        console.log(`📝 Transaction sent: ${tx.hash}`);

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
        if (error.message.includes('already voted')) {
            throw new Error('Voter has already voted in this election');
        } else if (error.message.includes('not active')) {
            throw new Error('Election is not currently active');
        }
        throw error;
    }
}

/**
 * Check if a voter has already voted in a specific election
 * @param {string} electionId - Blockchain election ID
 * @param {string} voterHash - Keccak256 hash of voter roll number
 * @returns {boolean}
 */
export async function checkIfVoted(electionId, voterHash) {
    try {
        if (!contract) await initializeBlockchain();
        const voterHashBytes32 = voterHash.startsWith('0x') ? voterHash : `0x${voterHash}`;
        return await contract.checkIfVoted(electionId, voterHashBytes32);
    } catch (error) {
        console.error('❌ checkIfVoted failed:', error.message);
        throw error;
    }
}

/**
 * Get vote count for a candidate in an election
 * @param {string} electionId - Blockchain election ID
 * @param {number} candidateId - Candidate serial number
 * @returns {number}
 */
export async function getVoteCount(electionId, candidateId) {
    try {
        if (!contract) await initializeBlockchain();
        const count = await contract.getVoteCount(electionId, candidateId);
        return Number(count);
    } catch (error) {
        console.error('❌ getVoteCount failed:', error.message);
        throw error;
    }
}

/**
 * Get total votes cast in a specific election
 * @param {string} electionId - Blockchain election ID
 * @returns {number}
 */
export async function getTotalVotesForElection(electionId) {
    try {
        if (!contract) await initializeBlockchain();
        const total = await contract.getTotalVotesForElection(electionId);
        return Number(total);
    } catch (error) {
        console.error('❌ getTotalVotesForElection failed:', error.message);
        throw error;
    }
}

/**
 * Check if an election is currently active on chain
 * @param {string} electionId - Blockchain election ID
 * @returns {boolean}
 */
export async function getElectionStatus(electionId) {
    try {
        if (!contract) await initializeBlockchain();
        return await contract.getElectionStatus(electionId);
    } catch (error) {
        console.error('❌ getElectionStatus failed:', error.message);
        throw error;
    }
}

// =================== Hash Functions ===================

/**
 * Hash a roll number with salt for voter privacy (Phase 2 primary identifier)
 * @param {string} rollNumber - Student roll number
 * @returns {string} Keccak256 hex hash
 */
export function hashRollNumber(rollNumber) {
    const salt = process.env.KECCAK_SALT || 'votarakshak_phase2_salt_2025';
    const combined = `${rollNumber.toLowerCase()}_${salt}`;
    return ethers.keccak256(ethers.toUtf8Bytes(combined));
}

/**
 * Generate blockchain election ID from DB election UUID
 * @param {string} electionUUID - UUID from elections table
 * @returns {string} Keccak256 hex string to use as bytes32 electionId
 */
export function generateElectionId(electionUUID) {
    return ethers.keccak256(ethers.toUtf8Bytes(electionUUID));
}

/**
 * @deprecated Phase 1 compat — use hashRollNumber() instead
 */
export function hashAadhaar(aadhar) {
    const salt = process.env.AADHAAR_SALT || process.env.KECCAK_SALT || 'voting_system_salt_2024';
    const combined = `${aadhar}_${salt}`;
    return ethers.keccak256(ethers.toUtf8Bytes(combined));
}

// =================== Event Listeners ===================

/**
 * Listen for VoteCast events and forward to callback
 * @param {Function} callback
 */
export function listenForVotes(callback) {
    if (!contract) throw new Error('Contract not initialized');

    contract.on('VoteCast', (electionId, voterHash, candidateId, timestamp, event) => {
        console.log(`📢 VoteCast event: election=${electionId} candidate=${Number(candidateId)}`);
        callback({
            electionId,
            voterHash,
            candidateId: Number(candidateId),
            timestamp: Number(timestamp),
            transactionHash: event.log.transactionHash,
        });
    });

    contract.on('ElectionOpened', (electionId, timestamp) => {
        console.log(`📢 ElectionOpened: ${electionId}`);
    });

    contract.on('ElectionClosed', (electionId, timestamp) => {
        console.log(`📢 ElectionClosed: ${electionId}`);
    });
}

export { provider, contract };
