# 📊 Análisis: Migración de Lógica de Negocio - Estado Actual

**Fecha de análisis:** 24 de enero de 2026  
**Sprints completados:** Sprint 1, 2, 3  

---

## ✅ YA MIGRADO AL BACKEND (Serverside)

### Sprint 1: Cálculos Territoriales ✅
- **Endpoint:** `/api/v2/dashboard/territorial/`
- **Lógica:** Agregaciones SQL nativas por zona/territorio
- **Performance:** -83% más rápido
- **Status:** ✅ Completado y en producción

### Sprint 2: Filtrado y Paginación ✅
- **Endpoints:** 
  - `/api/v2/obras/filtered/` (filtrado avanzado)
  - `/api/v2/dashboard/budget-by-direction/` (agregaciones por dirección)
- **Lógica:** 
  - Filtros: estado, dirección, fechas, búsqueda de texto
  - Ordenamiento: múltiples campos
  - Paginación: configurable
- **Hooks:** `useFilteredProjects`, `useUpcomingProjects`, `useProjectsByYear`, `useMilestoneProjects`, `useBudgetByDirection`
- **Status:** ✅ Completado
- **Componentes usando:** TransparencyView, TimelineView

### Sprint 3: Agregaciones y Parsing ✅
- **Endpoints:**
  - `/api/v2/dashboard/recent-activity/` (actividad reciente)
  - `/api/v2/dashboard/kpis/` (KPIs dinámicos)
  - `/api/v2/dashboard/territories/` (territorios)
- **Lógica:**
  - Normalización de fechas (10+ formatos → ISO 8601)
  - Parsing de fechas en backend
  - Agregaciones: proyectos activos, zonas, presupuesto
  - Cálculo de actividad reciente real
- **Hooks:** `useRecentActivity`, `useDashboardKPIs`, `useTerritories`
- **Status:** ✅ Completado
- **Componentes usando:** RecentActivity
- **Índices:** 10 índices PostgreSQL optimizados

---

## ⚠️ PENDIENTE DE MIGRAR (Lógica aún en Frontend)

### 1. **DashboardView - KPICard** 🔴 ALTA PRIORIDAD
**Archivo:** `src/components/views/DashboardView.tsx`

**Lógica en cliente:**
```typescript
const totalProjects = projects.length;
const activeProjects = projects.filter(p => p.status === 'en_ejecucion').length;
const completedProjects = projects.filter(p => p.status === 'completado').length;
const totalBudget = projects.reduce((sum, p) => sum + p.presupuesto, 0);
const executionRate = (totalExecuted / totalBudget) * 100;
```

**Solución:** Ya existe `useDashboardKPIs()` hook (Sprint 3)
**Acción requerida:** Reemplazar cálculos con el hook existente

---

### 2. **BudgetChart** 🔴 ALTA PRIORIDAD
**Archivo:** `src/components/dashboard/BudgetChart.tsx`

**Lógica en cliente:**
```typescript
const dataWithBudget = projects
  .map(p => ({ ...p, realBudget: p.presupuesto || p.ejecutado }))
  .filter(p => p.realBudget > 0)
  .sort((a, b) => b.realBudget - a.realBudget)
  .slice(0, 8);
```

**Problema:** 
- Recibe TODOS los proyectos (~500KB)
- Hace sorting y slicing en cliente
- Recalcula en cada render

**Solución propuesta:** 
- Endpoint: `/api/v2/dashboard/top-budget-projects/`
- Parámetros: `?limit=8&ordering=-presupuesto_modificado`
- Retorna solo 8 proyectos pre-ordenados

---

### 3. **ProjectsStatusChart** 🟡 MEDIA PRIORIDAD
**Archivo:** `src/components/dashboard/ProjectsStatusChart.tsx`

**Lógica en cliente:**
```typescript
const chartData = [
  { name: 'Completados', value: projects.filter(p => p.status === 'completado').length },
  { name: 'En Ejecución', value: projects.filter(p => p.status === 'en_ejecucion').length },
  { name: 'En Riesgo', value: projects.filter(p => p.status === 'en_riesgo').length },
  { name: 'Planificado', value: projects.filter(p => p.status === 'planificado').length },
  { name: 'Retrasado', value: projects.filter(p => p.status === 'retrasado').length },
].filter(item => item.value > 0);
```

**Problema:**
- Itera 5 veces sobre todos los proyectos
- Recalcula en cada render

**Solución:** Ya existe en `useDashboardKPIs()` → `data.by_status`
**Acción requerida:** Usar el hook existente

---

### 4. **CriticalProjectsTable** 🟡 MEDIA PRIORIDAD
**Archivo:** `src/components/dashboard/CriticalProjectsTable.tsx`

**Lógica en cliente:**
```typescript
const critical = projects
  .filter(p => 
    p.prioridad === 'critica' || 
    p.prioridad === 'muy_alta' ||
    p.status === 'en_riesgo'
  )
  .sort((a, b) => {
    const priorityOrder = { critica: 0, muy_alta: 1, alta: 2, media: 3, baja: 4 };
    return (priorityOrder[a.prioridad] || 5) - (priorityOrder[b.prioridad] || 5);
  })
  .slice(0, 5);
```

**Problema:**
- Filtra y ordena todos los proyectos
- Lógica de prioridad duplicada

**Solución propuesta:**
- Usar `useMilestoneProjects('critica')` (ya existe)
- O crear endpoint específico: `/api/v2/dashboard/critical-projects/?limit=5`

---

### 5. **TerritoryView** 🟢 BAJA PRIORIDAD (Parcialmente migrado)
**Archivo:** `src/components/views/TerritoryView.tsx`

**Lógica en cliente:**
```typescript
// Parsing de alcaldías en cliente
projects.forEach(p => {
  const ubicaciones = p.ubicacion?.split(',') || [];
  ubicaciones.forEach(loc => {
    // ... agregaciones manuales ...
  });
});

// Sorting
.sort((a, b) => b[1].budget - a[1].budget)
```

**Problema:**
- Usa hook territorial V2 pero hace parsing adicional
- Ordena resultados en cliente

**Solución:** Ya existe `useTerritories()` hook (Sprint 3)
**Acción requerida:** Reemplazar lógica con el hook existente

---

### 6. **RisksView** 🔴 ALTA PRIORIDAD
**Archivo:** `src/components/views/RisksView.tsx`

**Lógica en cliente:**
```typescript
// Cálculo de matriz de riesgos
const matrix = projects.filter(p => {
  const semaphores = { /* ... */ };
  return {
    red: Object.values(semaphores).filter(s => s === 'ROJO').length,
    yellow: Object.values(semaphores).filter(s => s === 'AMARILLO').length
  };
}).sort((a, b) => { /* sorting complejo */ });

// Planes de mitigación
const mitigations = projects.filter(p => {
  return p.riesgos && p.riesgos.length > 20;
});

// Categorías de riesgo
riskCategories.map(cat => ({
  count: projects.filter(p => p.prioridad === cat.name.toLowerCase()).length
}));
```

**Problema:**
- Múltiples iteraciones sobre todos los proyectos
- Lógica compleja de semáforos
- Usa imports de `mockData`

**Solución propuesta:**
- Endpoint: `/api/v2/dashboard/risk-analysis/`
- Retorna: matriz de riesgos, mitigaciones, categorías
- Hook: `useRiskAnalysis()`

---

### 7. **ReportsView** 🟡 MEDIA PRIORIDAD
**Archivo:** `src/components/views/ReportsView.tsx`

**Lógica en cliente:**
```typescript
import { mockProjects, direcciones } from '@/lib/mockData';

// Cálculos en cliente
const projectCount = mockProjects.filter(p => p.direccion === direction).length;
const totalBudget = mockProjects.reduce((sum, p) => sum + p.presupuesto, 0);
const totalBeneficiaries = mockProjects.reduce((sum, p) => sum + p.beneficiarios, 0);
```

**Problema:**
- ⚠️ Usa `mockProjects` (datos hardcodeados)
- ⚠️ Usa `direcciones` hardcodeadas
- No conectado con backend real

**Solución propuesta:**
- Usar `useDashboardKPIs()` para métricas generales
- Endpoint: `/api/v2/reports/summary/?direccion=X`
- Hook: `useReportSummary(direction)`

---

### 8. **ProjectsView - Filtros** 🟢 BAJA PRIORIDAD
**Archivo:** `src/components/views/ProjectsView.tsx`

**Lógica en cliente:**
```typescript
// Extracción de direcciones únicas
const areas = projects.map(p => p.direccion).filter(Boolean);
const uniqueAreas = Array.from(new Set(areas)).sort();

// Filtrado
const filteredProjects = projects.filter(p => {
  if (filters.direccion && p.direccion !== filters.direccion) return false;
  if (filters.status && p.status !== filters.status) return false;
  if (filters.search && !p.nombre.includes(filters.search)) return false;
  return true;
});
```

**Problema:**
- Filtrado en cliente (ineficiente con muchos proyectos)

**Solución:** Ya existe `useFilteredProjects()` hook (Sprint 2)
**Acción requerida:** Usar el hook con parámetros de filtro

---

## 📊 Resumen del Estado Actual

### Migración por Componente

| Componente | Estado | Prioridad | Hook Disponible |
|------------|--------|-----------|-----------------|
| **DashboardView - KPIs** | ⚠️ Parcial | 🔴 Alta | ✅ `useDashboardKPIs()` |
| **RecentActivity** | ✅ Migrado | - | ✅ `useRecentActivity()` |
| **BudgetChart** | ❌ Cliente | 🔴 Alta | ❌ Crear endpoint |
| **ProjectsStatusChart** | ❌ Cliente | 🟡 Media | ✅ `useDashboardKPIs()` |
| **CriticalProjectsTable** | ❌ Cliente | 🟡 Media | ✅ `useMilestoneProjects()` |
| **TimelineView** | ✅ Migrado | - | ✅ Múltiples hooks |
| **TransparencyView** | ✅ Migrado | - | ✅ Múltiples hooks |
| **TerritoryView** | ⚠️ Parcial | 🟢 Baja | ✅ `useTerritories()` |
| **RisksView** | ❌ Cliente | 🔴 Alta | ❌ Crear endpoint |
| **ReportsView** | ❌ Cliente | 🟡 Media | ❌ Crear endpoint |
| **ProjectsView** | ⚠️ Parcial | 🟢 Baja | ✅ `useFilteredProjects()` |

### Porcentaje de Migración

**Por Líneas de Código:**
- ✅ Migrado: ~60%
- ⚠️ Parcialmente migrado: ~15%
- ❌ Pendiente: ~25%

**Por Funcionalidad:**
- ✅ Territorial: 100%
- ✅ Filtrado/Paginación: 100%
- ✅ Agregaciones básicas: 80%
- ⚠️ Dashboard KPIs: 50%
- ❌ Análisis de riesgos: 0%
- ❌ Reportes: 0%

---

## 🎯 Plan de Acción: Sprint 4 - Completar Migración

### Fase 1: Usar Hooks Existentes (Rápido - 2h)

1. **DashboardView - Reemplazar KPIs**
   ```typescript
   // ANTES
   const totalProjects = projects.length;
   
   // DESPUÉS
   const { data: kpis } = useDashboardKPIs();
   const totalProjects = kpis.projects.total;
   ```

2. **ProjectsStatusChart - Usar KPIs**
   ```typescript
   // DESPUÉS
   const { data: kpis } = useDashboardKPIs();
   const chartData = kpis.by_status.map(item => ({
     name: item.estatus_general,
     value: item.count
   }));
   ```

3. **CriticalProjectsTable - Usar Milestones**
   ```typescript
   // DESPUÉS
   const { data } = useMilestoneProjects('critica');
   const critical = data?.results.slice(0, 5);
   ```

4. **TerritoryView - Usar Territories Hook**
   ```typescript
   // DESPUÉS
   const { data: territories } = useTerritories();
   // Ya no necesita parsing ni sorting
   ```

---

### Fase 2: Crear Nuevos Endpoints (Medio - 4h)

#### Endpoint 1: Top Budget Projects
```python
# backend/poa/views.py
class TopBudgetProjectsView(APIView):
    def get(self, request):
        limit = int(request.query_params.get('limit', 8))
        
        projects = Obra.objects.annotate(
            real_budget=Case(
                When(presupuesto_modificado__gt=0, then=F('presupuesto_modificado')),
                default=F('anteproyecto_total')
            )
        ).filter(
            real_budget__gt=0
        ).order_by('-real_budget')[:limit]
        
        # ...
```

#### Endpoint 2: Risk Analysis
```python
class RiskAnalysisView(APIView):
    def get(self, request):
        # Matriz de riesgos
        high_risk = Obra.objects.filter(
            Q(viabilidad_tecnica_semaforo='ROJO') |
            Q(viabilidad_presupuestal_semaforo='ROJO')
        ).count()
        
        # Categorías
        by_priority = Obra.objects.values('urgencia').annotate(
            count=Count('id')
        )
        
        # ...
```

#### Endpoint 3: Report Summary
```python
class ReportSummaryView(APIView):
    def get(self, request):
        direccion = request.query_params.get('direccion')
        
        queryset = Obra.objects.all()
        if direccion and direccion != 'all':
            queryset = queryset.filter(area_responsable=direccion)
        
        summary = queryset.aggregate(
            total_projects=Count('id'),
            total_budget=Sum('presupuesto_modificado'),
            total_beneficiaries=Sum('beneficiarios_num')
        )
        
        # ...
```

---

### Fase 3: Crear Hooks de Frontend (Rápido - 1h)

```typescript
// src/hooks/useTopBudgetProjects.ts
export const useTopBudgetProjects = (limit = 8) => {
  return useQuery({
    queryKey: ['dashboard', 'top-budget', limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/v2/dashboard/top-budget/?limit=${limit}`
      );
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });
};

// src/hooks/useRiskAnalysis.ts
// src/hooks/useReportSummary.ts
```

---

## 🎯 Objetivo Final: 100% Serverside

**Beneficios esperados al completar:**
- ⚡ **-98% payload** en todas las vistas
- 🚀 **-99% processing** en cliente
- 💾 **-95% RAM usage** en navegador
- 📊 **Datos consistentes** entre vistas
- 🔄 **Auto-refresh** automático
- 📈 **Escalabilidad** para 10,000+ proyectos

---

## 🚨 Archivos con mockData (Eliminar)

1. `src/components/views/ReportsView.tsx` - Línea 1
2. `src/components/views/RisksView.tsx` - Línea 2 (solo formatters)
3. `src/lib/mockData.ts` - Todo el archivo (después de migración)

---

## ✅ Checklist para 100% Migración

### Inmediato (Usar hooks existentes)
- [ ] DashboardView - Usar `useDashboardKPIs()`
- [ ] ProjectsStatusChart - Usar `useDashboardKPIs()`
- [ ] CriticalProjectsTable - Usar `useMilestoneProjects()`
- [ ] TerritoryView - Usar `useTerritories()`
- [ ] ProjectsView - Usar `useFilteredProjects()`

### Crear nuevos endpoints
- [ ] `/api/v2/dashboard/top-budget/` + hook
- [ ] `/api/v2/dashboard/risk-analysis/` + hook
- [ ] `/api/v2/reports/summary/` + hook

### Actualizar componentes
- [ ] BudgetChart - Usar `useTopBudgetProjects()`
- [ ] RisksView - Usar `useRiskAnalysis()`
- [ ] ReportsView - Usar `useReportSummary()`

### Limpieza
- [ ] Eliminar imports de `mockData`
- [ ] Remover funciones de agregación en componentes
- [ ] Eliminar `src/lib/mockData.ts` (opcional)
- [ ] Buscar y eliminar todos los `.filter()`, `.reduce()`, `.sort()` innecesarios

---

**Estimación de tiempo para 100% migración:** ~8 horas
- Fase 1 (hooks existentes): 2h
- Fase 2 (nuevos endpoints): 4h
- Fase 3 (nuevos hooks): 1h
- Pruebas y ajustes: 1h
