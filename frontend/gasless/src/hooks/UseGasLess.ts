import { useState, useCallback } from 'react';
import type { Signer } from 'ethers';
import { GaslessSDK, ContractEncoder } from 'gasless-relayer-sdk';

export function useGasless(config: RelayerConfig) {
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
      if (!provider) throw new Error('No provider');
      
      const sdk = new GaslessSDK(provider, config);
      const result = await sdk.relay(signer, targetContract, functionData, gasLimit);
      setTxHash(result.txHash);
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

  const clearError = useCallback(() => setError(null), []);

  return { relay, isRelaying, error, txHash, clearError };
}