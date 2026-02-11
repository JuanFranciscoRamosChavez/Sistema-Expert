/**
 * Funciones de formateo reutilizables para evitar duplicación de código
 * IMPORTANTE: Todos los valores del backend vienen en pesos, no en millones
 */

import { ZONA_MAPPING } from './zones';

interface CurrencyFormatOptions {
	value: number;
	locale?: string;
	currency?: string;
}

/**
 * Normaliza el nombre de una alcaldía para comparación
 * Remueve acentos, puntos, artículos, etc.
 */
const normalizeAlcaldiaName = (name: string): string => {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Remover acentos
		.replace(/\./g, '') // Remover puntos (G.A. Madero -> GA Madero)
		.replace(/^(la|el|los|las)\s+/i, '') // Remover artículos iniciales
		.replace(/\s+de\s+/g, ' ') // Simplificar "de" (Cuajimalpa de Morelos -> Cuajimalpa Morelos)
		.replace(/[^\w\s]/g, '') // Remover puntuación
		.replace(/\s+/g, ' ') // Normalizar espacios
		.trim();
};

/**
 * Crea variaciones de búsqueda para una alcaldía
 * Ejemplo: "Gustavo A. Madero" -> ["gustavo a madero", "gustavo madero", "ga madero"]
 */
const generateAlcaldiaVariants = (name: string): string[] => {
	const variants: string[] = [];
	const normalized = normalizeAlcaldiaName(name);
	
	// Variante principal normalizada
	variants.push(normalized);
	
	// Sin artículos (La Magdalena Contreras -> Magdalena Contreras)
	const withoutArticle = name.replace(/^(la|el|los|las)\s+/i, '');
	if (withoutArticle !== name) {
		variants.push(normalizeAlcaldiaName(withoutArticle));
	}
	
	// Sin "de" intermedios (Cuajimalpa de Morelos -> Cuajimalpa Morelos)
	const withoutDe = name.replace(/\s+de\s+/gi, ' ');
	if (withoutDe !== name) {
		variants.push(normalizeAlcaldiaName(withoutDe));
	}
	
	// Sin puntos en iniciales (G.A. Madero -> GA Madero)
	const withoutDots = name.replace(/\./g, '');
	if (withoutDots !== name) {
		variants.push(normalizeAlcaldiaName(withoutDots));
	}
	
	// Abreviaciones de iniciales (Gustavo A Madero -> GA Madero)
	const words = normalized.split(' ');
	if (words.length > 2) {
		// Primera palabra + iniciales del resto
		const abbreviated = words[0] + ' ' + words.slice(1).map(w => w[0]).join('');
		variants.push(abbreviated);
	}
	
	return [...new Set(variants)]; // Eliminar duplicados
};

/**
 * Lista completa de las 16 alcaldías de la CDMX normalizadas
 */
const ALL_ALCALDIAS = Object.values(ZONA_MAPPING).flat();

/**
 * Identifica a qué zona pertenece una alcaldía
 */
const getZoneForAlcaldia = (alcaldia: string): string | null => {
	const inputVariants = generateAlcaldiaVariants(alcaldia);
	
	for (const [zone, alcaldias] of Object.entries(ZONA_MAPPING)) {
		for (const knownAlcaldia of alcaldias) {
			const knownVariants = generateAlcaldiaVariants(knownAlcaldia);
			
			// Verificar si alguna variante del input coincide con alguna variante conocida
			for (const inputVar of inputVariants) {
				for (const knownVar of knownVariants) {
					if (inputVar === knownVar || inputVar.includes(knownVar) || knownVar.includes(inputVar)) {
						return zone;
					}
				}
			}
		}
	}
	return null;
};

/**
 * Agrupa alcaldías por zona geográfica
 */
const groupAlcaldiasByZone = (alcaldias: string[]): Record<string, string[]> => {
	const grouped: Record<string, string[]> = {};
	
	alcaldias.forEach(alcaldia => {
		const zone = getZoneForAlcaldia(alcaldia);
		if (zone) {
			if (!grouped[zone]) {
				grouped[zone] = [];
			}
			grouped[zone].push(alcaldia);
		} else {
			// Alcaldías no reconocidas van a "Otras"
			if (!grouped['Otras']) {
				grouped['Otras'] = [];
			}
			grouped['Otras'].push(alcaldia);
		}
	});
	
	return grouped;
};

/**
 * Analiza la cobertura territorial de un proyecto
 * @param alcaldias - String con las alcaldías (puede contener comas, pipes, etc.)
 * @returns Objeto con información de cobertura territorial
 */
export const analyzeTerritorialCoverage = (alcaldias?: string | null) => {
	if (!alcaldias || alcaldias.trim() === '') {
		return {
			type: 'unknown' as const,
			count: 0,
			list: [],
			grouped: {},
			display: 'Sin especificar',
			icon: '📍'
		};
	}

	// Detectar primero si menciona toda la ciudad
	const normalizedInput = normalizeAlcaldiaName(alcaldias);
	const hasAllKeyword = /todas|16|completa|toda la ciudad/i.test(alcaldias);
	
	if (hasAllKeyword) {
		const grouped = groupAlcaldiasByZone(ALL_ALCALDIAS);
		return {
			type: 'all' as const,
			count: 16,
			list: ALL_ALCALDIAS,
			grouped,
			display: 'Toda la Ciudad de México (16 alcaldías)',
			icon: '🏙️'
		};
	}

	// ESTRATEGIA MEJORADA: Buscar alcaldías conocidas en el texto
	// Esto maneja correctamente "Magdalena Contreras", "Benito Juárez", etc.
	const foundAlcaldias: Set<string> = new Set();
	
	// Normalizar el texto de entrada una sola vez
	const textNormalized = normalizeAlcaldiaName(alcaldias);
	
	// Buscar cada alcaldía conocida y sus variantes en el texto
	ALL_ALCALDIAS.forEach(alcaldia => {
		const variants = generateAlcaldiaVariants(alcaldia);
		
		// Si alguna variante aparece en el texto, agregar la alcaldía oficial
		for (const variant of variants) {
			if (textNormalized.includes(variant)) {
				foundAlcaldias.add(alcaldia);
				break; // Ya encontramos esta alcaldía, pasar a la siguiente
			}
		}
	});

	// Si encontramos alcaldías conocidas, usar esas
	let alcaldiasList: string[] = [];
	
	if (foundAlcaldias.size > 0) {
		alcaldiasList = Array.from(foundAlcaldias);
	} else {
		// Fallback: dividir por separadores comunes
		const separators = /[,;|\n]/;
		alcaldiasList = alcaldias
			.split(separators)
			.map(a => a.trim())
			.filter(Boolean);
	}

	const count = alcaldiasList.length;
	const grouped = groupAlcaldiasByZone(alcaldiasList);

	// Una sola alcaldía
	if (count === 1) {
		const zone = getZoneForAlcaldia(alcaldiasList[0]);
		return {
			type: 'single' as const,
			count: 1,
			list: alcaldiasList,
			grouped,
			zone: zone || undefined,
			display: alcaldiasList[0],
			icon: '📍'
		};
	}

	// Múltiples alcaldías
	const zones = Object.keys(grouped).filter(z => z !== 'Otras');
	const displayZones = zones.length > 1 
		? `${count} alcaldías (${zones.length} zonas)` 
		: zones.length === 1
			? `${count} alcaldías - ${zones[0]}`
			: `${count} alcaldías`;

	return {
		type: 'multiple' as const,
		count,
		list: alcaldiasList,
		grouped,
		zones,
		display: displayZones,
		icon: '📍'
	};
};

/**
 * Valida y sanitiza valores numéricos
 * @param value - Valor a validar
 * @returns Número válido o 0
 */
const sanitizeNumber = (value: any): number => {
	const num = Number(value);
	
	// Validar que sea un número finito
	if (!isFinite(num) || isNaN(num)) {
		return 0;
	}
	
	// Evitar valores negativos en contextos donde no tienen sentido
	return Math.max(0, num);
};

interface BeneficiariesFormatOptions {
	value: number;
	locale?: string;
}

/**
 * Formatea valores de presupuesto a formato de moneda MXN
 * IMPORTANTE: El backend envía todos los valores YA en pesos, no en millones
 * @param value - Valor en pesos (no en millones)
 * @param locale - Localización (default: es-MX)
 * @param currency - Moneda (default: MXN)
 * @returns Valor formateado como moneda (ej: "$1,500,000")
 */
export const formatBudgetValue = ({ 
	value, 
	locale = 'es-MX', 
	currency = 'MXN' 
}: CurrencyFormatOptions): string => {
	// Sanitizar y validar el valor
	const num = sanitizeNumber(value);
	
	// CORRECCIÓN: El backend YA envía valores en pesos, NO multiplicar
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(num);
};

/**
 * Genera el subtítulo para presupuesto mostrando millones
 * @param value - Valor en pesos
 * @param locale - Localización (default: es-MX)
 * @returns Texto formateado (ej: "1.5 millones de pesos")
 */
export const formatBudgetSubtitle = (value: number, locale = 'es-MX'): string => {
	const num = sanitizeNumber(value);
	
	// Convertir pesos a millones
	const millionsDisplay = num / 1000000;
	
	const formattedMillions = millionsDisplay.toLocaleString(locale, { 
		minimumFractionDigits: 2,
		maximumFractionDigits: 2 
	});
	
	return `${formattedMillions} millones de pesos`;
};

/**
 * Formatea número de beneficiarios
 */
export const formatBeneficiariesValue = ({ 
	value, 
	locale = 'es-MX' 
}: BeneficiariesFormatOptions): string => {
	const num = sanitizeNumber(value);
	return `${new Intl.NumberFormat(locale).format(num)} personas`;
};

/**
 * Genera subtítulo para beneficiarios mostrando en miles
 */
export const formatBeneficiariesSubtitle = (value: number, locale = 'es-MX'): string => {
	const num = sanitizeNumber(value);
	const miles = (num / 1000).toLocaleString(locale, { maximumFractionDigits: 0 });
	return `${miles} mil personas`;
};

/**
 * Formatea porcentajes
 */
export const formatPercentage = (value: number, decimals = 0): string => {
	const num = sanitizeNumber(value);
	return `${num.toFixed(decimals)}%`;
};

/**
 * Formatea números grandes con separadores de miles
 */
export const formatNumber = (value: number, locale = 'es-MX'): string => {
	const num = sanitizeNumber(value);
	return new Intl.NumberFormat(locale).format(num);
};

/**
 * Formatea valores monetarios con símbolo de moneda
 * @param value - Valor en pesos
 * @param locale - Localización (default: es-MX)
 * @param currency - Código de moneda (default: MXN)
 * @returns Valor formateado con símbolo de moneda (ej: "$1,234,567")
 */
export const formatCurrency = (value: number, locale = 'es-MX', currency = 'MXN'): string => {
	const num = sanitizeNumber(value);
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(num);
};

/**
 * Formatea valores grandes de forma compacta (ej: 1.5M, 2.3B)
 * @param value - Valor numérico
 * @param locale - Localización (default: es-MX)
 * @returns Valor compactado (ej: "1.5M", "2.3B")
 */
export const formatCompactNumber = (value: number, locale = 'es-MX'): string => {
	const num = sanitizeNumber(value);
	
	if (num >= 1000000000) {
		// Miles de millones (Billions)
		return `${(num / 1000000000).toFixed(1)}B`;
	} else if (num >= 1000000) {
		// Millones
		return `${(num / 1000000).toFixed(1)}M`;
	} else if (num >= 1000) {
		// Miles
		return `${(num / 1000).toFixed(1)}K`;
	}
	
	return num.toLocaleString(locale);
};

/**
 * Formatea valores de presupuesto de forma compacta con signo de pesos
 * @param value - Valor en pesos
 * @returns Valor compactado con $ (ej: "$1.5M", "$2.3B")
 */
export const formatCompactCurrency = (value: number): string => {
	const num = sanitizeNumber(value);
	
	if (num >= 1000000000) {
		return `$${(num / 1000000000).toFixed(1)}B`;
	} else if (num >= 1000000) {
		return `$${(num / 1000000).toFixed(1)}M`;
	} else if (num >= 1000) {
		return `$${(num / 1000).toFixed(0)}K`;
	}
	
	return `$${num.toFixed(0)}`;
};

/**
 * Formatea una fecha en formato dd/mm/yyyy
 * @param date - Fecha como string ISO (YYYY-MM-DD), Date object, o timestamp
 * @returns Fecha formateada como dd/mm/yyyy, o cadena vacía si la fecha es inválida
 */
export const formatDate = (date: string | Date | null | undefined): string => {
	if (!date) return '';
	
	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		
		// Verificar si es una fecha válida
		if (isNaN(dateObj.getTime())) return '';
		
		const day = dateObj.getDate().toString().padStart(2, '0');
		const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
		const year = dateObj.getFullYear();
		
		return `${day}/${month}/${year}`;
	} catch {
		return '';
	}
};

/**
 * Formatea una fecha en formato largo legible (ej: "15 de enero de 2026")
 * @param date - Fecha como string ISO (YYYY-MM-DD), Date object, o timestamp
 * @returns Fecha formateada en español, o cadena vacía si la fecha es inválida
 */
export const formatDateLong = (date: string | Date | null | undefined): string => {
	if (!date) return '';
	
	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		
		// Verificar si es una fecha válida
		if (isNaN(dateObj.getTime())) return '';
		
		return dateObj.toLocaleDateString('es-MX', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	} catch {
		return '';
	}
};