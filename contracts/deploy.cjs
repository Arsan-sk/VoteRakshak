/**
 * Deployment script for DecentralizedVoting smart contract
 * Deploys to local Ganache network and saves contract configuration
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

// Configuration
const GANACHE_URL = 'http://127.0.0.1:7545';
const PRIVATE_KEY = '0x3956e5d838a2a8a65e70008ea3168765886670179ae42397506626ec47f85591'; // Replace with Ganache account private key

// Voting period configuration (example: 24 hours from now)
const VOTING_DURATION_HOURS = 24;

async function main() {
    console.log('🚀 Starting deployment process...\n');

    // =================== Step 1: Compile Contract ===================
    console.log('📝 Compiling DecentralizedVoting.sol...');

    const contractPath = path.join(__dirname, 'DecentralizedVoting.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'DecentralizedVoting.sol': {
                content: source,
            },
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            evmVersion: 'london', // Compatible with Ganache
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for compilation errors
    if (output.errors) {
        output.errors.forEach((err) => {
            console.error(err.formattedMessage);
        });
        if (output.errors.some(err => err.severity === 'error')) {
            throw new Error('Compilation failed');
        }
    }

    const contract = output.contracts['DecentralizedVoting.sol']['DecentralizedVoting'];
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    console.log('✅ Contract compiled successfully\n');

    // =================== Step 2: Connect to Ganache ===================
    console.log('🔗 Connecting to Ganache...');

    const provider = new ethers.JsonRpcProvider(GANACHE_URL);

    // Get accounts from Ganache
    const accounts = await provider.listAccounts();
    console.log(`📋 Available accounts: ${accounts.length}`);

    // Use first account as deployer
    const deployerAddress = accounts[0].address;
    const deployer = await provider.getSigner(deployerAddress);

    console.log(`👤 Deploying from: ${deployerAddress}`);

    const balance = await provider.getBalance(deployerAddress);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

    // =================== Step 3: Set Voting Period ===================
    const now = Math.floor(Date.now() / 1000);
    const startTime = now; // Start immediately
    const endTime = now + (VOTING_DURATION_HOURS * 60 * 60);

    console.log('⏰ Voting Period Configuration:');
    console.log(`   Start: ${new Date(startTime * 1000).toLocaleString()}`);
    console.log(`   End:   ${new Date(endTime * 1000).toLocaleString()}`);
    console.log(`   Duration: ${VOTING_DURATION_HOURS} hours\n`);

    // =================== Step 4: Deploy Contract ===================
    console.log('🚀 Deploying contract...');

    const factory = new ethers.ContractFactory(abi, bytecode, deployer);
    const contract_instance = await factory.deploy(startTime, endTime);

    console.log(`📝 Transaction hash: ${contract_instance.deploymentTransaction().hash}`);
    console.log('⏳ Waiting for confirmation...');

    await contract_instance.waitForDeployment();
    const contractAddress = await contract_instance.getAddress();

    console.log(`✅ Contract deployed at: ${contractAddress}\n`);

    // =================== Step 5: Verify Deployment ===================
    console.log('🔍 Verifying deployment...');

    const deployedStartTime = await contract_instance.startTime();
    const deployedEndTime = await contract_instance.endTime();
    const admin = await contract_instance.admin();

    console.log(`   Admin: ${admin}`);
    console.log(`   Start Time: ${deployedStartTime}`);
    console.log(`   End Time: ${deployedEndTime}`);
    console.log('✅ Deployment verified\n');

    // =================== Step 6: Save Configuration ===================
    console.log('💾 Saving contract configuration...');

    const config = {
        contractAddress: contractAddress,
        abi: abi,
        network: 'ganache',
        ganacheUrl: GANACHE_URL,
        deployedAt: new Date().toISOString(),
        votingPeriod: {
            startTime: startTime,
            endTime: endTime,
            durationHours: VOTING_DURATION_HOURS,
        },
        admin: admin,
    };

    // Save to server directory
    const serverConfigPath = path.join(__dirname, '..', 'server', 'contract-config.json');
    fs.mkdirSync(path.dirname(serverConfigPath), { recursive: true });
    fs.writeFileSync(serverConfigPath, JSON.stringify(config, null, 2));

    console.log(`✅ Configuration saved to: ${serverConfigPath}\n`);

    // =================== Summary ===================
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Network: Ganache (${GANACHE_URL})`);
    console.log(`Admin: ${admin}`);
    console.log('═══════════════════════════════════════════════════\n');
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });
