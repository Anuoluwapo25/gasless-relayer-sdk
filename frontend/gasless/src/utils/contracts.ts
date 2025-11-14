import { ethers } from 'ethers';

export class ContractEncoder {
  static encodeSetMessage(message: string): string {
    const iface = new ethers.Interface([
      'function setMessage(string calldata message)',
    ]);
    return iface.encodeFunctionData('setMessage', [message]);
  }

  static encodeIncrementCounter(): string {
    const iface = new ethers.Interface([
      'function incrementCounter()',
    ]);
    return iface.encodeFunctionData('incrementCounter', []);
  }
}