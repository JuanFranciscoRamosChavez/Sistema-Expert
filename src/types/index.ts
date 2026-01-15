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
	
	// Datos crudos
	urgencia_num: number;
	riesgo_nivel: number;
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