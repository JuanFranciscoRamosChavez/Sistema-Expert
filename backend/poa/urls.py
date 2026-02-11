from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ObraViewSet, 
    DashboardResumenView, 
    DashboardTerritorialView,
    ObraFilteredViewSet,
    BudgetByDirectionView,
    # Sprint 3: Agregaciones y Parsing
    RecentActivityView,
    DynamicKPIsView,
    CriticalProjectsListView,
    TerritoryAggregationsView,
    RiskAnalysisView,
    # Reportes
    generar_reporte
)

router = DefaultRouter()
router.register(r'obras', ObraViewSet)
# Sprint 2: Endpoint de filtrado avanzado
router.register(r'v2/obras/filtered', ObraFilteredViewSet, basename='obra-filtered')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/resumen/', DashboardResumenView.as_view(), name='dashboard-resumen'),
    path('v2/dashboard/territorial/', DashboardTerritorialView.as_view(), name='dashboard-territorial'),
    # Sprint 2: Agregaciones por dirección
    path('v2/dashboard/budget-by-direction/', BudgetByDirectionView.as_view(), name='budget-by-direction'),
    # Sprint 3: Agregaciones y Parsing
    path('v2/dashboard/recent-activity/', RecentActivityView.as_view(), name='recent-activity'),
    path('v2/dashboard/kpis/', DynamicKPIsView.as_view(), name='dynamic-kpis'),
    path('v2/dashboard/critical-projects/', CriticalProjectsListView.as_view(), name='critical-projects'),
    path('v2/dashboard/territories/', TerritoryAggregationsView.as_view(), name='territories'),
    path('v2/dashboard/risk-analysis/', RiskAnalysisView.as_view(), name='risk-analysis'),
    # Reportes
    path('reportes/generar/', generar_reporte, name='generar-reporte'),
]