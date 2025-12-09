# Quick Fix Steps for Contract Deployment

## The Problem
The contract was using Solidity ^0.8.0 which compiled to version 0.8.31, using opcodes not supported by Ganache 2.7.1.

## The Solution
I've updated the contract to use Solidity 0.8.19 with 'london' EVM version, which is fully compatible with Ganache.

## Steps to Deploy (Run these commands)

### 1. Install Contract Dependencies
```bash
cd contracts
npm install
```

This installs:
- `ethers@6.15.0`
- `solc@0.8.19` (specific version for compatibility)

### 2. Verify Ganache is Running
Make sure Ganache GUI is open and running on port 7545.

### 3. Deploy the Contract
```bash
node deploy.cjs
```

### 4. Verify Success
You should see:
```
✅ Contract deployed at: 0x...
✅ Configuration saved to: ../server/contract-config.json
🎉 DEPLOYMENT SUCCESSFUL!
```

### 5. Start Backend Server
```bash
cd ../server
npm install
npm run dev
```

### 6. Start Polling Booth
```bash
cd ../polling-booth
npm install
npm run dev
```

## What Changed

1. **DecentralizedVoting.sol** - Changed `pragma solidity ^0.8.0;` to `pragma solidity 0.8.19;`
2. **deploy.cjs** - Added EVM version configuration: `evmVersion: 'london'`
3. **contracts/package.json** - Created with specific `solc@0.8.19` version

## If It Still Fails

If you still get errors, try:

1. **Update Ganache** to latest version
2. **Or use Hardhat** instead:
   ```bash
   npm install --save-dev hardhat
   npx hardhat node
   # Then run deploy.cjs
   ```

That's it! The contract should deploy successfully now.
