# 🎯 Corrección de Escalas y Puntuación Ponderada

> **✅ ACTUALIZACIÓN 28/01/2026:** Se corrigió la lógica de puntuación. **TODOS los criterios usan la MISMA escala**: 1=Muy bajo, 5=Muy alto. NO hay inversión.

## 📋 Problema Identificado

El sistema tenía múltiples formas de interpretar las escalas 1-5 y calcular la puntuación ponderada:
- Algunas celdas tenían valores como "5 - Muy alto"
- Otras tenían solo números: 5, 4, 3, 2, 1
- Otras tenían texto: "Muy alto", "Alto", "Regular", etc.
- La puntuación ponderada se calculaba en varios lugares con lógica duplicada

## ✅ Solución Implementada

### 1. Centralización de Funciones en `utils.py`

#### **Función: `interpretar_escala_flexible()`**

Ahora interpreta CUALQUIER formato de escala 1-5:

```python
# Ejemplos de interpretación:
interpretar_escala_flexible(5) → 5
interpretar_escala_flexible("5 - Muy alto") → 5
interpretar_escala_flexible("Muy alto") → 5
interpretar_escala_flexible("Alto") → 4
interpretar_escala_flexible("Regular") → 3
interpretar_escala_flexible("Bajo") → 2
interpretar_escala_flexible("Muy bajo") → 1
interpretar_escala_flexible("Critico") → 5
interpretar_escala_flexible("Urgente") → 5
interpretar_escala_flexible(None) → 1 (default)
```

**Soporta:**
- ✅ Números directos: 1, 2, 3, 4, 5
- ✅ Formato completo: "5 - Muy alto", "4 - Alto"
- ✅ Texto simple: "muy alto", "alto", "regular", "bajo", "muy bajo"
- ✅ Variantes: "crítico", "urgente", "moderado"
- ✅ Mayúsculas/minúsculas: "MUY ALTO", "Muy Alto", "muy alto"
- ✅ Con guiones: "5-Muy alto", "5 - Muy alto"

#### **Función: `calcular_puntuacion_ponderada()`**

Calcula el promedio simple de los 7 criterios de forma centralizada:

```python
puntuacion = calcular_puntuacion_ponderada(
    alineacion=5,      # Alineación estratégica (1-5, 5=mejor)
    impacto=5,         # Impacto social (1-5, 5=mejor)
    urgencia=5,        # Urgencia (1-5, 5=mejor)
    viabilidad=4,      # Viabilidad de ejecución (1-5, 5=mejor)
    recursos=5,        # Recursos disponibles (1-5, 5=mejor)
    riesgo=5,          # Nivel de riesgo (1-5, 5=muy alto riesgo)
    dependencias=5     # Nivel de dependencias (1-5, 5=muy dependiente)
)
# Resultado: 4.86 (Crítica)
```

**Fórmula Simple:**
```
Puntuación = (alineacion + impacto + urgencia + viabilidad + recursos + 
              riesgo + dependencias) / 7
```

**✅ ESCALA UNIFORME - Todos los criterios:**

TODOS los 7 criterios usan la MISMA escala de interpretación:
- **1** = Muy bajo / Mínimo
- **2** = Bajo
- **3** = Regular / Medio
- **4** = Alto
- **5** = Muy alto / Máximo

| Criterio | 1 | 2 | 3 | 4 | 5 |
|----------|---|---|---|---|---|
| Alineación | Muy baja | Baja | Regular | Alta | Muy alta |
| Impacto | Muy bajo | Bajo | Regular | Alto | Muy alto |
| Urgencia | Muy baja | Baja | Regular | Alta | Muy alta |
| Viabilidad | Muy baja | Baja | Regular | Alta | Muy alta |
| Recursos | Muy pocos | Pocos | Regulares | Muchos | Abundantes |
| Riesgo | Muy bajo | Bajo | Regular | Alto | Muy alto |
| Dependencias | Muy pocas | Pocas | Regulares | Muchas | Muchísimas |

**Rangos de Prioridad:**
| Puntuación | Etiqueta |
|------------|----------|
| 4.5 - 5.0 | **Crítica** |
| 3.5 - 4.4 | **Muy Alta** |
| 2.5 - 3.4 | **Alta** |
| 1.5 - 2.4 | **Media** |
| 1.0 - 1.4 | **Baja** |

#### **Función: `obtener_etiqueta_prioridad()`**

Convierte puntuación numérica a etiqueta:

```python
obtener_etiqueta_prioridad(4.57) → "critica"
obtener_etiqueta_prioridad(3.2) → "alta"
obtener_etiqueta_prioridad(1.8) → "media"
```

### 2. Catálogo Expandido de Escalas

El `CATALOGO_ESCALAS` ahora incluye todas las variantes posibles:

```python
CATALOGO_ESCALAS = {
    # Escala 1
    "1": 1, "muy bajo": 1, "muy baja": 1, "minimo": 1,
    
    # Escala 2
    "2": 2, "bajo": 2, "baja": 2,
    
    # Escala 3
    "3": 3, "regular": 3, "medio": 3, "media": 3, "moderado": 3,
    
    # Escala 4
    "4": 4, "alto": 4, "alta": 4,
    
    # Escala 5
    "5": 5, "muy alto": 5, "critico": 5, "urgente": 5, "maximo": 5
}
```

### 3. Actualización del Importador

El comando `importar_excel.py` ahora:

1. **Interpreta las escalas automáticamente:**
```python
alineacion = interpretar_escala_flexible(row[21])  # "5 - Muy alto" → 5
impacto = interpretar_escala_flexible(row[22])     # "Alto" → 4
urgencia = interpretar_escala_flexible(row[23])    # 5 → 5
```

2. **Calcula la puntuación ponderada (promedio simple):**
```python
# Los valores ya están interpretados (1-5)
puntuacion = calcular_puntuacion_ponderada(
    alineacion, impacto, urgencia, viabilidad, 
    recursos, riesgo, dependencias
)
# Promedio simple: (c1 + c2 + c3 + c4 + c5 + c6 + c7) / 7
```

3. **Guarda valores consistentes:**
   - Los 7 criterios se guardan como números 1-5
   - La puntuación se calcula automáticamente como promedio simple
   - Ignora columna 28 del Excel (puntuacion_final_ponderada)

### 4. Actualización del Serializer

El `ObraSerializer` ahora usa las funciones centralizadas:

```python
def get_puntuacion_final_ponderada(self, obj):
    return calcular_puntuacion_ponderada(
        obj.alineacion_estrategica or 1,
        obj.impacto_social_nivel or 1,
        obj.urgencia or 1,
        obj.viabilidad_ejecucion or 1,
        obj.recursos_disponibles or 1,
        obj.riesgo_nivel or 1,
        obj.dependencias_nivel or 1
    )

def get_prioridad_label(self, obj):
    score = self.get_puntuacion_final_ponderada(obj)
    return obtener_etiqueta_prioridad(score)
```

## 📊 Ejemplos de Transformación

### Ejemplo 1: Proyecto Crítico (Bajo Riesgo)
```
Excel:
  Alineación: "5 - Muy alto"
  Impacto: "5 - Muy alto"
  Urgencia: "5 - Muy alto"
  Viabilidad: "4 - Alto"
  Recursos: "5 - Muy alto"
  Riesgo: "5 - Muy bajo riesgo"        ⚠️ INVERSA
  Dependencias: "5 - Muy autónomo"      ⚠️ INVERSA

Interpretación:
  5, 5, 5, 4, 5, 5, 5

Inversión:
  Riesgo: 6-5 = 1 (muy bajo riesgo = bueno)
  Dependencias: 6-5 = 1 (autónomo = bueno)

Puntuación: (5+5+5+4+5+1+1)/7 = 3.71
Prioridad: MUY ALTA 🔶
```

### Ejemplo 2: Proyecto de Alto Riesgo y Muy Dependiente
```
Excel:
  Alineación: 5
  Impacto: "Muy alto"
  Urgencia: "5 - Muy alto"
  Viabilidad: "Alto"
  Recursos: 5
  Riesgo: "1 - Muy alto riesgo"        ⚠️ INVERSA
  Dependencias: "1 - Muy dependiente"   ⚠️ INVERSA

Interpretación:
  5, 5, 5, 4, 5, 1, 1

Inversión:
  Riesgo: 6-1 = 5 (muy alto riesgo = malo)
  Dependencias: 6-1 = 5 (muy dependiente = malo)

Puntuación: (5+5+5+4+5+5+5)/7 = 4.86
Prioridad: CRÍTICA ⚠️

Interpretación: Aunque tiene alto riesgo y muchas dependencias,
su alta alineación, impacto y urgencia lo hacen crítico.
```

### Ejemplo 3: Proyecto Balanceado
```
Excel:
  Alineación: "Regular"
  Impacto: 3
  Urgencia: "3 - Regular"
  Viabilidad: "Alto"
  Recursos: "Regular"
  Riesgo: "4 - Bajo riesgo"            ⚠️ INVERSA (bueno)
  Dependencias: "3 - Regular"          ⚠️ INVERSA (neutral)

Interpretación:
  3, 3, 3, 4, 3, 4, 3

Inversión:
  Riesgo: 6-4 = 2 (bajo riesgo = bueno)
  Dependencias: 6-3 = 3 (neutral)

Puntuación: (3+3+3+4+3+2+3)/7 = 3.0
Prioridad: ALTA �
```

## 🚀 Cómo Aplicar los Cambios

### Paso 1: Re-importar los Datos

```bash
cd backend
python manage.py importar_excel
```

**Esto recalculará:**
- ✅ Todas las escalas (1-5) desde cualquier formato
- ✅ Todas las puntuaciones ponderadas automáticamente
- ✅ Todas las etiquetas de prioridad

### Paso 2: Verificar en Shell

```bash
python manage.py shell
```

```python
from poa.models import Obra

# Ver proyectos con sus puntuaciones
obras = Obra.objects.all()[:10]
for obra in obras:
    print(f"{obra.programa[:40]}")
    print(f"  Alineación: {obra.alineacion_estrategica}")
    print(f"  Impacto: {obra.impacto_social_nivel}")
    print(f"  Urgencia: {obra.urgencia}")
    print(f"  Puntuación: {obra.puntuacion_final_ponderada}")
    print()

# Contar por prioridad (usando serializer)
from poa.serializers import ObraSerializer
from poa.utils import obtener_etiqueta_prioridad

prioridades = {}
for obra in Obra.objects.all():
    puntuacion = obra.puntuacion_final_ponderada or 0
    etiqueta = obtener_etiqueta_prioridad(puntuacion)
    prioridades[etiqueta] = prioridades.get(etiqueta, 0) + 1

print("Distribución de Prioridades:")
for etiqueta, count in sorted(prioridades.items()):
    print(f"  {etiqueta}: {count} proyectos")
```

### Paso 3: Verificar en Frontend

El dashboard debería mostrar las prioridades correctamente calculadas.

## 🔍 Validación de Datos

### Script de Validación

Crea `backend/validar_escalas.py`:

```python
from poa.models import Obra
from poa.utils import calcular_puntuacion_ponderada, obtener_etiqueta_prioridad

print("=== VALIDACIÓN DE ESCALAS Y PUNTUACIONES ===\n")

total = Obra.objects.count()
errores = 0

for obra in Obra.objects.all():
    # Verificar que todos los criterios estén en rango 1-5
    criterios = [
        ('Alineación', obra.alineacion_estrategica),
        ('Impacto', obra.impacto_social_nivel),
        ('Urgencia', obra.urgencia),
        ('Viabilidad', obra.viabilidad_ejecucion),
        ('Recursos', obra.recursos_disponibles),
        ('Riesgo', obra.riesgo_nivel),
        ('Dependencias', obra.dependencias_nivel),
    ]
    
    for nombre, valor in criterios:
        if valor is None or not (1 <= valor <= 5):
            print(f"❌ ERROR en {obra.programa[:40]}")
            print(f"   {nombre}: {valor} (fuera de rango 1-5)")
            errores += 1
    
    # Verificar que la puntuación sea correcta
    puntuacion_calc = calcular_puntuacion_ponderada(
        obra.alineacion_estrategica or 1,
        obra.impacto_social_nivel or 1,
        obra.urgencia or 1,
        obra.viabilidad_ejecucion or 1,
        obra.recursos_disponibles or 1,
        obra.riesgo_nivel or 1,
        obra.dependencias_nivel or 1
    )
    
    if abs((obra.puntuacion_final_ponderada or 0) - puntuacion_calc) > 0.01:
        print(f"⚠️  Puntuación incorrecta en {obra.programa[:40]}")
        print(f"   Guardada: {obra.puntuacion_final_ponderada}")
        print(f"   Calculada: {puntuacion_calc}")

if errores == 0:
    print(f"✅ TODOS LOS {total} PROYECTOS TIENEN ESCALAS VÁLIDAS")
else:
    print(f"\n❌ {errores} ERRORES ENCONTRADOS DE {total} PROYECTOS")
```

Ejecutar:
```bash
python validar_escalas.py
```

## 📝 Cambios en los Archivos

### Archivos Modificados:

1. ✅ `backend/poa/utils.py`
   - Expandido `CATALOGO_ESCALAS`
   - Mejorado `interpretar_escala_flexible()`
   - Agregado `calcular_puntuacion_ponderada()`
   - Agregado `obtener_etiqueta_prioridad()`

2. ✅ `backend/poa/serializers.py`
   - Importa funciones centralizadas
   - Simplificado `get_puntuacion_final_ponderada()`
   - Simplificado `get_prioridad_label()`

3. ✅ `backend/poa/management/commands/importar_excel.py`
   - Interpreta escalas antes de guardar
   - Calcula puntuación automáticamente
   - Ignora columna 28 del Excel (se recalcula)

## 🎯 Beneficios

1. ✅ **Consistencia:** Una sola función para interpretar escalas
2. ✅ **Flexibilidad:** Acepta cualquier formato de entrada
3. ✅ **Precisión:** Puntuación calculada con lógica centralizada
4. ✅ **Mantenibilidad:** Un solo lugar para modificar la lógica
5. ✅ **Auditoría:** Fácil rastrear cómo se calculan las prioridades

## ⚠️ Notas Importantes

1. **La columna 28 del Excel se ignora:** La puntuación se calcula siempre desde los 7 criterios.

2. **Valores por defecto:** Si un criterio es NULL, se usa 1 como mínimo.

3. **Redondeo:** La puntuación se redondea a 2 decimales.

4. **Rango válido:** Todos los criterios deben estar entre 1 y 5.

## 🔄 Migración de Datos Existentes

Si ya tienes datos en la base de datos:

```bash
# Opción 1: Re-importar desde Excel
python manage.py importar_excel

# Opción 2: Script de migración (si no tienes el Excel)
python manage.py shell
```

```python
from poa.models import Obra
from poa.utils import calcular_puntuacion_ponderada

for obra in Obra.objects.all():
    # Recalcular puntuación
    obra.puntuacion_final_ponderada = calcular_puntuacion_ponderada(
        obra.alineacion_estrategica or 1,
        obra.impacto_social_nivel or 1,
        obra.urgencia or 1,
        obra.viabilidad_ejecucion or 1,
        obra.recursos_disponibles or 1,
        obra.riesgo_nivel or 1,
        obra.dependencias_nivel or 1
    )
    obra.save()

print("✅ Puntuaciones recalculadas")
```

## ✅ Checklist

- [x] Expandir catálogo de escalas en `utils.py`
- [x] Mejorar `interpretar_escala_flexible()`
- [x] Crear `calcular_puntuacion_ponderada()`
- [x] Crear `obtener_etiqueta_prioridad()`
- [x] Actualizar `serializers.py`
- [x] Actualizar `importar_excel.py`
- [ ] Re-importar datos: `python manage.py importar_excel`
- [ ] Validar con script de verificación
- [ ] Verificar en frontend: dashboard y tablas
- [ ] Probar con datos reales

## 📞 Preguntas Frecuentes

**¿Qué pasa si el Excel tiene valores fuera de 1-5?**
- Se ajustan automáticamente al rango válido (1 como mínimo, 5 como máximo)

**¿Puedo cambiar los rangos de prioridad?**
- Sí, modifica la función `obtener_etiqueta_prioridad()` en `utils.py`

**¿Cómo agrego más variantes textuales?**
- Edita `CATALOGO_ESCALAS` en `utils.py`

**¿La puntuación se guarda o se calcula cada vez?**
- Se guarda en la base de datos durante la importación
- El serializer puede recalcularla si es necesario
