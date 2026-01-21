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