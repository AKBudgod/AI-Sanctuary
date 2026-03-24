const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ResearchRewards (unit)', function () {
    let SanctumToken, ResearchRewards;
    let sanctum, rewards;
    let owner, researcher1, researcher2, other;

    beforeEach(async function () {
        [owner, researcher1, researcher2, other] = await ethers.getSigners();

        const SanctumFactory = await ethers.getContractFactory('SanctumToken');
        sanctum = await SanctumFactory.connect(owner).deploy(owner.address);
        await sanctum.waitForDeployment();

        const RewardsFactory = await ethers.getContractFactory('ResearchRewards');
        rewards = await RewardsFactory.connect(owner).deploy(sanctum.getAddress());
        await rewards.waitForDeployment();

        // Fund ResearchRewards so it can pay out rewards
        await (await sanctum.connect(owner).transfer(await rewards.getAddress(), ethers.parseEther('1000'))).wait();
    });

    it('records pending submissions and batch verifies with correct payouts', async function () {
        // Submit two entries from different researchers (cooldown irrelevant)
        await (await rewards.connect(researcher1).submitResearch('model-A', 'QmA', 0)).wait();
        await (await rewards.connect(researcher2).submitResearch('model-B', 'QmB', 0)).wait();

        expect(await rewards.getPendingCount()).to.equal(2);

        // Batch verify both submissions (owner is default verifier)
        await (await rewards.connect(owner).batchVerify([0, 1], [60, 55], [true, true])).wait();

        expect(await rewards.getPendingCount()).to.equal(0);

        // Calculate expected rewards for SubmissionType.ModelTest (multiplier = 100)
        // baseReward = 10 SANC -> reward = 10 * (100 + score) / 100
        const r1 = ethers.parseEther('16.0'); // 10 * 1.6
        const r2 = ethers.parseEther('15.5'); // 10 * 1.55

        expect(await sanctum.balanceOf(researcher1.address)).to.equal(r1);
        expect(await sanctum.balanceOf(researcher2.address)).to.equal(r2);
    });

    it('getResearcherSubmissions returns created IDs', async function () {
        await (await rewards.connect(researcher1).submitResearch('m1', 'Qm1', 0)).wait();
        const ids = await rewards.getResearcherSubmissions(researcher1.address);
        expect(ids.length).to.equal(1);
        expect(ids[0]).to.equal(0);
    });

    it('verifySubmission sets rewardAmount and marks paid when approved', async function () {
        await (await rewards.connect(researcher1).submitResearch('m2', 'Qm2', 0)).wait();

        // single verify (owner)
        await (await rewards.connect(owner).verifySubmission(0, 80, true)).wait();

        const sub = await rewards.getSubmission(0);
        // rewardAmount for score 80 on ModelTest: 10 * (1 + 0.8) = 18
        expect(sub.rewardAmount).to.equal(ethers.parseEther('18.0'));
        expect(sub.verified).to.equal(true);
        expect(sub.paid).to.equal(true);

        // researcher balance should reflect payment
        expect(await sanctum.balanceOf(researcher1.address)).to.equal(ethers.parseEther('18.0'));
    });
});
