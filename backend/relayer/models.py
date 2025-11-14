from django.db import models

class RelayedTransaction(models.Model):
    request_id = models.CharField(max_length=66, unique=True, db_index=True)
    from_address = models.CharField(max_length=42)
    to_address = models.CharField(max_length=42)
    data = models.TextField()
    nonce = models.BigIntegerField()
    tx_hash = models.CharField(max_length=66, null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'relayed_transactions'
        indexes = [
            models.Index(fields=['from_address']),
            models.Index(fields=['status']),
        ]
