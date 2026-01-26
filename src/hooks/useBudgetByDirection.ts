/**
 * Hook: useBudgetByDirection
 * Sprint 2: Agregaciones Serverside
 * 
 * Reemplaza los reduce() client-side en TransparencyView.tsx
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { API_BASE_URL } from '@/config/api';

export interface DirectionBudget {
  name: string;
  full_name: string;
  value: number;
  executed: number;
  project_count: number;
}

interface BudgetByDirectionResponse {
  pie_chart_data: DirectionBudget[];
  _meta: {
    total_directions: number;
    timestamp: string;
  };
}

/**
 * Hook para obtener presupuesto agregado por dirección.
 * Postgres hace la agregación, el cliente solo renderiza.
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useBudgetByDirection();
 * 
 * if (data) {
 *   <PieChart data={data.pie_chart_data} />
 * }
 * ```
 */
export function useBudgetByDirection(): UseQueryResult<BudgetByDirectionResponse, Error> {
  return useQuery({
    queryKey: queryKeys.obras.byDirection,
    queryFn: async () => {
      const url = `${API_BASE_URL}/api/v2/dashboard/budget-by-direction/`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (agregaciones cambian poco)
  });
}
