import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface StatusCount {
  estatus_general: string;
  count: number;
}

interface KPIData {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  zones: {
    total: number;
    label: string;
    list: string[];
  };
  budget: {
    total: number;
    executed: number;
    remaining: number;
    execution_rate: number;
    formatted_total: string;
    formatted_executed: string;
  };
  progress: {
    average: number;
    label: string;
  };
  by_status: StatusCount[];
  timestamp: string;
}

/**
 * Hook para obtener KPIs dinámicos del dashboard.
 * 
 * Sprint 3 - KPIs calculados en tiempo real desde la base de datos:
 * - Total de proyectos activos vs completados
 * - Zonas/alcaldías únicas cubiertas
 * - Presupuesto total, ejecutado y tasa de ejecución
 * - Avance promedio general
 * - Distribución de proyectos por estado
 * 
 * @example
 * ```tsx
 * const { data: kpis, isLoading } = useDashboardKPIs();
 * 
 * if (isLoading) return <Loader />;
 * 
 * return (
 *   <div>
 *     <KPICard
 *       title="Proyectos Activos"
 *       value={kpis.projects.active}
 *     />
 *     <KPICard
 *       title="Zonas Cubiertas"
 *       value={kpis.zones.total}
 *       subtitle={kpis.zones.label}
 *     />
 *     <KPICard
 *       title="Ejecución Presupuestal"
 *       value={`${kpis.budget.execution_rate}%`}
 *     />
 *   </div>
 * );
 * ```
 */
export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async (): Promise<KPIData> => {
      const response = await fetch(`${API_BASE_URL}/v2/dashboard/kpis/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch KPIs: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos en caché
  });
};
