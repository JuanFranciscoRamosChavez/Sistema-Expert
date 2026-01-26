# 🚀 Sprint 3: Agregaciones y Parsing (Semana 5)

## 📋 Objetivo Principal

Optimizar el backend para manejar **agregaciones complejas** y **normalización de datos**, eliminando parsing de fechas y cálculos pesados del cliente. Implementar caching con Redis para endpoints frecuentes.

---

## 🎯 Metas del Sprint

### 1️⃣ **Normalización de Fechas**
- ✅ Mover parsing de fechas desde frontend a backend
- ✅ Normalizar formato en comando de importación (`generar.py`)
- ✅ Asegurar formato ISO 8601 consistente (`YYYY-MM-DD`)
- ✅ Eliminar lógica de `new Date()` repetida en componentes

### 2️⃣ **Agregaciones SQL Nativas**
- ✅ Crear endpoints para KPIs dinámicos (vs mes anterior, nuevas zonas)
- ✅ Endpoint para actividad reciente basada en `ultima_actualizacion`
- ✅ Agregación por alcaldías/territorios
- ✅ Estadísticas de riesgos agrupadas por nivel

### 3️⃣ **Caching con Redis**
- ✅ Instalar y configurar Redis
- ✅ Cachear endpoints de agregaciones frecuentes
- ✅ TTL inteligente (5 min para KPIs, 1 hora para listas estáticas)
- ✅ Invalidación automática al crear/actualizar obras

### 4️⃣ **Índices de Base de Datos**
- ✅ Crear índices en campos filtrados frecuentemente
- ✅ Optimizar queries de búsqueda de texto
- ✅ Benchmark antes/después

---

## 🔧 Tareas Técnicas

### **Backend (Django + PostgreSQL + Redis)**

#### Tarea 1: Normalizar Fechas en Importación
**Archivo:** `backend/generar.py`

**Cambios:**
```python
from datetime import datetime

def parse_date(date_str):
    """
    Normaliza fechas al formato ISO 8601 (YYYY-MM-DD).
    Soporta múltiples formatos de entrada.
    """
    if not date_str:
        return None
    
    formats = [
        "%d/%m/%Y",    # 31/12/2025
        "%Y-%m-%d",    # 2025-12-31 (ISO)
        "%d-%m-%Y",    # 31-12-2025
        "%Y/%m/%d",    # 2025/12/31
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date().isoformat()
        except ValueError:
            continue
    
    return None

# Aplicar en todos los campos de fecha:
# fecha_inicio_prog, fecha_termino_prog, fecha_inicio_real, 
# fecha_termino_real, ultima_actualizacion, fecha_aprobacion
```

**Beneficio:** Frontend recibe fechas listas para usar sin parsing.

---

#### Tarea 2: Endpoint de Actividad Reciente
**Archivo:** `backend/poa/views.py`

**Nuevo ViewSet:**
```python
from django.utils import timezone
from datetime import timedelta

class RecentActivityView(APIView):
    """
    Retorna actividad reciente basada en cambios reales en la BD.
    """
    
    def get(self, request):
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_week = now - timedelta(days=7)
        
        # Actividades de las últimas 24 horas
        recent_updates = Obra.objects.filter(
            ultima_actualizacion__gte=last_24h
        ).count()
        
        # Proyectos con acciones correctivas recientes
        recent_actions = Obra.objects.filter(
            acciones_correctivas__isnull=False,
            ultima_actualizacion__gte=last_week
        ).count()
        
        # Top 5 proyectos actualizados recientemente
        latest_projects = Obra.objects.filter(
            ultima_actualizacion__isnull=False
        ).order_by('-ultima_actualizacion')[:5].values(
            'id', 'programa', 'area_responsable', 
            'ultima_actualizacion', 'avance_fisico_pct'
        )
        
        return Response({
            'summary': {
                'updates_24h': recent_updates,
                'actions_week': recent_actions,
            },
            'latest_projects': list(latest_projects),
            'timestamp': now.isoformat()
        })
```

**URL:** `/api/v2/dashboard/recent-activity/`

---

#### Tarea 3: Endpoint de KPIs Dinámicos
**Archivo:** `backend/poa/views.py`

**Nuevo ViewSet:**
```python
from django.db.models import Count, F, Q
from dateutil.relativedelta import relativedelta

class DynamicKPIsView(APIView):
    """
    Calcula KPIs dinámicos con comparación temporal.
    """
    
    def get(self, request):
        now = timezone.now()
        last_month = now - relativedelta(months=1)
        
        # Proyectos actuales
        current_projects = Obra.objects.count()
        
        # Proyectos del mes anterior
        previous_projects = Obra.objects.filter(
            ultima_actualizacion__lt=last_month
        ).count()
        
        # Calcular tendencia
        trend = current_projects - previous_projects
        trend_pct = (trend / previous_projects * 100) if previous_projects > 0 else 0
        
        # Zonas únicas (alcaldías)
        unique_zones = Obra.objects.values('alcaldias').distinct().count()
        
        # Presupuesto total
        from django.db.models import Sum
        total_budget = Obra.objects.aggregate(
            total=Sum('presupuesto_modificado')
        )['total'] or 0
        
        # Proyectos por estado
        by_status = Obra.objects.values('estatus_general').annotate(
            count=Count('id')
        )
        
        return Response({
            'projects': {
                'total': current_projects,
                'trend': {
                    'value': trend,
                    'percentage': round(trend_pct, 2),
                    'label': 'vs mes anterior'
                }
            },
            'zones': {
                'total': unique_zones,
                'label': 'alcaldías únicas'
            },
            'budget': {
                'total': float(total_budget),
                'formatted': f"${total_budget:,.2f}"
            },
            'by_status': list(by_status),
            'timestamp': now.isoformat()
        })
```

**URL:** `/api/v2/dashboard/kpis/`

---

#### Tarea 4: Endpoint de Territorios/Alcaldías
**Archivo:** `backend/poa/views.py`

**Nuevo ViewSet:**
```python
class TerritoryAggregationsView(APIView):
    """
    Agrupa proyectos por alcaldía/territorio con estadísticas.
    """
    
    def get(self, request):
        # Obtener alcaldías únicas y contar proyectos
        territories = {}
        
        obras = Obra.objects.values(
            'alcaldias', 'ubicacion_especifica', 
            'presupuesto_modificado', 'avance_fisico_pct'
        )
        
        for obra in obras:
            alcaldias = obra['alcaldias'] or 'Sin especificar'
            
            if alcaldias not in territories:
                territories[alcaldias] = {
                    'name': alcaldias,
                    'projects': 0,
                    'total_budget': 0,
                    'avg_progress': []
                }
            
            territories[alcaldias]['projects'] += 1
            territories[alcaldias]['total_budget'] += obra['presupuesto_modificado'] or 0
            territories[alcaldias]['avg_progress'].append(obra['avance_fisico_pct'] or 0)
        
        # Calcular promedios
        result = []
        for territory in territories.values():
            progress_list = territory['avg_progress']
            avg = sum(progress_list) / len(progress_list) if progress_list else 0
            
            result.append({
                'name': territory['name'],
                'projects': territory['projects'],
                'total_budget': territory['total_budget'],
                'avg_progress': round(avg, 2)
            })
        
        # Ordenar por número de proyectos
        result.sort(key=lambda x: x['projects'], reverse=True)
        
        return Response({
            'territories': result,
            'total_territories': len(result)
        })
```

**URL:** `/api/v2/dashboard/territories/`

---

#### Tarea 5: Instalar y Configurar Redis
**Archivo:** `backend/core/settings.py`

**Instalación:**
```powershell
# En Windows, usar Redis para Windows o WSL
pip install redis django-redis
```

**Configuración en Django:**
```python
# settings.py

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'obras_publicas',
        'TIMEOUT': 300,  # 5 minutos por defecto
    }
}

# Cache para sesiones (opcional)
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

**Uso en Views:**
```python
from django.core.cache import cache
from django.views.decorators.cache import cache_page

class DynamicKPIsView(APIView):
    
    @cache_page(60 * 5)  # Cachear 5 minutos
    def get(self, request):
        # Intentar obtener de caché
        cache_key = 'dashboard:kpis'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Si no hay caché, calcular
        data = self._calculate_kpis()
        
        # Guardar en caché
        cache.set(cache_key, data, timeout=300)
        
        return Response(data)
```

**Invalidación al actualizar:**
```python
# En views.py después de crear/actualizar
from django.core.cache import cache

def update_obra(request, pk):
    # ... actualizar obra ...
    
    # Invalidar cachés relacionados
    cache.delete('dashboard:kpis')
    cache.delete('dashboard:territories')
    cache.delete_pattern('obras:filtered:*')
    
    return Response(...)
```

---

#### Tarea 6: Crear Índices PostgreSQL
**Archivo:** `backend/poa/migrations/0006_create_indexes.py`

**Nueva Migración:**
```python
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('poa', '0005_obra_beneficiarios_num'),
    ]

    operations = [
        # Índices para filtrado frecuente
        migrations.AddIndex(
            model_name='obra',
            index=models.Index(
                fields=['estatus_general'],
                name='poa_obra_estatus_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='obra',
            index=models.Index(
                fields=['area_responsable'],
                name='poa_obra_area_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='obra',
            index=models.Index(
                fields=['fecha_termino_prog'],
                name='poa_obra_fecha_term_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='obra',
            index=models.Index(
                fields=['fecha_inicio_prog'],
                name='poa_obra_fecha_ini_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='obra',
            index=models.Index(
                fields=['ultima_actualizacion'],
                name='poa_obra_ultima_act_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='obra',
            index=models.Index(
                fields=['puntuacion_final_ponderada'],
                name='poa_obra_punt_final_idx'
            ),
        ),
        # Índice compuesto para ordenamiento + filtro común
        migrations.AddIndex(
            model_name='obra',
            index=models.Index(
                fields=['area_responsable', '-avance_fisico_pct'],
                name='poa_obra_area_avance_idx'
            ),
        ),
    ]
```

**Aplicar migración:**
```powershell
python manage.py makemigrations
python manage.py migrate
```

---

### **Frontend (React + TanStack Query)**

#### Tarea 7: Hooks para Nuevos Endpoints
**Archivo:** `src/hooks/useDashboardKPIs.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/api';

interface KPIData {
  projects: {
    total: number;
    trend: {
      value: number;
      percentage: number;
      label: string;
    };
  };
  zones: {
    total: number;
    label: string;
  };
  budget: {
    total: number;
    formatted: string;
  };
  by_status: Array<{ estatus_general: string; count: number }>;
  timestamp: string;
}

export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async (): Promise<KPIData> => {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/dashboard/kpis/`);
      if (!response.ok) throw new Error('Failed to fetch KPIs');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
  });
};
```

**Archivo:** `src/hooks/useRecentActivity.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/api';

interface ActivityData {
  summary: {
    updates_24h: number;
    actions_week: number;
  };
  latest_projects: Array<{
    id: number;
    programa: string;
    area_responsable: string;
    ultima_actualizacion: string;
    avance_fisico_pct: number;
  }>;
  timestamp: string;
}

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: async (): Promise<ActivityData> => {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/dashboard/recent-activity/`);
      if (!response.ok) throw new Error('Failed to fetch activity');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (más frecuente)
    gcTime: 5 * 60 * 1000,
  });
};
```

**Archivo:** `src/hooks/useTerritories.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/api';

interface TerritoryData {
  name: string;
  projects: number;
  total_budget: number;
  avg_progress: number;
}

interface TerritoriesResponse {
  territories: TerritoryData[];
  total_territories: number;
}

export const useTerritories = () => {
  return useQuery({
    queryKey: ['dashboard', 'territories'],
    queryFn: async (): Promise<TerritoriesResponse> => {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/dashboard/territories/`);
      if (!response.ok) throw new Error('Failed to fetch territories');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (cambia poco)
    gcTime: 30 * 60 * 1000,
  });
};
```

---

#### Tarea 8: Actualizar Componentes con Nuevos Hooks

**DashboardView.tsx - Usar KPIs Dinámicos:**
```typescript
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';

function DashboardView() {
  const { data: kpis, isLoading } = useDashboardKPIs();
  
  if (isLoading) return <Loader />;
  
  return (
    <div>
      <KPICard
        title="Proyectos Activos"
        value={kpis.projects.total}
        trend={kpis.projects.trend}
      />
      <KPICard
        title="Zonas Cubiertas"
        value={kpis.zones.total}
        subtitle={kpis.zones.label}
      />
      {/* ... más KPIs ... */}
    </div>
  );
}
```

**RecentActivity.tsx - Usar Actividad Real:**
```typescript
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function RecentActivity() {
  const { data, isLoading } = useRecentActivity();
  
  if (isLoading) return <Loader />;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>
          {data.summary.updates_24h} actualizaciones en las últimas 24h
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul>
          {data.latest_projects.map(project => (
            <li key={project.id}>
              <strong>{project.programa}</strong>
              <br />
              <small>
                {project.area_responsable} • 
                {formatDistanceToNow(new Date(project.ultima_actualizacion), {
                  addSuffix: true,
                  locale: es
                })}
              </small>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

**TerritoryView.tsx - Usar Agregaciones:**
```typescript
import { useTerritories } from '@/hooks/useTerritories';

function TerritoryView() {
  const { data: territories, isLoading } = useTerritories();
  
  if (isLoading) return <Loader />;
  
  return (
    <div>
      <h2>Distribución Territorial ({territories.total_territories} zonas)</h2>
      <div className="grid">
        {territories.territories.map(territory => (
          <Card key={territory.name}>
            <CardHeader>
              <CardTitle>{territory.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Proyectos: {territory.projects}</p>
              <p>Presupuesto: ${territory.total_budget.toLocaleString()}</p>
              <Progress value={territory.avg_progress} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 Métricas Esperadas

### Performance Antes vs Después

| Operación | ANTES | DESPUÉS | Mejora |
|-----------|-------|---------|--------|
| **Parse de fechas (cliente)** | ~50ms | 0ms | **-100%** |
| **Cálculo de KPIs** | ~200ms | ~10ms | **-95%** |
| **Agregación territorial** | ~300ms | ~15ms | **-95%** |
| **Query con índices** | ~50ms | ~5ms | **-90%** |
| **Hit rate de Redis** | 0% | ~80% | **+80%** |

### Reducción de Payload

| Endpoint | ANTES | DESPUÉS | Reducción |
|----------|-------|---------|-----------|
| **Dashboard completo** | 500KB | 5KB | **-99%** |
| **Actividad reciente** | N/A (estático) | 2KB | **Dinámico** |
| **Territorios** | N/A (cliente) | 10KB | **Serverside** |

---

## ✅ Checklist de Implementación

### Backend
- [ ] Actualizar `generar.py` con `parse_date()` 
- [ ] Crear `RecentActivityView` en `views.py`
- [ ] Crear `DynamicKPIsView` en `views.py`
- [ ] Crear `TerritoryAggregationsView` en `views.py`
- [ ] Instalar Redis y `django-redis`
- [ ] Configurar caché en `settings.py`
- [ ] Crear migración de índices (`0006_create_indexes.py`)
- [ ] Aplicar migración: `python manage.py migrate`
- [ ] Agregar URLs en `urls.py`
- [ ] Probar endpoints manualmente

### Frontend
- [ ] Crear `src/hooks/useDashboardKPIs.ts`
- [ ] Crear `src/hooks/useRecentActivity.ts`
- [ ] Crear `src/hooks/useTerritories.ts`
- [ ] Actualizar `DashboardView.tsx` para usar `useDashboardKPIs()`
- [ ] Actualizar `RecentActivity.tsx` para usar `useRecentActivity()`
- [ ] Actualizar `TerritoryView.tsx` para usar `useTerritories()`
- [ ] Eliminar lógica de parsing de fechas en componentes
- [ ] Agregar endpoints a `src/config/api.ts`

### Testing
- [ ] Validar normalización de fechas en DB
- [ ] Benchmark queries con índices (antes/después)
- [ ] Probar caché de Redis (hit rate)
- [ ] Validar KPIs dinámicos vs datos reales
- [ ] Probar invalidación de caché al actualizar

### Documentación
- [ ] Crear script de validación `validate_sprint3.py`
- [ ] Documentar configuración de Redis
- [ ] Benchmark report con métricas
- [ ] Actualizar README con nuevos endpoints

---

## 🚀 Comandos de Ejecución

### Setup Redis (Windows)
```powershell
# Opción 1: WSL (recomendado)
wsl
sudo apt update
sudo apt install redis-server
sudo service redis-server start

# Opción 2: Redis para Windows
# Descargar desde: https://github.com/tporadowski/redis/releases
# Ejecutar: redis-server.exe
```

### Instalar Dependencias
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install redis django-redis
```

### Aplicar Migración de Índices
```powershell
python manage.py makemigrations poa
python manage.py migrate
```

### Re-importar Datos con Fechas Normalizadas
```powershell
# Respaldar DB actual
copy db.sqlite3 db.sqlite3.backup

# Limpiar y re-importar
python manage.py flush --no-input
python generar.py
```

### Validar Sprint 3
```powershell
python validate_sprint3.py
```

---

## 🐛 Troubleshooting

### Redis no conecta
```powershell
# Verificar que Redis esté corriendo
redis-cli ping
# Debe responder: PONG

# Si no responde, iniciar Redis
redis-server
```

### Migración de índices falla
```powershell
# Ver SQL generado sin aplicar
python manage.py sqlmigrate poa 0006

# Si hay conflicto, eliminar índices manualmente
python manage.py dbshell
DROP INDEX IF EXISTS poa_obra_estatus_idx;
```

### Cache no funciona
```python
# En Django shell
python manage.py shell

from django.core.cache import cache
cache.set('test', 'hello', 30)
print(cache.get('test'))  # Debe imprimir: hello
```

---

## 📚 Referencias

- **Redis con Django:** [django-redis.readthedocs.io](https://django-redis.readthedocs.io/)
- **PostgreSQL Indexes:** [postgresql.org/docs/indexes](https://www.postgresql.org/docs/current/indexes.html)
- **Django Aggregation:** [docs.djangoproject.com/en/5.0/topics/db/aggregation/](https://docs.djangoproject.com/en/5.0/topics/db/aggregation/)
- **TanStack Query Cache:** [tanstack.com/query/latest/docs/guides/caching](https://tanstack.com/query/latest/docs/guides/caching)

---

**Sprint:** 3/4 (Semana 5)  
**Status:** 📝 Planificado  
**Fecha estimada:** Enero 2026  
**Prerrequisitos:** Sprint 2 completado ✅
