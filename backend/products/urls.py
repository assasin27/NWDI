from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import CategoryViewSet, ProductViewSet
from .freshness_views import predict_freshness, freshness_model_status, predict_batch_freshness

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)

urlpatterns = router.urls + [
    path('predict-freshness/', predict_freshness, name='predict_freshness'),
    path('predict-batch/', predict_batch_freshness, name='predict_batch_freshness'),
    path('model-status/', freshness_model_status, name='freshness_model_status'),
]
