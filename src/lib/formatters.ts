/**
 * Funciones de formateo reutilizables para evitar duplicación de código
 */

interface CurrencyFormatOptions {
	value: number;
	locale?: string;
	currency?: string;
}

interface BeneficiariesFormatOptions {
	value: number;
	locale?: string;
}

/**
 * Formatea valores de presupuesto a formato de moneda MXN
 * Maneja automáticamente valores en millones
 */
export const formatBudgetValue = ({ 
	value, 
	locale = 'es-MX', 
	currency = 'MXN' 
}: CurrencyFormatOptions): string => {
	const num = Number(value) || 0;
	const realAmount = num < 1000000 ? num * 1000000 : num;

	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		minimumFractionDigits:  0,
		maximumFractionDigits: 0,
	}).format(realAmount);
};

/**
 * Genera el subtítulo para presupuesto mostrando millones
 */
export const formatBudgetSubtitle = (value: number, locale = 'es-MX'): string => {
	const num = Number(value) || 0;
	let millionsDisplay = 0;

	if (num < 1000000) {
		millionsDisplay = num;
	} else {
		millionsDisplay = num / 1000000;
	}

	const formattedMillions = millionsDisplay.toLocaleString(locale, { 
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
	const num = Number(value) || 0;
	return `${new Intl.NumberFormat(locale).format(num)} personas`;
};

/**
 * Genera subtítulo para beneficiarios mostrando en miles
 */
export const formatBeneficiariesSubtitle = (value: number, locale = 'es-MX'): string => {
	const num = Number(value) || 0;
	const miles = (num / 1000).toLocaleString(locale, { maximumFractionDigits: 0 });
	return `${miles} mil personas`;
};

/**
 * Formatea porcentajes
 */
export const formatPercentage = (value: number, decimals = 0): string => {
	return `${value.toFixed(decimals)}%`;
};

/**
 * Formatea números grandes con separadores de miles
 */
export const formatNumber = (value: number, locale = 'es-MX'): string => {
	return new Intl.NumberFormat(locale).format(value);
};