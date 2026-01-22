export type ProjectStatus = 'en_ejecucion' | 'planificado' | 'completado' | 'retrasado' | 'en_riesgo';
export type Priority = 'baja' | 'media' | 'alta' | 'muy_alta' | 'critica';
export type Viability = 'alta' | 'media' | 'baja';

// Nueva interfaz para los semáforos individuales
export interface ViabilitySemaphores {
  tecnica: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
  presupuestal: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
  juridica: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
  temporal: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
  administrativa: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
}

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
  semaphores: ViabilitySemaphores;
  fechaInicio: string;
  fechaFin: string;
  fecha_inicio_prog?: string;
  fecha_termino_prog?: string;
  fecha_inicio_real?: string;
  fecha_termino_real?: string;
  duracion_meses?: number;
  beneficiarios: number;
  ubicacion: string;
  alcanceTerritorial?: string; // Del Bloque 3 - Categorización
  zona: string;
  objetivos: string[];
  riesgos: string[];
  accionesCorrectivas?: string;
  avance: number;
  indicadores: {
    nombre: string;
    meta: number;
    actual: number;
    unidad: string;
  }[];
  riesgo: number;
  puntajePrioridad?: number;
}

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
    muy_alta: 'Muy Alta',
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

// ...existing code...

export const zonas = [
  {
    id: 'norte' as const,
    nombre: "Zona Norte",
    poblacion: 150000
  },
  {
    id: 'sur' as const,
    nombre: "Zona Sur",
    poblacion: 180000
  },
  {
    id: 'centro' as const,
    nombre: "Zona Centro",
    poblacion: 200000
  },
  {
    id: 'oriente' as const,
    nombre: "Zona Oriente",
    poblacion: 160000
  },
  {
    id: 'poniente' as const,
    nombre: "Zona Poniente",
    poblacion: 170000
  }
];

// ...existing code...
