from django.urls import path
from .views import HealthView, GetNonceView, RelayView, TransactionStatusView

urlpatterns = [
    path('health', HealthView.as_view()),
    path('nonce', GetNonceView.as_view(), name='get_nonce'),
    path('relay/', RelayView.as_view(), name='relay'),
    path('status/<str:tx_hash>/', TransactionStatusView.as_view(), name='status'),
]