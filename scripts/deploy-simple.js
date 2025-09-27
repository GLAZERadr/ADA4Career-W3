const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying CVRegistry to Lisk Sepolia...');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');

  // Deploy contract
  const CVRegistry = await ethers.deployContract('CVRegistry');
  await CVRegistry.waitForDeployment();

  console.log('✅ CVRegistry Contract Deployed at:', CVRegistry.target);
  console.log('🔗 Transaction hash:', CVRegistry.deploymentTransaction().hash);

  // Save contract address to .env file
  const fs = require('fs');
  const contractAddress = CVRegistry.target;

  const envContent = `# Add this to your .env.local file:
NEXT_PUBLIC_CV_REGISTRY_ADDRESS=${contractAddress}
NEXT_PUBLIC_NETWORK=lisk-sepolia
NEXT_PUBLIC_CHAIN_ID=4202
`;

  fs.writeFileSync('.env.contract', envContent);
  console.log('📄 Contract address saved to .env.contract');
}

main().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exitCode = 1;
});