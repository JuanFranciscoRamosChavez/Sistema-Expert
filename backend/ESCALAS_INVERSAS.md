# ⚠️ Escalas Inversas: Riesgo y Dependencias

## 📊 Explicación del Problema

En los 7 criterios de priorización, **RIESGO** y **DEPENDENCIAS** tienen una **escala inversa**, donde:
- **Valores bajos (1) = MALO** para el proyecto
- **Valores altos (5) = BUENO** para el proyecto

Esto es **diferente** de los otros 5 criterios donde:
- **Valores altos (5) = MEJOR** para el proyecto

## 🔍 Definición de Escalas

### RIESGO (1-5) - ESCALA INVERSA

Mide el nivel de riesgo asociado al proyecto (técnico, financiero, político, social).

| Valor | Significado | Interpretación | Para el cálculo |
|-------|-------------|----------------|-----------------|
| **1** | Muy alto riesgo | 🔴 **MALO** (muy riesgoso) | Se invierte a **5** |
| **2** | Alto riesgo | 🟠 MALO | Se invierte a **4** |
| **3** | Riesgo medio | 🟡 NEUTRAL | Se invierte a **3** |
| **4** | Bajo riesgo | 🟢 BUENO | Se invierte a **2** |
| **5** | Muy bajo riesgo | 🟢 **BUENO** (poco riesgo) | Se invierte a **1** |

**Peso ponderado:** 10%

**Ejemplo:**
- Si el proyecto tiene "Riesgo 5 - Muy bajo riesgo" → Es **bueno** (poco riesgo)
- Si el proyecto tiene "Riesgo 1 - Muy alto riesgo" → Es **malo** (muy riesgoso)

### DEPENDENCIAS (1-5) - ESCALA INVERSA

Mide el grado de dependencia de otros proyectos, actores o coordinaciones interinstitucionales.

| Valor | Significado | Interpretación | Para el cálculo |
|-------|-------------|----------------|-----------------|
| **1** | Muy dependiente | 🔴 **MALO** (muchas dependencias) | Se invierte a **5** |
| **2** | Dependiente | 🟠 MALO | Se invierte a **4** |
| **3** | Neutral | 🟡 NEUTRAL | Se invierte a **3** |
| **4** | Poco dependiente | 🟢 BUENO | Se invierte a **2** |
| **5** | Muy autónomo | 🟢 **BUENO** (independiente) | Se invierte a **1** |

**Peso ponderado:** 5%

**Ejemplo:**
- Si el proyecto tiene "Dependencias 5 - Muy autónomo" → Es **bueno** (puede ejecutarse solo)
- Si el proyecto tiene "Dependencias 1 - Muy dependiente" → Es **malo** (necesita mucha coordinación)

## 🔄 Fórmula de Inversión

Para que las escalas inversas se alineen con los demás criterios:

```python
valor_invertido = 6 - valor_original
```

### Tabla de Conversión

| Original | Invertido | Explicación |
|----------|-----------|-------------|
| 1 | 5 | Lo más malo se convierte en máxima penalización |
| 2 | 4 | Malo |
| 3 | 3 | Neutral (no cambia) |
| 4 | 2 | Bueno |
| 5 | 1 | Lo más bueno aporta mínimo (ya es óptimo) |

## 📐 Fórmula de Puntuación Ponderada

```python
# 1. Leer valores originales del Excel
alineacion = 5        # Muy alta (bueno)
impacto = 5           # Muy alto (bueno)
urgencia = 5          # Muy urgente (bueno)
viabilidad = 4        # Alta (bueno)
recursos = 5          # Muchos recursos (bueno)
riesgo = 1            # ⚠️ Muy alto riesgo (MALO)
dependencias = 1      # ⚠️ Muy dependiente (MALO)

# 2. Invertir riesgo y dependencias
riesgo_inv = 6 - 1 = 5        # Penaliza por ser riesgoso
dependencias_inv = 6 - 1 = 5  # Penaliza por ser dependiente

# 3. Calcular promedio
puntuacion = (5 + 5 + 5 + 4 + 5 + 5 + 5) / 7 = 4.86

# 4. Resultado
Prioridad: CRÍTICA (4.86)
```

## 📊 Ejemplos Completos

### Ejemplo 1: Proyecto de Bajo Riesgo y Autónomo

```
Datos del Excel:
  - Alineación Estratégica: 5 (Muy alta)
  - Impacto Social: 5 (Muy alto)
  - Urgencia: 5 (Muy urgente)
  - Viabilidad: 4 (Alta)
  - Recursos: 5 (Abundantes)
  - Riesgo: 5 (Muy bajo riesgo) ⚠️ INVERSA
  - Dependencias: 5 (Muy autónomo) ⚠️ INVERSA

Cálculo:
  riesgo_inv = 6 - 5 = 1 (bajo riesgo = bueno)
  dependencias_inv = 6 - 5 = 1 (autónomo = bueno)
  
  puntuacion = (5 + 5 + 5 + 4 + 5 + 1 + 1) / 7 = 3.71

Resultado: MUY ALTA (3.71) 🔶
```

### Ejemplo 2: Proyecto de Alto Riesgo y Muy Dependiente

```
Datos del Excel:
  - Alineación Estratégica: 5 (Muy alta)
  - Impacto Social: 5 (Muy alto)
  - Urgencia: 5 (Muy urgente)
  - Viabilidad: 4 (Alta)
  - Recursos: 5 (Abundantes)
  - Riesgo: 1 (Muy alto riesgo) ⚠️ INVERSA
  - Dependencias: 1 (Muy dependiente) ⚠️ INVERSA

Cálculo:
  riesgo_inv = 6 - 1 = 5 (alto riesgo = malo, penaliza)
  dependencias_inv = 6 - 1 = 5 (dependiente = malo, penaliza)
  
  puntuacion = (5 + 5 + 5 + 4 + 5 + 5 + 5) / 7 = 4.86

Resultado: CRÍTICA (4.86) ⚠️

Interpretación: Aunque tiene alto riesgo y muchas dependencias,
su alta alineación, impacto y urgencia lo hacen crítico para ejecutar.
```

### Ejemplo 3: Proyecto Balanceado

```
Datos del Excel:
  - Alineación Estratégica: 3 (Regular)
  - Impacto Social: 3 (Regular)
  - Urgencia: 3 (Regular)
  - Viabilidad: 4 (Alta)
  - Recursos: 3 (Regular)
  - Riesgo: 4 (Bajo riesgo) ⚠️ INVERSA
  - Dependencias: 3 (Neutral) ⚠️ INVERSA

Cálculo:
  riesgo_inv = 6 - 4 = 2 (bajo riesgo = bueno)
  dependencias_inv = 6 - 3 = 3 (neutral)
  
  puntuacion = (3 + 3 + 3 + 4 + 3 + 2 + 3) / 7 = 3.0

Resultado: ALTA (3.0) 🔸
```

### Ejemplo 4: Proyecto con Bajo Riesgo pero Baja Prioridad

```
Datos del Excel:
  - Alineación Estratégica: 2 (Baja)
  - Impacto Social: 2 (Bajo)
  - Urgencia: 2 (Baja)
  - Viabilidad: 3 (Regular)
  - Recursos: 2 (Escasos)
  - Riesgo: 5 (Muy bajo riesgo) ⚠️ INVERSA
  - Dependencias: 5 (Muy autónomo) ⚠️ INVERSA

Cálculo:
  riesgo_inv = 6 - 5 = 1 (bajo riesgo = bueno)
  dependencias_inv = 6 - 5 = 1 (autónomo = bueno)
  
  puntuacion = (2 + 2 + 2 + 3 + 2 + 1 + 1) / 7 = 1.86

Resultado: MEDIA (1.86) 🔹

Interpretación: Aunque tiene bajo riesgo y es autónomo,
su baja alineación e impacto lo hacen de prioridad media.
```

## 🔧 Implementación en el Código

### Función `calcular_puntuacion_ponderada()`

Ubicación: `backend/poa/utils.py`

```python
def calcular_puntuacion_ponderada(alineacion, impacto, urgencia, viabilidad, 
                                   recursos, riesgo, dependencias):
    """
    Calcula la puntuación con escalas inversas para riesgo y dependencias.
    
    ⚠️ ESCALAS INVERSAS:
    - RIESGO: 1=muy alto riesgo (malo), 5=muy bajo riesgo (bueno)
    - DEPENDENCIAS: 1=muy dependiente (malo), 5=muy autónomo (bueno)
    """
    # Validar criterios (1-5)
    criterios = [alineacion, impacto, urgencia, viabilidad, recursos, riesgo, dependencias]
    validos = [max(1, min(5, float(c or 1))) for c in criterios]
    
    # INVERTIR riesgo y dependencias
    validos[5] = 6 - validos[5]  # riesgo invertido
    validos[6] = 6 - validos[6]  # dependencias invertido
    
    # Calcular promedio
    promedio = sum(validos) / 7
    return round(promedio, 2)
```

## 📋 Interpretación en el Excel

Cuando lees el Excel, puedes encontrar:

### Formato Numérico
```
Riesgo: 1          → Se lee: "muy alto riesgo" (malo)
Riesgo: 5          → Se lee: "muy bajo riesgo" (bueno)
Dependencias: 1    → Se lee: "muy dependiente" (malo)
Dependencias: 5    → Se lee: "muy autónomo" (bueno)
```

### Formato Textual
```
Riesgo: "Muy alto"           → Interpretar como 1 → Invertir a 5
Riesgo: "Muy bajo"           → Interpretar como 5 → Invertir a 1
Dependencias: "Muy alto"     → Interpretar como 1 → Invertir a 5
Dependencias: "Muy bajo"     → Interpretar como 5 → Invertir a 1
```

### Formato Completo
```
Riesgo: "1 - Muy alto riesgo"        → Extraer 1 → Invertir a 5
Riesgo: "5 - Muy bajo riesgo"        → Extraer 5 → Invertir a 1
Dependencias: "1 - Muy dependiente"  → Extraer 1 → Invertir a 5
Dependencias: "5 - Muy autónomo"     → Extraer 5 → Invertir a 1
```

## ✅ Validación

Para validar que la inversión funciona correctamente:

```python
from poa.utils import calcular_puntuacion_ponderada

# Caso 1: Proyecto perfecto EXCEPTO alto riesgo
puntuacion = calcular_puntuacion_ponderada(5, 5, 5, 5, 5, 1, 5)
print(f"Riesgo 1 (muy alto): {puntuacion}")  # Debería ser alta (~4.71)

# Caso 2: Proyecto perfecto EXCEPTO muy dependiente
puntuacion = calcular_puntuacion_ponderada(5, 5, 5, 5, 5, 5, 1)
print(f"Dependencias 1 (muy dependiente): {puntuacion}")  # Debería ser alta (~4.71)

# Caso 3: Proyecto perfecto con bajo riesgo y autónomo
puntuacion = calcular_puntuacion_ponderada(5, 5, 5, 5, 5, 5, 5)
print(f"Riesgo 5, Dependencias 5: {puntuacion}")  # Debería ser ~3.71

# Caso 4: Proyecto con alto riesgo Y muy dependiente
puntuacion = calcular_puntuacion_ponderada(5, 5, 5, 5, 5, 1, 1)
print(f"Riesgo 1, Dependencias 1: {puntuacion}")  # Debería ser ~4.86
```

## 🎯 Resumen

| Criterio | Escala | 1 significa | 5 significa | Inversión |
|----------|--------|-------------|-------------|-----------|
| Alineación | Normal | Baja | Muy alta | ❌ No |
| Impacto | Normal | Bajo | Muy alto | ❌ No |
| Urgencia | Normal | Baja | Muy alta | ❌ No |
| Viabilidad | Normal | Baja | Muy alta | ❌ No |
| Recursos | Normal | Escasos | Abundantes | ❌ No |
| **Riesgo** | **Inversa** | **Muy alto riesgo** | **Muy bajo riesgo** | ✅ Sí (6-x) |
| **Dependencias** | **Inversa** | **Muy dependiente** | **Muy autónomo** | ✅ Sí (6-x) |

---

**Fecha de actualización:** 27 de enero de 2026
**Autor:** Sistema de Gestión de Obras Públicas
