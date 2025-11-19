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

export interface TransactionStatus {
  txHash: string;
  status: 'pending' | 'success' | 'failed' | 'submitted';
  from: string;
  to: string;
  createdAt: string;
}