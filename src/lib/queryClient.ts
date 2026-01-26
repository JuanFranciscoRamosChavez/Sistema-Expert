/**
 * Configuración de TanStack Query
 * Sprint 2: Filtrado Serverside
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración optimizada para "Thin Client"
      staleTime: 5 * 60 * 1000, // 5 minutos - datos frescos sin re-fetch constante
      cacheTime: 10 * 60 * 1000, // 10 minutos - mantener en caché
      retry: 2, // Reintentar 2 veces en caso de error
      refetchOnWindowFocus: false, // No re-fetch al cambiar de pestaña
      refetchOnReconnect: true, // Sí re-fetch al reconectar internet
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query Keys centralizados (mejora TypeSafety y debugging)
export const queryKeys = {
  // Dashboard
  dashboard: {
    resumen: ['dashboard', 'resumen'] as const,
    territorial: (version?: string) => ['dashboard', 'territorial', version] as const,
    obras: ['dashboard', 'obras'] as const,
  },
  
  // Filtrado (Sprint 2)
  obras: {
    all: ['obras'] as const,
    filtered: (filters: Record<string, any>) => ['obras', 'filtered', filters] as const,
    byDirection: ['obras', 'by-direction'] as const,
  },
} as const;
