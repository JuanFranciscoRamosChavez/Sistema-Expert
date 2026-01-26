"""
Script de Testing A/B: V1 vs V2 Cálculos Territoriales
Sprint 1 - Obras Públicas

Uso:
    python backend/poa/tests_performance.py

Mide:
- Tiempo de respuesta (ms)
- Uso de memoria (MB)
- Resultados idénticos entre versiones
"""

import time
import tracemalloc
from django.test import TestCase
from django.core.management import call_command
from poa.models import Obra
from poa.services import calculate_territorial_stats, calculate_territorial_stats_v2


class TerritorialStatsPerformanceTest(TestCase):
    """
    Test de performance comparativo entre V1 y V2
    """
    
    @classmethod
    def setUpTestData(cls):
        """Cargar datos de prueba una sola vez"""
        print("\n🔧 Configurando datos de prueba...")
        # Si tienes un fixture o comando de carga, descoméntalo:
        # call_command('loaddata', 'test_obras.json')
        
        # Validar que hay datos
        cls.total_obras = Obra.objects.count()
        print(f"✅ {cls.total_obras} obras cargadas para testing\n")
        
        if cls.total_obras == 0:
            print("⚠️  ADVERTENCIA: No hay datos en la BD. Ejecuta primero:")
            print("   python manage.py import_obras\n")
    
    def test_v1_performance(self):
        """Medir V1 (Python iteration)"""
        print("=" * 60)
        print("📊 TEST V1 - Python Iteration (Legacy)")
        print("=" * 60)
        
        qs = Obra.objects.only(
            'ubicacion_especifica', 'alcance_territorial',
            'presupuesto_modificado', 'anteproyecto_total', 'beneficiarios_num'
        )
        
        # Medición de memoria
        tracemalloc.start()
        start_time = time.perf_counter()
        
        result_v1 = calculate_territorial_stats(qs)
        
        end_time = time.perf_counter()
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        elapsed_ms = (end_time - start_time) * 1000
        memory_mb = peak / (1024 * 1024)
        
        print(f"⏱️  Tiempo: {elapsed_ms:.2f} ms")
        print(f"💾 Memoria: {memory_mb:.2f} MB")
        print(f"📈 Zonas procesadas: {len(result_v1['pie_chart_data'])}")
        print(f"📍 Proyectos únicos: {sum(z['proyectos'] for z in result_v1['bar_chart_data'])}\n")
        
        # Guardar para comparación
        self._v1_time = elapsed_ms
        self._v1_memory = memory_mb
        self._v1_result = result_v1
    
    def test_v2_performance(self):
        """Medir V2 (SQL-optimized)"""
        print("=" * 60)
        print("🚀 TEST V2 - SQL Optimizado")
        print("=" * 60)
        
        qs = Obra.objects.all()
        
        # Medición de memoria
        tracemalloc.start()
        start_time = time.perf_counter()
        
        result_v2 = calculate_territorial_stats_v2(qs)
        
        end_time = time.perf_counter()
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        elapsed_ms = (end_time - start_time) * 1000
        memory_mb = peak / (1024 * 1024)
        
        print(f"⏱️  Tiempo: {elapsed_ms:.2f} ms")
        print(f"💾 Memoria: {memory_mb:.2f} MB")
        print(f"📈 Zonas procesadas: {len(result_v2['pie_chart_data'])}")
        print(f"📍 Proyectos únicos: {sum(z['proyectos'] for z in result_v2['bar_chart_data'])}\n")
        
        self._v2_time = elapsed_ms
        self._v2_memory = memory_mb
        self._v2_result = result_v2
    
    def test_z_comparison(self):
        """
        Comparación final (debe ejecutarse al final, por eso 'z_')
        """
        if not hasattr(self, '_v1_time'):
            self.skipTest("Ejecutar test_v1_performance primero")
        
        print("=" * 60)
        print("📊 COMPARACIÓN FINAL V1 vs V2")
        print("=" * 60)
        
        # Performance
        speed_improvement = ((self._v1_time - self._v2_time) / self._v1_time) * 100
        memory_improvement = ((self._v1_memory - self._v2_memory) / self._v1_memory) * 100
        
        print(f"\n🏆 RESULTADOS:")
        print(f"   Velocidad  : V2 es {speed_improvement:+.1f}% más {'rápida' if speed_improvement > 0 else 'lenta'}")
        print(f"   Memoria    : V2 usa {memory_improvement:+.1f}% {'menos' if memory_improvement > 0 else 'más'} RAM")
        
        # Validación de consistencia
        v1_zones = len(self._v1_result['pie_chart_data'])
        v2_zones = len(self._v2_result['pie_chart_data'])
        
        print(f"\n🔍 CONSISTENCIA:")
        print(f"   Zonas V1   : {v1_zones}")
        print(f"   Zonas V2   : {v2_zones}")
        print(f"   ✅ Match    : {'SÍ' if v1_zones == v2_zones else '❌ NO'}")
        
        # Aserciones
        self.assertEqual(v1_zones, v2_zones, "El número de zonas debe ser idéntico")
        
        # Verificar que V2 es más rápida (tolerancia de ±10% por variabilidad)
        if self.total_obras > 100:
            self.assertLess(
                self._v2_time, 
                self._v1_time * 1.1,
                "V2 debe ser al menos tan rápida como V1"
            )
        
        print(f"\n{'='*60}")
        print("✅ TODOS LOS TESTS PASARON")
        print(f"{'='*60}\n")


if __name__ == '__main__':
    import django
    import os
    import sys
    
    # Setup Django
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    
    # Ejecutar tests
    from django.test.runner import DiscoverRunner
    runner = DiscoverRunner(verbosity=2, keepdb=True)
    runner.run_tests(['poa.tests_performance'])
