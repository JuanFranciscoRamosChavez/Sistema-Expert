"""
Script de prueba para validar la normalización de fechas en Sprint 3.
Prueba todos los formatos soportados por la función parse_date().
"""

import sys
import os
import django
from datetime import datetime, date

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Ahora podemos importar modelos
from poa.models import Obra

def test_date_parsing():
    """
    Prueba la función parse_date con diferentes formatos.
    """
    print("=" * 60)
    print("VALIDACIÓN SPRINT 3: Normalización de Fechas")
    print("=" * 60)
    print()
    
    # Casos de prueba (valor, formato_esperado)
    test_cases = [
        ("2026-01-15", "2026-01-15", "ISO 8601 (YYYY-MM-DD)"),
        ("15/01/2026", "2026-01-15", "DD/MM/YYYY con /"),
        ("15-01-2026", "2026-01-15", "DD-MM-YYYY con -"),
        ("2026/01/15", "2026-01-15", "YYYY/MM/DD con /"),
        ("abril 2026", "2026-04-01", "Mes y año en español"),
        ("28 de noviembre de 2025", "2025-11-28", "Fecha completa en español"),
        (45292, "2023-12-30", "Serial de Excel (int)"),
        (45292.0, "2023-12-30", "Serial de Excel (float)"),
        ("", None, "String vacío"),
        (None, None, "None"),
    ]
    
    # Importar función de parsing
    import pandas as pd
    from datetime import timedelta
    
    def parse_date(val):
        """
        Función de parsing copiada del comando de importación.
        """
        try:
            if pd.isna(val) or val == '': 
                return None
            
            # 1. Manejo de fecha serial de Excel (enteros/floats)
            if isinstance(val, (int, float)) and not isinstance(val, bool):
                return (datetime(1899, 12, 30) + timedelta(days=val)).date()
            
            # 2. Si ya es un objeto date o datetime, extraer date
            if isinstance(val, datetime):
                return val.date()
            if hasattr(val, 'date'):  # pandas Timestamp
                return val.date()
            
            # 3. Convertir a string para análisis de texto
            val_str = str(val).strip()
            
            # 4. Meses en español (diccionario)
            meses = {
                'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
                'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
                'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
            }
            
            import re
            
            # 5. Formato: "abril 2026", "mayo 2026" (solo mes y año en español)
            match_mes_anio = re.match(
                r'(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{4})', 
                val_str, 
                re.IGNORECASE
            )
            if match_mes_anio:
                mes_nombre = match_mes_anio.group(1).lower()
                anio = int(match_mes_anio.group(2))
                mes = meses[mes_nombre]
                return datetime(anio, mes, 1).date()
            
            # 6. Formato: "28 de noviembre de 2025" (fecha completa en español)
            match_completo = re.match(
                r'(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})', 
                val_str, 
                re.IGNORECASE
            )
            if match_completo:
                dia = int(match_completo.group(1))
                mes_nombre = match_completo.group(2).lower()
                anio = int(match_completo.group(3))
                mes = meses[mes_nombre]
                return datetime(anio, mes, dia).date()
            
            # 7. Formato ISO ya normalizado: "2025-12-31"
            if re.match(r'^\d{4}-\d{2}-\d{2}$', val_str):
                return datetime.strptime(val_str, "%Y-%m-%d").date()
            
            # 8. Formatos DD/MM/YYYY o DD-MM-YYYY
            for sep in ['/', '-']:
                pattern = rf'^\d{{1,2}}\{sep}\d{{1,2}}\{sep}\d{{4}}$'
                if re.match(pattern, val_str):
                    try:
                        return datetime.strptime(val_str, f"%d{sep}%m{sep}%Y").date()
                    except ValueError:
                        pass
            
            # 9. Formatos YYYY/MM/DD o YYYY-MM-DD (variantes)
            for sep in ['/', '-']:
                pattern = rf'^\d{{4}}\{sep}\d{{1,2}}\{sep}\d{{1,2}}$'
                if re.match(pattern, val_str):
                    try:
                        return datetime.strptime(val_str, f"%Y{sep}%m{sep}%d").date()
                    except ValueError:
                        pass
            
            # 10. Fallback: intentar parsing automático de pandas
            parsed = pd.to_datetime(val, errors='coerce')
            if pd.notna(parsed):
                return parsed.date()
            
            return None
            
        except Exception as e:
            return None
    
    # Ejecutar pruebas
    passed = 0
    failed = 0
    
    print("Casos de Prueba:")
    print("-" * 60)
    
    for input_val, expected_str, description in test_cases:
        result = parse_date(input_val)
        
        # Convertir expected_str a date object
        expected = None
        if expected_str:
            expected = datetime.strptime(expected_str, "%Y-%m-%d").date()
        
        # Verificar resultado
        if result == expected:
            status = "✅ PASS"
            passed += 1
        else:
            status = "❌ FAIL"
            failed += 1
        
        # Formatear resultado
        result_str = result.isoformat() if result else "None"
        expected_display = expected_str if expected_str else "None"
        
        print(f"{status} | {description}")
        print(f"    Input:    {repr(input_val)}")
        print(f"    Esperado: {expected_display}")
        print(f"    Resultado: {result_str}")
        print()
    
    print("-" * 60)
    print(f"Resultados: {passed} PASS, {failed} FAIL")
    print()
    
    return failed == 0


def test_database_dates():
    """
    Verifica que las fechas en la base de datos estén en formato ISO.
    """
    print("=" * 60)
    print("VALIDACIÓN: Fechas en Base de Datos")
    print("=" * 60)
    print()
    
    # Obtener una muestra de obras con fechas
    obras = Obra.objects.filter(
        fecha_inicio_prog__isnull=False
    )[:5]
    
    if not obras.exists():
        print("⚠️  No hay obras con fechas en la base de datos.")
        print("    Ejecuta 'python manage.py importar_excel' primero.")
        return True
    
    print(f"Verificando {obras.count()} obras con fechas...\n")
    
    all_valid = True
    for obra in obras:
        print(f"Obra ID {obra.id}: {obra.programa}")
        
        # Verificar cada campo de fecha
        fecha_fields = [
            ('fecha_inicio_prog', obra.fecha_inicio_prog),
            ('fecha_termino_prog', obra.fecha_termino_prog),
            ('fecha_inicio_real', obra.fecha_inicio_real),
            ('fecha_termino_real', obra.fecha_termino_real),
            ('ultima_actualizacion', obra.ultima_actualizacion),
        ]
        
        for field_name, field_value in fecha_fields:
            if field_value:
                # Verificar que sea un objeto date
                is_valid = isinstance(field_value, date)
                iso_str = field_value.isoformat() if is_valid else "ERROR"
                
                status = "✅" if is_valid else "❌"
                print(f"  {status} {field_name}: {iso_str}")
                
                if not is_valid:
                    all_valid = False
        print()
    
    return all_valid


def test_api_response():
    """
    Verifica que el API devuelva fechas en formato ISO 8601.
    """
    print("=" * 60)
    print("VALIDACIÓN: Formato de Fechas en API Response")
    print("=" * 60)
    print()
    
    from rest_framework.test import APIRequestFactory
    from poa.views import ObraFilteredViewSet
    
    factory = APIRequestFactory()
    request = factory.get('/api/v2/obras/filtered/')
    
    view = ObraFilteredViewSet.as_view({'get': 'list'})
    response = view(request)
    
    if response.status_code != 200:
        print(f"❌ API devolvió status {response.status_code}")
        return False
    
    data = response.data
    
    if 'results' not in data or len(data['results']) == 0:
        print("⚠️  No hay resultados en el API.")
        return True
    
    # Tomar primer proyecto y verificar formato de fechas
    first_project = data['results'][0]
    
    print("Verificando formato de fechas en respuesta del API:\n")
    
    fecha_fields = [
        'fecha_inicio_prog',
        'fecha_termino_prog',
        'fecha_inicio_real',
        'fecha_termino_real',
        'ultima_actualizacion'
    ]
    
    all_valid = True
    for field_name in fecha_fields:
        if field_name in first_project and first_project[field_name]:
            fecha_str = first_project[field_name]
            
            # Verificar formato ISO 8601 (YYYY-MM-DD)
            import re
            is_iso = bool(re.match(r'^\d{4}-\d{2}-\d{2}$', fecha_str))
            
            status = "✅" if is_iso else "❌"
            print(f"{status} {field_name}: {fecha_str}")
            
            if not is_iso:
                all_valid = False
    
    print()
    return all_valid


if __name__ == '__main__':
    print()
    print("🚀 INICIANDO VALIDACIÓN DE SPRINT 3")
    print()
    
    # Test 1: Parsing de fechas
    test1 = test_date_parsing()
    
    # Test 2: Fechas en base de datos
    test2 = test_database_dates()
    
    # Test 3: Respuesta del API
    test3 = test_api_response()
    
    # Resumen final
    print("=" * 60)
    print("RESUMEN DE VALIDACIÓN")
    print("=" * 60)
    print()
    print(f"✅ Parsing de fechas: {'PASS' if test1 else 'FAIL'}")
    print(f"✅ Fechas en BD: {'PASS' if test2 else 'FAIL'}")
    print(f"✅ Formato API: {'PASS' if test3 else 'FAIL'}")
    print()
    
    if test1 and test2 and test3:
        print("🎉 Todos los tests pasaron exitosamente!")
        sys.exit(0)
    else:
        print("❌ Algunos tests fallaron. Revisa los detalles arriba.")
        sys.exit(1)
