export type ChainConfig = {
  chainId: number;
  chainHex: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  explorerUrl: string;
  relayerUrl: string;
  forwarderAddress: string;
  targetContract: string;
};

const env = import.meta.env;

const chainId = Number(env.VITE_CHAIN_ID ?? '7000');
const chainHex = `0x${chainId.toString(16)}`;

export const appConfig: ChainConfig = {
  chainId,
  chainHex,
  chainName: env.VITE_CHAIN_NAME ?? 'BlockDAG',
  nativeCurrency: {
    name: env.VITE_NATIVE_NAME ?? 'BDAG',
    symbol: env.VITE_NATIVE_SYMBOL ?? 'BDAG',
    decimals: Number(env.VITE_NATIVE_DECIMALS ?? 18),
  },
  rpcUrl: env.VITE_RPC_URL ?? 'https://rpc.blockdag.network',
  explorerUrl: env.VITE_EXPLORER_URL ?? 'https://explorer.blockdag.network',
  relayerUrl: env.VITE_RELAYER_URL ?? 'https://relay.awakening.bdagscan.com/api',
  forwarderAddress: env.VITE_FORWARDER_ADDRESS ?? '0x0000000000000000000000000000000000000000',
  targetContract: env.VITE_TARGET_CONTRACT ?? '0x0000000000000000000000000000000000000000',
};
