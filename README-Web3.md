# ADA4Career Web3 Integration Guide

## Overview

This guide covers the Web3 integration for ADA4Career, transforming it from a traditional web application into a decentralized application (dApp) with blockchain-based CV verification.

## Features

### ✅ Implemented Features

1. **Wallet Integration**
   - MetaMask connection support
   - Wallet state management with React Context
   - Network switching to Sepolia testnet
   - Connection persistence across sessions

2. **Smart Contract**
   - CVRegistry contract for CV management
   - IPFS hash storage and metadata
   - Approval workflow (Pending → Approved/Rejected)
   - Role-based access control for approvers
   - Event emission for all CV actions

3. **Frontend Integration**
   - Web3-enabled CV builder component
   - Real-time blockchain status indicators
   - IPFS upload simulation
   - Transaction tracking and monitoring

4. **Development Infrastructure**
   - Hardhat setup for contract development
   - Comprehensive test suite
   - Deployment scripts for Sepolia testnet
   - Contract verification on Etherscan

## Project Structure

```
├── contracts/
│   └── CVRegistry.sol              # Main smart contract
├── scripts/
│   └── deploy.js                   # Deployment script
├── test/
│   └── CVRegistry.test.js          # Contract tests
├── src/
│   ├── contexts/
│   │   └── Web3Context.tsx         # Web3 provider and hooks
│   ├── hooks/
│   │   ├── useIPFS.ts              # IPFS upload utilities
│   │   └── useWeb3Transactions.ts  # Transaction management
│   ├── types/
│   │   └── web3.types.ts           # TypeScript definitions
│   └── components/features/web3/
│       ├── WalletConnectButton.tsx # Wallet connection UI
│       ├── CVStatusIndicator.tsx   # Status display
│       └── Web3CVBuilder.tsx       # Main CV builder
└── hardhat.config.js               # Hardhat configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env.local
```

Configure the following variables:

```env
# Web3 Configuration
NEXT_PUBLIC_CV_REGISTRY_ADDRESS=<CONTRACT_ADDRESS>
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111

# Hardhat Configuration
PRIVATE_KEY=<YOUR_PRIVATE_KEY>
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<YOUR_PROJECT_ID>
ETHERSCAN_API_KEY=<YOUR_ETHERSCAN_API_KEY>
```

### 3. Smart Contract Deployment

```bash
# Compile contracts
npm run compile

# Run tests
npm run test:contracts

# Deploy to Sepolia
npm run deploy:sepolia

# Verify on Etherscan (optional)
npm run verify:sepolia <CONTRACT_ADDRESS>
```

### 4. Frontend Development

```bash
# Start development server
npm run dev
```

Visit `http://localhost:3000/en/app/cv-builder` to access the Web3 CV builder.

## Smart Contract Details

### CVRegistry Contract

**Address**: `<DEPLOYED_CONTRACT_ADDRESS>`
**Network**: Sepolia Testnet
**Chain ID**: 11155111

#### Key Functions

- `submitCV(string ipfsHash, string metadataHash)` - Submit new CV
- `updateCV(string ipfsHash, string metadataHash)` - Update pending CV
- `approveCV(address user)` - Approve CV (approvers only)
- `rejectCV(address user, string reason)` - Reject CV (approvers only)
- `getCVRecord(address user)` - Get complete CV record
- `getCVStatus(address user)` - Get CV status only

#### Events

- `CVSubmitted(address user, string ipfsHash, string metadataHash, uint256 timestamp)`
- `CVUpdated(address user, string oldIpfsHash, string newIpfsHash, string newMetadataHash, uint256 timestamp)`
- `CVApproved(address user, address approver, uint256 timestamp)`
- `CVRejected(address user, address rejector, string reason, uint256 timestamp)`

## Usage Guide

### For Users

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select MetaMask
   - Approve connection and network switch to Sepolia

2. **Build CV**
   - Fill in personal information, skills, experience, education
   - Optionally upload CV document (PDF/DOC)
   - Click "Save to Blockchain"

3. **Monitor Status**
   - View real-time status: None → Pending → Approved/Rejected
   - Track transaction hashes and confirmations
   - Receive notifications on status changes

### For Approvers

1. **Get Approver Role**
   - Contract owner can add approvers using `addApprover(address)`
   - Owner is automatically an approver

2. **Manage Submissions**
   - Use contract functions to approve/reject CVs
   - Provide rejection reasons for user feedback

## Development Notes

### Current Limitations

1. **IPFS Integration**: Currently using mock IPFS service. For production:
   - Integrate with real IPFS (Pinata, Infura, or self-hosted)
   - Implement proper file uploading and metadata management

2. **Network Support**: Only Sepolia testnet supported
   - Can be extended to other networks by updating configuration

3. **Wallet Support**: Only MetaMask implemented
   - WalletConnect integration placeholder exists

### Production Considerations

1. **Security**
   - Ensure proper access controls
   - Validate all inputs
   - Implement rate limiting

2. **Gas Optimization**
   - Consider batch operations
   - Optimize contract storage patterns
   - Implement gas estimation

3. **User Experience**
   - Add loading states and progress indicators
   - Implement proper error handling
   - Add transaction retry mechanisms

## Testing

### Contract Tests

```bash
npm run test:contracts
```

Tests cover:
- Basic contract functionality
- Access control
- Edge cases and error conditions
- Gas optimization scenarios

### Frontend Testing

The existing Jest setup can be extended to test Web3 components:

```bash
npm run test
```

## Deployment

### Testnet Deployment (Sepolia)

1. Ensure you have test ETH in your wallet
2. Configure environment variables
3. Run deployment script:

```bash
npm run deploy:sepolia
```

### Mainnet Deployment (Future)

1. Update hardhat.config.js with mainnet configuration
2. Ensure sufficient ETH for deployment
3. Deploy and verify contract
4. Update frontend configuration

## Troubleshooting

### Common Issues

1. **Wallet Connection Fails**
   - Check if MetaMask is installed
   - Ensure you're on the correct network
   - Clear browser cache/cookies

2. **Transaction Fails**
   - Check wallet balance (need ETH for gas)
   - Ensure contract address is correct
   - Verify network configuration

3. **Contract Interaction Fails**
   - Verify contract is deployed and verified
   - Check ABI matches deployed contract
   - Ensure proper permissions for approver functions

### Debug Tools

1. **Browser Console**: Check for JavaScript errors
2. **MetaMask**: View transaction details and status
3. **Etherscan**: Track transactions and contract interactions
4. **Hardhat Console**: For contract debugging

## Contributing

When contributing to the Web3 integration:

1. Follow existing code patterns and structure
2. Add comprehensive tests for new functionality
3. Update documentation for any changes
4. Consider gas costs and user experience
5. Test thoroughly on Sepolia before mainnet deployment

## Security Considerations

1. **Private Key Management**
   - Never commit private keys to version control
   - Use environment variables for sensitive data
   - Consider using hardware wallets for production

2. **Smart Contract Security**
   - All contracts follow OpenZeppelin standards
   - Implement proper access controls
   - Consider formal audits before mainnet deployment

3. **Frontend Security**
   - Validate all user inputs
   - Implement proper error handling
   - Use secure communication with backend services

## Future Enhancements

1. **Multi-chain Support**: Extend to other EVM networks
2. **Enhanced IPFS**: Real IPFS integration with CDN
3. **Advanced Features**: CV versioning, endorsements, skill verification
4. **Mobile Support**: Web3 wallet integration for mobile
5. **Governance**: DAO-based approver management

---

For technical support or questions, please refer to the main project documentation or create an issue in the repository.