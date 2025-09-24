# 🚀 CVRegistry Contract Deployment Guide

## Current Status
- ✅ **Contracts**: Compiled successfully
- ✅ **Configuration**: Ready for Lisk Sepolia
- ✅ **Wallet**: `0x576A8455De3aC20E62b33dC05d77CBe3F3abE2e5`
- ❌ **Balance**: 0 ETH (NEED TESTNET ETH)

## Step 1: Get Testnet ETH 💰

### Option A: Lisk Sepolia Faucet (Recommended)
1. **Visit**: https://sepolia-faucet.lisk.com
2. **Enter your address**: `0x576A8455De3aC20E62b33dC05d77CBe3F3abE2e5`
3. **Request ETH**: Click "Send me ETH"
4. **Wait**: 1-2 minutes for transaction

### Option B: Alternative Faucets
If Lisk faucet doesn't work, try these for Ethereum Sepolia:
1. https://sepoliafaucet.com
2. https://www.alchemy.com/faucets/ethereum-sepolia
3. https://sepolia-faucet.pk910.de

## Step 2: Verify Balance ✅

Run this command to check your balance:
```bash
node scripts/check-balance.js
```

You should see something like:
```
💰 Balance: 0.1 ETH
✅ Can deploy: YES
```

## Step 3: Deploy Contract 🚀

Once you have ETH (minimum 0.01 ETH needed):

### For Lisk Sepolia:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### For Ethereum Sepolia (if you got ETH from Ethereum faucets):
```bash
npx hardhat run scripts/deploy.js --network eth-sepolia
```

## Step 4: Expected Output ✅

A successful deployment will show:
```
🚀 Starting CVRegistry deployment to Sepolia...
🌐 Connected to network: sepolia Chain ID: 4202
📝 Deploying with account: 0x576A8455De3aC20E62b33dC05d77CBe3F3abE2e5
💰 Account balance: 0.1 ETH
🔨 Deploying CVRegistry contract...
✅ CVRegistry deployed to: 0x1234567890abcdef...
🔗 Transaction hash: 0xabcdef1234567890...
👤 Contract owner: 0x576A8455De3aC20E62b33dC05d77CBe3F3abE2e5
⛽ Gas used: 1656409
💾 Deployment info saved to: deployments/sepolia-deployment.json
🌍 Environment variables saved to: .env.contract
📚 Contract examples saved to: contract-examples.js
```

## Step 5: Update Frontend Configuration 🎯

After successful deployment, update your `.env.local`:

```env
# Copy the contract address from deployment output
NEXT_PUBLIC_CV_REGISTRY_ADDRESS=0x1234567890abcdef...  # Replace with actual address
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=4202  # For Lisk Sepolia
```

## Step 6: Verify Contract (Optional) 🔍

If you want to verify on block explorer:
```bash
# Replace CONTRACT_ADDRESS with your deployed address
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Troubleshooting 🛠️

### "Insufficient funds" error:
- Check balance: `node scripts/check-balance.js`
- Need minimum 0.01 ETH for deployment
- Get more from faucet

### "Network connection" error:
- Check internet connection
- Try different RPC endpoint
- Wait and retry

### "Private key" error:
- Ensure PRIVATE_KEY is set in .env.local
- Don't share your private key with anyone

## Need Help? 🆘

1. **Check Balance**: `node scripts/check-balance.js`
2. **Compile Contracts**: `npx hardhat compile`
3. **Test Locally**: `npx hardhat test`

## Security Notes 🔒

- ✅ Your private key is safely stored in .env.local
- ✅ Never commit .env.local to git
- ✅ This is testnet ETH (no real value)
- ✅ Contract will be owned by your wallet address

---

**Your Wallet Address**: `0x576A8455De3aC20E62b33dC05d77CBe3F3abE2e5`
**Network**: Lisk Sepolia (Chain ID: 4202)
**Contract**: CVRegistry.sol