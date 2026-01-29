# ✅ Corrección Final: Puntuación Ponderada

**Fecha:** 28 de enero de 2026

## 🎯 Una Sola Fuente de Verdad

### Regla Unificada

**TODOS los 7 criterios usan la MISMA escala:**
- **1 = Muy bajo / Mínimo**
- **2 = Bajo**
- **3 = Regular / Medio**  
- **4 = Alto**
- **5 = Muy alto / Máximo**

### Fórmula Simple

```python
Puntuación = (criterio1 + criterio2 + ... + criterio7) / 7
```

**NO hay inversión de ningún criterio.**

## 📊 Ejemplos Reales

### Ejemplo 1: Proyecto Crítico (todos en 5)
```
Alineación: 5
Impacto: 5
Urgencia: 5
Viabilidad: 5
Recursos: 5
Riesgo: 5
Dependencias: 5

Puntuación = (5+5+5+5+5+5+5)/7 = 35/7 = 5.0
Prioridad: CRÍTICA 🔴
```

### Ejemplo 2: Proyecto Muy Alta (mayoría en 5, algunos en 4)
```
Alineación: 4
Impacto: 5
Urgencia: 5
Viabilidad: 4
Recursos: 5
Riesgo: 3
Dependencias: 5

Puntuación = (4+5+5+4+5+3+5)/7 = 31/7 = 4.43
Prioridad: MUY ALTA 🟠
```

### Ejemplo 3: Proyecto Alta (valores medios)
```
Alineación: 3
Impacto: 3
Urgencia: 3
Viabilidad: 3
Recursos: 3
Riesgo: 3
Dependencias: 3

Puntuación = (3+3+3+3+3+3+3)/7 = 21/7 = 3.0
Prioridad: ALTA 🟡
```

### Ejemplo 4: Proyecto Media
```
Alineación: 2
Impacto: 2
Urgencia: 2
Viabilidad: 3
Recursos: 2
Riesgo: 2
Dependencias: 2

Puntuación = (2+2+2+3+2+2+2)/7 = 15/7 = 2.14
Prioridad: MEDIA 🔵
```

### Ejemplo 5: Proyecto Baja
```
Alineación: 1
Impacto: 1
Urgencia: 1
Viabilidad: 1
Recursos: 1
Riesgo: 1
Dependencias: 1

Puntuación = (1+1+1+1+1+1+1)/7 = 7/7 = 1.0
Prioridad: BAJA ⚪
```

## 📋 Rangos de Prioridad

| Puntuación | Prioridad | Emoji |
|------------|-----------|-------|
| 4.5 - 5.0 | Crítica | 🔴 |
| 3.5 - 4.49 | Muy Alta | 🟠 |
| 2.5 - 3.49 | Alta | 🟡 |
| 1.5 - 2.49 | Media | 🔵 |
| 1.0 - 1.49 | Baja | ⚪ |

## 🔧 Implementación

### Ubicación del Código
- **Función principal:** `backend/poa/utils.py` → `calcular_puntuacion_ponderada()`
- **Usada por:** 
  - `backend/poa/serializers.py` → `get_puntuacion_final_ponderada()`
  - `backend/poa/management/commands/importar_excel.py`

### Código Simplificado

```python
def calcular_puntuacion_ponderada(alineacion, impacto, urgencia, 
                                   viabilidad, recursos, riesgo, dependencias):
    """
    Promedio simple de 7 criterios (1-5).
    NO hay inversión de escalas.
    """
    criterios = [alineacion, impacto, urgencia, viabilidad, 
                 recursos, riesgo, dependencias]
    
    # Validar y asegurar rango 1-5
    validos = [max(1, min(5, float(c or 1))) for c in criterios]
    
    # Promedio simple
    promedio = sum(validos) / 7
    
    return round(promedio, 2)
```

## ✅ Checklist de Verificación

- [x] Eliminada inversión de RIESGO
- [x] Eliminada inversión de DEPENDENCIAS
- [x] Escala uniforme 1-5 para todos los criterios
- [x] Función centralizada en `utils.py`
- [x] Documentación actualizada
- [ ] Re-importar datos: `python manage.py importar_excel`
- [ ] Verificar puntuaciones en el frontend

## 🚀 Próximos Pasos

```bash
cd backend
python manage.py importar_excel
```

Esto recalculará todas las puntuaciones con la lógica correcta (sin inversión).
