from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminProductViewSet,
    AdminOrderViewSet,
    AdminAnalyticsViewSet,
    AdminProfileViewSet,
    AdminUserViewSet
)

# Create a router for admin endpoints
router = DefaultRouter()
router.register(r'products', AdminProductViewSet, basename='admin-products')
router.register(r'orders', AdminOrderViewSet, basename='admin-orders')
router.register(r'analytics', AdminAnalyticsViewSet, basename='admin-analytics')
router.register(r'profile', AdminProfileViewSet, basename='admin-profile')
router.register(r'users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('admin/', include(router.urls)),
    path('admin/export/sales/', AdminAnalyticsViewSet.as_view({'get': 'export_sales'}), name='admin-export-sales'),
    path('admin/orders/<int:pk>/status/', AdminOrderViewSet.as_view({'put': 'update_status'}), name='admin-order-status'),
]
