import { useEffect, useState } from 'react';
import { Project, KPIData } from '@/types';
import { mapApiToUiProject } from '@/lib/mappers';
import { API_ENDPOINTS } from '@/config/api';

interface DashboardDataState {
	projects: Project[];
	kpiData: KPIData | null;
	loading:  boolean;
	error: string | null;
}

interface UseDashboardDataReturn extends DashboardDataState {
	refetch: () => Promise<void>;
}

/**
 * Custom hook para manejar la lógica de datos del dashboard
 * Separa la lógica de negocio del componente de presentación
 */
export function useDashboardData(): UseDashboardDataReturn {
	const [projects, setProjects] = useState<Project[]>([]);
	const [kpiData, setKpiData] = useState<KPIData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);

			const [resumenRes, obrasRes] = await Promise.all([
				fetch(API_ENDPOINTS.dashboard.resumen),
				fetch(API_ENDPOINTS.dashboard.obras)
			]);

			if (!resumenRes.ok || ! obrasRes.ok) {
				const errorMsg = ! resumenRes.ok 
					? `Error en resumen: ${resumenRes.status}` 
					: `Error en obras: ${obrasRes.status}`;
				throw new Error(errorMsg);
			}

			const resumenJson = await resumenRes.json();
			const obrasJson = await obrasRes.json();

			// Procesar proyectos
			if (Array.isArray(obrasJson)) {
				setProjects(obrasJson. map(mapApiToUiProject));
			} else {
				console.warn('Formato inesperado en obras:', obrasJson);
				setProjects([]);
			}

			// Procesar KPIs
			if (resumenJson?. kpi_tarjetas) {
				setKpiData(resumenJson.kpi_tarjetas);
			} else {
				console.warn('Formato inesperado en resumen:', resumenJson);
				throw new Error('No se encontraron datos de KPI');
			}

		} catch (err) {
			const errorMessage = err instanceof Error 
				? err.message 
				: 'Error desconocido';
			
			console.error('Error al cargar datos del dashboard:', err);
			setError(`No se pudo cargar la información: ${errorMessage}`);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return {
		projects,
		kpiData,
		loading,
		error,
		refetch: fetchData
	};
}