# ✅ Estados de Proyecto Corregidos

**Fecha:** 28 de enero de 2026

## 🎯 Nueva Lógica de Estados

Se ha centralizado y corregido el cálculo de estados en la función `calcular_estatus_proyecto()` en `utils.py`.

### 📊 Estados Disponibles

1. **Completado** 🟢
2. **En Riesgo** 🔴
3. **Retrasado** 🟠
4. **En Ejecución** 🔵
5. **Planificado** ⚪

---

## 🔄 Orden de Evaluación (Jerárquico)

```python
def calcular_estatus_proyecto(obra):
    # 1. COMPLETADO
    if avance_fisico >= 100:
        return 'completado'
    
    # 2. EN RIESGO
    if riesgo > 3:  # 4 o 5 = Alto/Muy Alto
        return 'en_riesgo'
    
    # 3. RETRASADO
    if fecha_inicio_real <= hoy and avance_fisico == 0:
        return 'retrasado'
    
    # 4. EN EJECUCIÓN
    if avance_fisico > 0:
        return 'en_ejecucion'
    
    # 5. PLANIFICADO
    return 'planificado'
```

---

## 📋 Detalle de Cada Estado

### 1. 🟢 COMPLETADO
**Condición:** Avance físico = 100%

**Criterio único:**
- `avance_fisico_pct >= 100`

**Ejemplo:**
```
Proyecto: Construcción de parque
Avance físico: 100%
Estado: COMPLETADO ✅
```

---

### 2. 🔴 EN RIESGO
**Condición:** Nivel de riesgo > 3 (Alto o Muy Alto)

**Escala de riesgo:**
- 1 = Muy bajo riesgo
- 2 = Bajo riesgo
- 3 = Riesgo medio
- 4 = Alto riesgo ⚠️ → **EN RIESGO**
- 5 = Muy alto riesgo ⚠️ → **EN RIESGO**

**Ejemplo:**
```
Proyecto: Remodelación escuela
Riesgo: 4 (Alto)
Avance: 30%
Estado: EN RIESGO 🔴
```

**Nota:** Este estado tiene prioridad sobre "Retrasado" y "En Ejecución".

---

### 3. 🟠 RETRASADO
**Condición:** Tiene fecha de inicio real pasada pero SIN avance físico

**Criterios combinados:**
- `fecha_inicio_real <= fecha_actual`
- `avance_fisico_pct == 0`

**Ejemplo:**
```
Proyecto: Pavimentación vial
Fecha inicio real: 15/12/2025
Fecha actual: 28/01/2026
Avance físico: 0%
Estado: RETRASADO 🟠
```

**Significado:** El proyecto debió haber comenzado pero no ha arrancado.

---

### 4. 🔵 EN EJECUCIÓN
**Condición:** Tiene avance físico > 0 pero < 100%

**Criterio único:**
- `0 < avance_fisico_pct < 100`

**Ejemplo:**
```
Proyecto: Centro comunitario
Avance físico: 45%
Estado: EN EJECUCIÓN 🔵
```

**Nota:** Solo importa el avance físico, no el financiero.

---

### 5. ⚪ PLANIFICADO
**Condición:** Por descarte (default)

**Se asigna cuando:**
- No tiene fecha de inicio real
- O la fecha de inicio real es futura
- Y avance físico = 0%

**Ejemplo:**
```
Proyecto: Nueva biblioteca
Fecha inicio real: null
Avance físico: 0%
Estado: PLANIFICADO ⚪
```

---

## 🔍 Casos Especiales

### Caso 1: Proyecto con riesgo alto pero completado
```
Avance físico: 100%
Riesgo: 5 (Muy alto)

Resultado: COMPLETADO 🟢
Razón: El completado tiene prioridad máxima
```

### Caso 2: Proyecto retrasado que empieza a avanzar
```
Fecha inicio real: 01/12/2025 (pasada)
Avance físico inicial: 0% → RETRASADO 🟠
Avance físico nuevo: 10% → EN EJECUCIÓN 🔵

Razón: En cuanto tiene avance > 0, cambia a ejecución
```

### Caso 3: Proyecto en riesgo con avance
```
Riesgo: 4 (Alto)
Avance físico: 60%

Resultado: EN RIESGO 🔴
Razón: El riesgo alto tiene prioridad sobre ejecución
```

### Caso 4: Proyecto con fecha futura
```
Fecha inicio real: 15/03/2026 (futura)
Avance físico: 0%

Resultado: PLANIFICADO ⚪
Razón: No se considera retrasado si la fecha es futura
```

---

## 🎨 Colores en el Frontend

Definidos en `src/lib/theme.ts`:

```typescript
export const STATUS_COLORS = {
  completado: '#10b981',   // Verde (success)
  en_ejecucion: '#3b82f6', // Azul (info)
  en_riesgo: '#ef4444',    // Rojo (danger)
  retrasado: '#f59e0b',    // Ámbar (warning)
  planificado: '#94a3b8'   // Gris (neutral)
}
```

---

## 📊 Estadísticas por Estado

Se calculan en `DynamicKPIsView` usando la función centralizada:

```python
from .utils import calcular_estatus_proyecto

status_counts = {
    'planificado': 0,
    'en_ejecucion': 0,
    'en_riesgo': 0,
    'retrasado': 0,
    'completado': 0
}

for obra in Obra.objects.all():
    status = calcular_estatus_proyecto(obra)
    status_counts[status] += 1
```

---

## ✅ Una Sola Fuente de Verdad

**Todos los lugares ahora usan `calcular_estatus_proyecto()`:**

1. ✅ `ObraSerializer.get_estatus_general()` - Para API responses
2. ✅ `DynamicKPIsView` - Para estadísticas del dashboard
3. ✅ `latest_projects` - Para actividad reciente
4. ✅ Frontend usa `estatus_general` del backend directamente

**Archivos modificados:**
- `backend/poa/utils.py` - Función centralizada
- `backend/poa/serializers.py` - Usa función centralizada
- `backend/poa/views.py` - Usa función centralizada
- `src/lib/mappers.ts` - Ya usa `estatus_general` del backend
- `src/lib/theme.ts` - Colores para todos los estados

---

## 🚀 Próximos Pasos

1. **Re-verificar en ProjectsStatusChart** que muestre los 5 estados correctamente
2. **Probar casos edge:**
   - Proyectos con fecha inicio real = hoy
   - Proyectos con avance = 99.9%
   - Proyectos con riesgo = 3 (límite)
3. **Validar colores** en modo oscuro/claro

---

## 📝 Notas Técnicas

### Campos de Base de Datos Usados:
- `avance_fisico_pct` (DecimalField)
- `riesgo_nivel` (IntegerField, 1-5)
- `fecha_inicio_real` (DateField)

### Performance:
- La función `calcular_estatus_proyecto()` es O(1)
- No hace queries adicionales a la BD
- Puede calcularse en masa con un loop

### Validación de Datos:
- Todos los valores tienen defaults seguros (`or 0`, `or ''`)
- No hay errores si faltan campos
- Compatible con datos legacy
