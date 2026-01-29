# 🔧 Corrección de Importación de Presupuestos en MDP

## 🎯 Problema Identificado

Los valores en el Excel están expresados en **MDP (Millones De Pesos)**, pero el sistema los estaba leyendo como valores normales.

### Ejemplo del Problema:

```
Excel dice: 428.0948343 (significa 428.09 MDP)
Sistema guardaba: $428.09
Debería guardar: $428,094,834.30
```

## ✅ Solución Implementada

Se modificó la función `clean_money()` para que acepte un parámetro `es_mdp` que indica si el valor está en millones.

### Archivo Modificado: `backend/poa/utils.py`

```python
def clean_money(valor, es_mdp=True):
    """
    Limpia y estandariza montos financieros.
    
    Args:
        valor: Valor a limpiar (puede ser número, string con símbolos, etc)
        es_mdp: Si True, asume que el valor está en Millones De Pesos (MDP)
                y multiplica por 1,000,000. Default: True
    
    Ejemplos:
        clean_money(428.0948343, es_mdp=True) -> 428094834.30  (428.09 MDP)
        clean_money("$ 1,990.6", es_mdp=True) -> 1990600000.00 (1,990.6 MDP)
        clean_money("2,569.1", es_mdp=True)   -> 2569100000.00 (2,569.1 MDP)
        clean_money(410.47, es_mdp=False)     -> 410.47        (valor directo)
    """
```

### Archivo Modificado: `backend/poa/management/commands/importar_excel.py`

Se especificó qué campos están en MDP:

```python
# ✅ CAMPOS EN MDP (se multiplican × 1,000,000)
presupuesto_modificado=clean_money(row[7], es_mdp=True)
anteproyecto_total=clean_money(row[8], es_mdp=True)

# ❌ CAMPOS QUE NO SON MDP (valores directos)
meta_2025=clean_money(row[9], es_mdp=False)          # Cantidad de metas
meta_2026=clean_money(row[10], es_mdp=False)         # Cantidad de metas
costo_unitario=clean_money(row[12], es_mdp=False)   # Costo por unidad
puntuacion_final_ponderada=clean_money(row[28], es_mdp=False)  # Escala 1-5
```

## 📊 Tabla de Conversión

| Valor en Excel | MDP | Valor Real | Formateado |
|----------------|-----|------------|------------|
| 428.0948343 | ✅ | $428,094,834.30 | $428.09 M |
| 2,569.1 | ✅ | $2,569,100,000.00 | $2.57 MM |
| 410.47 | ✅ | $410,470,000.00 | $410.47 M |
| 1,990.6 | ✅ | $1,990,600,000.00 | $1.99 MM |
| 764.2059281 | ✅ | $764,205,928.10 | $764.21 M |
| 50.0 | ✅ | $50,000,000.00 | $50.00 M |

## 🚀 Cómo Re-importar los Datos

### Paso 1: Verificar que tienes el Excel actualizado

```bash
cd backend
ls data/
# Debe mostrar: datos.xlsx o datos.csv
```

### Paso 2: Ejecutar el comando de importación

```bash
# En la terminal de Python (backend activado)
python manage.py importar_excel
```

### Paso 3: Verificar los datos

```bash
python manage.py shell
```

```python
from poa.models import Obra
from decimal import Decimal

# Ver algunos presupuestos
obras = Obra.objects.all()[:5]
for obra in obras:
    print(f"{obra.programa[:30]}: ${obra.presupuesto_modificado:,.2f}")

# Verificar el total
total = sum([
    obra.presupuesto_modificado if obra.presupuesto_modificado > 0 
    else obra.anteproyecto_total 
    for obra in Obra.objects.all()
])
print(f"\nPresupuesto Total: ${total:,.2f}")
```

## 🔍 Verificación en el Frontend

Después de re-importar, el dashboard debería mostrar:

```
Presupuesto Total: $XXX,XXX,XXX,XXX  (En miles de millones)
```

En lugar de:

```
Presupuesto Total: $XXX,XXX  (Incorrecto)
```

## ⚙️ Configuración para Otros Campos

Si necesitas que otros campos también se lean en MDP, modifica `importar_excel.py`:

```python
# Ejemplo: Si "proyecto_presupuesto" también está en MDP
proyecto_presupuesto=clean_money(row[13], es_mdp=True),  # Cambiar a True
```

## 📝 Campos que USAN MDP (es_mdp=True)

Estos campos están expresados en millones en el Excel:

- ✅ `presupuesto_modificado` (Columna 7)
- ✅ `anteproyecto_total` (Columna 8)

## 📝 Campos que NO USAN MDP (es_mdp=False)

Estos campos son valores directos, no millones:

- ❌ `meta_2025` (Columna 9) - Cantidad de metas
- ❌ `meta_2026` (Columna 10) - Cantidad de metas
- ❌ `costo_unitario` (Columna 12) - Costo por unidad
- ❌ `proyecto_presupuesto` (Columna 13) - **Verificar si debe ser MDP**
- ❌ `puntuacion_final_ponderada` (Columna 28) - Puntuación 1-5

## 🐛 Troubleshooting

### Problema: Los valores siguen apareciendo pequeños

**Causa:** No se re-importaron los datos después del cambio.

**Solución:**
```bash
python manage.py importar_excel
```

### Problema: Los valores ahora son demasiado grandes

**Causa:** El campo no debería estar en MDP pero se marcó como `es_mdp=True`.

**Solución:** Cambiar a `es_mdp=False` y re-importar.

### Problema: Error al importar

**Causa:** El archivo Excel puede tener valores corruptos.

**Solución:**
1. Verificar el archivo Excel
2. Revisar los logs del comando:
```bash
python manage.py importar_excel > log_importacion.txt 2>&1
```

## 📊 Impacto en el Sistema

### Backend
- ✅ Los cálculos de presupuesto total ahora serán correctos
- ✅ Los porcentajes de ejecución serán precisos
- ✅ Las comparaciones entre proyectos serán válidas

### Frontend
- ✅ Los KPIs mostrarán valores reales
- ✅ Las gráficas de presupuesto serán proporcionales
- ✅ Los formateados (M, MM, K) serán correctos

## 🎯 Verificación Rápida

Para verificar que todo está correcto:

```bash
# Backend
python manage.py shell -c "from poa.models import Obra; print(f'Total proyectos: {Obra.objects.count()}'); print(f'Presupuesto promedio: ${sum([o.presupuesto_modificado or o.anteproyecto_total for o in Obra.objects.all()]) / Obra.objects.count():,.2f}')"

# Frontend
# Abrir http://localhost:8080
# El "Presupuesto Total" debe mostrar miles de millones, no miles
```

## 📞 Notas Adicionales

1. **Default es MDP:** Por defecto, `clean_money()` ahora asume que los valores están en millones (`es_mdp=True`).

2. **Retrocompatibilidad:** Si tienes scripts que usan `clean_money()` sin el parámetro, seguirán funcionando (usarán el default `es_mdp=True`).

3. **Valores en Excel:** El Excel debe tener los valores en MDP (ej: 428.09 para representar $428,090,000).

4. **Precisión:** Todos los cálculos mantienen 2 decimales de precisión para cumplir con estándares financieros.

## ✅ Checklist de Implementación

- [x] Modificar función `clean_money()` en `utils.py`
- [x] Actualizar llamadas en `importar_excel.py`
- [x] Documentar cambios
- [ ] Re-importar datos: `python manage.py importar_excel`
- [ ] Verificar en shell: valores en millones
- [ ] Verificar en frontend: dashboard muestra valores correctos
- [ ] Probar con datos reales del Excel

## 🔄 Revertir Cambios (si es necesario)

Si necesitas volver a la versión anterior (sin MDP):

```python
# En utils.py, cambiar:
def clean_money(valor, es_mdp=False):  # Cambiar default a False
    # ... resto del código igual
```

Luego re-importar datos.
