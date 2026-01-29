// --- TIPOS DE RESPUESTA DE API (Backend Models) ---

export interface APIProject {
  id: number;
  id_excel: number;
  programa: string;
  responsable_operativo: string;
  area_responsable: string;
  impacto_social_desc: string;
  observaciones: string;
  
  // Campos calculados por backend
  presupuesto_final: number;
  monto_ejecutado: number;
  avance_fisico_pct: number;
  avance_financiero_pct: number;
  
  // Nuevos campos del Serializer V2 (Semaforización)
  puntuacion_final_ponderada: number;
  prioridad_label: 'critica' | 'muy_alta' | 'alta' | 'media' | 'baja';
  viabilidad_global: 'alta' | 'media' | 'baja';
  estatus_general: 'planificado' | 'en_ejecucion' | 'en_riesgo' | 'retrasado' | 'completado';

  // --- BLOQUE 1: Identificación ---
  eje_institucional?: string;

  // --- BLOQUE 2: Presupuestal y Metas ---
  tipo_recurso?: string;
  concentrado_programas?: string;
  capitulo_gasto?: string;
  presupuesto_modificado?: number;
  anteproyecto_total?: number;
  meta_2025?: number;
  meta_2026?: number;

  // --- BLOQUE 3: Categorización ---
  tipo_obra?: string;
  alcance_territorial?: string;
  fuente_financiamiento?: string;
  complejidad_tecnica?: number;

  // --- BLOQUE 4: Priorización Estratégica ---
  alineacion_estrategica?: number | string;
  impacto_social_nivel?: number | string;
  urgencia?: number | string;
  viabilidad_ejecucion?: number;
  recursos_disponibles?: number;
  riesgo_nivel?: number | string;
  dependencias_nivel?: number;

  // --- BLOQUE 5: Factibilidad Técnica y Legal ---
  propiedad_terreno?: string;
  proyecto_ejecutivo_estatus?: string;
  impacto_ambiental?: string;
  factibilidad_servicios?: string;
  derecho_via?: string;

  // --- BLOQUE 6: Ejecución y Tiempos ---
  duracion_meses?: number;
  fecha_inicio_prog?: string;
  fecha_termino_prog?: string;
  fecha_inicio_real?: string;
  fecha_termino_real?: string;

  // --- BLOQUE 7: Semáforos de Viabilidad (Colores) ---
  viabilidad_tecnica_semaforo?: string;
  viabilidad_presupuestal_semaforo?: string;
  viabilidad_juridica_semaforo?: string;
  viabilidad_temporal_semaforo?: string;
  viabilidad_administrativa_semaforo?: string;

  // --- BLOQUE 8: Gestión de Riesgos ---
  problemas_identificados?: string;
  acciones_correctivas?: string;
  
  // --- Comunicación ---
  hitos_comunicacionales?: string;
  problema_resuelve?: string;
  solucion_ofrece?: string;
  beneficiarios_num?: number;
  ubicacion_especifica?: string;
  alcaldias?: string;
}

// --- TIPOS DE UI (Frontend Models) ---

export type ProjectStatus = 'planificado' | 'en_ejecucion' | 'en_riesgo' | 'retrasado' | 'completado';
export type Priority = 'critica' | 'muy_alta' | 'alta' | 'media' | 'baja';
export type Viability = 'alta' | 'media' | 'baja';

export interface ViabilitySemaphores {
  tecnica: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
  presupuestal: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
  juridica: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
  temporal: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
  administrativa: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
}

export interface Project {
  id: number;
  nombre: string;
  programa: string;
  descripcion: string;
  direccion: string;
  area_responsable: string;
  responsable: string;
  eje_institucional?: string;
  presupuesto: number;
  ejecutado: number;
  status: ProjectStatus;
  prioridad: Priority;
  viabilidad: Viability;
  riesgo: number;
  fechaInicio: string;
  fechaFin: string;
  fecha_inicio_prog?: string;
  fecha_termino_prog?: string;
  fecha_inicio_real?: string;
  fecha_termino_real?: string;
  duracion_meses?: number;
  beneficiarios: number;
  ubicacion: string;
  ubicacion_especifica?: string;
  alcanceTerritorial?: string;
  zona: string;
  riesgos: string[];
  accionesCorrectivas?: string;
  avance: number;
  avance_fisico_pct: number;
  avance_financiero_pct: number;
  hitos_comunicacionales?: string;
  objetivo?: string;
  semaphores: ViabilitySemaphores;
  objetivos: string[];
  indicadores: any[]; // Definir si tienes estructura
  puntuacion_final_ponderada: number;
  observaciones?: string;
  problema_resuelve?: string;
  alcaldias?: string;
}

// --- TIPOS DE DASHBOARD (KPIs V2) ---

export interface StatusCount {
  estatus_general: string;
  count: number;
}

export interface KPIData {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  zones: {
    total: number;
    label: string;
    list: string[];
  };
  budget: {
    total: number;
    executed: number;
    remaining: number;
    execution_rate: number;
    formatted_total: string;
    formatted_executed: string;
  };
  beneficiaries: {
    total: number;
    formatted: string;
  };
  priority_attention: {
    count: number;
    label: string;
  };
  progress: {
    average: number;
    label: string;
  };
  by_status: StatusCount[];
  timestamp: string;
  
  // Opcionales por compatibilidad legacy
  social?: {
    beneficiaries: number;
  };
}

export interface TerritorialDataV2 {
  territories: Array<{
    name: string;
    projects: number;
    total_budget: number;
    avg_progress: number;
    formatted_budget: string;
  }>;
  total_territories: number;
  _meta?: {
    version: string;
    total_projects: number;
  };
}