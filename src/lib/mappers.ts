import { APIProject } from '@/types';
import { Project, ProjectStatus, Priority, Viability } from '@/lib/mockData';

export function mapApiToUiProject(apiProject: APIProject): Project {
  // Variables auxiliares para código más limpio
  const avanceFisico = apiProject.avance_fisico_pct || 0;
  const avanceFinanciero = apiProject.avance_financiero_pct || 0;
  const nivelRiesgo = apiProject.riesgo_nivel || 0;
  const urgencia = apiProject.urgencia_num || 0;

  // --- LÓGICA DE ESTATUS JERÁRQUICA (CORREGIDA) ---
  let status: ProjectStatus = 'planificado';

  // 1. PRIORIDAD MÁXIMA: COMPLETADO
  // Si el físico es 100%, el proyecto está terminado. PUNTO.
  // El 'return' implícito del if/else evita que se evalúe si tiene avance financiero.
  if (avanceFisico >= 99.9) {
    status = 'completado';
  }
  
  // 2. PRIORIDAD ALTA: EN RIESGO
  // Solo entramos aquí si NO está completado (< 99.9%).
  // Si el riesgo es alto (4 o 5), se marca rojo inmediatamente.
  else if (nivelRiesgo > 3) {
    status = 'en_riesgo';
  }
  
  // 3. PRIORIDAD MEDIA: EN EJECUCIÓN
  // Solo entramos aquí si NO está completado Y NO está en riesgo extremo.
  // Regla: Si hay CUALQUIER movimiento (físico > 0 O financiero > 0).
  // Al usar 'else if', garantizamos que aquí el físico es menor a 100%.
  else if (avanceFisico > 0 || avanceFinanciero > 0) {
    status = 'en_ejecucion';
  }
  
  // 4. RESIDUAL: PLANIFICADO
  // Si no cumplió ninguna anterior (todo es 0 y riesgo bajo).
  else {
    status = 'planificado';
  }

  // --- LÓGICA VISUAL (Prioridad y Viabilidad) ---
  let prioridad: Priority = 'baja';
  if (urgencia >= 5) prioridad = 'critica';
  else if (urgencia === 4) prioridad = 'alta';
  else if (urgencia === 3) prioridad = 'media';

  let viabilidad: Viability = 'alta';
  if (nivelRiesgo >= 4) viabilidad = 'baja';
  else if (nivelRiesgo === 3) viabilidad = 'media';

  return {
    id: apiProject.id.toString(),
    nombre: apiProject.programa || 'Sin Nombre',
    descripcion: apiProject.impacto_social_desc || apiProject.observaciones || 'Sin descripción.',
    direccion: apiProject.area_responsable || 'General',
    responsable: apiProject.responsable_operativo || 'No asignado',
    presupuesto: apiProject.presupuesto_final || 0,
    ejecutado: apiProject.monto_ejecutado || 0,
    status, // Aquí va el estatus corregido
    prioridad,
    viabilidad,
    fechaInicio: apiProject.fecha_inicio_prog || new Date().toISOString(),
    fechaFin: apiProject.fecha_termino_prog || new Date().toISOString(),
    beneficiarios: apiProject.beneficiarios_num || 0,
    ubicacion: apiProject.ubicacion_especifica || 'Múltiples',
    zona: 'multiple',
    objetivos: [apiProject.problema_resuelve].filter(Boolean) as string[],
    riesgos: [apiProject.problemas_identificados].filter(Boolean) as string[],
    avance: avanceFisico, // Mantenemos el avance físico real para la barra de progreso
    indicadores: []
  };
}