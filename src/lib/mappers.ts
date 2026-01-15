import { APIProject } from '@/types';
import { Project, ProjectStatus, Priority, Viability } from '@/lib/mockData';

export function mapApiToUiProject(apiProject: APIProject): Project {
	// 1. Calcular Status UI
	let status: ProjectStatus = 'planificado';
	if (apiProject.avance_fisico_pct >= 100) {
		status = 'completado';
	} else if (apiProject.semaforo === 'ROJO') {
		status = 'en_riesgo';
	} else if (apiProject.semaforo === 'AMARILLO') {
		status = 'retrasado';
	} else if (apiProject.monto_ejecutado > 0 || apiProject.avance_fisico_pct > 0) {
		status = 'en_ejecucion';
	}

	// 2. Calcular Prioridad UI
	let prioridad: Priority = 'baja';
	if (apiProject.urgencia_num >= 5) prioridad = 'critica';
	else if (apiProject.urgencia_num === 4) prioridad = 'alta';
	else if (apiProject.urgencia_num === 3) prioridad = 'media';

	// 3. Calcular Viabilidad UI
	let viabilidad: Viability = 'alta';
	if (apiProject.semaforo === 'ROJO') viabilidad = 'baja';
	if (apiProject.semaforo === 'AMARILLO') viabilidad = 'media';

	return {
		id: apiProject.id.toString(),
		nombre: apiProject.programa || 'Sin Nombre',
		descripcion: apiProject.impacto_social_desc || apiProject.observaciones || 'Sin descripción.',
		direccion: apiProject.area_responsable || 'Dirección General',
		responsable: apiProject.responsable_operativo || 'No asignado',
		presupuesto: apiProject.presupuesto_final,
		ejecutado: apiProject.monto_ejecutado,
		status: status,
		prioridad: prioridad,
		viabilidad: viabilidad,
		fechaInicio: apiProject.fecha_inicio_prog || new Date().toISOString(),
		fechaFin: apiProject.fecha_termino_prog || new Date().toISOString(),
		beneficiarios: apiProject.beneficiarios_num,
		ubicacion: apiProject.ubicacion_especifica || apiProject.alcaldias || 'Múltiples',
		zona: 'multiple',
		objetivos: [
			apiProject.problema_resuelve,
			apiProject.solucion_ofrece,
			apiProject.beneficio_ciudadania
		].filter(Boolean),
		riesgos: [
			apiProject.problemas_identificados,
			apiProject.acciones_correctivas
		].filter(Boolean),
		avance: apiProject.avance_fisico_pct,
		// Creamos un indicador dummy para que ProjectDetail no falle
		indicadores: apiProject.unidad_medida ? [{
			nombre: `Meta (${apiProject.unidad_medida})`,
			meta: 100,
			actual: apiProject.avance_fisico_pct,
			unidad: '%'
		}] : []
	};
}