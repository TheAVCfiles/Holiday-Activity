# Testnet Deployment Guide

This project deploys two ERC20-compatible contracts:

- `Stagecoin` (`STAGE`) with a 5% transfer royalty
- `SentientCents` (`SCENTS`) with 2 decimals and a 2.5% transfer royalty

Deploy to testnet before any mainnet deployment.

## 1. Install dependencies

```bash
npm install
```

## 2. Compile contracts

```bash
npm run compile
```

## 3. Run tests

```bash
npm test
```

Do not deploy until compile and tests pass.

## 4. Create a testnet-only wallet

Use a fresh wallet that does not hold mainnet assets. Export its private key only for local testnet deployment.

Never commit `.env`.

## 5. Configure environment

Copy the sample environment file:

```bash
cp .env.example .env
```

Fill in:

```bash
SEPOLIA_RPC_URL=
BASE_SEPOLIA_RPC_URL=
DEPLOYER_PRIVATE_KEY=
ETHERSCAN_API_KEY=
BASESCAN_API_KEY=
```

Use either Sepolia or Base Sepolia first. Base Sepolia is usually a practical low-cost path for UI demos.

## 6. Fund the deployer wallet

Send a small amount of testnet ETH to the deployer wallet from a faucet for the network you plan to use.

## 7. Deploy

Sepolia:

```bash
npm run deploy:sepolia
```

Base Sepolia:

```bash
npm run deploy:base-sepolia
```

The script prints the deployed contract addresses and constructor arguments.

## 8. Verify contracts

After deployment, verify each contract with the printed constructor arguments.

Example shape:

```bash
npm run verify:sepolia -- <CONTRACT_ADDRESS> "Stagecoin" "STAGE" <ADMIN_ADDRESS> <ROYALTY_ADDRESS> 500
```

```bash
npm run verify:base-sepolia -- <CONTRACT_ADDRESS> "SentientCents" "SCENTS" <ADMIN_ADDRESS> <ROYALTY_ADDRESS> 250
```

## Safety notes

- Testnet only until contracts have been reviewed.
- Do not use your main wallet private key.
- Do not promise legal copyright enforcement from token transfers alone.
- Treat this as claim-staking and payment-routing infrastructure, not a complete legal rights system.
