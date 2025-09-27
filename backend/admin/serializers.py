from rest_framework import serializers
from django.contrib.auth import get_user_model
from products.models import Product, Category
from orders.models import Order, OrderItem
from users.models import User
from .models import AdminProfile

User = get_user_model()


class AdminProductSerializer(serializers.ModelSerializer):
    """Serializer for products in admin panel."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    total_sold = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'quantity', 'image_url',
            'category', 'category_name', 'is_organic', 'in_stock',
            'created_at', 'updated_at', 'total_sold'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_sold']

    def get_total_sold(self, obj):
        return OrderItem.objects.filter(product=obj).aggregate(
            total=serializers.Sum('quantity')
        )['total'] or 0


class AdminOrderSerializer(serializers.ModelSerializer):
    """Serializer for orders in admin panel."""
    customer_email = serializers.CharField(source='user.email', read_only=True)
    customer_name = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'customer_email', 'customer_name', 'status',
            'total_amount', 'shipping_address', 'created_at', 'updated_at',
            'items_count', 'items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

    def get_items_count(self, obj):
        return obj.items.count()

    def get_items(self, obj):
        return [
            {
                'name': item.product_name,
                'quantity': item.quantity,
                'price': float(item.product_price)
            }
            for item in obj.items.all()
        ]


class AdminAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for analytics data."""
    total_sold = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'quantity', 'total_sold', 'total_revenue'
        ]

    def get_total_sold(self, obj):
        return getattr(obj, 'total_sold', 0)

    def get_total_revenue(self, obj):
        return float(getattr(obj, 'total_revenue', 0))


class AdminProfileSerializer(serializers.ModelSerializer):
    """Serializer for admin profiles."""
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = AdminProfile
        fields = [
            'id', 'user', 'user_email', 'farm_name', 'description',
            'region', 'contact_email', 'contact_phone', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for users in admin panel."""
    is_admin = serializers.BooleanField(read_only=True)
    total_orders = serializers.SerializerMethodField()
    last_order_date = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'address',
            'is_admin', 'is_active', 'created_at', 'updated_at',
            'total_orders', 'last_order_date'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_orders(self, obj):
        return Order.objects.filter(user=obj).count()

    def get_last_order_date(self, obj):
        last_order = Order.objects.filter(user=obj).order_by('-created_at').first()
        return last_order.created_at if last_order else None
