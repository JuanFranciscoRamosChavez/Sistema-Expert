# 📊 Cálculo del Presupuesto Total - Documentación Completa

## 🎯 Resumen Ejecutivo

El **presupuesto total** se calcula sumando el presupuesto de TODOS los proyectos, aplicando la siguiente regla de prioridad:

```
SI presupuesto_modificado > 0:
    usar presupuesto_modificado
SI NO:
    usar anteproyecto_total
```

---

## 📍 Ubicación del Cálculo

### **Backend: DynamicKPIsView**
**Archivo:** `backend/poa/views.py` (líneas 492-507)

```python
# Calcular presupuestos y montos ejecutados
total_budget = Decimal(0)
total_executed = Decimal(0)

for obra in Obra.objects.all():
    # Regla de negocio: presupuesto_modificado > 0 tiene prioridad
    presupuesto = Decimal(
        obra.presupuesto_modificado if (obra.presupuesto_modificado or 0) > 0 
        else (obra.anteproyecto_total or 0)
    )
    
    # Ejecutado = Presupuesto × (% avance financiero)
    avance_financiero = Decimal(obra.avance_financiero_pct or 0) / 100
    ejecutado = presupuesto * avance_financiero
    
    total_budget += presupuesto
    total_executed += ejecutado
```

**Retorna en JSON:**
```json
{
  "budget": {
    "total": 50000000.00,
    "executed": 25000000.00,
    "remaining": 25000000.00,
    "execution_rate": 50.0,
    "formatted_total": "$50,000,000",
    "formatted_executed": "$25,000,000"
  }
}
```

---

## 🔄 Flujo Completo del Cálculo

### **1. Base de Datos (models.py)**

```python
class Obra(models.Model):
    # Columna H del Excel
    presupuesto_modificado = models.FloatField(default=0)
    
    # Columna I del Excel  
    anteproyecto_total = models.FloatField(default=0)
    
    # % de avance financiero
    avance_financiero_pct = models.FloatField(default=0)
```

### **2. Serializer (serializers.py)**

Calcula el presupuesto para cada proyecto individual:

```python
def get_presupuesto_final(self, obj):
    """Determina qué presupuesto usar"""
    if (obj.presupuesto_modificado or 0) > 0:
        return obj.presupuesto_modificado
    else:
        return obj.anteproyecto_total or 0

def get_monto_ejecutado(self, obj):
    """Calcula el dinero ya gastado"""
    presupuesto = self.get_presupuesto_final(obj)
    return presupuesto * (obj.avance_financiero_pct / 100.0)
```

### **3. Vista DynamicKPIsView (views.py)**

Suma todos los proyectos:

```python
total_budget = Decimal(0)
total_executed = Decimal(0)

for obra in Obra.objects.all():
    presupuesto = (
        obra.presupuesto_modificado if obra.presupuesto_modificado > 0 
        else obra.anteproyecto_total
    )
    ejecutado = presupuesto * (obra.avance_financiero_pct / 100)
    
    total_budget += presupuesto
    total_executed += ejecutado
```

### **4. Frontend (DashboardView.tsx)**

Muestra el valor recibido del backend:

```tsx
<KPICard
    title="Presupuesto Total"
    value={kpis.budget?.formatted_total || '$0'}
    subtitle={`${(kpis.budget?.execution_rate || 0).toFixed(1)}% ejecutado`}
    icon={DollarSign}
/>
```

---

## 📋 Ejemplos Prácticos

### **Ejemplo 1: Proyecto con Presupuesto Modificado**

```
Proyecto A:
  presupuesto_modificado = $1,500,000
  anteproyecto_total = $1,000,000
  avance_financiero_pct = 60%

Resultado:
  ✅ Usa: $1,500,000 (presupuesto_modificado porque > 0)
  💰 Ejecutado: $1,500,000 × 60% = $900,000
```

### **Ejemplo 2: Proyecto sin Modificación**

```
Proyecto B:
  presupuesto_modificado = 0 (o null)
  anteproyecto_total = $800,000
  avance_financiero_pct = 45%

Resultado:
  ✅ Usa: $800,000 (anteproyecto_total porque modificado = 0)
  💰 Ejecutado: $800,000 × 45% = $360,000
```

### **Ejemplo 3: Total con 3 Proyectos**

```
Proyecto A: $1,500,000 (modificado) → Ejecutado: $900,000
Proyecto B: $800,000 (anteproyecto) → Ejecutado: $360,000
Proyecto C: $2,000,000 (modificado) → Ejecutado: $1,400,000

TOTAL PRESUPUESTO: $4,300,000
TOTAL EJECUTADO: $2,660,000
TASA DE EJECUCIÓN: 61.86%
```

---

## 🔍 Otros Lugares Donde se Usa Esta Lógica

### **1. DashboardResumenView (Legacy)**
**Archivo:** `backend/poa/views.py` (líneas 48-61)

```python
agregados = Obra.objects.aggregate(
    presupuesto_total=Sum(
        Case(
            When(presupuesto_modificado__gt=0, then=F('presupuesto_modificado')),
            default=F('anteproyecto_total'),
            output_field=DecimalField()
        )
    )
)
presupuesto_total = agregados['presupuesto_total'] or 0
```

**Ventaja:** Usa SQL nativo para calcular en la base de datos (más rápido).

### **2. Análisis Territorial (services.py)**

```python
def calculate_territorial_stats(queryset):
    for obra in queryset:
        presupuesto = Decimal(
            obra.presupuesto_modificado if obra.presupuesto_modificado > 0 
            else obra.anteproyecto_total
        )
        # Prorrateo por zonas...
```

### **3. Frontend Mapper (mappers.ts)**

```typescript
export function mapApiToUiProject(apiProject: APIProject): Project {
    return {
        presupuesto: apiProject.presupuesto_final || 0,
        ejecutado: apiProject.monto_ejecutado || 0,
        // ...otros campos
    };
}
```

**Nota:** El frontend recibe `presupuesto_final` ya calculado por el serializer.

---

## ⚠️ Consideraciones Importantes

### **1. Valores NULL o 0**

```python
# Manejo defensivo de valores NULL
presupuesto_modificado or 0  # Si es NULL, usa 0
anteproyecto_total or 0       # Si es NULL, usa 0
```

### **2. Precisión Decimal**

```python
from decimal import Decimal

# ✅ BIEN: Usa Decimal para dinero
total_budget = Decimal(0)
total_budget += Decimal(obra.presupuesto_modificado)

# ❌ MAL: Usar float puede causar errores de redondeo
total_budget = 0.0  # No recomendado para dinero
```

### **3. Formateo en Frontend**

```typescript
// Backend envía número plano
"total": 50000000.00

// Backend también envía formateado
"formatted_total": "$50,000,000"

// Frontend usa el formateado para mostrar
value={kpis.budget.formatted_total}
```

---

## 🧪 Cómo Verificar el Cálculo

### **Opción 1: Django Shell**

```bash
cd backend
python manage.py shell
```

```python
from poa.models import Obra
from decimal import Decimal

total = Decimal(0)
for obra in Obra.objects.all():
    presupuesto = (
        obra.presupuesto_modificado if obra.presupuesto_modificado > 0 
        else obra.anteproyecto_total
    )
    total += Decimal(presupuesto or 0)
    
print(f"Total: ${total:,.2f}")
```

### **Opción 2: Query SQL Directa**

```sql
SELECT 
    SUM(
        CASE 
            WHEN presupuesto_modificado > 0 THEN presupuesto_modificado
            ELSE anteproyecto_total
        END
    ) as presupuesto_total
FROM poa_obra;
```

### **Opción 3: Endpoint HTTP**

```bash
curl http://localhost:8000/api/v2/dashboard/kpis/ | jq '.budget'
```

**Respuesta esperada:**
```json
{
  "total": 50000000.00,
  "executed": 25000000.00,
  "remaining": 25000000.00,
  "execution_rate": 50.0,
  "formatted_total": "$50,000,000",
  "formatted_executed": "$25,000,000"
}
```

---

## 🔧 Cómo Modificar el Cálculo

### **Escenario 1: Cambiar la Regla de Prioridad**

Si quieres que SIEMPRE use `anteproyecto_total`:

```python
# En views.py, línea ~495
presupuesto = Decimal(obra.anteproyecto_total or 0)
```

### **Escenario 2: Usar Promedio en vez de Suma**

```python
# En views.py
from django.db.models import Avg

avg_budget = Obra.objects.aggregate(
    avg=Avg(
        Case(
            When(presupuesto_modificado__gt=0, then=F('presupuesto_modificado')),
            default=F('anteproyecto_total')
        )
    )
)['avg'] or 0
```

### **Escenario 3: Filtrar Solo Proyectos Activos**

```python
# En views.py
for obra in Obra.objects.filter(estatus_general='en_ejecucion'):
    presupuesto = ...
    total_budget += presupuesto
```

---

## 📊 Comparación con Otros KPIs

| KPI | Cálculo | Agregación |
|-----|---------|-----------|
| **Total Proyectos** | `Obra.objects.count()` | COUNT(*) |
| **Presupuesto Total** | Suma con regla de prioridad | SUM(CASE...) |
| **Presupuesto Ejecutado** | Presupuesto × % avance financiero | Calculado por iteración |
| **Beneficiarios** | `Sum('beneficiarios_num')` | SUM(beneficiarios_num) |
| **Tasa Ejecución** | (Ejecutado / Total) × 100 | Calculado después |

---

## 🎯 Puntos Clave

1. ✅ **Prioridad:** `presupuesto_modificado` > `anteproyecto_total`
2. ✅ **Suma:** Se suman TODOS los proyectos en la base de datos
3. ✅ **Ejecutado:** Presupuesto × (avance_financiero_pct / 100)
4. ✅ **Formateo:** Backend formatea el número con `$` y comas
5. ✅ **Precisión:** Se usa `Decimal` para evitar errores de redondeo
6. ✅ **Null-safe:** Se manejan valores NULL con `or 0`

---

## 📞 Preguntas Frecuentes

### **¿Por qué no se usa SQL puro para todo?**

El endpoint `DynamicKPIsView` necesita calcular varias métricas complejas (status, semáforos) que requieren lógica Python. Se podría optimizar más con SQL pero perdería legibilidad.

### **¿El presupuesto incluye proyectos completados?**

**Sí**, se incluyen TODOS los proyectos, independientemente de su estado.

### **¿Cómo se actualiza el presupuesto?**

1. Se modifica el valor en el Excel fuente
2. Se ejecuta `python generar.py` para cargar a la BD
3. El endpoint `DynamicKPIsView` recalcula automáticamente

### **¿El frontend hace algún cálculo?**

**No**, el frontend solo muestra el valor que viene del backend. Todo el cálculo está en el backend.

---

## 🔗 Referencias

- **Backend Views:** `backend/poa/views.py` líneas 492-661
- **Backend Serializers:** `backend/poa/serializers.py` líneas 99-102
- **Backend Models:** `backend/poa/models.py` líneas 12-14
- **Frontend Hook:** `src/hooks/useDashboardKPIs.ts`
- **Frontend Vista:** `src/components/views/DashboardView.tsx` línea 61
- **Documentación API:** `BACKEND_DOCUMENTATION.json` sección "endpoints.v2_dashboard_kpis"
