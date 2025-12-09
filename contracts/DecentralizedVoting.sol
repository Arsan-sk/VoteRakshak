// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/**
 * @title DecentralizedVoting
 * @dev Secure voting smart contract with time-lock and double-voting prevention
 * @notice This contract only accepts hashed Aadhaar numbers for privacy
 */
contract DecentralizedVoting {
    // =================== State Variables ===================
    
    address public admin;
    uint256 public startTime;
    uint256 public endTime;
    
    // Mapping to track if a voter (by hashed Aadhaar) has already voted
    mapping(bytes32 => bool) public hasVoted;
    
    // Mapping to track vote counts for each party
    mapping(uint256 => uint256) public voteCounts;
    
    // Total number of votes cast
    uint256 public totalVotes;
    
    // =================== Events ===================
    
    /**
     * @dev Emitted when a vote is successfully cast
     * @param voterHash Keccak256 hash of voter's Aadhaar number
     * @param partyId ID of the party voted for
     * @param timestamp Block timestamp when vote was cast
     */
    event VoteCast(
        bytes32 indexed voterHash,
        uint256 indexed partyId,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when voting period is updated
     */
    event VotingPeriodUpdated(uint256 newStartTime, uint256 newEndTime);
    
    // =================== Modifiers ===================
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier withinVotingPeriod() {
        require(
            block.timestamp >= startTime,
            "Voting has not started yet"
        );
        require(
            block.timestamp <= endTime,
            "Voting period has ended"
        );
        _;
    }
    
    // =================== Constructor ===================
    
    /**
     * @dev Initialize the voting contract with time-lock
     * @param _startTime Unix timestamp when voting begins
     * @param _endTime Unix timestamp when voting ends
     */
    constructor(uint256 _startTime, uint256 _endTime) {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_endTime > block.timestamp, "End time must be in the future");
        
        admin = msg.sender;
        startTime = _startTime;
        endTime = _endTime;
    }
    
    // =================== Core Functions ===================
    
    /**
     * @dev Cast a vote for a specific party
     * @param voterHash Keccak256 hash of voter's Aadhaar number (NEVER plaintext)
     * @param partyId ID of the party to vote for (1-based indexing)
     * @notice This function can only be called within the voting period
     * @notice Each voter (identified by hash) can only vote once
     */
    function castVote(bytes32 voterHash, uint256 partyId) 
        external 
        withinVotingPeriod 
    {
        // Validate inputs
        require(voterHash != bytes32(0), "Invalid voter hash");
        require(partyId > 0, "Invalid party ID");
        
        // Check if voter has already voted
        require(!hasVoted[voterHash], "Voter has already cast their vote");
        
        // Mark voter as having voted
        hasVoted[voterHash] = true;
        
        // Increment vote count for the selected party
        voteCounts[partyId]++;
        
        // Increment total votes
        totalVotes++;
        
        // Emit event for transparency
        emit VoteCast(voterHash, partyId, block.timestamp);
    }
    
    /**
     * @dev Check if a voter has already voted
     * @param voterHash Keccak256 hash of voter's Aadhaar number
     * @return bool True if voter has voted, false otherwise
     */
    function checkIfVoted(bytes32 voterHash) external view returns (bool) {
        return hasVoted[voterHash];
    }
    
    /**
     * @dev Get vote count for a specific party
     * @param partyId ID of the party
     * @return uint256 Number of votes received by the party
     */
    function getVoteCount(uint256 partyId) external view returns (uint256) {
        return voteCounts[partyId];
    }
    
    /**
     * @dev Get current voting status
     * @return isActive True if voting is currently active
     * @return timeRemaining Seconds remaining in voting period (0 if ended)
     */
    function getVotingStatus() external view returns (bool isActive, uint256 timeRemaining) {
        if (block.timestamp < startTime) {
            return (false, 0);
        } else if (block.timestamp > endTime) {
            return (false, 0);
        } else {
            return (true, endTime - block.timestamp);
        }
    }
    
    // =================== Admin Functions ===================
    
    /**
     * @dev Update voting period (only before voting starts)
     * @param _newStartTime New start time
     * @param _newEndTime New end time
     */
    function updateVotingPeriod(uint256 _newStartTime, uint256 _newEndTime) 
        external 
        onlyAdmin 
    {
        require(block.timestamp < startTime, "Cannot update after voting has started");
        require(_newStartTime < _newEndTime, "Start time must be before end time");
        
        startTime = _newStartTime;
        endTime = _newEndTime;
        
        emit VotingPeriodUpdated(_newStartTime, _newEndTime);
    }
    
    /**
     * @dev Get total number of votes cast
     * @return uint256 Total votes
     */
    function getTotalVotes() external view returns (uint256) {
        return totalVotes;
    }
}
