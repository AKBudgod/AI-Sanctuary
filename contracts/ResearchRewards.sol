// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ResearchRewards
 * @author AI Sanctuary
 * @notice Manages research submissions and token rewards
 * @dev Researchers submit findings, get verified, earn SANC tokens
 */
contract ResearchRewards is Ownable2Step, ReentrancyGuard {
    
    IERC20 public sanctumToken;
    using SafeERC20 for IERC20;
    
    /// @notice Types of research submissions
    enum SubmissionType { 
        ModelTest,      // Basic AI model test
        SafetyReport,   // AI safety finding
        AlignmentStudy, // Alignment research
        BugBounty,      // Found vulnerability
        DatasetContrib  // Contributed training data
    }
    
    /// @notice Structure for research submissions
    struct Submission {
        address researcher;
        string modelId;
        string ipfsHash;      // IPFS hash of full report
        SubmissionType submissionType;
        uint256 timestamp;
        uint256 rewardAmount;
        bool verified;
        bool paid;
        address verifier;
        uint8 qualityScore;   // 0-100 quality rating
    }
    
    /// @notice All submissions stored in array
    Submission[] public submissions;
    
    /// @notice Mapping from researcher to their submission IDs
    mapping(address => uint256[]) public researcherSubmissions;
    
    /// @notice Mapping tracking which submissions are pending verification
    mapping(uint256 => bool) public pendingVerification;
    
    /// @notice Authorized verifiers who can approve submissions
    mapping(address => bool) public isVerifier;
    
    /// @notice Reward multipliers for each submission type
    mapping(SubmissionType => uint256) public rewardMultipliers;
    
    /// @notice Minimum score required to receive reward
    uint256 public constant MIN_SCORE_FOR_REWARD = 50; // 50/100 minimum
    
    /// @notice Last submission time for each researcher (cooldown)
    mapping(address => uint256) public lastSubmissionTime;
    
    /// @notice Cooldown period between submissions
    uint256 public submissionCooldown = 1 hours;
    
    /// @notice Total submissions count
    uint256 public totalSubmissions;
    
    /// @notice Total verified submissions
    uint256 public totalVerified;
    
    /// @notice Total rewards paid out
    uint256 public totalRewardsPaid;
    
    // Events
    event SubmissionCreated(
        uint256 indexed submissionId,
        address indexed researcher,
        string modelId,
        SubmissionType submissionType
    );
    event SubmissionVerified(
        uint256 indexed submissionId,
        address indexed verifier,
        uint8 qualityScore,
        uint256 rewardAmount
    );
    event RewardPaid(
        uint256 indexed submissionId,
        address indexed researcher,
        uint256 amount
    );
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    event RewardMultiplierUpdated(SubmissionType indexed subType, uint256 multiplier);
    event CooldownUpdated(uint256 newCooldown);
    event TokenAddressUpdated(address indexed newToken);
    
    /**
     * @notice Restricts function to authorized verifiers or owner
     */
    modifier onlyVerifier() {
        require(isVerifier[msg.sender] || msg.sender == owner(), "Not a verifier");
        _;
    }
    
    /**
     * @notice Validates submission type is valid
     * @param _type Submission type to validate
     */
    modifier validSubmissionType(SubmissionType _type) {
        require(uint256(_type) <= 4, "Invalid submission type");
        _;
    }
    
    /**
     * @notice Deploys the ResearchRewards contract
     * @param _tokenAddress Address of the SanctumToken contract
     */
    constructor(address _tokenAddress) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Invalid token address");
        sanctumToken = IERC20(_tokenAddress);
        
        // Set default reward multipliers (percentage of base rate)
        rewardMultipliers[SubmissionType.ModelTest] = 100;      // 1x base
        rewardMultipliers[SubmissionType.SafetyReport] = 200;   // 2x base
        rewardMultipliers[SubmissionType.AlignmentStudy] = 300; // 3x base
        rewardMultipliers[SubmissionType.BugBounty] = 500;      // 5x base
        rewardMultipliers[SubmissionType.DatasetContrib] = 150; // 1.5x base
        
        // Owner is initial verifier
        isVerifier[msg.sender] = true;
    }
    
    /**
     * @notice Submit research finding
     * @param _modelId ID of the AI model tested
     * @param _ipfsHash IPFS hash of the full research report
     * @param _submissionType Type of submission
     * @return submissionId ID of the created submission
     */
    function submitResearch(
        string memory _modelId,
        string memory _ipfsHash,
        SubmissionType _submissionType
    ) external validSubmissionType(_submissionType) returns (uint256 submissionId) {
        require(bytes(_modelId).length != 0, "Model ID required");
        require(bytes(_ipfsHash).length != 0, "IPFS hash required");
        require(
            block.timestamp >= lastSubmissionTime[msg.sender] + submissionCooldown,
            "Submission cooldown active"
        );
        
        submissionId = submissions.length;
        
        Submission memory newSubmission = Submission({
            researcher: msg.sender,
            modelId: _modelId,
            ipfsHash: _ipfsHash,
            submissionType: _submissionType,
            timestamp: block.timestamp,
            rewardAmount: 0,
            verified: false,
            paid: false,
            verifier: address(0),
            qualityScore: 0
        });
        
        submissions.push(newSubmission);
        researcherSubmissions[msg.sender].push(submissionId);
        pendingVerification[submissionId] = true;
        
        lastSubmissionTime[msg.sender] = block.timestamp;
        totalSubmissions++;
        
        emit SubmissionCreated(submissionId, msg.sender, _modelId, _submissionType);
    }
    
    /**
     * @notice Verify a submission and set reward
     * @param _submissionId ID of submission to verify
     * @param _qualityScore Quality score 0-100
     * @param _approved Whether submission is approved
     */
    function verifySubmission(
        uint256 _submissionId,
        uint8 _qualityScore,
        bool _approved
    ) public onlyVerifier {
        require(_submissionId < submissions.length, "Invalid submission ID");
        require(pendingVerification[_submissionId], "Already verified");
        require(_qualityScore <= 100, "Score must be 0-100");
        
        Submission storage sub = submissions[_submissionId];
        
        sub.qualityScore = _qualityScore;
        sub.verifier = msg.sender;
        sub.verified = true;
        pendingVerification[_submissionId] = false;
        
        if (_approved && _qualityScore >= MIN_SCORE_FOR_REWARD) {
            // Calculate reward
            uint256 baseReward = 10 * 10**18; // 10 SANC base
            uint256 multiplier = rewardMultipliers[sub.submissionType];
            uint256 qualityMultiplier = _qualityScore;
            
            // Formula: base * typeMultiplier/100 * (100 + qualityScore)/100
            uint256 reward = (baseReward * multiplier * (100 + qualityMultiplier)) / 10000;
            
            sub.rewardAmount = reward;
            
            // Pay the reward
            _payReward(_submissionId);
        }
        
        totalVerified++;
        
        emit SubmissionVerified(_submissionId, msg.sender, _qualityScore, sub.rewardAmount);
    }
    
    /**
     * @dev Internal function to pay reward
     * @param _submissionId ID of submission to pay
     */
    function _payReward(uint256 _submissionId) internal nonReentrant {
        Submission storage sub = submissions[_submissionId];
        require(sub.verified && !sub.paid && sub.rewardAmount != 0, "Invalid payment state");
        
        sub.paid = true;
        totalRewardsPaid = totalRewardsPaid + sub.rewardAmount;
        
        // Transfer SANC to researcher
        sanctumToken.safeTransfer(sub.researcher, sub.rewardAmount);
        
        emit RewardPaid(_submissionId, sub.researcher, sub.rewardAmount);
    }
    
    /**
     * @notice Batch verify submissions (gas efficient)
     * @param _submissionIds Array of submission IDs
     * @param _qualityScores Array of quality scores
     * @param _approved Array of approval decisions
     */
    function batchVerify(
        uint256[] calldata _submissionIds,
        uint8[] calldata _qualityScores,
        bool[] calldata _approved
    ) external onlyVerifier {
        require(
            _submissionIds.length == _qualityScores.length && 
            _qualityScores.length == _approved.length,
            "Array length mismatch"
        );
        
        uint256 length = _submissionIds.length;
        for (uint i = 0; i < length; i++) {
            verifySubmission(_submissionIds[i], _qualityScores[i], _approved[i]);
        }
    }
    
    /**
     * @notice Get all submissions by a researcher
     * @param _researcher Address of researcher
     * @return Array of submission IDs
     */
    function getResearcherSubmissions(address _researcher) external view returns (uint256[] memory) {
        return researcherSubmissions[_researcher];
    }
    
    /**
     * @notice Get submission details
     * @param _submissionId ID of submission
     * @return Submission struct
     */
    function getSubmission(uint256 _submissionId) external view returns (Submission memory) {
        require(_submissionId < submissions.length, "Invalid submission ID");
        return submissions[_submissionId];
    }
    
    /**
     * @notice Get pending submissions count
     * @return count Number of pending submissions
     */
    function getPendingCount() external view returns (uint256 count) {
        uint256 length = submissions.length;
        for (uint i = 0; i < length; i++) {
            if (pendingVerification[i]) count++;
        }
        return count;
    }
    
    /**
     * @notice Add a verifier
     * @param _verifier Address to authorize
     */
    function addVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        isVerifier[_verifier] = true;
        emit VerifierAdded(_verifier);
    }
    
    /**
     * @notice Remove a verifier
     * @param _verifier Address to deauthorize
     */
    function removeVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        isVerifier[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }
    
    /**
     * @notice Update reward multiplier for submission type
     * @param _type Submission type
     * @param _multiplier New multiplier value
     */
    function setRewardMultiplier(SubmissionType _type, uint256 _multiplier) external onlyOwner {
        rewardMultipliers[_type] = _multiplier;
        emit RewardMultiplierUpdated(_type, _multiplier);
    }
    
    /**
     * @notice Update submission cooldown
     * @param _cooldown New cooldown duration in seconds
     */
    function setCooldown(uint256 _cooldown) external onlyOwner {
        submissionCooldown = _cooldown;
        emit CooldownUpdated(_cooldown);
    }
    
    /**
     * @notice Update token contract address
     * @param _tokenAddress New token contract address
     */
    function setTokenAddress(address _tokenAddress) external onlyOwner {
        require(_tokenAddress != address(0), "Invalid token address");
        sanctumToken = IERC20(_tokenAddress);
        emit TokenAddressUpdated(_tokenAddress);
    }
    
    /**
     * @notice Recover ERC20 tokens accidentally sent to this contract
     * @param token ERC20 token to recover
     * @param to Recipient address
     * @param amount Amount to recover
     */
    function recoverERC20(IERC20 token, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        token.safeTransfer(to, amount);
    }
    
    /**
     * @notice Get contract stats
     * @return _totalSubmissions Total submissions
     * @return _totalVerified Total verified
     * @return _totalRewardsPaid Total rewards paid
     * @return _pendingCount Pending count
     * @return _tokenBalance Token balance
     */
    function getStats() external view returns (
        uint256 _totalSubmissions,
        uint256 _totalVerified,
        uint256 _totalRewardsPaid,
        uint256 _pendingCount,
        uint256 _tokenBalance
    ) {
        return (
            totalSubmissions,
            totalVerified,
            totalRewardsPaid,
            this.getPendingCount(),
            sanctumToken.balanceOf(address(this))
        );
    }
}
