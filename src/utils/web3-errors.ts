// Web3 Error Classification and Handling

export interface Web3ErrorInfo {
  type: 'user' | 'network' | 'contract' | 'system' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
  code?: string | number;
  recoverable: boolean;
  retryable: boolean;
}

export interface ErrorWithCode extends Error {
  code?: string | number;
  reason?: string;
  data?: any;
}

/**
 * Analyze and classify Web3 errors for better user experience
 */
export function analyzeWeb3Error(error: any): Web3ErrorInfo {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code;
  const errorReason = error?.reason?.toLowerCase() || '';

  // User rejection errors
  if (errorCode === 4001 || errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
    return {
      type: 'user',
      severity: 'low',
      message: 'Transaction was rejected by user',
      suggestion: 'Please approve the transaction in your wallet to continue',
      code: errorCode,
      recoverable: true,
      retryable: true
    };
  }

  // Insufficient funds
  if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
    return {
      type: 'user',
      severity: 'medium',
      message: 'Insufficient funds for transaction',
      suggestion: 'Please ensure you have enough ETH/MATIC for gas fees and try again',
      code: errorCode,
      recoverable: true,
      retryable: false
    };
  }

  // Gas estimation errors
  if (errorMessage.includes('gas') && (errorMessage.includes('estimation failed') || errorMessage.includes('out of gas'))) {
    return {
      type: 'contract',
      severity: 'medium',
      message: 'Transaction would fail due to gas issues',
      suggestion: 'The transaction may revert. Check your inputs or try increasing gas limit',
      code: errorCode,
      recoverable: true,
      retryable: true
    };
  }

  // Network errors
  if (errorCode === 'NETWORK_ERROR' || errorMessage.includes('network') || errorMessage.includes('connection')) {
    return {
      type: 'network',
      severity: 'medium',
      message: 'Network connection error',
      suggestion: 'Please check your internet connection and try again',
      code: errorCode,
      recoverable: true,
      retryable: true
    };
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorCode === 'TIMEOUT') {
    return {
      type: 'network',
      severity: 'medium',
      message: 'Transaction timeout',
      suggestion: 'The network is congested. Try increasing gas price or retry later',
      code: errorCode,
      recoverable: true,
      retryable: true
    };
  }

  // Nonce errors
  if (errorMessage.includes('nonce') && (errorMessage.includes('too low') || errorMessage.includes('too high'))) {
    return {
      type: 'system',
      severity: 'medium',
      message: 'Nonce synchronization issue',
      suggestion: 'Please reset your wallet account or try again in a few moments',
      code: errorCode,
      recoverable: true,
      retryable: true
    };
  }

  // Replacement transaction underpriced
  if (errorMessage.includes('replacement transaction underpriced') || errorMessage.includes('underpriced')) {
    return {
      type: 'system',
      severity: 'low',
      message: 'Gas price too low for replacement',
      suggestion: 'Increase gas price to speed up the transaction',
      code: errorCode,
      recoverable: true,
      retryable: true
    };
  }

  // Contract revert errors
  if (errorMessage.includes('revert') || errorReason.includes('revert')) {
    const revertReason = error?.reason || 'Transaction reverted';
    return {
      type: 'contract',
      severity: 'high',
      message: `Contract error: ${revertReason}`,
      suggestion: 'The smart contract rejected this transaction. Please check your inputs',
      code: errorCode,
      recoverable: false,
      retryable: false
    };
  }

  // Execution reverted (more specific)
  if (errorMessage.includes('execution reverted')) {
    const reason = extractRevertReason(error);
    return {
      type: 'contract',
      severity: 'high',
      message: reason || 'Contract execution failed',
      suggestion: getContractErrorSuggestion(reason),
      code: errorCode,
      recoverable: false,
      retryable: false
    };
  }

  // Wrong network
  if (errorMessage.includes('chain') && errorMessage.includes('unsupported')) {
    return {
      type: 'network',
      severity: 'medium',
      message: 'Unsupported network',
      suggestion: 'Please switch to a supported network (Lisk Sepolia, Ethereum, etc.)',
      code: errorCode,
      recoverable: true,
      retryable: false
    };
  }

  // MetaMask locked
  if (errorMessage.includes('metamask') && errorMessage.includes('locked')) {
    return {
      type: 'user',
      severity: 'medium',
      message: 'Wallet is locked',
      suggestion: 'Please unlock your MetaMask wallet and try again',
      code: errorCode,
      recoverable: true,
      retryable: true
    };
  }

  // RPC errors
  if (errorMessage.includes('rpc') || errorMessage.includes('json-rpc')) {
    return {
      type: 'network',
      severity: 'medium',
      message: 'RPC provider error',
      suggestion: 'The network provider is experiencing issues. Try again or switch RPC endpoint',
      code: errorCode,
      recoverable: true,
      retryable: true
    };
  }

  // Unknown error
  return {
    type: 'unknown',
    severity: 'medium',
    message: error?.message || 'Unknown error occurred',
    suggestion: 'An unexpected error occurred. Please try again or contact support',
    code: errorCode,
    recoverable: true,
    retryable: true
  };
}

/**
 * Extract revert reason from error
 */
function extractRevertReason(error: any): string | null {
  // Try to extract from different error formats
  const sources = [
    error?.reason,
    error?.data?.message,
    error?.error?.message,
    error?.message
  ];

  for (const source of sources) {
    if (source && typeof source === 'string') {
      // Look for common revert patterns
      const revertMatch = source.match(/revert\s+(.+?)(?:\s|$)/i);
      if (revertMatch) {
        return revertMatch[1];
      }

      // Look for execution reverted patterns
      const executionMatch = source.match(/execution reverted:\s*(.+?)(?:\s|$)/i);
      if (executionMatch) {
        return executionMatch[1];
      }
    }
  }

  return null;
}

/**
 * Provide specific suggestions based on contract error
 */
function getContractErrorSuggestion(reason: string | null): string {
  if (!reason) {
    return 'Please verify your transaction parameters and try again';
  }

  const lowerReason = reason.toLowerCase();

  if (lowerReason.includes('hash already used')) {
    return 'This CV content already exists. Please modify your CV and try again';
  }

  if (lowerReason.includes('cv already submitted')) {
    return 'You have already submitted a CV. You can only update it if it\'s pending or rejected';
  }

  if (lowerReason.includes('not authorized') || lowerReason.includes('only approver')) {
    return 'You don\'t have permission to perform this action. Only approvers can approve/reject CVs';
  }

  if (lowerReason.includes('cv not pending')) {
    return 'This CV is not in pending status and cannot be modified';
  }

  if (lowerReason.includes('hash cannot be empty')) {
    return 'Invalid CV data. Please ensure all required fields are filled';
  }

  if (lowerReason.includes('can only update pending')) {
    return 'You can only update CVs that are in pending status';
  }

  return 'Transaction failed due to contract validation. Please check your inputs';
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: any): { title: string; message: string; severity: string } {
  const errorInfo = analyzeWeb3Error(error);

  const titles = {
    user: 'Action Required',
    network: 'Network Issue',
    contract: 'Transaction Failed',
    system: 'System Issue',
    unknown: 'Error Occurred'
  };

  return {
    title: titles[errorInfo.type],
    message: errorInfo.suggestion || errorInfo.message,
    severity: errorInfo.severity
  };
}

/**
 * Check if error should trigger a retry
 */
export function shouldRetryError(error: any): boolean {
  const errorInfo = analyzeWeb3Error(error);
  return errorInfo.retryable;
}

/**
 * Get retry delay based on error type
 */
export function getRetryDelay(error: any, attempt: number): number {
  const errorInfo = analyzeWeb3Error(error);

  const baseDelays = {
    user: 1000,      // Quick retry for user errors
    network: 3000,   // Longer for network issues
    contract: 0,     // No retry for contract errors
    system: 2000,    // Medium for system issues
    unknown: 2000    // Medium for unknown errors
  };

  const baseDelay = baseDelays[errorInfo.type];
  return baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
}

/**
 * Log error for monitoring
 */
export function logWeb3Error(error: any, context: string): void {
  const errorInfo = analyzeWeb3Error(error);

  const logData = {
    timestamp: new Date().toISOString(),
    context,
    type: errorInfo.type,
    severity: errorInfo.severity,
    message: errorInfo.message,
    code: errorInfo.code,
    original: error?.message,
    stack: error?.stack,
    recoverable: errorInfo.recoverable,
    retryable: errorInfo.retryable
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Web3 Error [${errorInfo.severity.toUpperCase()}]`);
    console.error('Context:', context);
    console.error('Type:', errorInfo.type);
    console.error('Message:', errorInfo.message);
    if (errorInfo.suggestion) {
      console.info('Suggestion:', errorInfo.suggestion);
    }
    console.error('Original Error:', error);
    console.groupEnd();
  }

  // In production, send to monitoring service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // window.gtag?.('event', 'web3_error', {
    //   error_type: errorInfo.type,
    //   error_severity: errorInfo.severity,
    //   error_context: context
    // });
  }
}