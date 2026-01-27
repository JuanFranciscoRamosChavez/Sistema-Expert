import { useQueries } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/api';
import { mapApiToUiProject } from '@/lib/mappers';
import { APIProject, KPIData, TerritorialDataV2 } from '@/types';

/**
 * Hook: useDashboardData
 * Arquitectura: Parallel Queries con TanStack Query
 * * Ventajas sobre la versión anterior:
 * 1. Caching automático (no recarga todo al cambiar de tab).
 * 2. Reintentos automáticos en caso de fallo de red.
 * 3. Devuelve datos parciales si una API falla pero las otras no (Resiliencia).
 */
export function useDashboardData() {
  const results = useQueries({
    queries: [
      // 1. KPIs (Usando el endpoint V2 optimizado)
      {
        queryKey: ['dashboard', 'kpis'],
        queryFn: async () => {
          const res = await fetch(API_ENDPOINTS.dashboard.kpis);
          if (!res.ok) throw new Error('Error al cargar KPIs');
          return res.json() as Promise<KPIData>;
        },
        staleTime: 5 * 60 * 1000, // 5 min cache
      },
      // 2. Proyectos (Lista completa)
      {
        queryKey: ['dashboard', 'projects'],
        queryFn: async () => {
          const res = await fetch(API_ENDPOINTS.dashboard.obras);
          if (!res.ok) throw new Error('Error al cargar Obras');
          
          const data = await res.json();
          // Validación de array antes de mapear
          if (!Array.isArray(data)) return [];
          
          // Mapeo seguro con tipos explícitos
          return (data as APIProject[]).map(mapApiToUiProject);
        },
        staleTime: 5 * 60 * 1000,
      },
      // 3. Datos Territoriales (V2 con agregación SQL)
      {
        queryKey: ['dashboard', 'territorial'],
        queryFn: async () => {
          const res = await fetch(API_ENDPOINTS.dashboard.territorial);
          if (!res.ok) throw new Error('Error al cargar Territorio');
          return res.json() as Promise<TerritorialDataV2>;
        },
        staleTime: 10 * 60 * 1000, // 10 min cache (cambia poco)
      },
    ],
  });

  const [kpiQuery, projectsQuery, territorialQuery] = results;

  // Unificamos el estado de carga y error para la vista simple
  const isLoading = results.some((query) => query.isLoading);
  const error = results.find((query) => query.error)?.error?.message || null;

  return {
    // Datos procesados y seguros (fallback a valores vacíos/nulos)
    kpiData: kpiQuery.data || null,
    projects: projectsQuery.data || [],
    territorialData: territorialQuery.data || null,
    
    // Metadatos
    territorialVersion: territorialQuery.data?._meta?.version,
    
    // UI States
    loading: isLoading,
    error,
    
    // Helper para recargar todo manualmente
    refetch: async () => {
      await Promise.all(results.map((r) => r.refetch()));
    },
  };
}