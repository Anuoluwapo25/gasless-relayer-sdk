import { ethers } from 'ethers';
import type { Provider, Signer } from 'ethers';

export interface ForwardRequest {
  from: string;
  to: string;
  value: string;
  gas: string;
  nonce: string;
  deadline: string;
  data: string;
}

export interface RelayResponse {
  txHash: string;
  status: string;
}

export interface RelayerConfig {
  relayerUrl: string;
  forwarderAddress: string;
  chainId: number;
}

export class GaslessSDK {
  private provider: Provider;
  private config: RelayerConfig;

  constructor(provider: Provider, config: RelayerConfig) {
    this.provider = provider;
    this.config = config;
  }

  /**
   * Get the current nonce for an address from the relayer
   */
  async getNonce(address: string): Promise<number> {
    const response = await fetch(
      `${this.config.relayerUrl}/nonce?address=${address}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get nonce: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.nonce;
  }

  /**
   * Create EIP-712 domain for the forwarder
   */
  private getDomain() {
    return {
      name: 'TrustedForwarder',
      version: '1',
      chainId: this.config.chainId,
      verifyingContract: this.config.forwarderAddress,
    };
  }

  /**
   * Create EIP-712 types for ForwardRequest
   */
  private getTypes() {
    return {
      ForwardRequest: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'gas', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint48' },
        { name: 'data', type: 'bytes' },
      ],
    };
  }

  /**
   * Sign a forward request using EIP-712
   */
  async signForwardRequest(
    signer: Signer,
    request: ForwardRequest
  ): Promise<string> {
    const domain = this.getDomain();
    const types = this.getTypes();
    
    return await signer.signTypedData(domain, types, request);
  }

  /**
   * Send a meta-transaction through the relayer
   */
  async relay(
    signer: Signer,
    targetContract: string,
    functionData: string,
    gasLimit: number = 150000,
    deadlineOffset: number = 3600 // 1 hour
  ): Promise<RelayResponse> {
    const signerAddress = await signer.getAddress();
    
    // Get nonce from relayer
    const nonce = await this.getNonce(signerAddress);
    
    // Create forward request
    const deadline = Math.floor(Date.now() / 1000) + deadlineOffset;
    const request: ForwardRequest = {
      from: signerAddress,
      to: targetContract,
      value: '0',
      gas: gasLimit.toString(),
      nonce: nonce.toString(),
      deadline: deadline.toString(),
      data: functionData,
    };

    // Sign the request
    const signature = await this.signForwardRequest(signer, request);

    // Send to relayer
    const response = await fetch(`${this.config.relayerUrl}/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request,
        signature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Relay failed: ${error.error || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Check the status of a relayed transaction
   */
  async getTransactionStatus(txHash: string): Promise<any> {
    const response = await fetch(
      `${this.config.relayerUrl}/status/${txHash}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Wait for transaction to be mined
   */
  async waitForTransaction(txHash: string, timeout: number = 60000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);
        if (receipt) {
          if (receipt.status === 0) {
            throw new Error('Transaction failed on-chain');
          }
          return;
        }
      } catch (error) {
        // Transaction not found yet, continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Transaction confirmation timeout');
  }
}

// ============= React Hook =============
// hooks/useGasless.ts
import { useState, useCallback } from 'react';

export interface UseGaslessReturn {
  relay: (
    signer: Signer,
    targetContract: string,
    functionData: string,
    gasLimit?: number
  ) => Promise<RelayResponse>;
  isRelaying: boolean;
  error: string | null;
  txHash: string | null;
  clearError: () => void;
}

export function useGasless(config: RelayerConfig): UseGaslessReturn {
  const [isRelaying, setIsRelaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const relay = useCallback(async (
    signer: Signer,
    targetContract: string,
    functionData: string,
    gasLimit?: number
  ): Promise<RelayResponse> => {
    setIsRelaying(true);
    setError(null);
    setTxHash(null);
    
    try {
      const provider = signer.provider;
      if (!provider) {
        throw new Error('Signer has no provider');
      }
      
      const sdk = new GaslessSDK(provider, config);
      const result = await sdk.relay(signer, targetContract, functionData, gasLimit);
      
      setTxHash(result.txHash);
      
      // Wait for confirmation
      await sdk.waitForTransaction(result.txHash);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsRelaying(false);
    }
  }, [config]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { relay, isRelaying, error, txHash, clearError };
}

// ============= Helper Functions =============
// utils/contracts.ts

/**
 * Encode function call data for common contract interactions
 */
export class ContractEncoder {
  /**
   * Encode setMessage function call
   */
  static encodeSetMessage(message: string): string {
    const iface = new ethers.Interface([
      'function setMessage(string calldata message)',
    ]);
    return iface.encodeFunctionData('setMessage', [message]);
  }

  /**
   * Encode incrementCounter function call
   */
  static encodeIncrementCounter(): string {
    const iface = new ethers.Interface([
      'function incrementCounter()',
    ]);
    return iface.encodeFunctionData('incrementCounter', []);
  }

  /**
   * Generic encoder for any function
   */
  static encode(abi: string[], functionName: string, params: any[]): string {
    const iface = new ethers.Interface(abi);
    return iface.encodeFunctionData(functionName, params);
  }
}

// ============= Usage Examples =============

// Example 1: Basic usage with Web3Modal or similar
async function example1() {
  // Assume you have a connected wallet
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const sdk = new GaslessSDK(provider, {
    relayerUrl: 'http://localhost:8000',
    forwarderAddress: '0xYourForwarderAddress',
    chainId: 11155111, // Sepolia
  });

  // Prepare function call
  const targetContract = '0xYourSampleContractAddress';
  const functionData = ContractEncoder.encodeSetMessage('Hello Gasless!');

  // Send gasless transaction
  const result = await sdk.relay(signer, targetContract, functionData);
  console.log('Transaction submitted:', result.txHash);

  // Wait for confirmation
  await sdk.waitForTransaction(result.txHash);
  console.log('Transaction confirmed!');
}

// Example 2: Using React hook
function MyComponent() {
  const [message, setMessage] = useState('');
  const { relay, isRelaying, error, txHash } = useGasless({
    relayerUrl: 'http://localhost:8000',
    forwarderAddress: '0xYourForwarderAddress',
    chainId: 11155111,
  });

  const handleSend = async () => {
    try {
      // Get signer from your wallet connection
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const targetContract = '0xYourSampleContractAddress';
      const functionData = ContractEncoder.encodeSetMessage(message);
      
      await relay(signer, targetContract, functionData);
      alert('Transaction successful!');
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  return (
    <div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={handleSend} disabled={isRelaying}>
        {isRelaying ? 'Sending...' : 'Send Gasless'}
      </button>
      {error && <div>Error: {error}</div>}
      {txHash && <div>Tx: {txHash}</div>}
    </div>
  );
}

// Example 3: Multiple actions
async function example3() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const sdk = new GaslessSDK(provider, {
    relayerUrl: 'http://localhost:8000',
    forwarderAddress: '0xYourForwarderAddress',
    chainId: 11155111,
  });

  const targetContract = '0xYourSampleContractAddress';

  // Action 1: Set message
  const setMessageData = ContractEncoder.encodeSetMessage('First message');
  const result1 = await sdk.relay(signer, targetContract, setMessageData);
  await sdk.waitForTransaction(result1.txHash);

  // Action 2: Increment counter
  const incrementData = ContractEncoder.encodeIncrementCounter();
  const result2 = await sdk.relay(signer, targetContract, incrementData);
  await sdk.waitForTransaction(result2.txHash);

  console.log('Both transactions completed!');
}