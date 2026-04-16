// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/**
 * @title DecentralizedVoting
 * @dev Phase 2 - College Election Management System
 * @notice Election-scoped voting contract. Each election is identified by a bytes32 electionId.
 *         The contract owner (deployer) opens and closes elections.
 *         Votes are isolated per election - a voter can vote in multiple elections independently.
 */
contract DecentralizedVoting {
    // =================== State Variables ===================

    address public owner;

    // electionId => voterHash => hasVoted
    mapping(bytes32 => mapping(bytes32 => bool)) public hasVoted;

    // electionId => candidateId => voteCount
    mapping(bytes32 => mapping(uint256 => uint256)) public voteCounts;

    // electionId => isActive
    mapping(bytes32 => bool) public isElectionActive;

    // electionId => totalVotes
    mapping(bytes32 => uint256) public totalVotesPerElection;

    // =================== Events ===================

    event VoteCast(
        bytes32 indexed electionId,
        bytes32 indexed voterHash,
        uint256 candidateId,
        uint256 timestamp
    );

    event ElectionOpened(
        bytes32 indexed electionId,
        uint256 timestamp
    );

    event ElectionClosed(
        bytes32 indexed electionId,
        uint256 timestamp
    );

    // =================== Modifiers ===================

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier electionMustBeActive(bytes32 electionId) {
        require(isElectionActive[electionId], "Election is not active");
        _;
    }

    // =================== Constructor ===================

    constructor() {
        owner = msg.sender;
    }

    // =================== Owner Functions ===================

    /**
     * @dev Open a new election
     * @param electionId Unique election identifier (keccak256 of DB UUID)
     */
    function openElection(bytes32 electionId) external onlyOwner {
        require(!isElectionActive[electionId], "Election is already active");
        isElectionActive[electionId] = true;
        emit ElectionOpened(electionId, block.timestamp);
    }

    /**
     * @dev Close an active election
     * @param electionId Unique election identifier
     */
    function closeElection(bytes32 electionId) external onlyOwner {
        require(isElectionActive[electionId], "Election is not active");
        isElectionActive[electionId] = false;
        emit ElectionClosed(electionId, block.timestamp);
    }

    // =================== Voting Functions ===================

    /**
     * @dev Cast a vote in a specific election
     * @param electionId The election to vote in
     * @param voterHash Keccak256 hash of voter's roll number + salt
     * @param candidateId ID of the candidate (1-based serial number)
     */
    function castVote(
        bytes32 electionId,
        bytes32 voterHash,
        uint256 candidateId
    ) external electionMustBeActive(electionId) {
        require(voterHash != bytes32(0), "Invalid voter hash");
        require(candidateId > 0, "Invalid candidate ID");
        require(!hasVoted[electionId][voterHash], "Voter has already voted in this election");

        // Record vote
        hasVoted[electionId][voterHash] = true;
        voteCounts[electionId][candidateId]++;
        totalVotesPerElection[electionId]++;

        emit VoteCast(electionId, voterHash, candidateId, block.timestamp);
    }

    // =================== View Functions ===================

    /**
     * @dev Check if a voter has already voted in a specific election
     * @param electionId The election to check
     * @param voterHash Keccak256 hash of voter's identifier
     * @return bool True if voter has voted
     */
    function checkIfVoted(bytes32 electionId, bytes32 voterHash)
        external
        view
        returns (bool)
    {
        return hasVoted[electionId][voterHash];
    }

    /**
     * @dev Get vote count for a candidate in a specific election
     * @param electionId The election
     * @param candidateId The candidate serial number
     * @return uint256 Number of votes
     */
    function getVoteCount(bytes32 electionId, uint256 candidateId)
        external
        view
        returns (uint256)
    {
        return voteCounts[electionId][candidateId];
    }

    /**
     * @dev Get total votes cast in a specific election
     * @param electionId The election
     * @return uint256 Total votes
     */
    function getTotalVotesForElection(bytes32 electionId)
        external
        view
        returns (uint256)
    {
        return totalVotesPerElection[electionId];
    }

    /**
     * @dev Check if an election is currently active
     * @param electionId The election
     * @return bool True if active
     */
    function getElectionStatus(bytes32 electionId)
        external
        view
        returns (bool)
    {
        return isElectionActive[electionId];
    }
}
