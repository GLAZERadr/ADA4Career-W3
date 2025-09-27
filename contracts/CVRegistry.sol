// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title CVRegistry
 * @dev A secure smart contract for managing CV registrations and approvals on ADA4Career platform
 * @notice Fixed critical vulnerabilities: front-running, broken getPendingCVs, missing validations
 */
contract CVRegistry is Ownable, ReentrancyGuard {
    enum CVStatus {
        None,
        Pending,
        Approved,
        Rejected
    }

    struct CVRecord {
        string ipfsHash;        // IPFS hash of the CV document
        string metadataHash;    // Hash of CV metadata (skills, experience, etc.)
        CVStatus status;
        uint256 submissionTime;
        uint256 lastUpdateTime;
        address submitter;
        string rejectionReason;
    }

    // Events
    event CVSubmitted(
        address indexed user,
        string ipfsHash,
        string metadataHash,
        uint256 timestamp
    );

    event CVUpdated(
        address indexed user,
        string oldIpfsHash,
        string newIpfsHash,
        string newMetadataHash,
        uint256 timestamp
    );

    event CVApproved(
        address indexed user,
        address indexed approver,
        uint256 timestamp
    );

    event CVRejected(
        address indexed user,
        address indexed rejector,
        string reason,
        uint256 timestamp
    );

    event ApproverAdded(address indexed approver);
    event ApproverRemoved(address indexed approver);
    event ApproverRemovalInitiated(address indexed approver, uint256 executeAfter);

    // State variables
    mapping(address => CVRecord) public cvRecords;
    mapping(address => bool) public approvers;

    // FIX: Per-user hash mapping to prevent front-running
    mapping(address => mapping(string => bool)) private usedHashes;

    // FIX: Dynamic tracking for pending CVs
    address[] private pendingUsers;
    mapping(address => uint256) private pendingIndexes; // Track position in pendingUsers array

    // FIX: Two-step approver removal for security
    mapping(address => uint256) private pendingApproverRemovals;
    uint256 private constant REMOVAL_DELAY = 2 days;

    uint256 public totalSubmissions;
    uint256 public totalApprovals;
    uint256 public totalRejections;

    // Modifiers
    modifier onlyApprover() {
        require(approvers[msg.sender] || msg.sender == owner(), "Not authorized to approve");
        _;
    }

    // FIX: Updated validHash to use per-user mapping
    modifier validHash(string memory _hash) {
        require(bytes(_hash).length > 0, "Hash cannot be empty");
        require(!usedHashes[msg.sender][_hash], "Hash already used by you");
        _;
    }

    // FIX: Add validation for metadata hash
    modifier validMetadataHash(string memory _metadataHash) {
        require(bytes(_metadataHash).length > 0, "Metadata hash cannot be empty");
        _;
    }

    constructor() Ownable(msg.sender) {
        approvers[msg.sender] = true; // Owner is default approver
    }

    /**
     * @dev Submit a new CV for approval
     * @param _ipfsHash IPFS hash of the CV document
     * @param _metadataHash Hash of CV metadata
     */
    function submitCV(
        string memory _ipfsHash,
        string memory _metadataHash
    ) external validHash(_ipfsHash) validMetadataHash(_metadataHash) nonReentrant {
        // FIX: Add zero address check
        require(msg.sender != address(0), "Zero address cannot submit");

        require(
            cvRecords[msg.sender].status == CVStatus.None ||
            cvRecords[msg.sender].status == CVStatus.Rejected,
            "CV already submitted or approved"
        );

        // Mark old hash as unused if updating from rejected status
        if (cvRecords[msg.sender].status == CVStatus.Rejected) {
            usedHashes[msg.sender][cvRecords[msg.sender].ipfsHash] = false;
            // Remove from pending if exists (edge case)
            _removePendingUser(msg.sender);
        }

        cvRecords[msg.sender] = CVRecord({
            ipfsHash: _ipfsHash,
            metadataHash: _metadataHash,
            status: CVStatus.Pending,
            submissionTime: block.timestamp,
            lastUpdateTime: block.timestamp,
            submitter: msg.sender,
            rejectionReason: ""
        });

        usedHashes[msg.sender][_ipfsHash] = true;

        // FIX: Add to pending users tracking
        _addPendingUser(msg.sender);

        // FIX: Gas optimization - use unchecked for counter
        unchecked { totalSubmissions++; }

        emit CVSubmitted(msg.sender, _ipfsHash, _metadataHash, block.timestamp);
    }

    /**
     * @dev Update an existing pending CV
     * @param _ipfsHash New IPFS hash of the CV document
     * @param _metadataHash New hash of CV metadata
     */
    function updateCV(
        string memory _ipfsHash,
        string memory _metadataHash
    ) external validHash(_ipfsHash) validMetadataHash(_metadataHash) nonReentrant {
        // FIX: Gas optimization - cache storage reference
        CVRecord storage record = cvRecords[msg.sender];
        require(record.status == CVStatus.Pending, "Can only update pending CVs");

        string memory oldHash = record.ipfsHash;
        usedHashes[msg.sender][oldHash] = false; // Free up old hash

        record.ipfsHash = _ipfsHash;
        record.metadataHash = _metadataHash;
        record.lastUpdateTime = block.timestamp;

        usedHashes[msg.sender][_ipfsHash] = true;

        emit CVUpdated(msg.sender, oldHash, _ipfsHash, _metadataHash, block.timestamp);
    }

    /**
     * @dev Approve a CV (only approvers)
     * @param _user Address of the user whose CV to approve
     */
    function approveCV(address _user) external onlyApprover {
        // FIX: Prevent self-approval
        require(_user != msg.sender, "Cannot approve own CV");
        require(cvRecords[_user].status == CVStatus.Pending, "CV not pending approval");

        cvRecords[_user].status = CVStatus.Approved;
        cvRecords[_user].lastUpdateTime = block.timestamp;

        // FIX: Remove from pending users
        _removePendingUser(_user);

        // FIX: Gas optimization - use unchecked for counter
        unchecked { totalApprovals++; }

        emit CVApproved(_user, msg.sender, block.timestamp);
    }

    /**
     * @dev Reject a CV with reason (only approvers)
     * @param _user Address of the user whose CV to reject
     * @param _reason Reason for rejection
     */
    function rejectCV(address _user, string memory _reason) external onlyApprover {
        // FIX: Prevent self-rejection
        require(_user != msg.sender, "Cannot reject own CV");
        require(cvRecords[_user].status == CVStatus.Pending, "CV not pending approval");

        cvRecords[_user].status = CVStatus.Rejected;
        cvRecords[_user].rejectionReason = _reason;
        cvRecords[_user].lastUpdateTime = block.timestamp;

        // FIX: Remove from pending users
        _removePendingUser(_user);

        // FIX: Gas optimization - use unchecked for counter
        unchecked { totalRejections++; }

        emit CVRejected(_user, msg.sender, _reason, block.timestamp);
    }

    /**
     * @dev Add a new approver (only owner)
     * @param _approver Address to add as approver
     */
    function addApprover(address _approver) external onlyOwner {
        require(_approver != address(0), "Invalid address");
        require(!approvers[_approver], "Already an approver");

        approvers[_approver] = true;
        emit ApproverAdded(_approver);
    }

    /**
     * @dev Initiate approver removal with delay (only owner)
     * @param _approver Address to remove as approver
     */
    function initiateApproverRemoval(address _approver) external onlyOwner {
        require(approvers[_approver], "Not an approver");
        require(_approver != owner(), "Cannot remove owner");
        require(pendingApproverRemovals[_approver] == 0, "Removal already initiated");

        pendingApproverRemovals[_approver] = block.timestamp + REMOVAL_DELAY;
        emit ApproverRemovalInitiated(_approver, pendingApproverRemovals[_approver]);
    }

    /**
     * @dev Execute approver removal after delay (only owner)
     * @param _approver Address to remove as approver
     */
    function executeApproverRemoval(address _approver) external onlyOwner {
        require(pendingApproverRemovals[_approver] != 0, "Removal not initiated");
        require(block.timestamp >= pendingApproverRemovals[_approver], "Delay not completed");

        approvers[_approver] = false;
        delete pendingApproverRemovals[_approver];
        emit ApproverRemoved(_approver);
    }

    /**
     * @dev Cancel pending approver removal (only owner)
     * @param _approver Address to cancel removal for
     */
    function cancelApproverRemoval(address _approver) external onlyOwner {
        require(pendingApproverRemovals[_approver] != 0, "No pending removal");
        delete pendingApproverRemovals[_approver];
    }

    /**
     * @dev Get CV record for a user
     * @param _user Address of the user
     * @return CVRecord struct
     */
    function getCVRecord(address _user) external view returns (CVRecord memory) {
        return cvRecords[_user];
    }

    /**
     * @dev Get CV status for a user
     * @param _user Address of the user
     * @return CVStatus enum value
     */
    function getCVStatus(address _user) external view returns (CVStatus) {
        return cvRecords[_user].status;
    }

    /**
     * @dev Check if an address is an approver
     * @param _address Address to check
     * @return bool indicating if address is approver
     */
    function isApprover(address _address) external view returns (bool) {
        return approvers[_address] || _address == owner();
    }

    /**
     * @dev Get contract statistics
     * @return totalSubmissions, totalApprovals, totalRejections
     */
    function getStats() external view returns (uint256, uint256, uint256) {
        return (totalSubmissions, totalApprovals, totalRejections);
    }

    /**
     * @dev Get total number of pending CVs
     * @return Number of pending CVs
     */
    function getPendingCount() external view returns (uint256) {
        return pendingUsers.length;
    }

    /**
     * @dev FIX: Properly implemented getPendingCVs with dynamic tracking and pagination
     * @param _offset Starting index for pagination
     * @param _limit Number of records to return
     * @return users Array of user addresses with pending CVs
     * @return records Array of corresponding CV records
     */
    function getPendingCVs(
        uint256 _offset,
        uint256 _limit
    ) external view onlyApprover returns (
        address[] memory users,
        CVRecord[] memory records
    ) {
        require(_limit > 0, "Limit must be > 0");
        require(_offset < pendingUsers.length, "Offset out of bounds");

        uint256 end = Math.min(_offset + _limit, pendingUsers.length);
        uint256 resultLength = end - _offset;

        users = new address[](resultLength);
        records = new CVRecord[](resultLength);

        for (uint256 i = _offset; i < end; i++) {
            address user = pendingUsers[i];
            users[i - _offset] = user;
            records[i - _offset] = cvRecords[user];
        }

        return (users, records);
    }

    /**
     * @dev FIX: Block ownership renunciation for security
     */
    function renounceOwnership() public pure override {
        revert("Ownership cannot be renounced");
    }

    // Internal functions for pending users management
    function _addPendingUser(address _user) internal {
        // Only add if not already pending
        if (pendingIndexes[_user] == 0 && (pendingUsers.length == 0 || pendingUsers[0] != _user)) {
            pendingUsers.push(_user);
            pendingIndexes[_user] = pendingUsers.length; // Store 1-based index
        }
    }

    function _removePendingUser(address _user) internal {
        uint256 index = pendingIndexes[_user];
        if (index == 0) return; // Not in pending list

        // Convert to 0-based index
        index = index - 1;

        // Move last element to removed position
        uint256 lastIndex = pendingUsers.length - 1;
        if (index != lastIndex) {
            address lastUser = pendingUsers[lastIndex];
            pendingUsers[index] = lastUser;
            pendingIndexes[lastUser] = index + 1; // Update to 1-based index
        }

        // Remove last element
        pendingUsers.pop();
        delete pendingIndexes[_user];
    }
}