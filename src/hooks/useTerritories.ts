import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface TerritoryData {
  name: string;
  projects: number;
  total_budget: number;
  avg_progress: number;
  formatted_budget: string;
}

interface TerritoriesResponse {
  territories: TerritoryData[];
  total_territories: number;
  timestamp: string;
}

/**
 * Hook para obtener agregaciones por territorio/alcaldía.
 * 
 * Sprint 3 - Distribución territorial dinámica:
 * - Proyectos por alcaldía
 * - Presupuesto asignado por territorio
 * - Avance promedio por zona
 * 
 * Reemplaza lógica de parsing de alcaldías en el cliente.
 * El backend hace la agregación SQL nativa.
 * 
 * @example
 * ```tsx
 * const { data: territories, isLoading } = useTerritories();
 * 
 * if (isLoading) return <Loader />;
 * 
 * return (
 *   <div>
 *     <h2>Distribución Territorial ({territories.total_territories} zonas)</h2>
 *     {territories.territories.map(territory => (
 *       <Card key={territory.name}>
 *         <CardTitle>{territory.name}</CardTitle>
 *         <p>Proyectos: {territory.projects}</p>
 *         <p>Presupuesto: {territory.formatted_budget}</p>
 *         <Progress value={territory.avg_progress} />
 *       </Card>
 *     ))}
 *   </div>
 * );
 * ```
 */
export const useTerritories = () => {
  return useQuery({
    queryKey: ['dashboard', 'territories'],
    queryFn: async (): Promise<TerritoriesResponse> => {
      const response = await fetch(`${API_BASE_URL}/v2/dashboard/territories/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch territories: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (datos cambian poco)
    gcTime: 30 * 60 * 1000,    // 30 minutos en caché
  });
};
