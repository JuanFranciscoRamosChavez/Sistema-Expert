import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface ActivityProject {
  id: number;
  programa: string;
  area_responsable: string;
  ultima_actualizacion: string;
  avance_fisico_pct: number;
  status: 'planificado' | 'en_ejecucion' | 'en_riesgo' | 'completado';
}

interface ActivityData {
  summary: {
    updates_24h: number;
    actions_week: number;
    completed_week: number;
  };
  latest_projects: ActivityProject[];
  timestamp: string;
}

/**
 * Hook para obtener actividad reciente dinámica.
 * 
 * Sprint 3 - Reemplaza datos hardcodeados con actividad real:
 * - Proyectos actualizados en las últimas 24 horas
 * - Proyectos con acciones correctivas esta semana
 * - Proyectos completados recientemente
 * - Top 5 proyectos actualizados más recientemente
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useRecentActivity();
 * 
 * if (isLoading) return <Loader />;
 * 
 * return (
 *   <div>
 *     <p>{data.summary.updates_24h} actualizaciones en 24h</p>
 *     {data.latest_projects.map(project => (
 *       <div key={project.id}>{project.programa}</div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: async (): Promise<ActivityData> => {
      const response = await fetch(`${API_BASE_URL}/v2/dashboard/recent-activity/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch recent activity: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (datos muy dinámicos)
    gcTime: 5 * 60 * 1000,     // 5 minutos en caché
    refetchInterval: 2 * 60 * 1000, // Auto-refetch cada 2 minutos
  });
};
