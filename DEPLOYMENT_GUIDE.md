# Smart Contract Deployment Guide

## Prerequisites

1. **Ganache** - Local blockchain running on port 7545
2. **Node.js** - Version 18 or higher

## Step-by-Step Deployment

### Step 1: Start Ganache

**Option A: Ganache GUI**
1. Open Ganache application
2. Click "Quickstart" or create a new workspace
3. Ensure it's running on port **7545** (default)
4. Keep Ganache running in the background

**Option B: Ganache CLI**
```bash
npm install -g ganache
ganache --port 7545
```

### Step 2: Install Contract Dependencies

```bash
cd contracts
npm install
```

This will install:
- `ethers@6.15.0` - Ethereum library
- `solc@0.8.19` - Solidity compiler (specific version for Ganache compatibility)

### Step 3: Deploy the Contract

```bash
node deploy.cjs
```

**Expected Output:**
```
🚀 Starting deployment process...

📝 Compiling DecentralizedVoting.sol...
✅ Contract compiled successfully

🔗 Connecting to Ganache...
📋 Available accounts: 10
👤 Deploying from: 0x...
💰 Balance: 100.0 ETH

⏰ Voting Period Configuration:
   Start: [current time]
   End:   [24 hours later]
   Duration: 24 hours

🚀 Deploying contract...
📝 Transaction hash: 0x...
⏳ Waiting for confirmation...
✅ Contract deployed at: 0x...

🔍 Verifying deployment...
   Admin: 0x...
   Start Time: ...
   End Time: ...
✅ Deployment verified

💾 Saving contract configuration...
✅ Configuration saved to: ../server/contract-config.json

═══════════════════════════════════════════════════
🎉 DEPLOYMENT SUCCESSFUL!
═══════════════════════════════════════════════════
Contract Address: 0x...
Network: Ganache (http://127.0.0.1:7545)
Admin: 0x...
═══════════════════════════════════════════════════
```

### Step 4: Verify Deployment

Check that `server/contract-config.json` was created:

```bash
cat ../server/contract-config.json
```

You should see:
```json
{
  "contractAddress": "0x...",
  "abi": [...],
  "network": "ganache",
  "ganacheUrl": "http://127.0.0.1:7545",
  "deployedAt": "2024-12-09T...",
  "votingPeriod": {
    "startTime": ...,
    "endTime": ...,
    "durationHours": 24
  },
  "admin": "0x..."
}
```

### Step 5: Start the Backend Server

```bash
cd ../server
npm install
npm run dev
```

The backend will automatically load the contract configuration and connect to Ganache.

## Troubleshooting

### Error: "Cannot connect to Ganache"

**Solution:**
- Ensure Ganache is running on port 7545
- Check firewall settings
- Try restarting Ganache

### Error: "invalid opcode" or "missing revert data"

**Solution:**
- This guide uses Solidity 0.8.19 which is compatible with Ganache
- If you still see this error, update Ganache to the latest version
- Or use Hardhat instead of Ganache (see alternative below)

### Error: "require is not defined"

**Solution:**
- The deployment script is now `deploy.cjs` (CommonJS format)
- Make sure you're running `node deploy.cjs` not `node deploy.js`

## Alternative: Using Hardhat (If Ganache Issues Persist)

If you continue to have issues with Ganache, you can use Hardhat Network instead:

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat init

# Run Hardhat node (in separate terminal)
npx hardhat node

# Update GANACHE_URL in server/.env to:
# GANACHE_URL=http://127.0.0.1:8545

# Deploy to Hardhat
node deploy.cjs
```

## Customizing Voting Period

Edit `deploy.cjs` line 9:

```javascript
const VOTING_DURATION_HOURS = 24; // Change to desired hours
```

Or modify to use specific start/end times:

```javascript
const startTime = Math.floor(new Date('2024-12-10T09:00:00').getTime() / 1000);
const endTime = Math.floor(new Date('2024-12-10T17:00:00').getTime() / 1000);
```

## Next Steps

After successful deployment:

1. ✅ Contract is deployed and configured
2. ✅ Backend can interact with the blockchain
3. ✅ Ready to start the full application

Continue with the main README.md for running the complete system.
