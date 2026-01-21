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
}

export interface KPIData {
	total_proyectos: number;
	presupuesto_total: number;
	beneficiarios: number;
	atencion_requerida: number;
	en_ejecucion: number;
}

// 2. Lo que usa el Frontend (Interfaz limpia para componentes)
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
	ubicacion: string;
	zona: string;
	alcanceTerritorial?: string; // Del Bloque 3 - Categorización
	beneficiarios: number;
	prioridad: string;    // Derivado de 'urgencia_num'
	riesgo: number;       // Mapeado directo de 'riesgo_nivel'
	viabilidad?: string;
}