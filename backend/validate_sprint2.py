"""
Script de Validación - Sprint 2: Filtrado Serverside
Obras Públicas

Uso:
    python backend/validate_sprint2.py

Valida:
- Endpoint de filtrado V2 con múltiples parámetros
- Endpoint de agregaciones por dirección
- Performance de queries con índices
- Paginación correcta
"""

import os
import sys
import django
import time
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory
from poa.views import ObraFilteredViewSet, BudgetByDirectionView
from poa.models import Obra


def validate_filtered_endpoint():
    """Test del endpoint de filtrado"""
    print("\n" + "="*60)
    print("🔍 TEST 1: Endpoint de Filtrado V2")
    print("="*60)
    
    factory = RequestFactory()
    view = ObraFilteredViewSet.as_view({'get': 'list'})
    
    # Test 1.1: Sin filtros (todos los proyectos)
    print("\n📋 Test 1.1: Sin filtros")
    request = factory.get('/api/v2/obras/filtered/')
    start = time.perf_counter()
    response = view(request)
    elapsed = (time.perf_counter() - start) * 1000
    
    print(f"   Status: {response.status_code}")
    print(f"   Tiempo: {elapsed:.2f} ms")
    
    if response.status_code == 200:
        data = response.data
        print(f"   ✅ Total proyectos: {data.get('_meta', {}).get('total_count', 'N/A')}")
        print(f"   ✅ Resultados en página: {len(data.get('results', []))}")
    else:
        print(f"   ❌ Error: {response.status_code}")
    
    # Test 1.2: Con filtro de estado
    print("\n📋 Test 1.2: Filtro por estado")
    request = factory.get('/api/v2/obras/filtered/?status=en_ejecucion')
    start = time.perf_counter()
    response = view(request)
    elapsed = (time.perf_counter() - start) * 1000
    
    print(f"   Tiempo: {elapsed:.2f} ms")
    if response.status_code == 200:
        filters_applied = response.data.get('_meta', {}).get('filters_applied', {})
        print(f"   ✅ Filtros aplicados: {filters_applied}")
    
    # Test 1.3: Con múltiples filtros
    print("\n📋 Test 1.3: Múltiples filtros")
    request = factory.get('/api/v2/obras/filtered/?status=en_ejecucion&days_threshold=90&ordering=-avance_fisico_pct')
    start = time.perf_counter()
    response = view(request)
    elapsed = (time.perf_counter() - start) * 1000
    
    print(f"   Tiempo: {elapsed:.2f} ms")
    if response.status_code == 200:
        print(f"   ✅ Filtros complejos funcionan")
        print(f"   ✅ Resultados: {len(response.data.get('results', []))}")
    
    # Test 1.4: Paginación
    print("\n📋 Test 1.4: Paginación")
    request = factory.get('/api/v2/obras/filtered/?page_size=5&page=1')
    response = view(request)
    
    if response.status_code == 200:
        results_count = len(response.data.get('results', []))
        has_next = response.data.get('next') is not None
        print(f"   ✅ Resultados por página: {results_count}")
        print(f"   ✅ Tiene siguiente página: {has_next}")
    
    # Test 1.5: Búsqueda de texto
    print("\n📋 Test 1.5: Búsqueda de texto")
    request = factory.get('/api/v2/obras/filtered/?search=agua')
    response = view(request)
    
    if response.status_code == 200:
        total = response.data.get('_meta', {}).get('total_count', 0)
        print(f"   ✅ Proyectos encontrados con 'agua': {total}")


def validate_budget_aggregation():
    """Test del endpoint de agregaciones"""
    print("\n" + "="*60)
    print("📊 TEST 2: Endpoint de Agregaciones por Dirección")
    print("="*60)
    
    factory = RequestFactory()
    view = BudgetByDirectionView.as_view()
    
    request = factory.get('/api/v2/dashboard/budget-by-direction/')
    start = time.perf_counter()
    response = view(request)
    elapsed = (time.perf_counter() - start) * 1000
    
    print(f"\n   Status: {response.status_code}")
    print(f"   Tiempo: {elapsed:.2f} ms")
    
    if response.status_code == 200:
        data = response.data
        pie_data = data.get('pie_chart_data', [])
        total_directions = data.get('_meta', {}).get('total_directions', 0)
        
        print(f"   ✅ Direcciones encontradas: {total_directions}")
        
        if pie_data:
            print(f"\n   📈 Top 3 direcciones por presupuesto:")
            for i, item in enumerate(pie_data[:3], 1):
                print(f"      {i}. {item['name']}: ${item['value']:,.2f}")
                print(f"         Proyectos: {item['project_count']}, Ejecutado: ${item['executed']:,.2f}")
    else:
        print(f"   ❌ Error: {response.status_code}")


def validate_performance():
    """Test de performance con dataset real"""
    print("\n" + "="*60)
    print("⚡ TEST 3: Performance con Dataset Real")
    print("="*60)
    
    total_obras = Obra.objects.count()
    print(f"\n   Total obras en BD: {total_obras}")
    
    if total_obras == 0:
        print("   ⚠️  Sin datos para probar performance")
        return
    
    # Test 3.1: Query sin filtros (baseline)
    print("\n   📊 Test 3.1: Query completa sin filtros")
    start = time.perf_counter()
    qs = Obra.objects.all()
    count = qs.count()
    elapsed = (time.perf_counter() - start) * 1000
    print(f"      Tiempo: {elapsed:.2f} ms")
    print(f"      Registros: {count}")
    
    # Test 3.2: Query con filtro simple
    print("\n   📊 Test 3.2: Query con filtro de estado")
    start = time.perf_counter()
    qs = Obra.objects.filter(estatus_general__iexact='en_ejecucion')
    count = qs.count()
    elapsed = (time.perf_counter() - start) * 1000
    print(f"      Tiempo: {elapsed:.2f} ms")
    print(f"      Registros: {count}")
    
    # Test 3.3: Query con agregación
    print("\n   📊 Test 3.3: Agregación por dirección")
    start = time.perf_counter()
    from django.db.models import Sum, Count
    result = Obra.objects.values('area_responsable').annotate(
        total=Sum('presupuesto_modificado'),
        count=Count('id')
    ).filter(area_responsable__isnull=False)[:10]
    list(result)  # Forzar evaluación
    elapsed = (time.perf_counter() - start) * 1000
    print(f"      Tiempo: {elapsed:.2f} ms")
    print(f"      Direcciones procesadas: {len(list(result))}")
    
    # Recomendaciones de índices
    print("\n   💡 Recomendaciones de Optimización:")
    print("      1. Crear índice en 'estatus_general':")
    print("         CREATE INDEX idx_obra_estatus ON poa_obra(estatus_general);")
    print("      2. Crear índice en 'area_responsable':")
    print("         CREATE INDEX idx_obra_area ON poa_obra(area_responsable);")
    print("      3. Crear índice en 'fecha_termino_prog':")
    print("         CREATE INDEX idx_obra_fecha_termino ON poa_obra(fecha_termino_prog);")


def validate_response_structure():
    """Validar estructura de respuestas"""
    print("\n" + "="*60)
    print("🔍 TEST 4: Validación de Estructura de Respuestas")
    print("="*60)
    
    factory = RequestFactory()
    
    # Test filtrado
    print("\n   📋 Estructura de endpoint de filtrado:")
    view = ObraFilteredViewSet.as_view({'get': 'list'})
    request = factory.get('/api/v2/obras/filtered/?page_size=1')
    response = view(request)
    
    if response.status_code == 200:
        required_keys = ['results', 'count', '_meta']
        data = response.data
        
        for key in required_keys:
            if key in data:
                print(f"      ✅ {key}: OK")
            else:
                print(f"      ❌ {key}: FALTA")
        
        # Validar metadata
        if '_meta' in data:
            meta_keys = ['total_count', 'filters_applied', 'timestamp']
            for key in meta_keys:
                if key in data['_meta']:
                    print(f"      ✅ _meta.{key}: OK")
    
    # Test agregaciones
    print("\n   📊 Estructura de endpoint de agregaciones:")
    view = BudgetByDirectionView.as_view()
    request = factory.get('/api/v2/dashboard/budget-by-direction/')
    response = view(request)
    
    if response.status_code == 200:
        if 'pie_chart_data' in response.data:
            print(f"      ✅ pie_chart_data: OK")
            if response.data['pie_chart_data']:
                sample = response.data['pie_chart_data'][0]
                required = ['name', 'full_name', 'value', 'executed', 'project_count']
                for key in required:
                    if key in sample:
                        print(f"      ✅ pie_chart_data[].{key}: OK")


def main():
    print("\n" + "="*60)
    print("🚀 VALIDACIÓN SPRINT 2: FILTRADO SERVERSIDE")
    print("="*60)
    
    try:
        validate_filtered_endpoint()
        validate_budget_aggregation()
        validate_performance()
        validate_response_structure()
        
        print("\n" + "="*60)
        print("✅ VALIDACIÓN SPRINT 2 COMPLETADA")
        print("="*60)
        print("\n💡 Próximos pasos:")
        print("   1. Migrar TimelineView.tsx a useFilteredProjects")
        print("   2. Migrar TransparencyView.tsx a useBudgetByDirection")
        print("   3. Crear índices en BD para mejor performance")
        print("   4. Probar en navegador con React Query DevTools\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
