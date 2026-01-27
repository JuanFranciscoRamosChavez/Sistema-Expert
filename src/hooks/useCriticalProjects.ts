import { useQuery } from '@tanstack/react-query';
import { mapApiToUiProject } from '@/lib/mappers';
import { Project, APIProject } from '@/types';
import { API_BASE_URL } from '@/config/api'; // <--- Usar config centralizada

interface CriticalProjectsAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: APIProject[]; // <--- El backend devuelve la estructura completa
}

export function useCriticalProjects(pageSize: number = 5) {
  return useQuery<Project[]>({
    queryKey: ['critical-projects', pageSize],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/v2/dashboard/critical-projects/?page_size=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error(`Error al cargar proyectos críticos: ${response.status}`);
      }
      
      const data: CriticalProjectsAPIResponse = await response.json();
      
      // Mapeo robusto
      return data.results.map(mapApiToUiProject);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache para datos críticos
  });
}