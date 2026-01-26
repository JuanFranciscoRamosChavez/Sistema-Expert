"""
Script de benchmark para medir el impacto de los índices PostgreSQL.
Compara performance de queries antes y después de aplicar índices.

Sprint 3 - Fase 2: Optimización con Índices
"""

import sys
import os
import django
import time
from datetime import datetime, timedelta

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from poa.models import Obra


def benchmark_query(name, query_func, iterations=5):
    """
    Ejecuta una query múltiples veces y calcula el tiempo promedio.
    """
    times = []
    
    for i in range(iterations):
        start = time.time()
        result = query_func()
        end = time.time()
        
        elapsed_ms = (end - start) * 1000
        times.append(elapsed_ms)
        
        # Forzar evaluación de queryset
        if hasattr(result, '__iter__'):
            list(result)
    
    avg_time = sum(times) / len(times)
    min_time = min(times)
    max_time = max(times)
    
    return {
        'name': name,
        'avg': avg_time,
        'min': min_time,
        'max': max_time,
        'iterations': iterations
    }


def print_results(results, title="Resultados de Benchmark"):
    """
    Imprime resultados de benchmark en formato tabla.
    """
    print()
    print("=" * 80)
    print(f"  {title}")
    print("=" * 80)
    print()
    print(f"{'Query':<40} {'Avg (ms)':<12} {'Min (ms)':<12} {'Max (ms)':<12}")
    print("-" * 80)
    
    for result in results:
        print(f"{result['name']:<40} {result['avg']:>10.2f}  {result['min']:>10.2f}  {result['max']:>10.2f}")
    
    print("-" * 80)
    print()


def run_benchmarks():
    """
    Ejecuta todas las queries de benchmark.
    """
    print()
    print("🚀 INICIANDO BENCHMARK DE ÍNDICES - SPRINT 3 FASE 2")
    print()
    
    # Contar total de obras
    total_obras = Obra.objects.count()
    print(f"Dataset: {total_obras} obras en la base de datos")
    print()
    
    results = []
    
    # Test 1: Filtrado por área responsable
    print("⏳ Test 1: Filtrado por área_responsable...")
    results.append(benchmark_query(
        "Filtrar por área_responsable",
        lambda: Obra.objects.filter(area_responsable__icontains='Obras')
    ))
    
    # Test 2: Filtrado por estado general
    print("⏳ Test 2: Filtrado por estatus_general...")
    results.append(benchmark_query(
        "Filtrar por estatus_general",
        lambda: Obra.objects.filter(estatus_general='EN EJECUCIÓN')
    ))
    
    # Test 3: Ordenamiento por fecha de término
    print("⏳ Test 3: Ordenamiento por fecha_termino_prog...")
    results.append(benchmark_query(
        "Ordenar por fecha_termino_prog",
        lambda: Obra.objects.order_by('fecha_termino_prog')[:50]
    ))
    
    # Test 4: Actividad reciente (ORDER BY ultima_actualizacion DESC)
    print("⏳ Test 4: Actividad reciente...")
    results.append(benchmark_query(
        "Actividad reciente (últimos 10)",
        lambda: Obra.objects.filter(
            ultima_actualizacion__isnull=False
        ).order_by('-ultima_actualizacion')[:10]
    ))
    
    # Test 5: Proyectos críticos (ORDER BY puntuacion DESC)
    print("⏳ Test 5: Proyectos críticos...")
    results.append(benchmark_query(
        "Proyectos críticos (top 20)",
        lambda: Obra.objects.filter(
            puntuacion_final_ponderada__isnull=False
        ).order_by('-puntuacion_final_ponderada')[:20]
    ))
    
    # Test 6: Ordenamiento por avance físico
    print("⏳ Test 6: Ordenamiento por avance_fisico_pct...")
    results.append(benchmark_query(
        "Ordenar por avance físico DESC",
        lambda: Obra.objects.order_by('-avance_fisico_pct')[:30]
    ))
    
    # Test 7: Query compuesta (área + avance) - usa índice compuesto
    print("⏳ Test 7: Query compuesta (área + avance)...")
    results.append(benchmark_query(
        "Filtrar área + ordenar avance",
        lambda: Obra.objects.filter(
            area_responsable__icontains='Obras'
        ).order_by('-avance_fisico_pct')[:20]
    ))
    
    # Test 8: Timeline query (estado + fecha)
    print("⏳ Test 8: Timeline query...")
    today = datetime.now().date()
    results.append(benchmark_query(
        "Timeline (estado + fecha)",
        lambda: Obra.objects.filter(
            estatus_general='EN EJECUCIÓN',
            fecha_termino_prog__gte=today
        ).order_by('fecha_termino_prog')[:25]
    ))
    
    # Test 9: Búsqueda en alcaldías
    print("⏳ Test 9: Búsqueda en alcaldías...")
    results.append(benchmark_query(
        "Buscar en alcaldías",
        lambda: Obra.objects.filter(alcaldias__icontains='Iztapalapa')
    ))
    
    # Test 10: Agregación con GROUP BY (área)
    print("⏳ Test 10: Agregación por área...")
    from django.db.models import Count
    results.append(benchmark_query(
        "COUNT por área_responsable",
        lambda: Obra.objects.values('area_responsable').annotate(
            count=Count('id')
        )
    ))
    
    # Imprimir resultados
    print_results(results, "BENCHMARK DE QUERIES CON ÍNDICES")
    
    # Análisis de índices
    print_index_analysis()
    
    return results


def print_index_analysis():
    """
    Imprime análisis de índices en la base de datos.
    """
    print()
    print("=" * 80)
    print("  ANÁLISIS DE ÍNDICES EN LA BASE DE DATOS")
    print("=" * 80)
    print()
    
    with connection.cursor() as cursor:
        # Para SQLite
        cursor.execute("""
            SELECT name, tbl_name 
            FROM sqlite_master 
            WHERE type='index' AND tbl_name='poa_obra'
        """)
        
        indexes = cursor.fetchall()
        
        if indexes:
            print("Índices encontrados en tabla poa_obra:")
            print("-" * 80)
            for idx_name, table_name in indexes:
                print(f"  • {idx_name}")
            print()
            print(f"Total: {len(indexes)} índices")
        else:
            print("⚠️  No se encontraron índices personalizados en poa_obra")
            print("    Ejecuta: python manage.py migrate")
    
    print()


def compare_with_baseline(results, baseline_file='benchmark_baseline.txt'):
    """
    Compara resultados con un baseline anterior (si existe).
    """
    import json
    
    if not os.path.exists(baseline_file):
        print("⚠️  No existe archivo baseline. Guardando resultados actuales...")
        with open(baseline_file, 'w') as f:
            json.dump(results, f, indent=2)
        return
    
    print()
    print("=" * 80)
    print("  COMPARACIÓN CON BASELINE (ANTES DE ÍNDICES)")
    print("=" * 80)
    print()
    
    with open(baseline_file, 'r') as f:
        baseline = json.load(f)
    
    print(f"{'Query':<40} {'Antes (ms)':<12} {'Después (ms)':<12} {'Mejora':<12}")
    print("-" * 80)
    
    for current in results:
        # Buscar query correspondiente en baseline
        baseline_item = next(
            (b for b in baseline if b['name'] == current['name']), 
            None
        )
        
        if baseline_item:
            before = baseline_item['avg']
            after = current['avg']
            improvement = ((before - after) / before) * 100 if before > 0 else 0
            
            improvement_str = f"-{improvement:.1f}%" if improvement > 0 else f"+{abs(improvement):.1f}%"
            
            print(f"{current['name']:<40} {before:>10.2f}  {after:>10.2f}  {improvement_str:>10}")
    
    print("-" * 80)
    print()


if __name__ == '__main__':
    print()
    print("📊 BENCHMARK DE PERFORMANCE - SPRINT 3 FASE 2")
    print()
    
    # Preguntar si guardar baseline
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--baseline':
        print("Modo: Guardar baseline (ANTES de aplicar índices)")
        print()
        results = run_benchmarks()
        
        # Guardar como baseline
        import json
        with open('benchmark_baseline.txt', 'w') as f:
            json.dump(results, f, indent=2)
        
        print("✅ Baseline guardado en 'benchmark_baseline.txt'")
        print()
        print("Instrucciones:")
        print("  1. Aplicar migración: python manage.py migrate")
        print("  2. Ejecutar de nuevo: python benchmark_indexes.py")
        print()
    else:
        print("Modo: Medir performance con índices")
        print()
        results = run_benchmarks()
        
        # Comparar con baseline si existe
        compare_with_baseline(results)
        
        print()
        print("💡 TIP: Para crear un baseline ANTES de los índices:")
        print("   python benchmark_indexes.py --baseline")
        print()
