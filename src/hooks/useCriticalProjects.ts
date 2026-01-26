import { useQuery } from '@tanstack/react-query';
import { mapApiToUiProject } from '@/lib/mappers';
import { Project } from '@/types';

const API_BASE = 'http://127.0.0.1:8000/api';

interface CriticalProjectsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

/**
 * Hook para obtener proyectos críticos desde el backend.
 * Usa la misma lógica multi-criterio que DashboardKPIView.
 * 
 * @param pageSize - Número de proyectos a obtener (default: 5)
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useCriticalProjects(5);
 * ```
 */
export function useCriticalProjects(pageSize: number = 5) {
  return useQuery<Project[]>({
    queryKey: ['critical-projects', pageSize],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/v2/dashboard/critical-projects/?page_size=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error(`Error al cargar proyectos críticos: ${response.status}`);
      }
      
      const data: CriticalProjectsResponse = await response.json();
      
      // Mapear proyectos del backend al formato UI
      return data.results.map(mapApiToUiProject);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos
  });
}
