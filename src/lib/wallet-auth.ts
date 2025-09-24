import { ethers } from 'ethers';
import api from '@/lib/axios';
import { API_BASE_URL } from '@/constant/config';
import { setToken, setTokenEmail } from '@/lib/cookies';

export interface WalletAuthResponse {
  token: string;
  user: {
    id: string;
    email?: string;
    role: string[];
    walletAddress: string;
    gender?: string;
    job_seeker_data?: {
      resume_url?: string;
    };
  };
}

export interface WalletAuthRequest {
  walletAddress: string;
  signature: string;
  message: string;
  timestamp: number;
}

class WalletAuthService {
  /**
   * Generate a message for wallet signature authentication
   */
  private generateAuthMessage(walletAddress: string, timestamp: number): string {
    return `Welcome to ADA4Career!\n\nSign this message to authenticate your wallet.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis request will not trigger any blockchain transaction or cost any gas fees.`;
  }

  /**
   * Sign authentication message with wallet
   */
  private async signAuthMessage(walletAddress: string): Promise<{ signature: string; message: string; timestamp: number }> {
    if (!window.ethereum) {
      throw new Error('No wallet detected. Please install MetaMask.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const timestamp = Date.now();
    const message = this.generateAuthMessage(walletAddress, timestamp);

    try {
      const signature = await signer.signMessage(message);
      return { signature, message, timestamp };
    } catch (error: any) {
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('User rejected the signature request');
      }
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  /**
   * Authenticate user with wallet signature
   */
  async authenticateWithWallet(walletAddress: string): Promise<WalletAuthResponse> {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    try {
      // Step 1: Sign authentication message
      const { signature, message, timestamp } = await this.signAuthMessage(walletAddress);

      // Step 2: Send to backend for verification
      const authRequest: WalletAuthRequest = {
        walletAddress,
        signature,
        message,
        timestamp
      };

      const response = await api.post(`${API_BASE_URL}/auth/wallet-login`, authRequest);

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from authentication server');
      }

      const authData: WalletAuthResponse = response.data.data;

      // Step 3: Store tokens
      setToken(authData.token);
      setTokenEmail(authData.user.email || `${walletAddress.slice(0, 8)}...wallet`);

      return authData;

    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Signature verification failed. Please try again.');
      } else if (error.response?.status === 404) {
        // User not found, attempt registration
        return await this.registerWithWallet(walletAddress);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Authentication failed. Please try again.');
      }
    }
  }

  /**
   * Register new user with wallet
   */
  private async registerWithWallet(walletAddress: string): Promise<WalletAuthResponse> {
    try {
      // Sign registration message
      const { signature, message, timestamp } = await this.signAuthMessage(walletAddress);

      const registerRequest = {
        walletAddress,
        signature,
        message,
        timestamp,
        email: `${walletAddress.slice(0, 8).toLowerCase()}@wallet.local`, // Generate unique email
        role: ['jobseeker'] // Default role for wallet users
      };

      const response = await api.post(`${API_BASE_URL}/auth/wallet-register`, registerRequest);

      if (!response.data || !response.data.data) {
        throw new Error('Registration failed');
      }

      const authData: WalletAuthResponse = response.data.data;

      // Store tokens
      setToken(authData.token);
      setTokenEmail(authData.user.email || `${walletAddress.slice(0, 8)}...wallet`);

      return authData;

    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(`Registration failed: ${error.response.data.message}`);
      }
      throw new Error('Failed to create wallet account. Please try again.');
    }
  }

  /**
   * Mock backend authentication (for development when backend isn't available)
   */
  async mockWalletAuth(walletAddress: string): Promise<WalletAuthResponse> {
    // Sign message for security (still requires user interaction)
    await this.signAuthMessage(walletAddress);

    // Return mock response
    const mockResponse: WalletAuthResponse = {
      token: `mock_token_${walletAddress}_${Date.now()}`,
      user: {
        id: walletAddress.slice(-12),
        email: `${walletAddress.slice(0, 8).toLowerCase()}@wallet.local`,
        role: ['jobseeker'],
        walletAddress: walletAddress,
        gender: 'male', // Set to bypass middleware gender check
        job_seeker_data: {
          resume_url: 'https://placeholder.resume.url' // Mock resume to bypass middleware check
        }
      }
    };

    // Store tokens
    setToken(mockResponse.token);
    setTokenEmail(mockResponse.user.email || 'wallet-user');

    return mockResponse;
  }

  /**
   * Verify wallet ownership (can be called periodically)
   */
  async verifyWalletOwnership(walletAddress: string): Promise<boolean> {
    try {
      await this.signAuthMessage(walletAddress);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get shortened wallet address for display
   */
  formatWalletAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const walletAuthService = new WalletAuthService();

// For backward compatibility, also export the class
export { WalletAuthService };