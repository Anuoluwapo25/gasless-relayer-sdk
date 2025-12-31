import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { GaslessSDK } from 'gasless-relayer-sdk';

export const useGasless = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [sdk, setSdk] = useState<GaslessSDK | null>(null);
  const [isRelaying, setIsRelaying] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  const initialize = useCallback((newProvider: ethers.BrowserProvider, newSigner: ethers.Signer) => {
    setProvider(newProvider);
    setSigner(newSigner);

    const gaslessSDK = new GaslessSDK(newProvider, {
      relayerUrl: 'http://127.0.0.1:8000/api',
      forwarderAddress: '0xA7ab9c7f337574C8560f715085a53c62b275EfBf',
      chainId: 11155111,
    });

    setSdk(gaslessSDK);
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setSdk(null);
    setTxHash('');
    setError('');
  }, []);

  const sendTransaction = useCallback(async (
    targetContract: string,
    functionData: string,
    gasLimit: number = 150000
  ) => {
    if (!sdk || !signer) {
      setError('Wallet not connected');
      return null;
    }

    setIsRelaying(true);
    setError('');
    setTxHash('');

    try {
      const result = await sdk.relay(
        signer,
        targetContract,
        functionData,
        gasLimit
      );

      setTxHash(result.txHash);

      // Wait for confirmation
      await sdk.waitForTransaction(result.txHash);

      setIsRelaying(false);
      return result;
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      setIsRelaying(false);
      return null;
    }
  }, [sdk, signer]);

  return {
    provider,
    signer,
    sdk,
    isRelaying,
    txHash,
    error,
    initialize,
    disconnect,
    sendTransaction,
  };
};