// src/lib/zones.ts
import { ZONE_PALETTE } from './theme';

export const ZONA_MAPPING: Record<string, string[]> = {
	'Zona Norte': ['Gustavo A. Madero', 'Azcapotzalco', 'Tláhuac', 'Milpa Alta'],
	'Zona Sur': ['Coyoacán', 'Tlalpan', 'Xochimilco', 'La Magdalena Contreras'],
	'Centro Histórico': ['Cuauhtémoc', 'Benito Juárez'],
	'Zona Oriente': ['Iztapalapa', 'Iztacalco', 'Venustiano Carranza'],
	'Zona Poniente': ['Miguel Hidalgo', 'Cuajimalpa de Morelos', 'Álvaro Obregón']
};

// Mapeamos las llaves del diccionario de zonas a los colores del tema
export const ZONE_COLORS: Record<string, string> = {
	'Zona Norte': ZONE_PALETTE.norte,
	'Zona Sur': ZONE_PALETTE.sur,
	'Centro Histórico': ZONE_PALETTE.centro,
	'Zona Oriente': ZONE_PALETTE.oriente,
	'Zona Poniente': ZONE_PALETTE.poniente,
    'Sin Asignar': ZONE_PALETTE.sin_asignar
};

// Función helper para normalizar texto
export const normalizeText = (text: string): string => 
	text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Palabras clave para proyectos que cubren toda la ciudad
const CITY_WIDE_KEYWORDS = ['todas', '16 alcaldias', 'ciudad completa', 'toda la ciudad'];

/**
 * Calcula estadísticas por zona territorial
 * @param projects - Array de proyectos
 * @returns Objeto con estadísticas por zona
 */
export function calculateZoneStats(projects: any[]) {
	const stats: Record<string, { projects: number; budget: number; beneficiaries: number }> = {
		'Zona Norte': { projects: 0, budget: 0, beneficiaries: 0 },
		'Zona Sur': { projects: 0, budget: 0, beneficiaries: 0 },
		'Centro Histórico': { projects: 0, budget: 0, beneficiaries: 0 },
		'Zona Oriente': { projects: 0, budget: 0, beneficiaries: 0 },
		'Zona Poniente': { projects: 0, budget: 0, beneficiaries: 0 },
		'Sin Asignar': { projects: 0, budget: 0, beneficiaries: 0 }
	};

	projects.forEach(project => {
		const ubicacion = normalizeText(project.zona || project.ubicacion || '');
		const alcance = normalizeText(project.alcance_territorial || '');
		const alcaldias = normalizeText(project.alcaldias || '');
		
		const presupuesto = project.presupuesto || 0;
		const beneficiarios = project.beneficiarios || 0;

		// Detectar si es proyecto de toda la ciudad
		const isCityWide = CITY_WIDE_KEYWORDS.some(keyword => 
			ubicacion.includes(keyword) || alcance.includes(keyword) || alcaldias.includes(keyword)
		);

		const matchingZones: string[] = [];

		if (isCityWide) {
			// Proyecto cubre todas las zonas
			matchingZones.push(...Object.keys(ZONA_MAPPING));
		} else {
			// Buscar coincidencias por alcaldía
			for (const [zoneName, alcaldiasList] of Object.entries(ZONA_MAPPING)) {
				const hasMatch = alcaldiasList.some(alcaldia => {
					const alcaldiaNorm = normalizeText(alcaldia);
					return ubicacion.includes(alcaldiaNorm) || 
						   alcance.includes(alcaldiaNorm) || 
						   alcaldias.includes(alcaldiaNorm);
				});
				
				if (hasMatch) {
					matchingZones.push(zoneName);
				}
			}
		}

		// Distribuir proporcionalmente si hay múltiples zonas
		if (matchingZones.length > 0) {
			const divisor = matchingZones.length;
			matchingZones.forEach(zone => {
				stats[zone].projects += 1 / divisor;
				stats[zone].budget += presupuesto / divisor;
				stats[zone].beneficiaries += beneficiarios / divisor;
			});
		} else {
			// Sin asignar
			stats['Sin Asignar'].projects += 1;
			stats['Sin Asignar'].budget += presupuesto;
			stats['Sin Asignar'].beneficiaries += beneficiarios;
		}
	});

	return stats;
}