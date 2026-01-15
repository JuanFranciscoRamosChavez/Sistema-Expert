from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ObraViewSet, DashboardResumenView

router = DefaultRouter()
router.register(r'obras', ObraViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('dashboard/resumen/', DashboardResumenView.as_view(), name='dashboard-resumen'),
]