/**
 * Configuración centralizada de endpoints de API
 * Permite cambiar entre entornos (desarrollo, producción) fácilmente
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Feature Flags (Sprint 1: Cálculos Territoriales)
const USE_TERRITORIAL_V2 = import.meta.env.VITE_USE_TERRITORIAL_V2 === 'true';

// Feature Flags (Sprint 2: Filtrado Serverside)
const USE_FILTERS_V2 = import.meta.env.VITE_USE_FILTERS_V2 !== 'false'; // Habilitado por default

export const API_ENDPOINTS = {
	dashboard: {
		resumen: `${API_BASE_URL}/api/dashboard/resumen/`,
		obras: `${API_BASE_URL}/api/obras/`,
		// Feature Flag: Permite A/B testing entre v1 (Python) y v2 (SQL-optimized)
		territorial: `${API_BASE_URL}/api/v2/dashboard/territorial/${USE_TERRITORIAL_V2 ? '?version=v2' : ''}`,
		// Sprint 2: Agregaciones por dirección
		budgetByDirection: `${API_BASE_URL}/api/v2/dashboard/budget-by-direction/`,
		// Sprint 3: Agregaciones y Parsing
		recentActivity: `${API_BASE_URL}/api/v2/dashboard/recent-activity/`,
		kpis: `${API_BASE_URL}/api/v2/dashboard/kpis/`,
		territories: `${API_BASE_URL}/api/v2/dashboard/territories/`
	},
	// Sprint 2: Endpoints de filtrado
	v2: {
		obrasFiltered: `${API_BASE_URL}/api/v2/obras/filtered/`
	}
} as const;

export { API_BASE_URL, USE_TERRITORIAL_V2, USE_FILTERS_V2 };