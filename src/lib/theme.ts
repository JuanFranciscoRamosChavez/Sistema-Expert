// Paleta central de colores para la aplicación
// Formato HEX para compatibilidad total con Recharts y Tailwind

export const APP_COLORS = {
  // Estados Semánticos (El significado del color)
  success: '#10b981', // Emerald 500 - Para completado/bueno
  info: '#3b82f6',    // Blue 500    - Para ejecución/informativo
  warning: '#f59e0b', // Amber 500   - Para alertas medias/retrasos
  danger: '#ef4444',  // Red 500     - Para riesgo alto/crítico

  primary: '#0f172a',
  secondary: '#64748b',
  accent: '#3b82f6',
  background: '#f8fafc',
  surface: '#ffffff',
  
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
  critica: '#ef4444',   // Rojo (4.5 - 5.0)
  muy_alta: '#f97316',  // Naranja Intenso (3.5 - 4.4)
  alta: '#f59e0b',      // Ámbar (2.5 - 3.4)
  media: '#3b82f6',     // Azul (1.5 - 2.4)
  baja: '#10b981'       // Verde (1.0 - 1.4)
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

// Colores para urgencias (usado en TimelineView)
export const URGENCY_STYLES = {
  high: {
    border: 'border-red-200 dark:border-red-900/50',
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-600 dark:text-red-400'
  },
  medium: {
    border: 'border-yellow-200 dark:border-yellow-900/50',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    text: 'text-yellow-600 dark:text-yellow-400'
  },
  low: {
    border: 'border-border',
    bg: 'bg-card',
    text: 'text-muted-foreground'
  }
};

// Colores para multianualidad
export const MULTIANUAL_STYLES = {
  border: 'border-purple-500',
  text: 'text-purple-700 dark:text-purple-400',
  bg: 'bg-purple-50 dark:bg-purple-950/20'
};

// Colores para presupuesto
export const BUDGET_STYLES = {
  bg: 'bg-blue-50 dark:bg-blue-950/20',
  border: 'border-blue-200 dark:border-blue-900',
  text: 'text-blue-900 dark:text-blue-100',
  textMuted: 'text-blue-700 dark:text-blue-300'
};

// Colores para estados en timeline/gantt
export const TIMELINE_STATUS_STYLES = {
  en_ejecucion: { bg: 'bg-blue-500', bgCard: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  completado: { bg: 'bg-green-500', bgCard: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  retrasado: { bg: 'bg-yellow-500', bgCard: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  en_riesgo: { bg: 'bg-red-500', bgCard: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  planificado: { bg: 'bg-gray-400', bgCard: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300' }
};

// Colores para score/prioridad visual
export const SCORE_STYLES = {
  critica: { border: 'border-red-500', text: 'text-red-700 dark:text-red-300', bg: 'bg-red-500' },
  muy_alta: { border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-500' },
  alta: { border: 'border-yellow-500', text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-500' },
  media: { border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-500' },
  baja: { border: 'border-green-500', text: 'text-green-700 dark:text-green-300', bg: 'bg-green-500' }
};

// Helper para obtener estilos de score según puntuación
export function getScoreStyles(score: number) {
  if (score >= 4.5) return SCORE_STYLES.critica;
  if (score >= 3.5) return SCORE_STYLES.muy_alta;
  if (score >= 2.5) return SCORE_STYLES.alta;
  if (score >= 1.5) return SCORE_STYLES.media;
  return SCORE_STYLES.baja;
}
