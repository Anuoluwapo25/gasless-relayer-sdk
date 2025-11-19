import React, { useState, useCallback } from 'react';
import { GaslessSDK, ContractEncoder } from 'gasless-relayer-sdk';
import { Zap, Code, Rocket, Shield, CheckCircle, Copy, ExternalLink, Terminal, Book, PlayCircle } from 'lucide-react';

const GaslessSDKLanding = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(null);
  const [demoMessage, setDemoMessage] = useState('Hello Gasless World!');
  const [demoStatus, setDemoStatus] = useState('');
  const [txHash, setTxHash] = useState('');

  const copyToClipboard = useCallback((code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const installCode = `npm install ethers@^6.0.0
# or
yarn add ethers@^6.0.0`;

  const quickStartCode = `import { GaslessSDK } from './sdk/Gasless';
import { ethers } from 'ethers';

// Initialize SDK
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const sdk = new GaslessSDK(provider, {
  relayerUrl: '${window.location.origin}/api',
  forwarderAddress: '0xA7ab9c7f337574C8560f715085a53c62b275EfBf',
  chainId: 11155111 // Sepolia
});

// Send gasless transaction
const functionData = ContractEncoder.encodeSetMessage('Hello!');
const result = await sdk.relay(
  signer,
  '0x4687Bd0255892f305267487C1aFD5ff5b41354a3',
  functionData
);

console.log('Transaction:', result.txHash);`;

  const hookExampleCode = `import { useGasless } from './hooks/useGasless';
import { ContractEncoder } from './utils/contracts';

function MyComponent() {
  const { relay, isRelaying, error, txHash } = useGasless({
    relayerUrl: '${window.location.origin}/api',
    forwarderAddress: '0xA7ab9c7f337574C8560f715085a53c62b275EfBf',
    chainId: 11155111
  });

  const handleSend = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const data = ContractEncoder.encodeSetMessage('Hello!');
    await relay(signer, TARGET_CONTRACT, data);
  };

  return (
    <button onClick={handleSend} disabled={isRelaying}>
      {isRelaying ? 'Sending...' : 'Send Gasless'}
    </button>
  );
}`;

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Zero Gas Fees',
      description: 'Users can interact with smart contracts without holding ETH for gas'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'EIP-712 Signatures',
      description: 'Secure meta-transactions using industry-standard typed data signatures'
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Easy Integration',
      description: 'Simple SDK with React hooks for seamless dApp integration'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'TypeScript Support',
      description: 'Full type safety with TypeScript definitions included'
    }
  ];

  // const handleDemo = async () => {
  //   setDemoStatus('Connecting wallet...');
  //   setTxHash('');
    
  //   try {
  //     // Simulate demo flow
  //     await new Promise(resolve => setTimeout(resolve, 1000));
  //     setDemoStatus('Signing meta-transaction...');
      
  //     await new Promise(resolve => setTimeout(resolve, 1500));
  //     setDemoStatus('Relaying transaction...');
      
  //     await new Promise(resolve => setTimeout(resolve, 1500));
  //     const mockTxHash = '0x' + Array.from({length: 64}, () => 
  //       Math.floor(Math.random() * 16).toString(16)).join('');
  //     setTxHash(mockTxHash);
  //     setDemoStatus('Transaction confirmed! ✓');
      
  //   } catch (error) {
  //     setDemoStatus('Demo simulation - connect a wallet for real transactions');
  //   }
  // };
  const handleDemo = async () => {
  try {
    setDemoStatus("Connecting wallet...");
    
    // Check if MetaMask is installed
    if (!window.ethereum) {
      setDemoStatus("Please install MetaMask!");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request account access
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const sdk = new GaslessSDK(provider, {
      relayerUrl: `${window.location.origin}/api`,
      forwarderAddress: "0xA7ab9c7f337574C8560f715085a53c62b275EfBf",
      chainId: 11155111,
    });

    setDemoStatus("Encoding contract call...");
    const functionData = ContractEncoder.encodeSetMessage(demoMessage);

    setDemoStatus("Signing meta-transaction...");
    const result = await sdk.relay(
      signer,
      "0x4687Bd0255892f305267487C1aFD5ff5b41354a3",
      functionData
    );

    setDemoStatus("Relayed! Waiting for confirmation...");
    setTxHash(result.txHash);

    // Wait for transaction (this throws if it fails)
    await sdk.waitForTransaction(result.txHash);
    
    setDemoStatus("Transaction Confirmed ✓");
    
  } catch (e: any) {
    console.error(e);
    setDemoStatus(`Error: ${e.message || "Failed to send transaction"}`);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gasless SDK</h1>
                <p className="text-xs text-purple-300">Meta-transaction relayer for Ethereum</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#docs" className="text-purple-300 hover:text-white transition-colors text-sm">
                Docs
              </a>
              <a href="#playground" className="text-purple-300 hover:text-white transition-colors text-sm">
                Playground
              </a>
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-purple-300">Live on Sepolia Testnet</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Build Gasless
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Ethereum dApps
            </span>
          </h2>
          
          <p className="text-xl text-purple-200 mb-12 max-w-3xl mx-auto">
            Enable your users to interact with smart contracts without holding ETH. 
            Simple SDK, secure meta-transactions, powered by EIP-712 signatures.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="#playground"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Try Demo</span>
            </a>
            <a 
              href="#docs"
              className="px-8 py-4 bg-white/5 border border-purple-500/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-all flex items-center space-x-2"
            >
              <Book className="w-5 h-5" />
              <span>Read Docs</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Why Gasless SDK?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all"
              >
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 text-purple-400">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-purple-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section id="docs" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Documentation</h3>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {['overview', 'installation', 'quickstart', 'hooks', 'api'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-purple-300 hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 rounded-2xl p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-white">Overview</h4>
                <p className="text-purple-200">
                  Gasless SDK is a complete meta-transaction solution that allows users to interact with 
                  Ethereum smart contracts without paying gas fees. The relayer pays the gas fees on behalf 
                  of users while maintaining security through EIP-712 signatures.
                </p>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h5 className="font-semibold text-white mb-2">Key Features:</h5>
                  <ul className="space-y-2 text-purple-200">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>EIP-712 typed data signatures for security</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Nonce management and replay protection</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Deadline-based transaction expiration</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Transaction status tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'installation' && (
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-white">Installation</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-purple-200 mb-4">Install the required dependencies:</p>
                    <div className="relative">
                      <pre className="bg-black/50 border border-purple-500/30 rounded-lg p-4 overflow-x-auto">
                        <code className="text-sm text-purple-300">{installCode}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(installCode, 'install')}
                        className="absolute top-3 right-3 p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg transition-colors"
                      >
                        {copiedCode === 'install' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-purple-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-purple-200 mb-4">Copy the SDK files to your project:</p>
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                      <ul className="space-y-2 text-purple-200 text-sm">
                        <li><code className="text-pink-400">sdk/Gasless.tsx</code> - Core SDK</li>
                        <li><code className="text-pink-400">hooks/useGasless.ts</code> - React hook</li>
                        <li><code className="text-pink-400">utils/contracts.ts</code> - Contract encoders</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quickstart' && (
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-white">Quick Start</h4>
                <p className="text-purple-200">
                  Get started with a basic gasless transaction in just a few lines:
                </p>
                <div className="relative">
                  <pre className="bg-black/50 border border-purple-500/30 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-purple-300">{quickStartCode}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(quickStartCode, 'quickstart')}
                    className="absolute top-3 right-3 p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg transition-colors"
                  >
                    {copiedCode === 'quickstart' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-purple-300" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'hooks' && (
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-white">React Hooks</h4>
                <p className="text-purple-200">
                  Use the <code className="text-pink-400">useGasless</code> hook for easy React integration:
                </p>
                <div className="relative">
                  <pre className="bg-black/50 border border-purple-500/30 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-purple-300">{hookExampleCode}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(hookExampleCode, 'hook')}
                    className="absolute top-3 right-3 p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg transition-colors"
                  >
                    {copiedCode === 'hook' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-purple-300" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-white">API Reference</h4>
                
                <div className="space-y-6">
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-white mb-3">GaslessSDK</h5>
                    <div className="space-y-4 text-sm">
                      <div>
                        <code className="text-pink-400">relay(signer, targetContract, functionData, gasLimit?)</code>
                        <p className="text-purple-300 mt-2">Send a gasless meta-transaction</p>
                      </div>
                      <div>
                        <code className="text-pink-400">getNonce(address)</code>
                        <p className="text-purple-300 mt-2">Get the current nonce for an address</p>
                      </div>
                      <div>
                        <code className="text-pink-400">waitForTransaction(txHash, timeout?)</code>
                        <p className="text-purple-300 mt-2">Wait for transaction confirmation</p>
                      </div>
                      <div>
                        <code className="text-pink-400">getTransactionStatus(txHash)</code>
                        <p className="text-purple-300 mt-2">Check transaction status</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-white mb-3">ContractEncoder</h5>
                    <div className="space-y-4 text-sm">
                      <div>
                        <code className="text-pink-400">encodeSetMessage(message: string)</code>
                        <p className="text-purple-300 mt-2">Encode setMessage function call</p>
                      </div>
                      <div>
                        <code className="text-pink-400">encodeIncrementCounter()</code>
                        <p className="text-purple-300 mt-2">Encode incrementCounter function call</p>
                      </div>
                      <div>
                        <code className="text-pink-400">encode(abi, functionName, params)</code>
                        <p className="text-purple-300 mt-2">Generic encoder for any function</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Playground */}
      <section id="playground" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Interactive Playground</h3>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 rounded-2xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Message to Send
                </label>
                <input
                  type="text"
                  value={demoMessage}
                  onChange={(e) => setDemoMessage(e.target.value)}
                  className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
                  placeholder="Enter your message..."
                />
              </div>

              <button
                onClick={handleDemo}
                disabled={!demoMessage}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Terminal className="w-5 h-5" />
                <span>Send Gasless Transaction</span>
              </button>

              {demoStatus && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-200 text-sm mb-2">Status:</p>
                  <p className="text-white font-mono text-sm">{demoStatus}</p>
                  {txHash && (
                    <div className="mt-3 pt-3 border-t border-purple-500/20">
                      <p className="text-purple-200 text-sm mb-2">Transaction Hash:</p>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs text-pink-400 break-all">{txHash}</code>
                        <button
                          onClick={() => copyToClipboard(txHash, 'txhash')}
                          className="p-1 hover:bg-purple-600/20 rounded transition-colors"
                        >
                          {copiedCode === 'txhash' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-purple-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  <strong>Note:</strong> This is a demo simulation. Connect your wallet and use the actual SDK to send real gasless transactions on Sepolia testnet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Configuration</h3>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 rounded-2xl p-8">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-300 text-sm mb-1">Relayer URL</p>
                  <code className="text-white text-sm break-all">{window.location.origin}/api</code>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-300 text-sm mb-1">Chain ID</p>
                  <code className="text-white text-sm">11155111 (Sepolia)</code>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-300 text-sm mb-1">Forwarder</p>
                  <code className="text-white text-xs break-all">0xA7ab9c7f337574C8560f715085a53c62b275EfBf</code>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-300 text-sm mb-1">Target Contract</p>
                  <code className="text-white text-xs break-all">0x4687Bd0255892f305267487C1aFD5ff5b41354a3</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-purple-300">
            Built with ❤️ for the BlockDag community
          </p>
          <p className="text-purple-400 text-sm mt-2">
            Gasless SDK v1.0.3 | EIP-712 Meta-Transactions
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GaslessSDKLanding;