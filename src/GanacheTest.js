// ==============================================
// GANACHE CONFIGURATION SETUP GUIDE
// ==============================================

// Step 1: Update these values in your React component
// Replace the placeholder values with your actual Ganache details:

const GANACHE_CONFIG = {
  // Your Ganache RPC URL (usually one of these):
  RPC_URL: "http://127.0.0.1:8545",  // Default Ganache GUI
  // RPC_URL: "http://127.0.0.1:8545",  // Default Ganache CLI
  // RPC_URL: "http://localhost:7545",  // Alternative localhost

  // Your deployed contract address from Ganache
  CONTRACT_ADDRESS: "0x0169702144FD18aEE87675515DED3978E720e30C", // REPLACE THIS

  // Private key from one of your Ganache accounts (without 0x prefix)
  PRIVATE_KEY: "14593352dfc287735660d85b1ee8cbbe3c18972cd89dd8b455504185ea4ac27f" // REPLACE THIS
};

// ==============================================
// HOW TO GET YOUR GANACHE DETAILS
// ==============================================

// 1. GANACHE RPC URL:
//    - Open Ganache GUI
//    - Look at the top of the window for "RPC SERVER"
//    - Copy the URL (usually http://127.0.0.1:7545)

// 2. CONTRACT ADDRESS:
//    - In Ganache, go to "Contracts" tab
//    - Find your deployed BiometricVotingSystem contract
//    - Copy the contract address

// 3. PRIVATE KEY:
//    - In Ganache, go to "Accounts" tab
//    - Click the key icon next to any account
//    - Copy the private key (remove the 0x prefix)
//    - Make sure the account has enough ETH

// ==============================================
// VERIFICATION STEPS
// ==============================================

// Step 1: Verify Ganache is running
async function verifyGanacheConnection() {
  try {
    const response = await fetch('http://127.0.0.1:7545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    const result = await response.json();
    console.log('✅ Ganache is running, current block:', parseInt(result.result, 16));
    return true;
  } catch (error) {
    console.error('❌ Ganache connection failed:', error);
    return false;
  }
}

// Step 2: Test contract interaction
async function testContractConnection() {
  const { ethers } = window;
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
  const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);
  
  // Minimal ABI for testing
  const testABI = [
    "function owner() view returns (address)",
    "function votingActive() view returns (bool)"
  ];
  
  const contract = new ethers.Contract('YOUR_CONTRACT_ADDRESS', testABI, wallet);
  
  try {
    const owner = await contract.owner();
    const votingActive = await contract.votingActive();
    console.log('✅ Contract accessible');
    console.log('Contract owner:', owner);
    console.log('Voting active:', votingActive);
    return true;
  } catch (error) {
    console.error('❌ Contract interaction failed:', error);
    return false;
  }
}

// ==============================================
// COMMON ISSUES & SOLUTIONS
// ==============================================

/*
❌ ISSUE: "Failed to fetch" or network error
✅ SOLUTION: 
   - Make sure Ganache is running
   - Check the RPC URL matches Ganache settings
   - Try http://127.0.0.1:7545 or http://localhost:7545

❌ ISSUE: "Invalid private key"
✅ SOLUTION:
   - Remove 0x prefix from private key
   - Make sure you copied the full private key
   - Try a different account from Ganache

❌ ISSUE: "Contract call reverted"
✅ SOLUTION:
   - Make sure the contract address is correct
   - Check if voting period is active (call startVoting if needed)
   - Verify the contract is properly deployed

❌ ISSUE: "Insufficient gas"
✅ SOLUTION:
   - Increase gas limit in Ganache settings
   - Or add gasLimit parameter to transactions

❌ ISSUE: CORS error
✅ SOLUTION:
   - This usually doesn't happen with Ganache
   - If it does, use a local server for your React app
*/

// ==============================================
// QUICK SETUP CHECKLIST
// ==============================================

/*
□ 1. Ganache is running
□ 2. Contract is deployed to Ganache
□ 3. Updated CONTRACT_ADDRESS in React component
□ 4. Updated RPC_URL in React component  
□ 5. Updated PRIVATE_KEY in React component
□ 6. Account has sufficient ETH for gas
□ 7. Started voting period in contract (if needed)
*/

// ==============================================
// EXAMPLE GANACHE INTERACTION SCRIPT
// ==============================================

// You can run this in browser console to test your setup
async function quickGanacheTest() {
  console.log('🧪 Testing Ganache connection...');
  
  // Test 1: Basic connection
  const ganacheRunning = await verifyGanacheConnection();
  if (!ganacheRunning) return;
  
  // Test 2: Load ethers
  if (typeof window.ethers === 'undefined') {
    console.log('Loading ethers.js...');
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js';
    document.head.appendChild(script);
    await new Promise(resolve => script.onload = resolve);
  }
  
  // Test 3: Contract interaction
  await testContractConnection();
  
  console.log('✅ Ganache setup test complete!');
}


quickGanacheTest();