/**
 * Hook: useFilteredProjects
 * Sprint 2: Filtrado Serverside
 * 
 * Reemplaza la lógica de filtrado client-side en:
 * - TimelineView.tsx
 * - TransparencyView.tsx
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { API_BASE_URL } from '@/config/api';
import { mapApiToUiProject } from '@/lib/mappers';
import type { Project } from '@/types';

export interface ProjectFilters {
  status?: string;
  direccion?: string;
  days_threshold?: number | string;
  year?: number;
  has_milestones?: boolean;
  score_range?: 'critica' | 'muy_alta' | 'alta' | 'media' | 'baja';
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number | 'todos';
}

interface FilteredProjectsResponse {
  results: Project[];
  count: number;
  next: string | null;
  previous: string | null;
  _meta: {
    total_count: number;
    filters_applied: Record<string, any>;
    timestamp: string;
  };
}

/**
 * Hook para obtener proyectos filtrados desde el servidor.
 * 
 * @param filters - Objeto con los filtros a aplicar
 * @param enabled - Si false, no hace la query (útil para lazy loading)
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useFilteredProjects({
 *   status: 'en_ejecucion',
 *   direccion: 'Obras Públicas',
 *   page_size: 10
 * });
 * ```
 */
export function useFilteredProjects(
  filters: ProjectFilters = {},
  enabled: boolean = true
): UseQueryResult<FilteredProjectsResponse, Error> {
  return useQuery({
    queryKey: queryKeys.obras.filtered(filters),
    queryFn: async () => {
      // Construir query params
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      const url = `${API_BASE_URL}/api/v2/obras/filtered/?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Mapear los resultados del API al formato de la UI
      return {
        ...data,
        results: data.results.map(mapApiToUiProject)
      };
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutos (filtros cambian frecuentemente)
  });
}

/**
 * Hook simplificado para obtener próximas entregas.
 * Wrapper alrededor de useFilteredProjects con parámetros predeterminados.
 * 
 * @example
 * ```tsx
 * const { data } = useUpcomingProjects(90); // Próximos 90 días
 * ```
 */
export function useUpcomingProjects(daysThreshold: number = 90) {
  return useFilteredProjects({
    days_threshold: daysThreshold,
    ordering: 'fecha_termino_prog',
    page_size: 'todos'
  });
}

/**
 * Hook para obtener proyectos de un año específico.
 * Útil para vista de timeline/gantt.
 * 
 * @example
 * ```tsx
 * const { data } = useProjectsByYear(2026);
 * ```
 */
export function useProjectsByYear(
  year: number,
  additionalFilters: Partial<ProjectFilters> = {}
) {
  return useFilteredProjects({
    year,
    ordering: 'fecha_inicio_prog',
    ...additionalFilters
  });
}

/**
 * Hook para obtener proyectos con hitos comunicacionales.
 * 
 * @example
 * ```tsx
 * const { data } = useMilestoneProjects('critica');
 * ```
 */
export function useMilestoneProjects(
  scoreRange?: ProjectFilters['score_range'],
  additionalFilters: Partial<ProjectFilters> = {}
) {
  return useFilteredProjects({
    has_milestones: true,
    score_range: scoreRange,
    ordering: '-puntuacion_final_ponderada',
    ...additionalFilters
  });
}
