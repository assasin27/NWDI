from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Import your app URLs
from products.urls import router as products_router
from orders.urls import router as orders_router
from users.urls import router as users_router
from admin.urls import router as admin_router

# Create main router
router = DefaultRouter()
router.registry.extend(products_router.registry)
router.registry.extend(orders_router.registry)
router.registry.extend(users_router.registry)
router.registry.extend(admin_router.registry)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('users.urls')),
]
