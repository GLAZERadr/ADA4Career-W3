const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Starting CVRegistry deployment to Sepolia...');

  // Check network connection
  const provider = ethers.provider;
  const network = await provider.getNetwork();
  console.log('🌐 Connected to network:', network.name, 'Chain ID:', Number(network.chainId));

  // Get deployer
  const signers = await ethers.getSigners();
  console.log('🔍 Number of signers found:', signers.length);

  if (signers.length === 0) {
    console.error('❌ No signers available. Checking configuration...');
    console.log('Private key exists:', !!process.env.PRIVATE_KEY);
    console.log('Private key length:', process.env.PRIVATE_KEY?.length);
    throw new Error('No deployer account found. Check your PRIVATE_KEY in .env.local');
  }

  const [deployer] = signers;
  console.log('📝 Deploying with account:', deployer.address);

  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');

  if (balance < ethers.parseEther('0.01')) {
    console.warn('⚠️  Low balance! Make sure you have enough ETH for deployment.');
  }

  // Get contract factory
  const CVRegistry = await ethers.getContractFactory('CVRegistry');

  // Deploy contract
  console.log('🔨 Deploying CVRegistry contract...');
  const cvRegistry = await CVRegistry.deploy();

  // Wait for deployment
  await cvRegistry.waitForDeployment();
  const contractAddress = await cvRegistry.getAddress();

  console.log('✅ CVRegistry deployed to:', contractAddress);
  console.log('🔗 Transaction hash:', cvRegistry.deploymentTransaction()?.hash);

  // Verify deployment
  console.log('🔍 Verifying deployment...');
  const owner = await cvRegistry.owner();
  console.log('👤 Contract owner:', owner);
  console.log('✨ Owner is deployer:', owner === deployer.address);

  // Save deployment info
  const deploymentInfo = {
    network: 'sepolia',
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    ownerAddress: owner,
    blockNumber: cvRegistry.deploymentTransaction()?.blockNumber,
    transactionHash: cvRegistry.deploymentTransaction()?.hash,
    timestamp: new Date().toISOString(),
    contractName: 'CVRegistry',
    gasUsed: null // Will be updated after getting receipt
  };

  // Get deployment receipt for gas information
  const receipt = await cvRegistry.deploymentTransaction()?.wait();
  if (receipt) {
    deploymentInfo.gasUsed = receipt.gasUsed.toString();
    console.log('⛽ Gas used:', receipt.gasUsed.toString());
  }

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentPath = path.join(deploymentsDir, 'sepolia-deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('💾 Deployment info saved to:', deploymentPath);

  // Generate environment variables
  const envTemplate = `
# CVRegistry Contract Deployment (Sepolia)
NEXT_PUBLIC_CV_REGISTRY_ADDRESS=${contractAddress}
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111

# Contract Owner (for admin functions)
CONTRACT_OWNER_ADDRESS=${deployer.address}
`;

  const envPath = path.join(__dirname, '..', '.env.contract');
  fs.writeFileSync(envPath, envTemplate.trim());
  console.log('🌍 Environment variables saved to:', envPath);

  // Generate contract interaction examples
  const examplesTemplate = `
// CVRegistry Contract Interaction Examples
// Contract Address: ${contractAddress}
// Network: Sepolia Testnet

import { ethers } from 'ethers';

// Contract ABI (add to your project)
const CVRegistry_ABI = ${JSON.stringify(
  [
    "function submitCV(string memory _ipfsHash, string memory _metadataHash) external",
    "function updateCV(string memory _ipfsHash, string memory _metadataHash) external",
    "function approveCV(address _user) external",
    "function rejectCV(address _user, string memory _reason) external",
    "function getCVRecord(address _user) external view returns (tuple(string ipfsHash, string metadataHash, uint8 status, uint256 submissionTime, uint256 lastUpdateTime, address submitter, string rejectionReason))",
    "function getCVStatus(address _user) external view returns (uint8)",
    "function isApprover(address _address) external view returns (bool)",
    "function addApprover(address _approver) external",
    "function removeApprover(address _approver) external",
    "function getStats() external view returns (uint256, uint256, uint256)",
    "event CVSubmitted(address indexed user, string ipfsHash, string metadataHash, uint256 timestamp)",
    "event CVUpdated(address indexed user, string oldIpfsHash, string newIpfsHash, string newMetadataHash, uint256 timestamp)",
    "event CVApproved(address indexed user, address indexed approver, uint256 timestamp)",
    "event CVRejected(address indexed user, address indexed rejector, string reason, uint256 timestamp)"
  ],
  null,
  2
)};

// Example: Connect to contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract('${contractAddress}', CVRegistry_ABI, signer);

// Example: Submit CV
async function submitCV(ipfsHash, metadataHash) {
  const tx = await contract.submitCV(ipfsHash, metadataHash);
  await tx.wait();
  console.log('CV submitted:', tx.hash);
}

// Example: Get CV status
async function getCVStatus(userAddress) {
  const status = await contract.getCVStatus(userAddress);
  const statusNames = ['None', 'Pending', 'Approved', 'Rejected'];
  console.log('CV Status:', statusNames[status]);
}

// Example: Listen for events
contract.on('CVSubmitted', (user, ipfsHash, metadataHash, timestamp) => {
  console.log('CV Submitted:', { user, ipfsHash, metadataHash, timestamp });
});
`;

  const examplesPath = path.join(__dirname, '..', 'contract-examples.js');
  fs.writeFileSync(examplesPath, examplesTemplate.trim());
  console.log('📚 Contract examples saved to:', examplesPath);

  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Add the contract address to your .env.local file');
  console.log('2. Update your frontend to use the new contract address');
  console.log('3. Test the contract functions using the provided examples');
  console.log('4. Consider verifying the contract on Etherscan');

  // Etherscan verification command
  console.log('\n🔍 To verify on Etherscan, run:');
  console.log(`npx hardhat verify --network sepolia ${contractAddress}`);

  return {
    contractAddress,
    deploymentInfo
  };
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });

module.exports = { main };