import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
const SEPOLIA_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

type WalletConnectProps = {
  onConnect?: (provider: ethers.BrowserProvider, signer: ethers.Signer) => void;
  onDisconnect?: () => void;
};

export const WalletConnect = ({ onConnect, onDisconnect }: WalletConnectProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already connected
  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setAccount(address);
        setChainId(network.chainId.toString());
        
        if (network.chainId.toString() === '11155111') {
          onConnect?.(provider, signer);
        }
      }
    } catch (err) {
      console.error('Check connection error:', err);
    }
  };

  const handleAccountsChanged = (accounts: Array<string>) => {
    if (accounts.length === 0) {
      setAccount(null);
      onDisconnect?.();
    } else {
      setAccount(accounts[0]);
      checkConnection();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError && typeof switchError === 'object' && 'code' in switchError && (switchError as { code?: number }).code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_PARAMS],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          throw addError;
        }
      }
      throw switchError;
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      // Check if we're on Sepolia, if not, switch
      if (network.chainId.toString() !== '11155111') {
        await switchToSepolia();
        // Reload provider after network switch
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        const address = await newSigner.getAddress();
        
        setAccount(address);
        setChainId('11155111');
        onConnect?.(newProvider, newSigner);
      } else {
        const address = await signer.getAddress();
        setAccount(address);
        setChainId(network.chainId.toString());
        onConnect?.(provider, signer);
      }

    } catch (err) {
      console.error('Connection error:', err);
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    onDisconnect?.();
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isCorrectNetwork = chainId === '11155111';

  if (account) {
    return (
      <div className="flex items-center space-x-3">
        {!isCorrectNetwork && (
          <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-200">Wrong Network</span>
            <button
              onClick={switchToSepolia}
              className="ml-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
            >
              Switch to Sepolia
            </button>
          </div>
        )}
        
        {isCorrectNetwork && (
          <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-200">Sepolia</span>
          </div>
        )}

        <div className="flex items-center space-x-2 bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-2">
          <Wallet className="w-4 h-4 text-purple-300" />
          <span className="text-sm text-white font-mono">{formatAddress(account)}</span>
        </div>

        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-200 rounded-lg text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        {isConnecting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 max-w-xs">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-200">{error}</span>
        </div>
      )}
    </div>
  );
};