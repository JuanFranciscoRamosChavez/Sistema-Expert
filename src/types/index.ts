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

	// --- BLOQUE 4: Priorización Estratégica (Nuevos Campos) ---
	alineacion_estrategica: number;
	impacto_social_nivel: number;
	urgencia: number; // Nota: Antes usabas urgencia_num, asegúrate que el backend mande este nombre
	viabilidad_ejecucion: number;
	recursos_disponibles: number;
	riesgo_nivel: number;
	dependencias_nivel: number;
	
	// Datos crudos
	urgencia_num: number;
	beneficiarios_num: number;
	
	// Fechas
	fecha_inicio_prog: string;
	fecha_termino_prog: string;
	
	// Ubicación
	ubicacion_especifica: string;
	alcaldias: string;
	
	// Textos
	problema_resuelve: string;
	solucion_ofrece: string;
	beneficio_ciudadania: string;
	problemas_identificados: string;
	acciones_correctivas: string;
	unidad_medida: string;
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
	beneficiarios: number;
	prioridad: string;    // Derivado de 'urgencia_num'
	riesgo: number;       // Mapeado directo de 'riesgo_nivel'
	viabilidad?: string;
}