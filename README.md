# Holiday Activity - StagePort Token Contracts

Production-ready ERC-20 token contracts for the StagePort/PayGait ecosystem.

## Overview

This repository contains:
- **Stagecoin (SC)**: Visible reputation and reward token (18 decimals)
- **SentientCents (SCENT)**: Internal royalty and utility token (2 decimals)
- Hardhat deployment scripts with role management
- Comprehensive documentation for gasless patterns and treasury management

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Compile contracts (requires network access)
npx hardhat compile

# Deploy to local network
npx hardhat run scripts/deploy.js

# Deploy to Base testnet
npx hardhat run scripts/deploy.js --network baseTestnet
```

## Documentation

- **[CONTRACTS.md](./CONTRACTS.md)** - Complete guide to the token contracts, deployment, and usage
- **[GASLESS-PATTERNS.md](./GASLESS-PATTERNS.md)** - How to implement zero-gas user experiences and manage treasury

## Key Features

### Both Tokens Include:
- ✅ Role-based access control (Minter, Burner, Royalty Admin)
- ✅ Optional on-transfer royalty mechanism
- ✅ OpenZeppelin battle-tested base contracts
- ✅ Production-hardened security patterns

### Stagecoin (SC)
- 18 decimals (standard ERC-20)
- Public reputation and rewards
- Visible in wallets
- Tradeable on DEXs

### SentientCents (SCENT)
- 2 decimals (cent-like precision)
- Internal royalty tracking
- Can be custodial or on-chain
- Investment vehicle for artists

## Network Support

Configured for:
- Local Hardhat network
- Sepolia (Ethereum testnet)
- Base & Base Sepolia
- Arbitrum & Arbitrum Sepolia
- Easy to add more networks

## Gasless Options

Multiple patterns available for zero-gas user experience:
1. **Off-chain ledger** with periodic settlement (lowest cost)
2. **Meta-transactions** with relayer (true on-chain)
3. **Account abstraction** (ERC-4337) with paymasters
4. **Subsidized L2** deployment (Base, Arbitrum)

See [GASLESS-PATTERNS.md](./GASLESS-PATTERNS.md) for detailed implementation guides.

## Economics

### Anti-Hoarding
- Time-decay mechanism for inactive accounts
- Encourages circulation and engagement
- Configurable decay rates

### Treasury Management
- SCENT pre-sales fund operations
- Automated ETH conversion for gas
- Multi-sig security
- Transparent reserves

## Security

- Built on OpenZeppelin v5.x (audited)
- Multi-sig recommended for production
- Role-based access control
- No upgrade complexity (immutable)

## License

MIT License - See LICENSE file

## Resources

- Repository: https://github.com/TheAVCfiles/Holiday-Activity
- Issues: Report bugs via GitHub Issues
- Discussions: Ask questions via GitHub Discussions

---

Built for StagePort StudioOS and PayGait by TheAVCfiles.
