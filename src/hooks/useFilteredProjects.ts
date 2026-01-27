/**
 * Hook: useFilteredProjects
 * Arquitectura: API Response -> Mapper -> UI State
 * Incluye: Soporte para hitos comunicacionales y filtrado serverside.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { API_BASE_URL } from '@/config/api';
import { mapApiToUiProject } from '@/lib/mappers';
import type { Project, APIProject } from '@/types';

export interface ProjectFilters {
  status?: string;
  direccion?: string;
  days_threshold?: number | string;
  year?: number;
  has_milestones?: boolean; // 
  score_range?: 'critica' | 'muy_alta' | 'alta' | 'media' | 'baja';
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number | 'todos';
}

// 1. Tipado de lo que llega del Backend (Crudo)
interface APIFilteredResponse {
  results: APIProject[]; 
  count: number;
  next: string | null;
  previous: string | null;
  _meta: {
    total_count: number;
    filters_applied: Record<string, any>;
    timestamp: string;
  };
}

// 2. Tipado de lo que sale al Componente (Limpio)
interface FilteredProjectsResult {
  results: Project[]; 
  count: number;
  next: string | null;
  previous: string | null;
  _meta: APIFilteredResponse['_meta'];
}

/**
 * Hook principal para obtener proyectos filtrados.
 */
export function useFilteredProjects(
  filters: ProjectFilters = {},
  enabled: boolean = true
) {
  // Limpieza de filtros (eliminar nulos/vacíos)
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v != null && v !== '')
  );

  const queryString = new URLSearchParams(cleanFilters as any).toString();

  return useQuery<FilteredProjectsResult>({
    queryKey: [queryKeys.obras.filtered, cleanFilters],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/v2/obras/filtered/?${queryString}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data: APIFilteredResponse = await response.json();
      
      // 3. Transformación Inmediata: APIProject[] -> Project[]
      return {
        ...data,
        results: data.results.map(mapApiToUiProject)
      };
    },
    enabled,
    staleTime: 3 * 60 * 1000, 
  });
}

// --- HELPERS (Funciones de conveniencia) ---

export function useUpcomingProjects(daysThreshold: number = 90) {
  return useFilteredProjects({
    days_threshold: daysThreshold,
    ordering: 'fecha_termino_prog',
    page_size: 'todos'
  });
}

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

export function useMilestoneProjects(
  scoreRange?: ProjectFilters['score_range'],
  additionalFilters: Partial<ProjectFilters> = {}
) {
  return useFilteredProjects({
    has_milestones: true, // Esto activa el filtro en el backend
    score_range: scoreRange,
    ordering: '-puntuacion_final_ponderada', // Los más importantes primero
    ...additionalFilters
  });
}