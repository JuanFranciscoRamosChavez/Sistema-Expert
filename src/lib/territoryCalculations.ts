/**
 * territoryCalculations.ts
 * 
 * Funciones puras para cálculos territoriales
 * Separación de lógica de negocio del componente UI
 */

import { ZONA_MAPPING, normalizeText } from './zones';

// --- TIPOS ---

export interface ZoneStats {
	count: number;
	budget: number;
	beneficiaries: number;
}

// Interfaz mínima requerida para los cálculos territoriales
export interface ProjectMinimal {
	id: string | number;
	ubicacion: string;
	alcanceTerritorial?: string;
	presupuesto: number;
	beneficiarios: number;
}

export interface PieChartData {
	name: string;
	value: number;
}

export interface BarChartData {
	name: string;
	fullName: string;
	proyectos: number;
	beneficiarios: number;
}

// --- FUNCIONES PRINCIPALES ---

/**
 * Calcula estadísticas por zona estratégica
 * Maneja prorrateo de proyectos multiterritoriales
 */
export function calculateZoneStats(projects: ProjectMinimal[]): Record<string, ZoneStats> {
	// 1. Inicializar estructura de estadísticas vacía
	const stats: Record<string, { 
		count: number; 
		budget: number; 
		beneficiaries: number;
		projectIds: Set<string | number>;
	}> = {};
	
	Object.keys(ZONA_MAPPING).forEach(zoneName => {
		stats[zoneName] = { count: 0, budget: 0, beneficiaries: 0, projectIds: new Set() };
	});

	// Zona para proyectos sin alcaldía definida
	stats['Sin Asignar'] = { count: 0, budget: 0, beneficiaries: 0, projectIds: new Set() };

	// 2. Procesar cada proyecto
	projects.forEach(project => {
		if (!project.ubicacion) {
			stats['Sin Asignar'].projectIds.add(project.id);
			stats['Sin Asignar'].budget += project.presupuesto;
			stats['Sin Asignar'].beneficiaries += project.beneficiarios;
			return;
		}

		const matchingZones = findMatchingZones(project);

		// 3. Distribuir proyecto entre zonas (prorrateo)
		if (matchingZones.length > 0) {
			const divisor = matchingZones.length;
			const budgetPerZone = project.presupuesto / divisor;
			const beneficiariesPerZone = project.beneficiarios / divisor;

			matchingZones.forEach(zoneName => {
				stats[zoneName].projectIds.add(project.id);
				stats[zoneName].budget += budgetPerZone;
				stats[zoneName].beneficiaries += beneficiariesPerZone;
			});
		} else {
			stats['Sin Asignar'].projectIds.add(project.id);
			stats['Sin Asignar'].budget += project.presupuesto;
			stats['Sin Asignar'].beneficiaries += project.beneficiarios;
		}
	});

	// 4. Convertir Sets de IDs a conteo real
	const finalStats: Record<string, ZoneStats> = {};
	Object.entries(stats).forEach(([zoneName, data]) => {
		finalStats[zoneName] = {
			count: data.projectIds.size,
			budget: data.budget,
			beneficiaries: Math.round(data.beneficiaries)
		};
	});

	return finalStats;
}

/**
 * Encuentra las zonas estratégicas que corresponden a un proyecto
 */
export function findMatchingZones(project: ProjectMinimal): string[] {
	const projectLocationNorm = normalizeText(project.ubicacion);
	const alcanceTerritorialNorm = normalizeText(project.alcanceTerritorial || '');
	const matchingZones: string[] = [];

	// CASO ESPECIAL: Proyecto de toda la ciudad
	if (isCityWideProject(projectLocationNorm, alcanceTerritorialNorm)) {
		return Object.keys(ZONA_MAPPING);
	}

	// Buscar coincidencias con alcaldías
	Object.entries(ZONA_MAPPING).forEach(([zoneName, alcaldias]) => {
		const hasAlcaldiaMatch = alcaldias.some(alcaldia => {
			const alcaldiaNorm = normalizeText(alcaldia);
			return projectLocationNorm.includes(alcaldiaNorm) || 
			       alcanceTerritorialNorm.includes(alcaldiaNorm);
		});

		if (hasAlcaldiaMatch) {
			matchingZones.push(zoneName);
		}
	});

	return matchingZones;
}

/**
 * Detecta si un proyecto es de alcance ciudad completa
 */
export function isCityWideProject(locationNorm: string, alcanceNorm: string): boolean {
	const cityWideKeywords = ['todas', '16 alcaldias', 'ciudad completa'];
	
	return cityWideKeywords.some(keyword => 
		locationNorm.includes(keyword) || alcanceNorm.includes(keyword)
	);
}

/**
 * Filtra proyectos que pertenecen a una zona específica
 */
export function filterProjectsByZone<T extends ProjectMinimal>(projects: T[], zoneName: string): T[] {
	return projects.filter(project => {
		if (!project.ubicacion) return false;

		const projectLocationNorm = normalizeText(project.ubicacion);
		const alcanceTerritorialNorm = normalizeText(project.alcanceTerritorial || '');

		// Proyecto de toda la ciudad
		if (isCityWideProject(projectLocationNorm, alcanceTerritorialNorm)) {
			return true;
		}

		// Buscar coincidencias con las alcaldías de la zona
		const alcaldiasDeZona = ZONA_MAPPING[zoneName] || [];
		return alcaldiasDeZona.some(alcaldia => {
			const alcaldiaNorm = normalizeText(alcaldia);
			return projectLocationNorm.includes(alcaldiaNorm) || 
			       alcanceTerritorialNorm.includes(alcaldiaNorm);
		});
	});
}

// --- FUNCIONES DE PREPARACIÓN DE DATOS PARA GRÁFICAS ---

/**
 * Prepara datos para gráfica de pastel (Pie Chart)
 */
export function preparePieChartData(zoneStats: Record<string, ZoneStats>): PieChartData[] {
	return Object.entries(zoneStats)
		.filter(([_, data]) => data.budget > 0)
		.map(([zone, data]) => ({
			name: zone,
			value: data.budget,
		}));
}

/**
 * Prepara datos para gráfica de barras (Bar Chart)
 */
export function prepareBarChartData(zoneStats: Record<string, ZoneStats>): BarChartData[] {
	return Object.entries(zoneStats)
		.filter(([name]) => name !== 'Sin Asignar')
		.map(([zone, data]) => ({
			name: zone.replace('Zona ', ''), // Nombre corto para eje X
			fullName: zone,
			proyectos: data.count,
			beneficiarios: data.beneficiaries,
		}));
}

// --- FUNCIONES DE CÁLCULO DE TOTALES ---

/**
 * Calcula el presupuesto total distribuido entre zonas
 */
export function calculateTotalDistributedBudget(zoneStats: Record<string, ZoneStats>): number {
	return Object.values(zoneStats).reduce((sum, stat) => sum + stat.budget, 0);
}

/**
 * Calcula el total de asignaciones zonales (con duplicados por zonas múltiples)
 */
export function calculateTotalZoneAssignments(zoneStats: Record<string, ZoneStats>): number {
	return Object.values(zoneStats).reduce((sum, stat) => sum + stat.count, 0);
}

/**
 * Calcula el total de beneficiarios
 */
export function calculateTotalBeneficiaries(zoneStats: Record<string, ZoneStats>): number {
	return Object.values(zoneStats).reduce((sum, stat) => sum + stat.beneficiaries, 0);
}

/**
 * Detecta si hay anomalías en proyectos sin asignar
 */
export function hasUnassignedAnomalies(
	zoneStats: Record<string, ZoneStats>,
	totalBudget: number,
	threshold: number = 50
): boolean {
	const sinAsignarBudget = zoneStats['Sin Asignar']?.budget || 0;
	const percentage = totalBudget > 0 ? (sinAsignarBudget / totalBudget) * 100 : 0;
	return percentage > threshold;
}

/**
 * Obtiene el porcentaje de presupuesto sin asignar
 */
export function getUnassignedPercentage(
	zoneStats: Record<string, ZoneStats>,
	totalBudget: number
): number {
	const sinAsignarBudget = zoneStats['Sin Asignar']?.budget || 0;
	return totalBudget > 0 ? (sinAsignarBudget / totalBudget) * 100 : 0;
}
