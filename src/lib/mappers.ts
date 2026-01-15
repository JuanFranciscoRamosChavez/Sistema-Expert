import { APIProject } from '@/types';
import { Project, ProjectStatus, Priority, Viability } from '@/lib/mockData';

export function mapApiToUiProject(apiProject: APIProject): Project {
  let status: ProjectStatus = 'planificado';

  // 1. COMPLETADO: 
  // Usamos >= 99.9 para ser tolerantes con decimales flotantes (ej. 99.99999)
  if ((apiProject.avance_fisico_pct || 0) >= 99.9) {
    status = 'completado';
  }
  // 2. EN RIESGO (Si no está completado y tiene riesgo alto > 3)
  else if ((apiProject.riesgo_nivel || 0) > 3) {
    status = 'en_riesgo';
  }
  // 3. EN EJECUCIÓN (Si tiene algún avance físico o financiero)
  else if ((apiProject.avance_fisico_pct || 0) > 0 || (apiProject.avance_financiero_pct || 0) > 0) {
    status = 'en_ejecucion';
  }
  // 4. PLANIFICADO (Todo en 0)
  else {
    status = 'planificado';
  }

  // ... resto del mapper igual (prioridad, viabilidad, return) ...
  let prioridad: Priority = 'baja';
  if ((apiProject.urgencia_num || 0) >= 5) prioridad = 'critica';
  else if ((apiProject.urgencia_num || 0) === 4) prioridad = 'alta';
  else if ((apiProject.urgencia_num || 0) === 3) prioridad = 'media';

  let viabilidad: Viability = 'alta';
  if ((apiProject.riesgo_nivel || 0) >= 4) viabilidad = 'baja';
  else if ((apiProject.riesgo_nivel || 0) === 3) viabilidad = 'media';

  return {
    id: apiProject.id.toString(),
    nombre: apiProject.programa || 'Sin Nombre',
    descripcion: apiProject.impacto_social_desc || apiProject.observaciones || 'Sin descripción.',
    direccion: apiProject.area_responsable || 'General',
    responsable: apiProject.responsable_operativo || 'No asignado',
    presupuesto: apiProject.presupuesto_final || 0,
    ejecutado: apiProject.monto_ejecutado || 0,
    status,
    prioridad,
    viabilidad,
    fechaInicio: apiProject.fecha_inicio_prog || new Date().toISOString(),
    fechaFin: apiProject.fecha_termino_prog || new Date().toISOString(),
    beneficiarios: apiProject.beneficiarios_num || 0,
    ubicacion: apiProject.ubicacion_especifica || 'Múltiples',
    zona: 'multiple',
    objetivos: [apiProject.problema_resuelve].filter(Boolean) as string[],
    riesgos: [apiProject.problemas_identificados].filter(Boolean) as string[],
    avance: apiProject.avance_fisico_pct || 0,
    indicadores: []
  };
}