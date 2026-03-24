// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title SanctumToken
 * @author AI Sanctuary
 * @dev ERC-20 token for AI Sanctuary research platform
 * Researchers earn tokens for testing AI models
 * Subscriptions create buy pressure - revenue used to buy/burn tokens
 */
contract SanctumToken is ERC20, ERC20Burnable, Ownable2Step, ERC20Permit {
    
    // Tokenomics
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100M tokens
    uint256 public constant INITIAL_LIQUIDITY = 20_000_000 * 10**18; // 20% for DEX
    uint256 public constant RESEARCH_REWARDS = 50_000_000 * 10**18; // 50% for researchers
    uint256 public constant TEAM_VESTING = 15_000_000 * 10**18; // 15% team (vested)
    uint256 public constant COMMUNITY = 15_000_000 * 10**18; // 15% community/airdrops
    
    // Research rewards tracking
    uint256 public totalResearchRewardsDistributed;
    uint256 public rewardRatePerTest = 10 * 10**18; // 10 tokens per test (adjustable)
    
    // Subscription revenue sharing
    uint256 public totalRevenueCollected;
    uint256 public buybackPercentage = 50; // 50% of revenue buys back tokens
    
    // Authorized research reward distributors
    mapping(address => bool) public isResearchDistributor;
    
    // Researcher stats
    mapping(address => uint256) public researcherTestsCompleted;
    mapping(address => uint256) public researcherTokensEarned;
    
    // Tier staking (stake tokens for tier benefits)
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingStartTime;
    uint256 public constant STAKE_LOCK_PERIOD = 30 days;
    
    // Events
    event ResearchRewarded(address indexed researcher, uint256 amount, string modelId);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RevenueCollected(uint256 amount);
    event TokensBoughtBack(uint256 amount, uint256 tokensBurned);
    event DistributorAdded(address indexed distributor);
    event DistributorRemoved(address indexed distributor);
    event RewardRateUpdated(uint256 newRate);
    event BuybackPercentageUpdated(uint256 newPercentage);
    event MaticWithdrawn(address indexed to, uint256 amount);
    
    /**
     * @notice Restricts function to authorized distributors or owner
     */
    modifier onlyDistributor() {
        require(isResearchDistributor[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    /**
     * @notice Deploys the SanctumToken contract
     * @param _dexLiquidityAddress Address to receive initial liquidity tokens
     */
    constructor(address _dexLiquidityAddress) 
        ERC20("Sanctum", "SANC") 
        ERC20Permit("Sanctum")
        Ownable(msg.sender)
    {
        require(_dexLiquidityAddress != address(0), "Invalid liquidity address");
        
        // Mint initial distribution
        _mint(_dexLiquidityAddress, INITIAL_LIQUIDITY);
        _mint(address(this), RESEARCH_REWARDS + COMMUNITY); // Hold for rewards
        _mint(msg.sender, TEAM_VESTING); // Team tokens (should vest separately)
        
        // Owner is initial distributor
        isResearchDistributor[msg.sender] = true;
    }
    
    /**
     * @notice Reward researcher for completing AI model test
     * @param _researcher Address of the researcher to reward
     * @param _testScore Score from 0-100 determining reward amount
     * @param _modelId ID of the AI model tested
     * @return rewardAmount Amount of tokens rewarded
     */
    function rewardResearcher(
        address _researcher, 
        uint256 _testScore,
        string memory _modelId
    ) external onlyDistributor returns (uint256 rewardAmount) {
        require(_researcher != address(0), "Invalid researcher address");
        require(_testScore <= 100, "Score must be 0-100");
        require(balanceOf(address(this)) >= rewardRatePerTest, "Insufficient reward pool");
        
        // Calculate reward based on test score (0-100)
        // Higher score = more tokens
        rewardAmount = (rewardRatePerTest * _testScore) / 100;
        if (rewardAmount == 0) rewardAmount = rewardRatePerTest / 10; // Minimum reward
        
        // Transfer from contract to researcher
        _transfer(address(this), _researcher, rewardAmount);
        
        // Update stats
        researcherTestsCompleted[_researcher]++;
        researcherTokensEarned[_researcher] += rewardAmount;
        totalResearchRewardsDistributed += rewardAmount;
        
        emit ResearchRewarded(_researcher, rewardAmount, _modelId);
    }
    
    /**
     * @notice Batch reward multiple researchers (gas efficient)
     * @param _researchers Array of researcher addresses
     * @param _scores Array of test scores
     * @param _modelIds Array of model IDs
     */
    function batchRewardResearchers(
        address[] calldata _researchers,
        uint256[] calldata _scores,
        string[] calldata _modelIds
    ) external onlyDistributor {
        require(
            _researchers.length == _scores.length && _scores.length == _modelIds.length,
            "Array length mismatch"
        );
        
        uint256 length = _researchers.length;
        for (uint i = 0; i < length; ) {
            this.rewardResearcher(_researchers[i], _scores[i], _modelIds[i]);
            unchecked { ++i; }
        }
    }
    
    /**
     * @notice Stake tokens to unlock tier benefits
     * @param _amount Amount of tokens to stake
     */
    function stakeTokens(uint256 _amount) external {
        require(_amount != 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), _amount);
        stakedBalance[msg.sender] += _amount;
        stakingStartTime[msg.sender] = block.timestamp;
        
        emit TokensStaked(msg.sender, _amount);
    }
    
    /**
     * @notice Unstake tokens after lock period
     * @param _amount Amount of tokens to unstake
     */
    function unstakeTokens(uint256 _amount) external {
        require(_amount != 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= _amount, "Insufficient staked balance");
        require(
            block.timestamp >= stakingStartTime[msg.sender] + STAKE_LOCK_PERIOD,
            "Stake still locked"
        );
        
        stakedBalance[msg.sender] -= _amount;
        _transfer(address(this), msg.sender, _amount);
        
        emit TokensUnstaked(msg.sender, _amount);
    }
    
    /**
     * @notice Check if user has staked enough for a tier
     * @param _user Address to check
     * @param _tierRequirement Minimum stake required
     * @return bool True if user meets requirement
     */
    function hasStakedForTier(address _user, uint256 _tierRequirement) external view returns (bool) {
        return stakedBalance[_user] >= _tierRequirement;
    }
    
    /**
     * @notice Collect subscription revenue (MATIC/ETH)
     * @dev Part of revenue is used to buy back and burn tokens
     */
    function collectRevenue() external payable onlyOwner {
        require(msg.value != 0, "Must send revenue");
        totalRevenueCollected += msg.value;
        emit RevenueCollected(msg.value);
        
        // Auto-trigger buyback if significant revenue
        if (msg.value >= 1 ether) {
            _executeBuyback(msg.value * buybackPercentage / 100);
        }
    }
    
    /**
     * @dev Execute buyback and burn
     * @param _amount Amount to use for buyback
     */
    function _executeBuyback(uint256 _amount) internal {
        // In production, this would swap MATIC for SANC on DEX
        // For now, we just track it - integrate with QuickSwap on Polygon
        // TODO: Integrate DEX router for actual buyback
        
        emit TokensBoughtBack(_amount, 0);
    }
    
    /**
     * @notice Manual buyback (owner can trigger)
     * @param _amount Amount to use for buyback
     */
    function manualBuyback(uint256 _amount) external onlyOwner {
        _executeBuyback(_amount);
    }
    
    /**
     * @notice Add research reward distributor
     * @param _distributor Address to authorize
     */
    function addDistributor(address _distributor) external onlyOwner {
        require(_distributor != address(0), "Invalid distributor address");
        isResearchDistributor[_distributor] = true;
        emit DistributorAdded(_distributor);
    }
    
    /**
     * @notice Remove research reward distributor
     * @param _distributor Address to deauthorize
     */
    function removeDistributor(address _distributor) external onlyOwner {
        require(_distributor != address(0), "Invalid distributor address");
        isResearchDistributor[_distributor] = false;
        emit DistributorRemoved(_distributor);
    }
    
    /**
     * @notice Update reward rate (owner only)
     * @param _newRate New reward rate per test
     */
    function setRewardRate(uint256 _newRate) external onlyOwner {
        rewardRatePerTest = _newRate;
        emit RewardRateUpdated(_newRate);
    }
    
    /**
     * @notice Update buyback percentage
     * @param _percentage New percentage (0-100)
     */
    function setBuybackPercentage(uint256 _percentage) external onlyOwner {
        require(_percentage <= 100, "Percentage cannot exceed 100");
        buybackPercentage = _percentage;
        emit BuybackPercentageUpdated(_percentage);
    }
    
    /**
     * @notice Get researcher stats
     * @param _researcher Address to query
     * @return testsCompleted Number of tests completed
     * @return tokensEarned Total tokens earned
     * @return stakedAmount Current staked amount
     */
    function getResearcherStats(address _researcher) external view returns (
        uint256 testsCompleted,
        uint256 tokensEarned,
        uint256 stakedAmount
    ) {
        return (
            researcherTestsCompleted[_researcher],
            researcherTokensEarned[_researcher],
            stakedBalance[_researcher]
        );
    }
    
    /**
     * @notice Withdraw MATIC (for revenue distribution or liquidity)
     * @param _amount Amount to withdraw
     */
    function withdrawMatic(uint256 _amount) external onlyOwner {
        require(_amount != 0, "Cannot withdraw 0");
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "Transfer failed");
        emit MaticWithdrawn(owner(), _amount);
    }
    
    /**
     * @notice Receive MATIC for revenue
     */
    receive() external payable {
        require(msg.value != 0, "Must send value");
        totalRevenueCollected += msg.value;
        emit RevenueCollected(msg.value);
    }
}
