/**
 * Configuración centralizada de endpoints de API
 * Permite cambiar entre entornos (desarrollo, producción) fácilmente
 */

const API_BASE_URL = import. meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
	dashboard:  {
		resumen: `${API_BASE_URL}/api/dashboard/resumen/`,
		obras: `${API_BASE_URL}/api/obras/`
	}
} as const;

export { API_BASE_URL };