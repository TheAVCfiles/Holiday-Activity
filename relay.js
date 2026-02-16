/**
 * StagePort Ledger Bridge (Gasless Relay)
 * Bridges the internal off-chain ledger (StudioOS) with the on-chain Stagecoin contract.
 * Handles "Fee-on-Mint" calculation and "Time-Burn" logic before settlement.
 */

const ethers = require('ethers');

// --- Configuration ---
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545"; // Connects to Arb/Base/Localhost
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY; // The Platform's Wallet (Pays Gas)
const STAGECOIN_ADDRESS = process.env.STAGECOIN_ADDRESS || "0x..."; // Deployed Contract Address (StagePortTokens.sol)

// --- Mock Database (Internal Ledger) ---
// In production, this is your PostgreSQL/Mongo instance
const offChainLedger = {
    "user_123": {
        sentientCents: 1250000, // stored as integer (cents)
        lastActivity: Date.now(),
        walletAddress: "0xUserWalletAddress..."
    }
};

// --- Helper: Time Burn Calculator ---
// Replicates the logic in Stagecoin.sol -> applyTimeBurn
function calculateDecay(userId) {
    const user = offChainLedger[userId];
    const now = Date.now();
    const daysInactive = (now - user.lastActivity) / (1000 * 60 * 60 * 24);
    
    // Example: 1% decay per month of inactivity
    if (daysInactive > 30) {
        const decayAmount = Math.floor(user.sentientCents * 0.01);
        return decayAmount;
    }
    return 0;
}

// --- Main Function: Bridge to Chain ---
async function bridgeToChain(userId, amountToBridge) {
    console.log(`[RELAY] Initiating Bridge for ${userId}...`);

    // 1. Check Internal Balance
    const user = offChainLedger[userId];
    if (!user) {
        throw new Error("User not found in ledger.");
    }
    if (user.sentientCents < amountToBridge) {
        throw new Error("Insufficient SentientCents balance.");
    }

    // 2. Apply Decay (if any) before bridging
    const decay = calculateDecay(userId);
    if (decay > 0) {
        console.log(`[RELAY] Applying Time-Burn: -${decay} SCENT`);
        user.sentientCents -= decay;
        // In prod: update DB
    }

    // 3. Connect to Blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
    
    // ABI for Stagecoin (MintWithRoyalty function only)
    const abi = [
        "function mintWithRoyalty(address to, uint256 amount) external"
    ];
    const contract = new ethers.Contract(STAGECOIN_ADDRESS, abi, wallet);

    // 4. Calculate Conversion (e.g., 100 SCENT = 1 STAGE)
    const stageAmount = ethers.parseEther((amountToBridge / 100).toString());

    try {
        console.log(`[RELAY] Submitting Transaction (Gas Covered by Platform)...`);
        
        // The Relayer calls the function. User pays 0 gas.
        // "mintWithRoyalty" handles the fee split on-chain automatically.
        const tx = await contract.mintWithRoyalty(user.walletAddress, stageAmount);
        
        console.log(`[RELAY] Tx Sent: ${tx.hash}`);
        await tx.wait();
        
        // 5. Update Internal Ledger
        user.sentientCents -= amountToBridge;
        user.lastActivity = Date.now(); // Reset activity clock
        
        console.log(`[RELAY] Bridge Complete. New Balance: ${user.sentientCents}`);
        return { success: true, txHash: tx.hash };

    } catch (error) {
        console.error(`[RELAY] Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// --- Export for use as a module ---
module.exports = {
    bridgeToChain,
    calculateDecay,
    offChainLedger
};

// --- Usage Example ---
// Uncomment to run directly:
// bridgeToChain("user_123", 5000).then(result => {
//     console.log("Result:", result);
// }).catch(err => {
//     console.error("Failed:", err);
// });
