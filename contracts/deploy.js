/**
 * Deploy script for Phase 2 DecentralizedVoting contract
 * Run: node contracts/deploy.js
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import solc from 'solc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 VoteRakshak Phase 2 — Contract Deployment');
    console.log('═══════════════════════════════════════════════════');

    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) {
        throw new Error('No accounts available. Is Ganache running?');
    }

    const deployer = await provider.getSigner(accounts[0].address);
    console.log(`👤 Deploying from: ${await deployer.getAddress()}`);

    // Read contract source
    const contractPath = path.join(__dirname, 'DecentralizedVoting.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    // Compile with solc
    const input = {
        language: 'Solidity',
        sources: { 'DecentralizedVoting.sol': { content: source } },
        settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } },
    };

    console.log('⚙️  Compiling contract...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error('❌ Compilation errors:', errors);
            process.exit(1);
        }
    }

    const contractOutput = output.contracts['DecentralizedVoting.sol']['DecentralizedVoting'];
    const abi = contractOutput.abi;
    const bytecode = contractOutput.evm.bytecode.object;

    console.log('✅ Compiled successfully');

    // Deploy
    const factory = new ethers.ContractFactory(abi, bytecode, deployer);
    console.log('📝 Deploying contract (no constructor args in Phase 2)...');
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log(`✅ Contract deployed at: ${contractAddress}`);

    // Save to contract-config.json
    const configPath = path.join(__dirname, '..', 'server', 'contract-config.json');
    const config = {
        contractAddress,
        abi,
        deployedAt: new Date().toISOString(),
        network: 'ganache',
        phase: 2,
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`📄 Config saved to: ${configPath}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Deployment complete! Phase 2 contract is live.');
    console.log('═══════════════════════════════════════════════════');
}

main().catch((err) => {
    console.error('❌ Deployment failed:', err);
    process.exit(1);
});
