// Paleta central de colores para la aplicación
// Formato HEX para compatibilidad total con Recharts y Tailwind

export const APP_COLORS = {
  // Estados Semánticos (El significado del color)
  success: '#10b981', // Emerald 500 - Para completado/bueno
  info: '#3b82f6',    // Blue 500    - Para ejecución/informativo
  warning: '#f59e0b', // Amber 500   - Para alertas medias/retrasos
  danger: '#ef4444',  // Red 500     - Para riesgo alto/crítico

  primary: "#0f172a",
	secondary: "#64748b",
	accent: "#3b82f6",
	background: "#f8fafc",
	surface: "#ffffff",
  
  // Elementos de UI
  neutral: '#94a3b8',    // Slate 400 - Para elementos planificados/inactivos
  backgroundBar: '#cbd5e1', // Slate 300 - Para el fondo de las barras de presupuesto
  textMain: 'hsl(var(--foreground))', // Negro principal (vinculado al tema oscuro/claro)
  textMuted: 'hsl(var(--muted-foreground))', // Gris texto secundario
};

// Mapa de estatus para gráficas
export const STATUS_COLORS = {
  completado: APP_COLORS.success,
  en_ejecucion: APP_COLORS.info,
  en_riesgo: APP_COLORS.danger,
  planificado: APP_COLORS.neutral,
  retrasado: APP_COLORS.warning,
};

// Mapa para prioridades
export const PRIORITY_COLORS = {
  critica: "#ef4444",   // Rojo (4.5 - 5.0)
	muy_alta: "#f97316",  // Naranja Intenso (3.5 - 4.4) <-- NUEVO
	alta: "#f59e0b",      // Ámbar (2.5 - 3.4)
	media: "#3b82f6",     // Azul (1.5 - 2.4)
	baja: "#10b981"       // Verde (1.0 - 1.4)
};

// Usamos colores distintivos pero armónicos con la paleta Tailwind
export const ZONE_PALETTE = {
  norte: '#0ea5e9',    // Sky 500 (Azul claro)
  sur: '#22c55e',      // Green 500 (Verde)
  centro: '#eab308',   // Yellow 500 (Dorado/Amarillo)
  oriente: '#a855f7',  // Purple 500 (Morado)
  poniente: '#f43f5e', // Rose 500 (Rojo/Rosa)
  sin_asignar: APP_COLORS.neutral // Gris
};