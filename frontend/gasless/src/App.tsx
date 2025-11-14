import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useGasless } from './hooks/UseGasLess';
import { ContractEncoder } from './utils/contracts';
import { Wallet, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';

const CONFIG = {
  relayerUrl: 'http://localhost:8000/api',
  forwarderAddress: '0xA7ab9c7f337574C8560f715085a53c62b275EfBf',
  targetContract: '0x4687Bd0255892f305267487C1aFD5ff5b41354a3',
  chainId: 11155111,
};

function App() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>('');
  const [message, setMessage] = useState('');

  const { relay, isRelaying, error, txHash, clearError } = useGasless({
    relayerUrl: CONFIG.relayerUrl,
    forwarderAddress: CONFIG.forwarderAddress,
    chainId: CONFIG.chainId,
  });

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      const addr = await newSigner.getAddress();

      setProvider(newProvider);
      setSigner(newSigner);
      setAddress(addr);
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  const handleSendGasless = async () => {
    if (!signer || !message.trim()) return;

    try {
      const functionData = ContractEncoder.encodeSetMessage(message);
      await relay(signer, CONFIG.targetContract, functionData);
      setMessage('');
      alert('Transaction successful!');
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Gasless Transactions Demo
        </h1>

        {!address ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={connectWallet}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold">Connected</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Address</div>
                <div className="font-mono text-sm">{address}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold">Send Transaction</h2>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  disabled={isRelaying}
                />

                <button
                  onClick={handleSendGasless}
                  disabled={isRelaying || !message.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRelaying ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    '⚡ Send Gasless'
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="text-red-700">{error}</div>
                  </div>
                )}

                {txHash && !error && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-green-700 font-medium mb-1">Success!</div>
                      <div className="text-sm text-green-600 break-all">{txHash}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;