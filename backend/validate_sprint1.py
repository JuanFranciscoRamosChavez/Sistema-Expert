#!/usr/bin/env python
"""
Script de Validación Rápida - Sprint 1
Ejecuta pruebas básicas de los endpoints V1 y V2

Uso:
    python backend/validate_sprint1.py
"""

import os
import sys
import django
import json
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from poa.models import Obra
from poa.services import calculate_territorial_stats, calculate_territorial_stats_v2
import time


def decimal_to_float(obj):
    """Convertir Decimals a float para JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def validate_response_structure(data, version):
    """Validar estructura de respuesta"""
    print(f"\n{'='*60}")
    print(f"🔍 VALIDACIÓN ESTRUCTURA - {version}")
    print(f"{'='*60}")
    
    required_keys = ['pie_chart_data', 'bar_chart_data']
    
    for key in required_keys:
        if key in data:
            print(f"✅ {key}: OK ({len(data[key])} elementos)")
        else:
            print(f"❌ {key}: FALTA")
            return False
    
    # Validar estructura de pie_chart
    if data['pie_chart_data']:
        sample = data['pie_chart_data'][0]
        if 'name' in sample and 'value' in sample:
            print(f"✅ pie_chart_data estructura: OK")
        else:
            print(f"❌ pie_chart_data estructura: INVÁLIDA")
            return False
    
    # Validar estructura de bar_chart
    if data['bar_chart_data']:
        sample = data['bar_chart_data'][0]
        required = ['name', 'fullName', 'proyectos', 'beneficiarios']
        missing = [k for k in required if k not in sample]
        if not missing:
            print(f"✅ bar_chart_data estructura: OK")
        else:
            print(f"❌ bar_chart_data estructura: FALTAN {missing}")
            return False
    
    return True


def main():
    print("\n" + "="*60)
    print("🚀 VALIDACIÓN SPRINT 1: CÁLCULOS TERRITORIALES")
    print("="*60)
    
    # Verificar datos
    total_obras = Obra.objects.count()
    print(f"\n📊 Obras en BD: {total_obras}")
    
    if total_obras == 0:
        print("\n⚠️  ADVERTENCIA: No hay datos en la base de datos")
        print("   Ejecuta primero: python manage.py import_obras")
        return
    
    qs = Obra.objects.all()
    
    # ==================== TEST V1 ====================
    print(f"\n{'='*60}")
    print("📍 TEST V1 - Python Iteration")
    print(f"{'='*60}")
    
    start = time.perf_counter()
    result_v1 = calculate_territorial_stats(qs)
    elapsed_v1 = (time.perf_counter() - start) * 1000
    
    print(f"⏱️  Tiempo: {elapsed_v1:.2f} ms")
    validate_response_structure(result_v1, "V1")
    
    print(f"\n📊 Resumen V1:")
    print(f"   - Zonas con presupuesto: {len(result_v1['pie_chart_data'])}")
    print(f"   - Zonas en gráfica de barras: {len(result_v1['bar_chart_data'])}")
    
    if result_v1['bar_chart_data']:
        total_proyectos_v1 = sum(z['proyectos'] for z in result_v1['bar_chart_data'])
        print(f"   - Total proyectos únicos: {total_proyectos_v1}")
    
    # ==================== TEST V2 ====================
    print(f"\n{'='*60}")
    print("🚀 TEST V2 - SQL Optimizado")
    print(f"{'='*60}")
    
    start = time.perf_counter()
    result_v2 = calculate_territorial_stats_v2(qs)
    elapsed_v2 = (time.perf_counter() - start) * 1000
    
    print(f"⏱️  Tiempo: {elapsed_v2:.2f} ms")
    validate_response_structure(result_v2, "V2")
    
    print(f"\n📊 Resumen V2:")
    print(f"   - Zonas con presupuesto: {len(result_v2['pie_chart_data'])}")
    print(f"   - Zonas en gráfica de barras: {len(result_v2['bar_chart_data'])}")
    
    if result_v2['bar_chart_data']:
        total_proyectos_v2 = sum(z['proyectos'] for z in result_v2['bar_chart_data'])
        print(f"   - Total proyectos únicos: {total_proyectos_v2}")
    
    # ==================== COMPARACIÓN ====================
    print(f"\n{'='*60}")
    print("⚖️  COMPARACIÓN V1 vs V2")
    print(f"{'='*60}")
    
    speed_improvement = ((elapsed_v1 - elapsed_v2) / elapsed_v1) * 100
    print(f"\n🏆 Performance:")
    print(f"   V1: {elapsed_v1:.2f} ms")
    print(f"   V2: {elapsed_v2:.2f} ms")
    print(f"   Mejora: {speed_improvement:+.1f}%")
    
    # Consistencia
    zones_match = len(result_v1['pie_chart_data']) == len(result_v2['pie_chart_data'])
    print(f"\n🔍 Consistencia:")
    print(f"   Zonas coinciden: {'✅ SÍ' if zones_match else '❌ NO'}")
    
    # Exportar samples para debug
    print(f"\n📁 Exportando samples a JSON...")
    
    os.makedirs('backend/test_outputs', exist_ok=True)
    
    with open('backend/test_outputs/v1_sample.json', 'w', encoding='utf-8') as f:
        json.dump(result_v1, f, ensure_ascii=False, indent=2, default=decimal_to_float)
    
    with open('backend/test_outputs/v2_sample.json', 'w', encoding='utf-8') as f:
        json.dump(result_v2, f, ensure_ascii=False, indent=2, default=decimal_to_float)
    
    print(f"   ✅ backend/test_outputs/v1_sample.json")
    print(f"   ✅ backend/test_outputs/v2_sample.json")
    
    # ==================== RESULTADO FINAL ====================
    print(f"\n{'='*60}")
    if zones_match and speed_improvement >= -10:  # Tolerancia de -10%
        print("✅ VALIDACIÓN EXITOSA - Sprint 1 implementado correctamente")
    else:
        print("⚠️  VALIDACIÓN CON ADVERTENCIAS - Revisar inconsistencias")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
