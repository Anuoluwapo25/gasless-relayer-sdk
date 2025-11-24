import type { Provider, Signer } from 'ethers';
import type { ForwardRequest, RelayResponse, RelayerConfig, TransactionStatus } from './types';

export class GaslessSDK {
  private provider: Provider;
  private config: RelayerConfig;

  constructor(provider: Provider, config: RelayerConfig) {
    this.provider = provider;
    this.config = {
      ...config,
      relayerUrl: config.relayerUrl.replace(/\/$/, ''),
    }; 
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
        { name: 'deadline', type: 'uint256' },
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
    
    // Convert string values to BigInt for signing
    const messageToSign = {
      from: request.from,
      to: request.to,
      value: BigInt(request.value),
      gas: BigInt(request.gas),
      nonce: BigInt(request.nonce),
      deadline: BigInt(request.deadline),
      data: request.data,
    };
    
    console.log('Signing with domain:', domain);
    console.log('Signing with types:', types);
    console.log('Signing message:', messageToSign);
    
    return await signer.signTypedData(domain, types, messageToSign);
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
    // const signerAddress = await signer.getAddress();

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

    console.log('Forward request:', request);

    // Sign the request (converts to BigInt internally)
    const signature = await this.signForwardRequest(signer, request);

    console.log('Generated signature:', signature);

    // Send to relayer (with string values)
    const response = await fetch(`${this.config.relayerUrl}/relay/`, {
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
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
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