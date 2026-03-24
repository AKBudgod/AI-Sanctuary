// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISanctumToken is IERC20 {
    // Additional custom functions can be added here if needed
}

/**
 * @title TierStaking
 * @author AI Sanctuary
 * @notice Stake SANC tokens to unlock platform tiers
 * @dev No lock period - instant unstake, but rewards are time-weighted
 */
contract TierStaking is Ownable2Step, ReentrancyGuard {
    
    ISanctumToken public sanctumToken;
    
    /// @notice Tier requirements structure
    struct Tier {
        string name;
        uint256 minStake;
        uint256 dailyRewardRate; // Rewards per day per token staked (in basis points)
        bool active;
    }
    
    /// @notice Tier levels mapping
    mapping(uint256 => Tier) public tiers;
    
    /// @notice Number of tiers
    uint256 public tierCount;
    
    /// @notice User staking info structure
    struct StakeInfo {
        uint256 amount;
        uint256 tierLevel;
        uint256 lastClaimTime;
        uint256 totalClaimed;
        uint256 stakeStartTime;
    }
    
    /// @notice Mapping of user stakes
    mapping(address => StakeInfo) public stakes;
    
    /// @notice Total tokens staked
    uint256 public totalStaked;
    
    /// @notice Reward pool balance
    uint256 public rewardPool;
    
    /// @notice Platform revenue share percentage (30% to stakers)
    uint256 public revenueSharePercent = 30;
    
    /// @notice Maximum daily reward rate (1000 = 10%)
    uint256 public constant MAX_DAILY_REWARD_RATE = 1000;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 tier);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event TierAdded(uint256 indexed tierId, string name, uint256 minStake);
    event TierUpdated(uint256 indexed tierId, string name, uint256 minStake);
    event RewardPoolFunded(address indexed funder, uint256 amount);
    event RevenueShareUpdated(uint256 newPercentage);
    event EmergencyWithdraw(address indexed to, uint256 amount);
    event RevenueCollected(uint256 amount);
    
    /**
     * @notice Deploys the TierStaking contract
     * @param _tokenAddress Address of the SanctumToken contract
     */
    constructor(address _tokenAddress) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Invalid token address");
        sanctumToken = ISanctumToken(_tokenAddress);
        
        // Initialize default tiers
        tiers[0] = Tier("Explorer", 0, 0, true);
        tiers[1] = Tier("Researcher", 100 * 10**18, 5, true);
        tiers[2] = Tier("Analyst", 1000 * 10**18, 10, true);
        tiers[3] = Tier("Institutional", 10000 * 10**18, 15, true);
        tiers[4] = Tier("Verified", 100000 * 10**18, 25, true);
        tierCount = 5;
    }
    
    /**
     * @notice Stake tokens and automatically assign tier
     * @param _amount Amount of tokens to stake
     */
    function stake(uint256 _amount) external nonReentrant {
        require(_amount != 0, "Cannot stake 0");
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        // If already staking, claim pending rewards first
        if (userStake.amount != 0) {
            _claimRewards(msg.sender);
        } else {
            userStake.lastClaimTime = block.timestamp;
            userStake.stakeStartTime = block.timestamp;
        }
        
        // Transfer tokens from user
        require(sanctumToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        userStake.amount = userStake.amount + _amount;
        totalStaked = totalStaked + _amount;
        
        // Determine tier based on stake amount
        uint256 newTier = _calculateTier(userStake.amount);
        userStake.tierLevel = newTier;
        
        emit Staked(msg.sender, _amount, newTier);
    }
    
    /**
     * @notice Unstake all tokens (instant, no lock)
     */
    function unstake() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount != 0, "No stake to unstake");
        
        // Claim any pending rewards first
        _claimRewards(msg.sender);
        
        uint256 amount = userStake.amount;
        userStake.amount = 0;
        userStake.tierLevel = 0;
        totalStaked = totalStaked - amount;
        
        // Return tokens to user
        require(sanctumToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @notice Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }
    
    /**
     * @dev Internal claim function
     * @param _user Address to claim rewards for
     */
    function _claimRewards(address _user) internal {
        StakeInfo storage userStake = stakes[_user];
        require(userStake.amount != 0, "No stake");
        
        uint256 pending = calculatePendingRewards(_user);
        require(pending != 0, "No rewards to claim");
        require(pending <= rewardPool, "Insufficient reward pool");
        
        userStake.lastClaimTime = block.timestamp;
        userStake.totalClaimed = userStake.totalClaimed + pending;
        rewardPool = rewardPool - pending;
        
        require(sanctumToken.transfer(_user, pending), "Transfer failed");
        
        emit RewardsClaimed(_user, pending);
    }
    
    /**
     * @notice Calculate pending rewards for a user
     * @param _user Address to calculate for
     * @return Pending reward amount
     */
    function calculatePendingRewards(address _user) public view returns (uint256) {
        StakeInfo storage userStake = stakes[_user];
        if (userStake.amount == 0) return 0;
        
        Tier memory tier = tiers[userStake.tierLevel];
        if (!tier.active || tier.dailyRewardRate == 0) return 0;
        
        uint256 timeStaked = block.timestamp - userStake.lastClaimTime;
        uint256 daysStaked = timeStaked / 1 days;
        
        // Calculate: amount * dailyRate * days / 10000 (basis points)
        return (userStake.amount * tier.dailyRewardRate * daysStaked) / 10000;
    }
    
    /**
     * @dev Calculate tier based on stake amount
     * @param _amount Stake amount
     * @return Highest tier level achieved
     */
    function _calculateTier(uint256 _amount) internal view returns (uint256) {
        uint256 highestTier = 0;
        uint256 count = tierCount;
        for (uint256 i = 0; i < count; ) {
            if (tiers[i].active && _amount >= tiers[i].minStake) {
                highestTier = i;
            }
            unchecked { ++i; }
        }
        return highestTier;
    }
    
    /**
     * @notice Get user's current tier info
     * @param _user Address to query
     * @return tierLevel Current tier level
     * @return tierName Tier name
     * @return stakedAmount Amount staked
     * @return pendingRewards Pending rewards
     */
    function getUserTier(address _user) external view returns (
        uint256 tierLevel,
        string memory tierName,
        uint256 stakedAmount,
        uint256 pendingRewards
    ) {
        StakeInfo storage userStake = stakes[_user];
        tierLevel = userStake.tierLevel;
        tierName = tiers[tierLevel].name;
        stakedAmount = userStake.amount;
        pendingRewards = calculatePendingRewards(_user);
    }
    
    /**
     * @notice Check if user meets tier requirement
     * @param _user Address to check
     * @param _tierLevel Required tier level
     * @return True if user meets requirement
     */
    function hasTier(address _user, uint256 _tierLevel) external view returns (bool) {
        return stakes[_user].tierLevel >= _tierLevel;
    }
    
    /**
     * @notice Add or update a tier
     * @param _tierId Tier ID
     * @param _name Tier name
     * @param _minStake Minimum stake required
     * @param _dailyRewardRate Daily reward rate in basis points (max 1000 = 10%)
     * @param _active Whether tier is active
     */
    function setTier(
        uint256 _tierId,
        string memory _name,
        uint256 _minStake,
        uint256 _dailyRewardRate,
        bool _active
    ) external onlyOwner {
        require(bytes(_name).length != 0, "Name cannot be empty");
        require(_dailyRewardRate <= MAX_DAILY_REWARD_RATE, "Reward rate too high");
        
        tiers[_tierId] = Tier(_name, _minStake, _dailyRewardRate, _active);
        if (_tierId >= tierCount) {
            tierCount = _tierId + 1;
        }
        emit TierUpdated(_tierId, _name, _minStake);
    }
    
    /**
     * @notice Fund reward pool (from subscription revenue)
     * @param _amount Amount to add to reward pool
     */
    function fundRewardPool(uint256 _amount) external nonReentrant {
        require(_amount != 0, "Cannot fund 0");
        
        uint256 balanceBefore = sanctumToken.balanceOf(address(this));
        require(sanctumToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        uint256 balanceAfter = sanctumToken.balanceOf(address(this));
        uint256 actualAmount = balanceAfter - balanceBefore;
        
        rewardPool = rewardPool + actualAmount;
        emit RewardPoolFunded(msg.sender, actualAmount);
    }
    
    /**
     * @notice Collect subscription revenue (MATIC)
     * @dev Part goes to reward pool - only owner can call
     */
    function collectRevenue() external payable onlyOwner {
        require(msg.value != 0, "Must send revenue");
        emit RevenueCollected(msg.value);
        // In production, swap MATIC for SANC and add to rewardPool
    }
    
    /**
     * @notice Update revenue share percentage
     * @param _percentage New percentage (0-100)
     */
    function setRevenueShare(uint256 _percentage) external onlyOwner {
        require(_percentage <= 100, "Cannot exceed 100%");
        revenueSharePercent = _percentage;
        emit RevenueShareUpdated(_percentage);
    }
    
    /**
     * @notice Get all tier info
     * @return Array of all tiers
     */
    function getAllTiers() external view returns (Tier[] memory) {
        Tier[] memory allTiers = new Tier[](tierCount);
        for (uint256 i = 0; i < tierCount; ) {
            allTiers[i] = tiers[i];
            unchecked { ++i; }
        }
        return allTiers;
    }
    
    /**
     * @notice Emergency withdraw (owner only)
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount != 0, "Cannot withdraw 0");
        require(sanctumToken.transfer(owner(), _amount), "Transfer failed");
        emit EmergencyWithdraw(owner(), _amount);
    }
    
    /**
     * @notice Get staking stats
     * @return _totalStaked Total staked amount
     * @return _rewardPool Current reward pool
     * @return _activeStakers Active stakers count (not tracked)
     */
    function getStats() external view returns (
        uint256 _totalStaked,
        uint256 _rewardPool,
        uint256 _activeStakers
    ) {
        return (totalStaked, rewardPool, 0);
    }
}
