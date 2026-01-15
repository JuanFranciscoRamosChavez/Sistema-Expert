export type ProjectStatus = 'en_ejecucion' | 'planificado' | 'completado' | 'retrasado' | 'en_riesgo';
export type Priority = 'critica' | 'alta' | 'media' | 'baja';
export type Viability = 'alta' | 'media' | 'baja';

export interface Project {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  responsable: string;
  presupuesto: number;
  ejecutado: number;
  status: ProjectStatus;
  prioridad: Priority;
  viabilidad: Viability;
  fechaInicio: string;
  fechaFin: string;
  beneficiarios: number;
  ubicacion: string;
  zona: string;
  objetivos: string[];
  riesgos: string[];
  avance: number;
  indicadores: {
    nombre: string;
    meta: number;
    actual: number;
    unidad: string;
  }[];
}

// --- Listas Estáticas Restauradas (Necesarias para filtros) ---
export const direcciones = [
  'Dirección de Obras Públicas',
  'Dirección de Desarrollo Social',
  'Dirección de Servicios Públicos',
  'Dirección de Medio Ambiente',
  'Dirección de Innovación',
  'Dirección de Desarrollo Económico',
  'Dirección de Movilidad',
];

export const zonas = [
  { id: 'norte', nombre: 'Zona Norte', poblacion: 85000 },
  { id: 'sur', nombre: 'Zona Sur', poblacion: 72000 },
  { id: 'centro', nombre: 'Centro Histórico', poblacion: 45000 },
  { id: 'oriente', nombre: 'Zona Oriente', poblacion: 63000 },
  { id: 'poniente', nombre: 'Zona Poniente', poblacion: 55000 },
];

// --- Helpers ---
export const getStatusLabel = (status: ProjectStatus): string => {
  const labels: Record<ProjectStatus, string> = {
    en_ejecucion: 'En Ejecución',
    planificado: 'Planificado',
    completado: 'Completado',
    retrasado: 'Retrasado',
    en_riesgo: 'En Riesgo',
  };
  return labels[status] || status;
};

export const getPriorityLabel = (priority: Priority): string => {
  const labels: Record<Priority, string> = {
    critica: 'Crítica',
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja',
  };
  return labels[priority] || priority;
};

export const formatCurrency = (amount: number): string => {
  // Si es mayor a 1,000 millones (Billions en inglés, Miles de Millones en español)
  if (amount >= 1000000000) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 1000000000) + ' MMD'; // MMD = Miles de Millones de Dólares/Pesos
  }
  
  // Si es mayor a 1 millón
  if (amount >= 1000000) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 1000000) + ' MDP'; // MDP = Millones de Pesos
  }

  // Formato estándar para montos normales (con centavos siempre)
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-MX').format(num);
};

export const mockProjects: Project[] = [];
