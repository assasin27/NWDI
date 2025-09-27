from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
import csv
from django.http import HttpResponse
from .models import AdminProfile
from products.models import Product, Category
from orders.models import Order, OrderItem
from users.models import User
from .serializers import (
    AdminProductSerializer,
    AdminOrderSerializer,
    AdminAnalyticsSerializer,
    AdminProfileSerializer,
    AdminUserSerializer
)


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access admin endpoints.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class AdminProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing products from admin panel.
    """
    queryset = Product.objects.all()
    serializer_class = AdminProductSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = Product.objects.all()
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        in_stock = self.request.query_params.get('in_stock', None)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )

        if category:
            queryset = queryset.filter(category_id=category)

        if in_stock is not None:
            queryset = queryset.filter(in_stock=in_stock.lower() == 'true')

        return queryset

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock (less than 10 items)."""
        low_stock_products = Product.objects.filter(quantity__lt=10)
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """Get products that are out of stock."""
        out_of_stock_products = Product.objects.filter(quantity=0)
        serializer = self.get_serializer(out_of_stock_products, many=True)
        return Response(serializer.data)


class AdminOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing orders from admin panel.
    """
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = Order.objects.all()
        status_filter = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if search:
            queryset = queryset.filter(
                Q(id__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )

        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)

        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)

        return queryset

    @action(detail=True, methods=['put'])
    def update_status(self, request, pk=None):
        """Update order status."""
        order = self.get_object()
        new_status = request.data.get('status')

        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate status transition
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()

        # Send notification to user (implement notification system)
        # notification_service.notify_order_status_update(order, new_status)

        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_orders(self, request):
        """Get all pending orders."""
        pending_orders = Order.objects.filter(status='pending')
        serializer = self.get_serializer(pending_orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today_orders(self, request):
        """Get orders from today."""
        today = timezone.now().date()
        today_orders = Order.objects.filter(created_at__date=today)
        serializer = self.get_serializer(today_orders, many=True)
        return Response(serializer.data)


class AdminAnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for admin analytics and reporting.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def list(self, request):
        """Get analytics overview."""
        # Get date range
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)

        # Basic metrics
        total_orders = Order.objects.filter(created_at__gte=start_date).count()
        total_revenue = Order.objects.filter(
            created_at__gte=start_date
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        total_products = Product.objects.count()
        low_stock_products = Product.objects.filter(quantity__lt=10).count()

        # Sales by day
        sales_data = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            day_orders = Order.objects.filter(created_at__date=date.date())
            day_revenue = day_orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            day_count = day_orders.count()

            sales_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'orders': day_count,
                'revenue': float(day_revenue)
            })

        # Top products
        top_products = OrderItem.objects.filter(
            order__created_at__gte=start_date
        ).values('product_name').annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('product_price')
        ).order_by('-total_sold')[:10]

        analytics_data = {
            'overview': {
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'total_products': total_products,
                'low_stock_products': low_stock_products,
            },
            'sales_data': sales_data,
            'top_products': list(top_products)
        }

        return Response(analytics_data)

    @action(detail=False, methods=['get'])
    def export_sales(self, request):
        """Export sales data as CSV."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        orders = Order.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )

        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="sales_report_{start_date}_to_{end_date}.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Order ID', 'Customer Email', 'Total Amount', 'Status',
            'Created At', 'Items Count'
        ])

        for order in orders:
            writer.writerow([
                order.id,
                order.user.email,
                order.total_amount,
                order.status,
                order.created_at,
                order.items.count()
            ])

        return response

    @action(detail=False, methods=['get'])
    def product_performance(self, request):
        """Get product performance analytics."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Product performance
        products = Product.objects.annotate(
            total_sold=Sum(
                'orderitem__quantity',
                filter=Q(orderitem__order__created_at__date__gte=start_date) &
                      Q(orderitem__order__created_at__date__lte=end_date)
            ),
            total_revenue=Sum(
                'orderitem__product_price',
                filter=Q(orderitem__order__created_at__date__gte=start_date) &
                      Q(orderitem__order__created_at__date__lte=end_date)
            )
        ).filter(total_sold__gt=0).order_by('-total_sold')

        serializer = AdminAnalyticsSerializer(products, many=True)
        return Response(serializer.data)


class AdminProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing admin profiles.
    """
    queryset = AdminProfile.objects.all()
    serializer_class = AdminProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users from admin panel.
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all()
        search = self.request.query_params.get('search', None)

        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        return queryset
