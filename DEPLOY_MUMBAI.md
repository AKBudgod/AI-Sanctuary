Quick deploy — Polygon Mumbai

1) Prerequisites
   - Create a `.env` at repo root with:
     - PRIVATE_KEY (deployer private key)
     - MUMBAI_RPC (RPC endpoint, e.g. Alchemy/Infura/MaticVigil)
   - Have test MATIC in your deployer account (faucet)

2) One-line deploy
   - PowerShell: `./scripts/deploy-mumbai.ps1`
   - Or: `npx hardhat run deploy.js --network mumbai`

3) What the script does
   - Deploys `SanctumToken`, `ResearchRewards`, `TierStaking`
   - Adds `ResearchRewards` as a token distributor
   - Funds `ResearchRewards` (10M SANC)
   - Approves and funds `TierStaking.rewardPool` (5M SANC)
   - Saves `deployment-mumbai.json` with addresses

4) Post-deploy manual actions (if needed)
   - Transfer more SANC to a contract: `sanctum.transfer(addr, amount)`
   - Approve + fund staking pool: `sanctum.approve(stakingAddress, amount)` then `tierStaking.fundRewardPool(amount)`
---

Server-side purchase & revenue split (80/20) — how it works
- You chose OFF-CHAIN split: the website/backend accepts payments and the backend distributes funds/token transfers.
- The repository includes:
  - `POST /api/gate/check` — verify a wallet holds enough SANC to unlock AI features
  - `POST /api/purchase/membership` — backend purchase endpoint; when `TREASURY_PRIVATE_KEY` is set it will perform on-chain transfers: 80% → `REWARDS_ADDRESS`, 20% → `OWNER_ADDRESS`.
  - `POST /api/ai/proxy` — AI proxy endpoint that enforces token-gating and forwards requests to OpenAI (requires `OPENAI_API_KEY`).

Environment variables (see `.env.example`): `TREASURY_PRIVATE_KEY`, `TREASURY_ADDRESS`, `OWNER_ADDRESS`, `REWARDS_ADDRESS`, `OPENAI_API_KEY`.

Recommended flow for live site:
1. Accept payment (Stripe/fiat or on-chain) in your backend.
2. Call `/api/purchase/membership` to record the purchase and (optionally) transfer SANC from a funded treasury wallet to the `ResearchRewards` funding address (80%) and to your owner wallet (20%).
3. Use `/api/gate/check` to token-gate AI endpoints for users.
5) Run verification (optional)
   - `npx hardhat verify --network mumbai <contractAddress> "<constructorArgs...>"`
