const { ethers } = require('hardhat');
require('dotenv').config({ path: '.env.local' });

async function checkBalanceOnNetwork(networkName, rpcUrl, chainId) {
  try {
    console.log(`\n🔍 Checking ${networkName} (Chain ID: ${chainId})`);
    console.log(`📡 RPC: ${rpcUrl}`);

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Test connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to: ${network.name} (${Number(network.chainId)})`);

    // Check if we have a private key
    if (!process.env.PRIVATE_KEY) {
      console.log('❌ No private key found in environment');
      return null;
    }

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;
    const balance = await provider.getBalance(address);
    const balanceETH = ethers.formatEther(balance);

    console.log(`💰 Address: ${address}`);
    console.log(`💰 Balance: ${balanceETH} ETH`);

    const hasEnoughForDeployment = parseFloat(balanceETH) >= 0.01;
    console.log(`✅ Can deploy: ${hasEnoughForDeployment ? 'YES' : 'NO'} (need ~0.01 ETH)`);

    return {
      networkName,
      chainId,
      address,
      balance: balanceETH,
      canDeploy: hasEnoughForDeployment
    };

  } catch (error) {
    console.log(`❌ Failed to connect to ${networkName}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Checking wallet balance across different testnets...\n');

  const networks = [
    {
      name: 'Lisk Sepolia',
      rpc: 'https://rpc.sepolia-api.lisk.com',
      chainId: 4202
    },
    {
      name: 'Ethereum Sepolia',
      rpc: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      chainId: 11155111
    },
    {
      name: 'Polygon Mumbai',
      rpc: 'https://rpc-mumbai.maticvigil.com',
      chainId: 80001
    }
  ];

  const results = [];

  for (const network of networks) {
    const result = await checkBalanceOnNetwork(network.name, network.rpc, network.chainId);
    if (result) {
      results.push(result);
    }
  }

  console.log('\n📊 SUMMARY:');
  console.log('============');

  if (results.length === 0) {
    console.log('❌ Could not connect to any networks');
    return;
  }

  const deployableNetworks = results.filter(r => r.canDeploy);

  if (deployableNetworks.length > 0) {
    console.log('\n✅ Ready to deploy on:');
    deployableNetworks.forEach(network => {
      console.log(`   • ${network.networkName}: ${network.balance} ETH`);
    });

    const recommended = deployableNetworks[0];
    console.log(`\n🎯 RECOMMENDED: Deploy to ${recommended.networkName}`);

    if (recommended.chainId === 4202) {
      console.log('📝 Deploy command: npx hardhat run scripts/deploy.js --network sepolia');
    } else if (recommended.chainId === 11155111) {
      console.log('📝 Deploy command: npx hardhat run scripts/deploy.js --network eth-sepolia');
    }

  } else {
    console.log('\n❌ No networks with sufficient balance found');
    console.log('\n🔗 Get testnet ETH from these faucets:');

    results.forEach(network => {
      console.log(`\n${network.networkName}:`);
      if (network.chainId === 4202) {
        console.log('   • https://sepolia-faucet.lisk.com');
      } else if (network.chainId === 11155111) {
        console.log('   • https://sepoliafaucet.com');
        console.log('   • https://www.alchemy.com/faucets/ethereum-sepolia');
      } else if (network.chainId === 80001) {
        console.log('   • https://faucet.polygon.technology');
      }
      console.log(`   Address: ${network.address}`);
    });
  }

  console.log('\n💡 TIP: You need ~0.01 ETH for deployment');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });