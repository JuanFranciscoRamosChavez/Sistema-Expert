import { Project } from '@/types';
import { ZONA_MAPPING } from './zones';

/**
 * Obtiene las zonas a partir del string de alcaldías y alcance territorial
 */
function getZonasFromAlcaldias(alcaldiasStr: string, alcanceTerritorial?: string): string[] {
	const alcaldias = (alcaldiasStr || '').toLowerCase().trim();
	const alcance = (alcanceTerritorial || '').toLowerCase().trim();

	// Caso especial: toda la ciudad (búsqueda flexible)
	const isTodaCiudad = (
		alcance.includes('toda') ||
		alcance.includes('16') ||
		alcaldias.includes('toda') ||
		alcaldias.includes('16') ||
		alcance.includes('completa') ||
		alcance.includes('todas')
	);

	if (isTodaCiudad) {
		return ['Zona Norte', 'Zona Sur', 'Zona Oriente', 'Zona Poniente', 'Centro Histórico'];
	}

	// Extraer zonas de las alcaldías mencionadas
	const zonasSet = new Set<string>();

	Object.entries(ZONA_MAPPING).forEach(([zona, alcaldias]) => {
		alcaldias.forEach(alcaldia => {
			// Buscar la alcaldía en el texto (más flexible)
			const alcaldiaLower = alcaldia.toLowerCase();
			if (alcaldiasStr.toLowerCase().includes(alcaldiaLower)) {
				zonasSet.add(zona);
			}
		});
	});

	return Array.from(zonasSet);
}

/**
 * Filtra proyectos por zona geográfica
 * Usado para mostrar proyectos en el modal al hacer clic en una zona
 */
export function filterProjectsByZone(projects: Project[], zoneName: string): Project[] {
	return projects.filter(project => {
		// Obtener ambos campos
		const alcaldiasStr = project.alcaldias || '';
		const alcanceTerritorial = project.alcanceTerritorial || '';
		
		// Obtener las zonas del proyecto
		const zonas = getZonasFromAlcaldias(alcaldiasStr, alcanceTerritorial);
		
		// El proyecto pertenece a la zona si está en su lista de zonas
		return zonas.includes(zoneName);
	});
}
