# Contract Verification Guide

Guide for verifying deployed contracts on block explorers (Etherscan, Basescan, Arbiscan).

## Why Verify Contracts?

Verified contracts:
- ✅ Allow users to read the source code directly on the explorer
- ✅ Enable direct interaction through the block explorer UI
- ✅ Build trust and transparency
- ✅ Are required for many DeFi integrations

## Prerequisites

1. **API Keys**: Get API keys from:
   - Etherscan: https://etherscan.io/myapikey
   - Basescan: https://basescan.org/myapikey
   - Arbiscan: https://arbiscan.io/myapikey

2. **Configure in .env**:
```bash
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
```

## Automatic Verification with Hardhat

### After Deployment

```bash
# Verify on Ethereum Sepolia
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Stagecoin" "SC" ADMIN_ADDRESS ROYALTY_RECIPIENT 0

# Verify on Base
npx hardhat verify --network base CONTRACT_ADDRESS "Stagecoin" "SC" ADMIN_ADDRESS ROYALTY_RECIPIENT 0

# Verify on Arbitrum
npx hardhat verify --network arbitrum CONTRACT_ADDRESS "Stagecoin" "SC" ADMIN_ADDRESS ROYALTY_RECIPIENT 0
```

### Example with Real Addresses

```bash
# Deploy and capture the address
npx hardhat run scripts/deploy.js --network baseTestnet

# Output will show:
# Stagecoin deployed: 0x1234567890123456789012345678901234567890
# SentientCents deployed: 0x0987654321098765432109876543210987654321

# Verify Stagecoin
npx hardhat verify --network baseTestnet \
  0x1234567890123456789012345678901234567890 \
  "Stagecoin" \
  "SC" \
  "0xYourAdminAddress" \
  "0xYourTreasuryAddress" \
  0

# Verify SentientCents
npx hardhat verify --network baseTestnet \
  0x0987654321098765432109876543210987654321 \
  "Sentient Cents" \
  "SCENT" \
  "0xYourAdminAddress" \
  "0xYourTreasuryAddress" \
  0
```

## Enhanced Deployment Script with Auto-Verify

Create `scripts/deploy-and-verify.js`:

```javascript
const { ethers, run } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy Stagecoin
  console.log("\n--- Deploying Stagecoin ---");
  const Stagecoin = await ethers.getContractFactory("Stagecoin");
  const stage = await Stagecoin.deploy(
    "Stagecoin",
    "SC",
    deployer.address,
    deployer.address,
    0
  );
  await stage.waitForDeployment();
  const stageAddress = await stage.getAddress();
  console.log("Stagecoin deployed:", stageAddress);

  // Deploy SentientCents
  console.log("\n--- Deploying SentientCents ---");
  const SentientCents = await ethers.getContractFactory("SentientCents");
  const sent = await SentientCents.deploy(
    "Sentient Cents",
    "SCENT",
    deployer.address,
    deployer.address,
    0
  );
  await sent.waitForDeployment();
  const sentAddress = await sent.getAddress();
  console.log("SentientCents deployed:", sentAddress);

  // Wait for block confirmations
  console.log("\nWaiting for block confirmations...");
  await stage.deploymentTransaction().wait(5);
  await sent.deploymentTransaction().wait(5);

  // Verify contracts
  console.log("\n--- Verifying Stagecoin ---");
  try {
    await run("verify:verify", {
      address: stageAddress,
      constructorArguments: [
        "Stagecoin",
        "SC",
        deployer.address,
        deployer.address,
        0
      ],
    });
    console.log("Stagecoin verified successfully");
  } catch (error) {
    console.log("Stagecoin verification failed:", error.message);
  }

  console.log("\n--- Verifying SentientCents ---");
  try {
    await run("verify:verify", {
      address: sentAddress,
      constructorArguments: [
        "Sentient Cents",
        "SCENT",
        deployer.address,
        deployer.address,
        0
      ],
    });
    console.log("SentientCents verified successfully");
  } catch (error) {
    console.log("SentientCents verification failed:", error.message);
  }

  console.log("\n=== Deployment & Verification Complete ===");
  console.log("Stagecoin:", stageAddress);
  console.log("SentientCents:", sentAddress);
  console.log("\nView on explorer:");
  console.log("Base:", `https://basescan.org/address/${stageAddress}`);
  console.log("Arbitrum:", `https://arbiscan.io/address/${stageAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Manual Verification (if automatic fails)

1. Go to the block explorer (e.g., https://basescan.org)
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Select:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.24+commit.xxxxx (match hardhat.config.js)
   - License: MIT
6. Paste your flattened contract:

```bash
npx hardhat flatten contracts/Stagecoin.sol > Stagecoin-flat.sol
```

7. Enter constructor arguments (ABI-encoded):

```javascript
// Use Ethers to encode constructor arguments
const { ethers } = require("ethers");

const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
  ["string", "string", "address", "address", "uint256"],
  ["Stagecoin", "SC", "0xAdminAddress", "0xTreasuryAddress", 0]
);
console.log(encoded);
```

## Troubleshooting

### "Already Verified"
Contract is already verified. Check the explorer link.

### "Compilation Failed"
- Ensure compiler version matches exactly
- Check if optimizer is enabled/disabled correctly
- Verify license identifier

### "Constructor Arguments Mismatch"
- Double-check the order and values of constructor arguments
- Ensure addresses are checksummed correctly

### "Source Code Does Not Match"
- Make sure you're verifying the exact same code
- Check if any dependencies have been updated
- Flatten the contract if using imports

## Verification Best Practices

1. **Wait for Confirmations**: Wait 5-10 blocks before verifying
2. **Save Constructor Args**: Keep a record of deployment parameters
3. **Verify Immediately**: Don't wait days; do it right after deployment
4. **Test on Testnet First**: Practice verification flow on testnet
5. **Document Addresses**: Keep a deployment log with all addresses

## Example Deployment Log

Create `deployments/base-testnet.json`:

```json
{
  "network": "Base Sepolia",
  "chainId": 84532,
  "deployer": "0xYourDeployerAddress",
  "timestamp": "2024-02-16T20:00:00Z",
  "contracts": {
    "Stagecoin": {
      "address": "0x1234567890123456789012345678901234567890",
      "txHash": "0xabcdef...",
      "verified": true,
      "explorerUrl": "https://sepolia.basescan.org/address/0x1234..."
    },
    "SentientCents": {
      "address": "0x0987654321098765432109876543210987654321",
      "txHash": "0x123456...",
      "verified": true,
      "explorerUrl": "https://sepolia.basescan.org/address/0x0987..."
    }
  },
  "roles": {
    "admin": "0xYourAdminAddress",
    "minter": "0xYourMinterAddress",
    "burner": "0xYourBurnerAddress",
    "royaltyAdmin": "0xYourRoyaltyAdminAddress"
  },
  "initialConfig": {
    "royaltyBasisPoints": 0,
    "royaltyRecipient": "0xYourTreasuryAddress"
  }
}
```

## Post-Verification Checklist

After successful verification:

- [ ] Contract source code visible on explorer
- [ ] "Read Contract" tab shows all public functions
- [ ] "Write Contract" tab allows interaction
- [ ] Constructor arguments match deployment
- [ ] All imports resolved correctly
- [ ] License type displayed correctly

## Resources

- [Hardhat Verification Plugin](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan)
- [Etherscan Verification Guide](https://docs.etherscan.io/tutorials/verifying-contracts-programmatically)
- [Basescan API](https://docs.basescan.org/api-endpoints/contracts)
- [Arbiscan API](https://docs.arbiscan.io/api-endpoints/contracts)

---

**Tip**: Always verify contracts on testnet first to ensure your verification workflow works before deploying to mainnet!
