from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import RelayerService
from .models import RelayedTransaction
import time

relayer_service = RelayerService()

class GetNonceView(APIView):
    def get(self, request):
        address = request.query_params.get('address')
        if not address:
            return Response(
                {'error': 'Address parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            nonce = relayer_service.get_nonce(address)
            return Response({'nonce': nonce})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RelayView(APIView):
    def post(self, request):
        """
        Expected payload:
        {
            "request": {
                "from": "0x...",
                "to": "0x...",
                "value": "0",
                "gas": "100000",
                "nonce": "0",
                "deadline": "1234567890",
                "data": "0x..."
            },
            "signature": "0x..."
        }
        """
        try:
            forward_request = request.data.get('request')
            signature = request.data.get('signature')
            
            if not forward_request or not signature:
                return Response(
                    {'error': 'Missing request or signature'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify signature
            if not relayer_service.verify_signature(forward_request, signature):
                return Response(
                    {'error': 'Invalid signature'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Check deadline
            if int(forward_request['deadline']) < int(time.time()):
                return Response(
                    {'error': 'Request expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Relay transaction
            tx_hash = relayer_service.relay_transaction(forward_request, signature)
            
            # Save to database
            RelayedTransaction.objects.create(
                request_id=tx_hash,
                from_address=forward_request['from'],
                to_address=forward_request['to'],
                data=forward_request['data'],
                nonce=forward_request['nonce'],
                tx_hash=tx_hash,
                status='submitted'
            )
            
            return Response({
                'txHash': tx_hash,
                'status': 'submitted'
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TransactionStatusView(APIView):
    def get(self, request, tx_hash):
        try:
            tx = RelayedTransaction.objects.get(tx_hash=tx_hash)
            
            # Check on-chain status
            receipt = relayer_service.w3.eth.get_transaction_receipt(tx_hash)
            if receipt:
                tx.status = 'success' if receipt['status'] == 1 else 'failed'
                tx.save()
            
            return Response({
                'txHash': tx.tx_hash,
                'status': tx.status,
                'from': tx.from_address,
                'to': tx.to_address,
                'createdAt': tx.created_at
            })
        except RelayedTransaction.DoesNotExist:
            return Response(
                {'error': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class HealthView(APIView):
    def get(self, request):
        return Response({"status": "ok", "time": time.time()})
