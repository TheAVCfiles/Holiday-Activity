# Gasless Patterns & Treasury Management Guide

Comprehensive guide for implementing zero-gas user experiences while maintaining blockchain security and transparency.

## Overview

This guide covers practical approaches to eliminate user-facing gas costs for the StagePort/PayGait token ecosystem, including implementation patterns, cost analysis, and treasury management strategies.

## Table of Contents

1. [Gasless UX Approaches](#gasless-ux-approaches)
2. [Implementation Patterns](#implementation-patterns)
3. [Cost Analysis](#cost-analysis)
4. [Treasury Management](#treasury-management)
5. [Security Considerations](#security-considerations)
6. [Recommended Launch Path](#recommended-launch-path)

---

## Gasless UX Approaches

### Approach 1: Off-Chain Ledger with Periodic Settlement

**Concept**: Maintain token balances in a database, periodically anchor state on-chain.

**How It Works**:
```
User Actions → Database Update → Daily/Weekly Merkle Root → On-Chain Anchor
                                                          ↓
                                              User can prove ownership
```

**Pros**:
- ✅ Zero gas for 99% of operations
- ✅ Instant transactions
- ✅ Easy to implement
- ✅ Can undo mistakes before settlement
- ✅ Lowest infrastructure cost

**Cons**:
- ❌ Centralized (requires trust in platform)
- ❌ Not immediately on-chain verifiable
- ❌ Platform becomes custodian

**Best For**: 
- Early pilot (100-1000 users)
- SentientCents internal token
- Custodial rewards systems

**Implementation Checklist**:
```javascript
// Database schema
CREATE TABLE balances (
  user_address VARCHAR(42) PRIMARY KEY,
  stagecoin_balance DECIMAL(78,18),
  scent_balance DECIMAL(78,2),
  last_updated TIMESTAMP,
  nonce INT
);

CREATE TABLE transactions (
  tx_id UUID PRIMARY KEY,
  from_address VARCHAR(42),
  to_address VARCHAR(42),
  amount DECIMAL(78,18),
  token_type VARCHAR(20),
  timestamp TIMESTAMP,
  merkle_root VARCHAR(66),
  on_chain_settled BOOLEAN DEFAULT FALSE
);

// Generate daily Merkle root
function generateMerkleRoot(balances) {
  const leaves = balances.map(b => 
    ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'uint256'],
      [b.address, b.stagecoin, b.scent]
    )
  );
  return new MerkleTree(leaves, keccak256).getRoot();
}

// Anchor on-chain (daily job)
const root = generateMerkleRoot(allBalances);
await anchorContract.submitRoot(root, timestamp);
```

### Approach 2: Meta-Transactions with Relayer

**Concept**: Users sign transactions off-chain, relayer submits and pays gas.

**How It Works**:
```
User Signs EIP-712 Message → Relayer Validates → Submits On-Chain → Pays Gas
                                                                    ↓
                                            Optionally charge user in SCENT
```

**Pros**:
- ✅ True on-chain settlement
- ✅ Gasless for users
- ✅ Provable and transparent
- ✅ No custody required

**Cons**:
- ❌ Platform pays gas for all operations
- ❌ More complex infrastructure
- ❌ Relayer can be a bottleneck
- ❌ Need spam protection

**Best For**:
- Production systems (after pilot)
- When on-chain transparency is critical
- Regulatory-friendly approach

**EIP-712 Message Format**:
```javascript
const domain = {
  name: 'Stagecoin',
  version: '1',
  chainId: await ethers.provider.getNetwork().chainId,
  verifyingContract: stagecoinAddress
};

const types = {
  Transfer: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
};

// User signs
const signature = await signer.signTypedData(domain, types, message);

// Relayer submits
await stagecoin.executeMetaTransfer(message, signature);
```

### Approach 3: Account Abstraction (ERC-4337)

**Concept**: Smart contract wallets with paymaster sponsoring gas.

**How It Works**:
```
User Creates UserOperation → Bundler Collects → Paymaster Validates → Executes
                                                                      ↓
                                              Check SCENT balance & pay
```

**Pros**:
- ✅ Industry standard (ERC-4337)
- ✅ Many existing tools/libraries
- ✅ Flexible payment options
- ✅ Can charge in any token

**Cons**:
- ❌ Complex to implement
- ❌ Higher gas overhead per tx
- ❌ Not all chains support well
- ❌ User needs smart wallet

**Best For**:
- Mature products with volume
- When you want to charge gas in SCENT
- Multi-chain applications

**Paymaster Example**:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/core/BasePaymaster.sol";

contract ScentPaymaster is BasePaymaster {
    ISentientCents public scentToken;
    uint256 public scentPerGas = 1e12; // 1 SCENT per 1e12 gas
    
    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) internal override returns (bytes memory context, uint256 validationData) {
        // Calculate SCENT cost
        uint256 scentCost = (maxCost / 1e9) * scentPerGas;
        
        // Check user has enough SCENT
        address sender = userOp.sender;
        require(scentToken.balanceOf(sender) >= scentCost, "Insufficient SCENT");
        
        return ("", 0);
    }
    
    function _postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) internal override {
        // Charge user in SCENT
        uint256 scentCost = (actualGasCost / 1e9) * scentPerGas;
        scentToken.burn(tx.origin, scentCost);
    }
}
```

### Approach 4: Subsidized L2 Deployment

**Concept**: Deploy on ultra-low-cost L2, subsidize the small gas fees.

**How It Works**:
- Deploy to Base, Arbitrum, or Polygon zkEVM
- Transactions cost $0.01-0.05
- Platform gives users small ETH airdrops ($5 worth)
- Users can transact hundreds of times

**Pros**:
- ✅ Simple: no custom infrastructure
- ✅ True decentralization
- ✅ Users can self-custody
- ✅ Low platform cost

**Cons**:
- ❌ Users still see gas (even if tiny)
- ❌ Need to manage ETH airdrops
- ❌ Can't truly claim "gasless"

**Cost Example**:
- Base L2 transfer: ~$0.02
- $5 airdrop = 250 transactions
- For 1000 users = $5000 subsidy (one-time)

---

## Implementation Patterns

### Pattern 1: Custodial SCENT + Batched Stagecoin

**Architecture**:
```
SentientCents:
  - Database ledger (off-chain)
  - Instant updates
  - Redeem to on-chain via batch settlement

Stagecoin:
  - Deploy on Base L2
  - Batch mint every 24h for all earned rewards
  - Public, verifiable balances
```

**Code Example**:
```javascript
// Backend: Process recreation approval
async function approveRecreation(recreationId, recreatorAddr, creatorAddr) {
  // Credit SCENT to database (instant)
  await db.creditSCENT(creatorAddr, 100); // 1.00 SCENT
  
  // Queue Stagecoin mint for batch
  await db.queueStagecoinMint(recreatorAddr, ethers.parseEther("10"));
  
  // Return success immediately
  return { success: true, scent: 100, stagecoin: "10" };
}

// Cron job: Batch mint Stagecoin daily
async function batchMintStagecoin() {
  const pending = await db.getPendingStagecoins();
  
  // Group by address
  const grouped = {};
  pending.forEach(p => {
    grouped[p.address] = (grouped[p.address] || 0n) + p.amount;
  });
  
  // Mint all at once
  for (const [address, amount] of Object.entries(grouped)) {
    await stagecoin.mint(address, amount);
    console.log(`Minted ${ethers.formatEther(amount)} SC to ${address}`);
  }
  
  // Mark as settled
  await db.markSettled(pending.map(p => p.id));
}
```

### Pattern 2: Relayer with SCENT Payment

**Architecture**:
```javascript
// Relayer service
const express = require('express');
const app = express();

app.post('/relay', async (req, res) => {
  const { signature, message, userAddress } = req.body;
  
  // Verify signature
  const recovered = ethers.verifyTypedData(domain, types, message, signature);
  if (recovered !== userAddress) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  // Check user has SCENT balance (off-chain)
  const scentBalance = await db.getScentBalance(userAddress);
  const gasCost = estimateGas(message);
  const scentCost = gasCost * SCENT_PER_GAS;
  
  if (scentBalance < scentCost) {
    return res.status(402).json({ error: 'Insufficient SCENT' });
  }
  
  // Submit transaction
  const tx = await stagecoin.executeMetaTransfer(message, signature);
  await tx.wait();
  
  // Deduct SCENT
  await db.deductSCENT(userAddress, scentCost);
  
  res.json({ success: true, txHash: tx.hash });
});

app.listen(3000);
```

### Pattern 3: Time-Decay Anti-Hoarding

**Implementation**:
```javascript
// Database schema addition
ALTER TABLE balances ADD COLUMN last_activity TIMESTAMP;

// Calculate decay (run in epoch job)
async function applyDecay() {
  const DECAY_RATE = 0.05; // 5% per month for inactive
  const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  
  const users = await db.getAllUsers();
  
  for (const user of users) {
    const monthsSinceActivity = 
      (Date.now() - user.last_activity) / MONTH_MS;
    
    if (monthsSinceActivity >= 1) {
      // Apply decay
      const decayFactor = Math.pow(1 - DECAY_RATE, monthsSinceActivity);
      const newBalance = user.scent_balance * decayFactor;
      
      await db.updateBalance(user.address, {
        scent_balance: newBalance,
        decay_applied: user.scent_balance - newBalance
      });
      
      console.log(
        `Decayed ${user.address}: ${user.scent_balance} → ${newBalance}`
      );
    }
  }
}

// Exempt active users
async function recordActivity(userAddress) {
  await db.query(
    'UPDATE balances SET last_activity = NOW() WHERE user_address = ?',
    [userAddress]
  );
}
```

---

## Cost Analysis

### Off-Chain Ledger Costs

| Operation | Cost | Annual (10K users) |
|-----------|------|-------------------|
| Database ops | ~$0.0001 | $1,000 |
| Server hosting | $50/mo | $600 |
| Daily on-chain anchor | $2/day | $730 |
| **Total** | | **~$2,330/year** |

### Relayer Costs (L2)

| Chain | Gas/Tx | Cost/Tx | 1M Tx/Year |
|-------|--------|---------|------------|
| Base | 100K | $0.01 | $10,000 |
| Arbitrum | 120K | $0.015 | $15,000 |
| Ethereum | 100K | $2.00 | $2,000,000 |

**Mitigation**: Charge users in SCENT, convert to ETH.

### Subsidized L2 Costs

| Users | Airdrop/User | Total One-Time | Ongoing |
|-------|--------------|----------------|---------|
| 1,000 | $5 | $5,000 | $0 |
| 10,000 | $5 | $50,000 | $0 |
| 100,000 | $2 | $200,000 | $0 |

---

## Treasury Management

### Revenue Sources

1. **SCENT Pre-Sale**: Artists buy SCENT with USD/USDC
2. **Platform Fees**: Transaction fees collected in SCENT
3. **Stagecoin Issuance**: Controlled inflation (value to treasury)
4. **Royalty Fees**: % of transfers (if enabled)

### Treasury Allocation

```javascript
// Example policy
const TREASURY_POLICY = {
  // Revenue allocation
  relayerReserve: 0.30,    // 30% to buy ETH for gas
  development: 0.20,        // 20% to development
  marketing: 0.15,          // 15% to user acquisition
  reserves: 0.25,           // 25% cash reserves
  teamRewards: 0.10,        // 10% team incentives
  
  // Spending rules
  maxGasSubsidy: ethers.parseEther("0.5"), // Max 0.5 ETH/day
  scentEthRatio: 1000,      // 1000 SCENT = 1 ETH worth of gas
};

// Automated treasury management
async function manageTreasury() {
  const revenue = await calculateMonthlyRevenue();
  const ethNeeded = await estimateMonthlyGasNeeds();
  
  // Convert SCENT to ETH if needed
  if (treasury.eth < ethNeeded) {
    const scentToSell = ethNeeded * POLICY.scentEthRatio;
    await swapScentForEth(scentToSell);
  }
  
  // Allocate remaining
  await allocateRevenue(revenue, TREASURY_POLICY);
}
```

### SCENT → ETH Conversion

**Option 1: DEX Liquidity Pool**
```javascript
// After sufficient liquidity
const pool = await uniswap.createPool(SCENT, WETH, fee);
await pool.addLiquidity(scentAmount, ethAmount);

// Treasury swaps as needed
await pool.swap(scentAmount, ethAmount);
```

**Option 2: OTC Deals**
```javascript
// Early stage: manual OTC with investors
// Platform offers: 1000 SCENT for 0.1 ETH
// Investor gets discount, platform gets ETH for operations
```

**Option 3: Buyback Program**
```javascript
// Platform commits to buy back SCENT at floor price
const FLOOR_PRICE = ethers.parseEther("0.0001"); // per SCENT

async function buybackSCENT(user, amount) {
  const ethToSend = amount * FLOOR_PRICE;
  await user.transfer(ethToSend);
  await db.deductSCENT(user, amount);
}
```

---

## Security Considerations

### Custodial Security

**If you hold user funds**:

1. ✅ **Cold/Hot Wallet Split**: 90% cold, 10% hot for operations
2. ✅ **Multi-sig for Cold**: Require 3/5 signatures for withdrawals
3. ✅ **Regular Audits**: Reconcile database vs. actual holdings
4. ✅ **Insurance**: Consider custodial insurance
5. ✅ **Transparent Reserves**: Publish proof of reserves

### Relayer Security

**Protect relayer from abuse**:

```javascript
// Rate limiting
const RATE_LIMITS = {
  perUser: 100,      // 100 tx/day
  perIP: 1000,       // 1000 tx/day per IP
  globalMax: 10000   // 10K tx/day total
};

// Signature replay protection
const usedNonces = new Set();
function validateNonce(userAddress, nonce) {
  const key = `${userAddress}:${nonce}`;
  if (usedNonces.has(key)) throw new Error('Nonce reused');
  usedNonces.add(key);
}

// Deadline enforcement
function validateDeadline(deadline) {
  if (Date.now() / 1000 > deadline) {
    throw new Error('Signature expired');
  }
}
```

### Treasury Security

**Multi-sig contract for treasury**:

```solidity
// Use Gnosis Safe or similar
// Example: 3/5 multisig
// Signers: 2 founders + 1 advisor + 2 community members
```

---

## Recommended Launch Path

### Phase 0: MVP (Month 1-2)

**Goal**: Validate concept with 50-100 alpha users

**Architecture**:
- ✅ Custodial SCENT (database only)
- ✅ Stagecoin testnet (Base Sepolia)
- ✅ Manual admin approvals
- ✅ No real money

**Deliverables**:
- Working PayGait integration
- 100 recreations stamped
- User feedback collected

**Cost**: $0 (testnet, internal)

### Phase 1: Pilot (Month 3-4)

**Goal**: Scale to 1000 users, validate economics

**Architecture**:
- ✅ Custodial SCENT with redemption
- ✅ Stagecoin mainnet (Base L2)
- ✅ Automated oracle/minting
- ✅ Allow SCENT purchase ($1-100)

**Deliverables**:
- $10K-50K SCENT sold
- 1000 active users
- 10K+ recreations
- Royalty payouts working

**Cost**: $5K-10K (subsidies + infrastructure)

### Phase 2: Growth (Month 5-8)

**Goal**: Scale to 10K users, add gasless UX

**Architecture**:
- ✅ Relayer with EIP-712 meta-tx
- ✅ SCENT pays for gas
- ✅ Daily Merkle anchoring
- ✅ Mobile app integration

**Deliverables**:
- 10K active users
- $100K+ SCENT in circulation
- Treasury self-sustaining
- First DEX liquidity pool

**Cost**: $20K-50K (relayer ops, marketing)

### Phase 3: Scale (Month 9+)

**Goal**: 100K+ users, full decentralization

**Architecture**:
- ✅ ERC-4337 account abstraction
- ✅ On-chain SCENT (convertible)
- ✅ DAO governance
- ✅ Multi-chain support

**Deliverables**:
- 100K+ users
- $1M+ locked value
- Community-governed
- Profitable operations

**Cost**: Revenue-funded

---

## Quick Decision Matrix

| Scenario | Recommended Pattern | Why |
|----------|-------------------|-----|
| Just starting | Off-chain ledger | Fastest, cheapest, iterate quickly |
| 1K users, stable | Relayer + L2 | Proven, on-chain, manageable cost |
| 10K+ users | Account abstraction | Scales, standard, can charge users |
| Low budget | Subsidized L2 | One-time cost, decentralized |
| High volume | Off-chain + batch | Only way to handle massive scale |

---

## Next Steps

1. **Choose Pattern**: Based on your stage and resources
2. **Deploy Testnet**: Base Sepolia recommended
3. **Build Relayer** (if needed): See Pattern 2 example
4. **Set Up Treasury**: Multi-sig + conversion strategy
5. **Document Policies**: Redemption, fees, decay rules
6. **Launch Pilot**: 50-100 users, iterate

---

## Additional Resources

- [ERC-4337 Docs](https://eips.ethereum.org/EIPS/eip-4337)
- [EIP-712 Typed Data](https://eips.ethereum.org/EIPS/eip-712)
- [Base Documentation](https://docs.base.org/)
- [Merkle Tree Libraries](https://github.com/miguelmota/merkletreejs)
- [Gnosis Safe](https://safe.global/)

---

**Questions?** Open an issue in the repo or start a discussion.

**Ready to implement?** Start with Phase 0 and work your way up!
