from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import UserViewSet, SellerProfileViewSet, RegisterView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'sellers', SellerProfileViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
] + router.urls
