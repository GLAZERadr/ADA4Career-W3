// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CVRegistry
 * @dev A smart contract for managing CV registrations and approvals on ADA4Career platform
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

    // State variables
    mapping(address => CVRecord) public cvRecords;
    mapping(address => bool) public approvers;
    mapping(string => bool) private usedHashes; // Prevent hash reuse

    uint256 public totalSubmissions;
    uint256 public totalApprovals;
    uint256 public totalRejections;

    // Modifiers
    modifier onlyApprover() {
        require(approvers[msg.sender] || msg.sender == owner(), "Not authorized to approve");
        _;
    }

    modifier validHash(string memory _hash) {
        require(bytes(_hash).length > 0, "Hash cannot be empty");
        require(!usedHashes[_hash], "Hash already used");
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
    ) external validHash(_ipfsHash) nonReentrant {
        require(
            cvRecords[msg.sender].status == CVStatus.None ||
            cvRecords[msg.sender].status == CVStatus.Rejected,
            "CV already submitted or approved"
        );

        // Mark old hash as unused if updating from rejected status
        if (cvRecords[msg.sender].status == CVStatus.Rejected) {
            usedHashes[cvRecords[msg.sender].ipfsHash] = false;
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

        usedHashes[_ipfsHash] = true;
        totalSubmissions++;

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
    ) external validHash(_ipfsHash) nonReentrant {
        require(cvRecords[msg.sender].status == CVStatus.Pending, "Can only update pending CVs");

        string memory oldHash = cvRecords[msg.sender].ipfsHash;
        usedHashes[oldHash] = false; // Free up old hash

        cvRecords[msg.sender].ipfsHash = _ipfsHash;
        cvRecords[msg.sender].metadataHash = _metadataHash;
        cvRecords[msg.sender].lastUpdateTime = block.timestamp;

        usedHashes[_ipfsHash] = true;

        emit CVUpdated(msg.sender, oldHash, _ipfsHash, _metadataHash, block.timestamp);
    }

    /**
     * @dev Approve a CV (only approvers)
     * @param _user Address of the user whose CV to approve
     */
    function approveCV(address _user) external onlyApprover {
        require(cvRecords[_user].status == CVStatus.Pending, "CV not pending approval");

        cvRecords[_user].status = CVStatus.Approved;
        cvRecords[_user].lastUpdateTime = block.timestamp;
        totalApprovals++;

        emit CVApproved(_user, msg.sender, block.timestamp);
    }

    /**
     * @dev Reject a CV with reason (only approvers)
     * @param _user Address of the user whose CV to reject
     * @param _reason Reason for rejection
     */
    function rejectCV(address _user, string memory _reason) external onlyApprover {
        require(cvRecords[_user].status == CVStatus.Pending, "CV not pending approval");

        cvRecords[_user].status = CVStatus.Rejected;
        cvRecords[_user].rejectionReason = _reason;
        cvRecords[_user].lastUpdateTime = block.timestamp;
        totalRejections++;

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
     * @dev Remove an approver (only owner)
     * @param _approver Address to remove as approver
     */
    function removeApprover(address _approver) external onlyOwner {
        require(approvers[_approver], "Not an approver");
        require(_approver != owner(), "Cannot remove owner");

        approvers[_approver] = false;
        emit ApproverRemoved(_approver);
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
     * @dev Get all pending CVs (for approvers only)
     * @param _limit Number of records to return
     * @return users Array of user addresses with pending CVs
     * @return records Array of corresponding CV records
     */
    function getPendingCVs(
        uint256 /* _offset */,
        uint256 _limit
    ) external view onlyApprover returns (
        address[] memory users,
        CVRecord[] memory records
    ) {
        // Note: This is a simplified version. In production, you might want to
        // maintain a separate array of pending CVs for efficient querying
        users = new address[](_limit);
        records = new CVRecord[](_limit);

        // This would need to be implemented with proper indexing
        // For now, it's a placeholder structure
    }
}