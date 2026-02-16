# StagePort Token Contracts

Production-ready ERC-20 token contracts for the StagePort/PayGait ecosystem featuring:
- **Stagecoin (SC)**: Visible reputation and reward token (18 decimals)
- **SentientCents (SCENT)**: Internal royalty and utility token (2 decimals)

Both tokens include:
- Role-based access control (Minter, Burner, Royalty Admin)
- Optional on-transfer royalty mechanism
- Production-hardened security patterns
- OpenZeppelin battle-tested base contracts

## Table of Contents

- [Quick Start](#quick-start)
- [Contract Overview](#contract-overview)
- [Deployment](#deployment)
- [Roles & Permissions](#roles--permissions)
- [Royalty Mechanism](#royalty-mechanism)
- [Gas Optimization Strategies](#gas-optimization-strategies)
- [Network Options](#network-options)
- [Security Considerations](#security-considerations)
- [Architecture Patterns](#architecture-patterns)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your private key and RPC URLs

# Compile contracts (requires network access to download Solidity compiler)
npx hardhat compile

# Run deployment on local network
npx hardhat run scripts/deploy.js

# Deploy to testnet (e.g., Base Sepolia)
npx hardhat run scripts/deploy.js --network baseTestnet
```

## Contract Overview

### Stagecoin.sol

**Purpose**: Visible, public reputation token for rewarding recreators/artists who engage with the platform.

**Key Features**:
- Standard ERC-20 (18 decimals)
- AccessControl for minting/burning/royalty management
- Optional on-transfer royalty (deducted from sender)
- Event emission for royalty configuration changes

**Use Cases**:
- Reward users for approved recreations
- Public reputation metric
- Community voting power
- Staking for platform benefits

### SentientCents.sol

**Purpose**: Internal royalty and utility token for creators and platform economics.

**Key Features**:
- ERC-20 with 2 decimals (cent-like precision)
- Same security and role patterns as Stagecoin
- Optimized for micro-royalty tracking
- Can be custodial or on-chain

**Use Cases**:
- Royalty pool for original creators
- Platform fee payments
- Gas-less transaction credits
- Investment vehicle for early adopters

## Deployment

### Local Testing

```bash
npx hardhat run scripts/deploy.js
```

This will:
1. Deploy both tokens to local Hardhat network
2. Grant admin roles to deployer
3. Mint example tokens for testing

### Testnet Deployment

```bash
# Base Sepolia (recommended for low-cost testing)
npx hardhat run scripts/deploy.js --network baseTestnet

# Arbitrum Sepolia
npx hardhat run scripts/deploy.js --network arbitrumTestnet

# Ethereum Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet Deployment

**⚠️ IMPORTANT**: For production deployments:

1. Use a hardware wallet or secure key management
2. Consider using a multi-sig (Gnosis Safe) as admin
3. Thoroughly test on testnet first
4. Start with royalty disabled (0 bps) and enable gradually
5. Have contracts audited before significant value

```bash
# Example: Base mainnet
npx hardhat run scripts/deploy.js --network base
```

## Roles & Permissions

Both contracts implement OpenZeppelin's AccessControl:

### DEFAULT_ADMIN_ROLE
- Can grant/revoke all other roles
- **Production**: Use a multi-sig wallet
- **Pilot**: Can be single operator account

### MINTER_ROLE
- Can mint new tokens
- **Typical holder**: Oracle/backend service that approves recreations
- **Security**: Should be a secure backend service, not exposed

### BURNER_ROLE  
- Can burn tokens from any address
- **Use cases**: Penalty enforcement, token sinks, redemptions
- **Security**: Use sparingly, clearly document burn policies

### ROYALTY_ADMIN_ROLE
- Can update royalty recipient and basis points
- **Production**: Should be governance or trusted multi-sig
- **Allows**: Dynamic adjustment of platform economics

### Role Management Example

```javascript
// Grant minter role to oracle service
await stagecoin.grantRole(MINTER_ROLE, oracleAddress);

// Revoke burner role
await stagecoin.revokeRole(BURNER_ROLE, oldBurnerAddress);

// Check if address has role
const isMinter = await stagecoin.hasRole(MINTER_ROLE, address);
```

## Royalty Mechanism

### How It Works

When enabled (royaltyBasisPoints > 0):
1. On every transfer, calculate fee: `fee = amount * royaltyBasisPoints / 10000`
2. Transfer `fee` to `royaltyRecipient`
3. Transfer `amount - fee` to intended recipient

### Configuration

```javascript
// Set royalty to 2.5% (250 basis points)
await stagecoin.setRoyaltyBasisPoints(250);

// Set royalty recipient (treasury/fee splitter)
await stagecoin.setRoyaltyRecipient(treasuryAddress);

// Disable royalty
await stagecoin.setRoyaltyBasisPoints(0);
```

### Edge Cases Handled

- ✓ Transfers from/to royaltyRecipient don't incur fees (prevents loops)
- ✓ If fee calculates to 0 (very small transfers), no double-transfer
- ✓ Minting/burning operations don't incur royalty
- ✓ Maximum royalty is capped at 100% (10000 basis points)

### Gas Cost Considerations

On-transfer royalty **doubles the storage writes** per transfer:
- Normal transfer: 1 `_update` call
- With royalty: 2 `_update` calls (fee + net amount)

**Typical gas increase**: ~40,000 additional gas per transfer with royalty

**Alternatives** (see [Gas Optimization](#gas-optimization-strategies)):
- Fee-on-mint (lower runtime cost)
- Off-chain accounting with periodic settlement
- Custodial model with gasless UX

## Gas Optimization Strategies

### Strategy 1: Fee-on-Mint (Recommended for Pilot)

Collect royalty when tokens are **minted** instead of transferred:

**Pros**: 
- No additional gas on transfers
- Simpler user experience
- Revenue tied to new token creation

**Implementation**: Deploy with `royaltyBasisPoints = 0`, implement custom mint function that splits at mint time.

### Strategy 2: Off-Chain Ledger + Periodic Settlement

Keep balances in database, settle on-chain periodically:

**Pros**:
- Near-zero per-user cost
- Fast operations
- Can offer "gasless" UX

**Cons**:
- Requires trusted operator
- More complex infrastructure

**Best for**: Early pilot, custodial SentientCents

### Strategy 3: Account Abstraction (ERC-4337)

Use paymasters to subsidize gas, charge users in SCENT:

**Pros**:
- True gasless UX for users
- Platform pays gas
- Can charge in custom tokens

**Requires**: Paymaster contract, relayer infrastructure

### Strategy 4: Layer 2 Deployment

Deploy on low-cost L2s:

**Chains** (cheapest to most expensive):
1. **Base** - Very low fees, Coinbase ecosystem
2. **Arbitrum** - Mature, low cost, strong tooling  
3. **Optimism** - Similar to Arbitrum
4. **Polygon zkEVM** - Very fast finality

**Typical cost per transaction**: $0.01 - $0.05 (vs $1-$10 on Ethereum mainnet)

### Recommended Approach for Launch

**Phase 1 (Pilot)**: 
- Custodial SentientCents (database)
- Stagecoin on Base testnet with fee-on-mint
- 100-1000 users

**Phase 2 (Growth)**:
- Deploy to Base mainnet
- Implement relayer/paymaster for gasless UX
- SentientCents convertible on-chain via batch settlement

**Phase 3 (Scale)**:
- Full on-chain with optimized batching
- Liquidity pools for token trading
- DAO governance for parameters

## Network Options

All networks configured in `hardhat.config.js`:

| Network | Type | Cost | Best For |
|---------|------|------|----------|
| Hardhat | Local | Free | Development |
| Sepolia | Testnet | Free (faucet) | Ethereum testing |
| Base Sepolia | Testnet | Free | Base testing |
| Arbitrum Sepolia | Testnet | Free | Arbitrum testing |
| Base | Mainnet | Very Low | Production (recommended) |
| Arbitrum | Mainnet | Low | Production |
| Ethereum | Mainnet | High | High-value only |

### Getting Testnet ETH

- **Sepolia**: https://sepoliafaucet.com/
- **Base Sepolia**: Bridge from Sepolia at https://bridge.base.org
- **Arbitrum Sepolia**: https://faucet.quicknode.com/arbitrum/sepolia

## Security Considerations

### Auditing

✅ **Uses OpenZeppelin contracts** (v5.x) - battle-tested, audited standards

⚠️ **Custom logic added**:
- Royalty mechanism in `_update` override
- Role initialization in constructor

**Recommendation**: For production with significant value, get a security audit of the custom royalty logic.

### Access Control Best Practices

1. **Never share private keys** - Use hardware wallets for admin roles
2. **Use multi-sig for production** - Gnosis Safe with 2/3 or 3/5 signatures
3. **Separate role holders** - Don't give all roles to one address
4. **Monitor role grants** - Log all `RoleGranted` events
5. **Timelock for critical changes** - Consider timelock for parameter updates

### Known Considerations

**Royalty Recipient Risk**: 
- Don't set royaltyRecipient to an untrusted contract
- If recipient is a contract, ensure it can receive tokens
- Consider using a fee splitter contract for multi-party royalties

**Integer Division**:
- Very small transfers may result in 0 fee (by design)
- For 1 wei transfer with 1% royalty: 1 * 100 / 10000 = 0

**Upgrade Path**:
- These contracts are **not upgradeable**
- Design carefully before mainnet deployment
- Consider deploying behind a proxy if upgradeability is needed

### Vulnerability Checks

Run security analysis:

```bash
# Install slither (requires Python)
pip install slither-analyzer

# Run static analysis
slither contracts/Stagecoin.sol
slither contracts/SentientCents.sol
```

## Architecture Patterns

### Pattern 1: Custodial Pilot (Lowest Risk)

```
User Actions → Database (SCENT balance) → Periodic Merkle Root on-chain
                      ↓
               Redemption via batch settlement
```

**Pros**: Lowest cost, fastest, simple
**Cons**: Centralized, requires trust

### Pattern 2: Gasless On-Chain

```
User Signs Message → Relayer Submits → Paymaster Pays Gas → On-chain State
                                ↓
                         Deduct SCENT from user
```

**Pros**: True on-chain, gasless UX
**Cons**: Requires relayer infrastructure

### Pattern 3: Hybrid

```
Stagecoin: On-chain (Base L2) - Public reputation
SentientCents: Custodial - Internal only, redeemable
```

**Pros**: Balance of transparency and efficiency
**Cons**: Dual-system complexity

### Recommended Integration with PayGait/StagePort

```
PayGait Local Oracle
      ↓
Approve Recreation Event
      ↓
Backend Service (Minter Role)
      ↓
   ┌──────────────────┐
   │  Mint Stagecoin  │ → User (recreator)
   │       to          │
   └──────────────────┘
      ↓
   ┌──────────────────┐
   │ Credit SCENT in  │ → Creator (source)
   │    Database      │
   └──────────────────┘
```

## Economics & Tokenomics

### Stagecoin Economics

- **Initial Supply**: 0 (minted as earned)
- **Inflation**: Controlled by platform (only MINTER_ROLE can mint)
- **Utility**: Reputation, voting, staking
- **Liquidity**: Can add DEX pool later

### SentientCents Economics

- **Purpose**: Platform credit & royalty unit
- **Acquisition**: 
  - Buy with fiat/USDC (pre-sale)
  - Earn via royalties
  - Stake Stagecoin to earn
- **Utility**:
  - Pay for gas (via relayer)
  - Priority stamping
  - Governance participation
- **Treasury**: Fiat proceeds buy ETH for relayer operations

### Anti-Hoarding: Time Decay

To encourage circulation, implement epoch-based decay:

```javascript
// Off-chain calculation every epoch (week/month)
newBalance = currentBalance * (1 - decayRate)

// Example: 5% monthly decay for inactive accounts
// Active users (who used platform) are exempt or reduced decay
```

**Implementation**: Store last activity timestamp, calculate decay on next action or periodic batch update.

## Example Usage Flows

### Minting Rewards

```javascript
// Backend service with MINTER_ROLE
const amount = ethers.parseEther("100"); // 100 SC
await stagecoin.mint(userAddress, amount);
```

### Setting Royalty

```javascript
// Royalty admin sets 2.5% fee
await stagecoin.setRoyaltyBasisPoints(250); // 2.5%
await stagecoin.setRoyaltyRecipient(treasuryAddress);
```

### Burning Tokens

```javascript
// Burner role removes tokens (e.g., penalty or redemption)
const amount = ethers.parseEther("50");
await stagecoin.burn(userAddress, amount);
```

### User Transfer (with Royalty Active)

```javascript
// User sends 1000 SC, royalty is 2.5%
// User calls: transfer(recipientAddress, 1000 SC)
// Result:
//   - Treasury receives: 25 SC (2.5%)
//   - Recipient receives: 975 SC
//   - User pays gas
```

## Testing

Create tests in `test/` directory:

```javascript
// test/Stagecoin.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Stagecoin", function () {
  it("Should deploy with correct name and symbol", async function () {
    const Stagecoin = await ethers.getContractFactory("Stagecoin");
    const stagecoin = await Stagecoin.deploy(
      "Stagecoin", "SC",
      ethers.ZeroAddress, ethers.ZeroAddress, 0
    );
    
    expect(await stagecoin.name()).to.equal("Stagecoin");
    expect(await stagecoin.symbol()).to.equal("SC");
  });
  
  it("Should mint tokens with MINTER_ROLE", async function () {
    const [owner, user] = await ethers.getSigners();
    const Stagecoin = await ethers.getContractFactory("Stagecoin");
    const stagecoin = await Stagecoin.deploy(
      "Stagecoin", "SC",
      owner.address, owner.address, 0
    );
    
    await stagecoin.mint(user.address, ethers.parseEther("1000"));
    expect(await stagecoin.balanceOf(user.address)).to.equal(
      ethers.parseEther("1000")
    );
  });
});
```

Run tests:
```bash
npx hardhat test
```

## Support & Community

- **Repository**: https://github.com/TheAVCfiles/Holiday-Activity
- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions

## License

MIT License - See LICENSE file for details

## Credits

Built with:
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Hardhat](https://hardhat.org/)
- [Ethers.js](https://docs.ethers.org/)

---

**Ready to deploy?** Start with testnet deployment and gradually move to production following the phased approach outlined above.
