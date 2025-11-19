import { Interface } from "ethers";

export class ContractEncoder {
  static encodeFunction(abi: any[], functionName: string, args: any[]): string {
    const iface = new Interface(abi);
    return iface.encodeFunctionData(functionName, args);
  }
}
