import { APIProject, Project } from '@/types';
import { ProjectStatus, Priority, Viability, ViabilitySemaphores } from '@/types';

/**
 * MAPPERS.TS - Versión Refactorizada (2026)
 * Filosofía: Solo transformación de datos. Cero reglas de negocio.
 * * Cambios realizados:
 * - Eliminado cálculo de 'puntuacion_final_ponderada' (ahora viene del backend).
 * - Eliminada lógica de rangos para 'prioridad' (ahora viene del backend).
 * - Eliminada lógica compleja para 'status' (ahora usamos estatus_general del backend).
 * - Eliminado conteo manual de semáforos para 'viabilidad' (ahora usamos viabilidad_global).
 */

export function mapApiToUiProject(api: APIProject): Project {
  // 1. SEMÁFOROS: Agrupación visual solamente
  // El backend manda campos planos, nosotros los agrupamos para la UI.
  const semaphores: ViabilitySemaphores = {
    tecnica: cleanSemaphore(api.viabilidad_tecnica_semaforo),
    presupuestal: cleanSemaphore(api.viabilidad_presupuestal_semaforo),
    juridica: cleanSemaphore(api.viabilidad_juridica_semaforo),
    temporal: cleanSemaphore(api.viabilidad_temporal_semaforo),
    administrativa: cleanSemaphore(api.viabilidad_administrativa_semaforo),
  };

  // 2. PARSEO DE LISTAS (Formateo de texto, aceptable en frontend)
  const listaRiesgos = parseList(api.problemas_identificados);
  // Si no hay un campo específico de objetivos, usamos los primeros 3 problemas como placeholder visual
  const listaObjetivos = listaRiesgos.slice(0, 3); 

  // 3. UBICACIÓN (Concatenación visual)
  const ubicacionCompleta = [
      api.alcaldias, 
      api.ubicacion_especifica
  ].filter(Boolean).join(' - ');

  return {
    id: api.id,
    
    // --- DATOS DIRECTOS (Sin transformación) ---
    nombre: api.programa || 'Sin Nombre',
    programa: api.programa,
    descripcion: api.impacto_social_desc || api.observaciones || 'Sin descripción.',
    direccion: api.area_responsable || 'General',
    area_responsable: api.area_responsable,
    responsable: api.responsable_operativo || 'No asignado',
    eje_institucional: api.eje_institucional,
    presupuesto: api.presupuesto_final || 0,
    ejecutado: api.monto_ejecutado || 0,
    beneficiarios: api.beneficiarios_num || 0,
    riesgo: Number(api.riesgo_nivel) || 1,
    duracion_meses: api.duracion_meses,
    alcanceTerritorial: api.alcance_territorial,
    observaciones: api.observaciones,
    problema_resuelve: api.problema_resuelve,
    alcaldias: api.alcaldias,
    multianualidad: api.multianualidad,
    accionesCorrectivas: api.acciones_correctivas,
    hitos_comunicacionales: api.hitos_comunicacionales,
    objetivo: api.problema_resuelve || api.solucion_ofrece,
    tipo_obra: api.tipo_obra,
    tipo_recurso: api.tipo_recurso,
    fuente_financiamiento: api.fuente_financiamiento,
    contratista: api.contratista,

    // --- CAMPOS DE NEGOCIO (Delegados al Backend) ---
    
    // Prioridad: Usamos el label calculado por el servidor
    // Fallback 'baja' solo por seguridad de tipos en caso de error de red
    prioridad: (api.prioridad_label as Priority) || 'baja',
    
    // Puntuación: Directa del servidor, ya calculada
    puntuacion_final_ponderada: api.puntuacion_final_ponderada ?? 0,

    // Estatus: El backend es la única fuente de la verdad
    status: normalizeStatus(api.estatus_general),

    // Viabilidad: El backend ya evaluó los semáforos
    viabilidad: (api.viabilidad_global as Viability) || 'alta',

    // Semáforos agrupados
    semaphores,

    // --- FECHAS Y AVANCES ---
    fechaInicio: api.fecha_inicio_prog || api.fecha_inicio_real || '',
    fechaFin: api.fecha_termino_prog || api.fecha_termino_real || '',
    fecha_inicio_prog: api.fecha_inicio_prog,
    fecha_termino_prog: api.fecha_termino_prog,
    fecha_inicio_real: api.fecha_inicio_real,
    fecha_termino_real: api.fecha_termino_real,
    
    avance: api.avance_fisico_pct || 0,
    avance_fisico_pct: api.avance_fisico_pct || 0,
    avance_financiero_pct: api.avance_financiero_pct || 0,
    
    // --- OTROS ---
    ubicacion: ubicacionCompleta || 'No especificada',
    ubicacion_especifica: api.ubicacion_especifica,
    zona: 'multiple', // Este campo podría venir del backend en el futuro
    riesgos: listaRiesgos,
    objetivos: listaObjetivos,
    indicadores: [], // Array vacío por defecto si no viene del API
  };
}

// --- HELPERS PURAMENTE VISUALES / DE LIMPIEZA ---

function cleanSemaphore(val?: string): 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS' {
  const v = (val || '').toUpperCase().trim();
  if (['ROJO', 'AMARILLO', 'VERDE'].includes(v)) return v as any;
  return 'GRIS';
}

function parseList(text?: string): string[] {
  if (!text) return [];
  return text.split(/[|;]+/).map(s => s.trim()).filter(Boolean);
}

function normalizeStatus(serverStatus?: string): ProjectStatus {
  if (!serverStatus) return 'planificado';
  
  // Normalización simple de strings a las keys del frontend
  // Mapeamos lo que envíe el backend (keys) a las constantes del UI
  const map: Record<string, ProjectStatus> = {
    'planificado': 'planificado',
    'en_ejecucion': 'en_ejecucion',
    'en_riesgo': 'en_riesgo',
    'retrasado': 'retrasado',
    'completado': 'completado',
    // Tolerancia a variaciones por si acaso
    'en ejecucion': 'en_ejecucion',
    'en riesgo': 'en_riesgo',
    'terminado': 'completado'
  };
  
  const key = serverStatus.toLowerCase().trim();
  return map[key] || 'planificado';
}