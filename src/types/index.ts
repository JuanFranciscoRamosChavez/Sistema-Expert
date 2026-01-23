// 1. Lo que recibes del Backend (Tu estructura exacta)
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
	semaforo: 'ROJO' | 'AMARILLO' | 'VERDE';

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
	alineacion_estrategica?: number;
	impacto_social_nivel?: number;
	urgencia?: number;
	viabilidad_ejecucion?: number;
	recursos_disponibles?: number;
	riesgo_nivel?: number;
	dependencias_nivel?: number;
	puntuacion_final_ponderada?: number;

	// --- BLOQUE 5: Viabilidad (Semáforos) ---
	viabilidad_tecnica_semaforo?: string;
	viabilidad_presupuestal_semaforo?: string;
	viabilidad_juridica_semaforo?: string;
	viabilidad_temporal_semaforo?: string;
	viabilidad_administrativa_semaforo?: string;
	
	// Datos crudos
	urgencia_num?: number;
	beneficiarios_num?: number;
	poblacion_objetivo_num?: string;
	
	// Fechas
	fecha_inicio_prog?: string;
	fecha_termino_prog?: string;
	fecha_inicio_real?: string;
	fecha_termino_real?: string;
	duracion_meses?: number;
	ultima_actualizacion?: string;
	
	// Ubicación
	ubicacion_especifica?: string;
	alcaldias?: string;
	
	// Personal
	contratista?: string;
	
	// Textos
	problema_resuelve?: string;
	solucion_ofrece?: string;
	beneficio_ciudadania?: string;
	problemas_identificados?: string;
	acciones_correctivas?: string;
	unidad_medida?: string;
	dato_destacable?: string;
	estatus_general?: string;
	
	// BLOQUE 12: Comunicación
	hitos_comunicacionales?: string;
	mensajes_clave?: string;
	estrategia_comunicacion?: string;
	relevancia_comunicacional?: string;
	alineacion_gobierno?: string;
	poblacion_perfil?: string;
}

export interface KPIData {
	total_proyectos: number;
	presupuesto_total: number;
	beneficiarios: number;
	atencion_requerida: number;
	en_ejecucion: number;
}

// --- NUEVOS TIPOS AÑADIDOS PARA EL MAPPER ---
export type ProjectStatus = 'planificado' | 'en_ejecucion' | 'en_riesgo' | 'retrasado' | 'completado';
export type Priority = 'baja' | 'media' | 'alta' | 'muy_alta' | 'critica';
export type Viability = 'baja' | 'media' | 'alta';

export interface ViabilitySemaphores {
	tecnica: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
	presupuestal: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
	juridica: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
	temporal: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
	administrativa: 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS';
}

	export interface Project {
	id: number;
	nombre: string;       // Viene de 'programa'
	status: string;       // Viene de 'estatus_general' o 'semaforo'
	avance: number;       // Viene de 'avance_fisico_pct'
	presupuesto: number;  // Viene de 'presupuesto_final'
	ejecutado: number;    // Viene de 'monto_ejecutado'
	responsable: string;  // Viene de 'responsable_operativo'
	direccion: string;    // Viene de 'area_responsable'
	riesgos: string[];    // Convertimos 'problemas_identificados' a array
	descripcion: string;  // Viene de 'impacto_social_desc'
	fechaInicio: string;
	fechaFin: string;
	fecha_inicio_prog?: string;   // Fecha de inicio programada
	fecha_termino_prog?: string;  // Fecha de término programada/estimada
	fecha_inicio_real?: string;   // Fecha de inicio real
	fecha_termino_real?: string;  // Fecha de término real (cuando concluyó)
	duracion_meses?: number;      // Duración total del proyecto en meses
	ubicacion: string;
	zona: string;
	alcanceTerritorial?: string; // Del Bloque 3 - Categorización
	beneficiarios: number;
	prioridad: string;    // Derivado de 'urgencia_num'
	riesgo: number;       // Mapeado directo de 'riesgo_nivel'
	viabilidad?: string;
	accionesCorrectivas?: string;
	
	// Semáforos de viabilidad
	semaphores: ViabilitySemaphores;
	
	// Objetivos del proyecto
	objetivos: string[];
	
	// Indicadores de desempeño
	indicadores: {
		nombre: string;
		meta: number;
		actual: number;
		unidad: string;
	}[];
	
	// Comunicación
	hitos_comunicacionales?: string;
	objetivo?: string;  // Del problema_resuelve o solucion_ofrece
	puntuacion_final_ponderada?: number;
	observaciones?: string;       // Soluciona el error .observaciones
	problema_resuelve?: string;   // Soluciona el error .problema_resuelve
	alcaldias?: string;
}