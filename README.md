# Gasless Relayer SDK

A TypeScript SDK for sending gasless meta-transactions on Ethereum using EIP-712 signatures.

## Installation
```bash
npm install @yourname/gasless-relayer-sdk ethers@^6
```

## Quick Start
```typescript
import { GaslessSDK, ContractEncoder } from '@yourname/gasless-relayer-sdk';
import { ethers } from 'ethers';

// Initialize SDK
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const sdk = new GaslessSDK(provider, {
  relayerUrl: 'https://your-relayer.com/api',
  forwarderAddress: '0xYourForwarderAddress',
  chainId: 11155111, // Sepolia
});

// Encode function call
const functionData = ContractEncoder.encodeSetMessage('Hello World!');

// Send gasless transaction
const result = await sdk.relay(
  signer,
  '0xYourTargetContract',
  functionData
);

console.log('Transaction:', result.txHash);

// Wait for confirmation
await sdk.waitForTransaction(result.txHash);
console.log('Transaction confirmed!');
```

## API Reference

### GaslessSDK

#### `constructor(provider, config)`
Initialize the SDK with an ethers provider and configuration.

#### `relay(signer, targetContract, functionData, gasLimit?, deadlineOffset?)`
Send a gasless meta-transaction.

#### `getNonce(address)`
Get the current nonce for an address.

#### `waitForTransaction(txHash, timeout?)`
Wait for transaction confirmation.

#### `getTransactionStatus(txHash)`
Check transaction status.

### ContractEncoder

#### `encodeSetMessage(message)`
Encode a setMessage function call.

#### `encodeIncrementCounter()`
Encode an incrementCounter function call.

#### `encode(abi, functionName, params)`
Generic encoder for any function.

## License

MIT