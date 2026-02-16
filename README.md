# StagePort Ledger Bridge (Gasless Relay)

A gasless relay system that bridges an internal off-chain ledger (StudioOS) with the on-chain Stagecoin contract. This implementation handles "Fee-on-Mint" calculation and "Time-Burn" logic before settlement.

## Features

- **Gasless Transactions**: Platform pays gas fees, users pay nothing
- **Time-Burn Mechanism**: Automatic decay calculation for inactive accounts (1% per month)
- **Fee-on-Mint**: On-chain royalty fee handling via `mintWithRoyalty`
- **Balance Management**: Tracks internal ledger balances and syncs to blockchain
- **Flexible Configuration**: Supports Arbitrum, Base, or local testnets

## Architecture

```
┌─────────────────┐     Bridge     ┌──────────────────┐
│  Off-Chain      │ ──────────────> │   On-Chain       │
│  Ledger         │                 │   Stagecoin      │
│  (StudioOS)     │                 │   Contract       │
└─────────────────┘                 └──────────────────┘
      ↑                                      ↑
      │                                      │
   User Balance              Platform Relayer (Pays Gas)
   (SentientCents)                  (Wallet)
```

## Installation

```bash
npm install
```

## Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration:
   ```env
   RPC_URL=http://127.0.0.1:8545          # Your RPC endpoint
   RELAYER_PRIVATE_KEY=0x...              # Platform wallet private key
   STAGECOIN_ADDRESS=0x...                # Deployed Stagecoin contract
   ```

   **⚠️ SECURITY WARNING**: Never commit the `.env` file to version control!

## Usage

### As a Module

```javascript
const { bridgeToChain } = require('./relay');

// Bridge 5000 cents (50 STAGE tokens) for user_123
bridgeToChain("user_123", 5000)
    .then(result => {
        console.log("Bridge successful:", result.txHash);
    })
    .catch(err => {
        console.error("Bridge failed:", err.message);
    });
```

### Direct Execution

Uncomment the usage example at the bottom of `relay.js` and run:

```bash
node relay.js
```

## How It Works

1. **Balance Check**: Verifies user has sufficient SentientCents in off-chain ledger
2. **Time-Burn Application**: Calculates and applies decay for inactive accounts
3. **Blockchain Connection**: Connects to configured RPC endpoint
4. **Token Minting**: Calls `mintWithRoyalty` on Stagecoin contract
5. **Ledger Update**: Deducts bridged amount and resets activity timer

## Conversion Rate

- **100 SCENT = 1 STAGE token**
- Example: Bridging 5,000 cents mints 50 STAGE tokens

## Time-Burn Logic

- Accounts inactive for **>30 days** experience **1% decay per month**
- Decay is applied before bridging
- Activity timer resets after successful bridge

## Database Integration

The current implementation uses a mock in-memory ledger. In production, replace with:

- PostgreSQL
- MongoDB
- Any database of your choice

Replace the `offChainLedger` object with actual database queries.

## Security Considerations

- Store private keys securely (use environment variables, never commit)
- Implement rate limiting to prevent abuse
- Add authentication/authorization for API endpoints
- Monitor relayer wallet balance to ensure gas availability
- Implement proper error handling and logging
- Consider using a hardware wallet or key management service for the relayer

## Testing

Before deploying to mainnet:

1. Test on a local network (Hardhat/Anvil)
2. Deploy to testnet (Arbitrum Sepolia, Base Sepolia)
3. Verify all calculations match expected values
4. Monitor gas usage and optimize if needed

## License

MIT

---

*Repository was created by [Working Copy](https://workingcopy.app/?ct=holiday) to decorate the GitHub Activity Overview.*
