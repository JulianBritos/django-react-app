from rest_framework import serializers
from .models import Payment, PaymentMethod, PaymentTransaction, PaymentRefund
from apps.orders.models import Order


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer para PaymentMethod"""
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'name', 'code', 'payment_type', 'payment_type_display',
            'is_active', 'interest_rate', 'min_installments', 'max_installments',
            'gateway_config', 'min_amount', 'max_amount', 'description',
            'icon', 'display_order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Serializer para PaymentTransaction"""
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    
    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'payment', 'transaction_id', 'external_transaction_id',
            'transaction_type', 'transaction_type_display', 'amount', 'currency',
            'status', 'description', 'gateway_response', 'processed_by',
            'processed_at', 'created_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'processed_at', 'created_at']


class PaymentRefundSerializer(serializers.ModelSerializer):
    """Serializer para PaymentRefund"""
    processed_by_email = serializers.CharField(source='processed_by.email', read_only=True)
    
    class Meta:
        model = PaymentRefund
        fields = [
            'id', 'payment', 'refund_id', 'external_refund_id',
            'amount', 'status', 'reason', 'processed_by', 'processed_by_email',
            'gateway_response', 'processed_at', 'created_at'
        ]
        read_only_fields = ['id', 'refund_id', 'processed_at', 'created_at']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer para Payment"""
    payment_method_data = PaymentMethodSerializer(source='payment_method', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_successful = serializers.ReadOnlyField()
    can_be_refunded = serializers.ReadOnlyField()
    remaining_refundable_amount = serializers.ReadOnlyField()
    transactions = PaymentTransactionSerializer(many=True, read_only=True)
    refunds = PaymentRefundSerializer(many=True, read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'external_payment_id', 'order', 'order_number',
            'payment_method', 'payment_method_data', 'amount', 'currency',
            'installments', 'installment_amount', 'status', 'status_display',
            'payment_date', 'gateway_response', 'failure_reason', 'notes',
            'is_successful', 'can_be_refunded', 'remaining_refundable_amount',
            'transactions', 'refunds', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'payment_id', 'external_payment_id', 'payment_date',
            'created_at', 'updated_at'
        ]


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear Payment"""
    
    class Meta:
        model = Payment
        fields = [
            'order', 'payment_method', 'amount', 'currency',
            'installments', 'notes'
        ]
    
    def validate_order(self, value):
        """Validar que la orden exista"""
        if not value:
            raise serializers.ValidationError("Se requiere una orden")
        return value


class PaymentUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar Payment"""
    
    class Meta:
        model = Payment
        fields = ['status', 'notes', 'failure_reason']

