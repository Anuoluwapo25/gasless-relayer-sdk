# from web3 import Web3
# from eth_account import Account
# from eth_account.messages import encode_typed_data 
# import os
# from dotenv import load_dotenv

# load_dotenv()  
# class RelayerService:
#     def __init__(self):
#         self.w3 = Web3(Web3.HTTPProvider(os.getenv('RPC_URL')))  
#         self.relayer_key = os.getenv('RELAYER_PRIVATE_KEY')
#         self.relayer_account = Account.from_key(self.relayer_key)

#     def get_nonce(self, address: str) -> int:
#         if not hasattr(self, '_nonce_cache'):
#             self._nonce_cache = {}
#         self._nonce_cache[address] = self._nonce_cache.get(address, 0)
#         nonce = self._nonce_cache[address]
#         self._nonce_cache[address] += 1
#         return nonce

#     def verify_signature(self, request: dict, signature: str) -> bool:
#         try:
#             # EIP-712 domain
#             domain = {
#                 "name": "TrustedForwarder",
#                 "version": "1",
#                 "chainId": request.get('chainId'), 
#                 "verifyingContract": "0xYourForwarderAddress"
#             }

#             # EIP-712 types
#             types = {
#                 "EIP712Domain": [
#                     {"name": "name", "type": "string"},
#                     {"name": "version", "type": "string"},
#                     {"name": "chainId", "type": "uint256"},
#                     {"name": "verifyingContract", "type": "address"}
#                 ],
#                 "ForwardRequest": [
#                     {"name": "from", "type": "address"},
#                     {"name": "to", "type": "address"},
#                     {"name": "value", "type": "uint256"},
#                     {"name": "gas", "type": "uint256"},
#                     {"name": "nonce", "type": "uint256"},
#                     {"name": "deadline", "type": "uint48"},
#                     {"name": "data", "type": "bytes"}
#                 ]
#             }

#             message = {
#                 "from": request['from'],
#                 "to": request['to'],
#                 "value": int(request['value']),
#                 "gas": int(request['gas']),
#                 "nonce": int(request['nonce']),
#                 "deadline": int(request['deadline']),
#                 "data": request['data']
#             }

#             # Encode EIP-712
#             encoded = encode_typed_data(domain, types, message)
#             # Recover signer
#             signer = Account.recover_message(encoded, signature=signature)
#             return signer.lower() == request['from'].lower()
#         except Exception as e:
#             print(f"Signature verification failed: {e}")
#             return False

#     def relay_transaction(self, request: dict, signature: str) -> str:
#         # Build transaction via forwarder
#         forwarder_abi = [
#             {
#                 "type": "function",
#                 "name": "eip712Domain",
#                 "inputs": [],
#                 "outputs": [
#                 {
#                     "name": "fields",
#                     "type": "bytes1",
#                     "internalType": "bytes1"
#                 },
#                 {
#                     "name": "name",
#                     "type": "string",
#                     "internalType": "string"
#                 },
#                 {
#                     "name": "version",
#                     "type": "string",
#                     "internalType": "string"
#                 },
#                 {
#                     "name": "chainId",
#                     "type": "uint256",
#                     "internalType": "uint256"
#                 },
#                 {
#                     "name": "verifyingContract",
#                     "type": "address",
#                     "internalType": "address"
#                 },
#                 {
#                     "name": "salt",
#                     "type": "bytes32",
#                     "internalType": "bytes32"
#                 },
#                 {
#                     "name": "extensions",
#                     "type": "uint256[]",
#                     "internalType": "uint256[]"
#                 }
#                 ],
#                 "stateMutability": "view"
#             },
#             {
#                 "type": "function",
#                 "name": "execute",
#                 "inputs": [
#                 {
#                     "name": "req",
#                     "type": "tuple",
#                     "internalType": "struct MinimalForwarder.ForwardRequest",
#                     "components": [
#                     {
#                         "name": "from",
#                         "type": "address",
#                         "internalType": "address"
#                     },
#                     {
#                         "name": "to",
#                         "type": "address",
#                         "internalType": "address"
#                     },
#                     {
#                         "name": "value",
#                         "type": "uint256",
#                         "internalType": "uint256"
#                     },
#                     {
#                         "name": "gas",
#                         "type": "uint256",
#                         "internalType": "uint256"
#                     },
#                     {
#                         "name": "nonce",
#                         "type": "uint256",
#                         "internalType": "uint256"
#                     },
#                     {
#                         "name": "data",
#                         "type": "bytes",
#                         "internalType": "bytes"
#                     }
#                     ]
#                 },
#                 {
#                     "name": "signature",
#                     "type": "bytes",
#                     "internalType": "bytes"
#                 }
#                 ],
#                 "outputs": [
#                 {
#                     "name": "",
#                     "type": "bool",
#                     "internalType": "bool"
#                 },
#                 {
#                     "name": "",
#                     "type": "bytes",
#                     "internalType": "bytes"
#                 }
#                 ],
#                 "stateMutability": "payable"
#             },
#             {
#                 "type": "function",
#                 "name": "getNonce",
#                 "inputs": [
#                 {
#                     "name": "from",
#                     "type": "address",
#                     "internalType": "address"
#                 }
#                 ],
#                 "outputs": [
#                 {
#                     "name": "",
#                     "type": "uint256",
#                     "internalType": "uint256"
#                 }
#                 ],
#                 "stateMutability": "view"
#             },
#             {
#                 "type": "function",
#                 "name": "verify",
#                 "inputs": [
#                 {
#                     "name": "req",
#                     "type": "tuple",
#                     "internalType": "struct MinimalForwarder.ForwardRequest",
#                     "components": [
#                     {
#                         "name": "from",
#                         "type": "address",
#                         "internalType": "address"
#                     },
#                     {
#                         "name": "to",
#                         "type": "address",
#                         "internalType": "address"
#                     },
#                     {
#                         "name": "value",
#                         "type": "uint256",
#                         "internalType": "uint256"
#                     },
#                     {
#                         "name": "gas",
#                         "type": "uint256",
#                         "internalType": "uint256"
#                     },
#                     {
#                         "name": "nonce",
#                         "type": "uint256",
#                         "internalType": "uint256"
#                     },
#                     {
#                         "name": "data",
#                         "type": "bytes",
#                         "internalType": "bytes"
#                     }
#                     ]
#                 },
#                 {
#                     "name": "signature",
#                     "type": "bytes",
#                     "internalType": "bytes"
#                 }
#                 ],
#                 "outputs": [
#                 {
#                     "name": "",
#                     "type": "bool",
#                     "internalType": "bool"
#                 }
#                 ],
#                 "stateMutability": "view"
#             },
#             {
#                 "type": "event",
#                 "name": "EIP712DomainChanged",
#                 "inputs": [],
#                 "anonymous": false
#             },
#             {
#                 "type": "error",
#                 "name": "InvalidShortString",
#                 "inputs": []
#             },
#             {
#                 "type": "error",
#                 "name": "StringTooLong",
#                 "inputs": [
#                 {
#                     "name": "str",
#                     "type": "string",
#                     "internalType": "string"
#                 }
#                 ]
#             }
#             ]
#         forwarder = self.w3.eth.contract(
#             address=request['to'], 
#             abi=forwarder_abi
#         )

#         # Actually: forwarder is fixed
#         forwarder_address = "0xA7ab9c7f337574C8560f715085a53c62b275EfBf"
#         forwarder = self.w3.eth.contract(address=forwarder_address, abi=forwarder_abi)

#         tx = forwarder.functions.execute(
#             (
#                 request['from'],
#                 request['to'],
#                 request['value'],
#                 request['gas'],
#                 request['nonce'],
#                 request['deadline'],
#                 request['data']
#             ),
#             signature
#         ).build_transaction({
#             'from': self.relayer_account.address,
#             'gas': 500000,
#             'gasPrice': self.w3.eth.gas_price,
#             'nonce': self.w3.eth.get_transaction_count(self.relayer_account.address),
#         })

#         signed_tx = self.w3.eth.account.sign_transaction(tx, self.relayer_key)
#         tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
#         return tx_hash.hex()


import os
import time
from web3 import Web3
from dotenv import load_dotenv
from eth_account import Account
from eth_account.messages import encode_typed_data 

encode_eip712 = encode_typed_data if 'encode_typed_data' in globals() else encode_structured_data


load_dotenv()

class RelayerService:
    def __init__(self):
        infura_url = os.getenv('RPC_URL')
        if not infura_url:
            raise ValueError("RPC_URL not set in .env")
        
        self.w3 = Web3(Web3.HTTPProvider(infura_url))
        if not self.w3.is_connected():
            raise ValueError("Failed to connect to Web3 provider")

        private_key = os.getenv('RELAYER_PRIVATE_KEY')
        if not private_key:
            raise ValueError("RELAYER_PRIVATE_KEY not set in .env")
        
        private_key = private_key.strip()
        if not private_key.startswith('0x'):
            private_key = '0x' + private_key
        
        if len(private_key) != 66 or not all(c in '0123456789abcdefABCDEFx' for c in private_key[2:]):
            raise ValueError(f"Invalid private key: {private_key[:10]}... (must be 64 hex chars + 0x)")

        self.relayer_key = private_key
        self.relayer_account = Account.from_key(self.relayer_key)
        print(f"Relayer loaded: {self.relayer_account.address}")

        self.forwarder_address = os.getenv('FORWARDER_ADDRESS')
        if not self.forwarder_address:
            raise ValueError("FORWARDER_ADDRESS not set in .env")

        self.chain_id = int(os.getenv('CHAIN_ID', 11155111))

    def get_nonce(self, address: str) -> int:
        # Simple in-memory cache; replace with DB query in production
        if not hasattr(self, '_nonce_cache'):
            self._nonce_cache = {}
        self._nonce_cache[address] = self._nonce_cache.get(address, 0)
        nonce = self._nonce_cache[address]
        self._nonce_cache[address] += 1
        return nonce

    def verify_signature(self, request: dict, signature: str) -> bool:
        try:
            # EIP-712 domain
            domain = {
                "name": "TrustedForwarder",
                "version": "1",
                "chainId": self.chain_id,
                "verifyingContract": self.forwarder_address,
            }

            # EIP-712 types (include EIP712Domain for full encoding)
            types = {
                "EIP712Domain": [
                    {"name": "name", "type": "string"},
                    {"name": "version", "type": "string"},
                    {"name": "chainId", "type": "uint256"},
                    {"name": "verifyingContract", "type": "address"},
                ],
                "ForwardRequest": [
                    {"name": "from", "type": "address"},
                    {"name": "to", "type": "address"},
                    {"name": "value", "type": "uint256"},
                    {"name": "gas", "type": "uint256"},
                    {"name": "nonce", "type": "uint256"},
                    {"name": "deadline", "type": "uint48"},
                    {"name": "data", "type": "bytes"},
                ],
            }

            # Convert string values to ints for numeric fields
            message = {
                "from": request['from'],
                "to": request['to'],
                "value": int(request['value']),
                "gas": int(request['gas']),
                "nonce": int(request['nonce']),
                "deadline": int(request['deadline']),
                "data": request['data'],
            }

            # Encode using the new import
            encoded_message = encode_typed_data(domain=domain, message_types=types, message=message)
            
            # Recover the signer
            recovered_signer = Account.recover_message(encoded_message, signature=signature)
            return recovered_signer.lower() == request['from'].lower()
        except Exception as e:
            print(f"Signature verification failed: {e}")
            return False

    def relay_transaction(self, request: dict, signature: str) -> str:
        # Minimal ABI for the forwarder contract's `execute` function
        forwarder_abi = [
            {
                "inputs": [
                    {
                        "components": [
                            {"name": "from", "type": "address"},
                            {"name": "to", "type": "address"},
                            {"name": "value", "type": "uint256"},
                            {"name": "gas", "type": "uint256"},
                            {"name": "nonce", "type": "uint256"},
                            {"name": "deadline", "type": "uint48"},
                            {"name": "data", "type": "bytes"},
                        ],
                        "name": "req",
                        "type": "tuple",
                    },
                    {"name": "signature", "type": "bytes"},
                ],
                "name": "execute",
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function",
            }
        ]

        forwarder = self.w3.eth.contract(address=self.forwarder_address, abi=forwarder_abi)

        # Build the request tuple
        req = (
            request['from'],
            request['to'],
            int(request['value']),
            int(request['gas']),
            int(request['nonce']),
            int(request['deadline']),
            request['data'],
        )

        # Build and sign the transaction
        tx = forwarder.functions.execute(req, signature).build_transaction({
            'from': self.relayer_account.address,
            'gas': 500000,
            'maxFeePerGas': self.w3.to_wei(50, 'gwei'),  # For EIP-1559
            'maxPriorityFeePerGas': self.w3.to_wei(2, 'gwei'),
            'nonce': self.w3.eth.get_transaction_count(self.relayer_account.address),
            'chainId': self.chain_id,
        })

        signed_tx = self.w3.eth.account.sign_transaction(tx, self.relayer_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        return tx_hash.hex()