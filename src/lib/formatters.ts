/**
 * Funciones de formateo reutilizables para evitar duplicación de código
 * IMPORTANTE: Todos los valores del backend vienen en pesos, no en millones
 */

interface CurrencyFormatOptions {
	value: number;
	locale?: string;
	currency?: string;
}

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