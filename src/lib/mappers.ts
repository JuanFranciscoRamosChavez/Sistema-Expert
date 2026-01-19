import { APIProject } from '@/types';
import { Project, ProjectStatus, Priority, Viability, ViabilitySemaphores } from '@/lib/mockData';

export function mapApiToUiProject(apiProject: APIProject): Project {
  // 1. OBTENER VALORES DE LOS 7 CRITERIOS (Bloque 4)
	// Usamos 1 como default para no romper el promedio si falta un dato
	const c1 = Number(apiProject.alineacion_estrategica) || 1;
	const c2 = Number(apiProject.impacto_social_nivel) || 1;
	const c3 = Number(apiProject.urgencia) || 1;
	const c4 = Number(apiProject.viabilidad_ejecucion) || 1;
	const c5 = Number(apiProject.recursos_disponibles) || 1;
	const c6 = Number(apiProject.riesgo_nivel) || 1;
	const c7 = Number(apiProject.dependencias_nivel) || 1;

	// 2. CALCULAR PROMEDIO PONDERADO
	// Promedio simple de los 7 factores
	const sumaPuntaje = c1 + c2 + c3 + c4 + c5 + c6 + c7;
	const puntajeFinal = sumaPuntaje / 7;

	// 3. DETERMINAR NIVEL DE PRIORIDAD (Tu tabla de rangos)
	let prioridad: Priority = 'baja';
	
	if (puntajeFinal >= 4.5) {
		prioridad = 'critica'; // 4.5 - 5.0
	} else if (puntajeFinal >= 3.5) {
		prioridad = 'muy_alta'; // 3.5 - 4.4
	} else if (puntajeFinal >= 2.5) {
		prioridad = 'alta'; // 2.5 - 3.4
	} else if (puntajeFinal >= 1.5) {
		prioridad = 'media'; // 1.5 - 2.4
	} else {
		prioridad = 'baja'; // 1.0 - 1.4
	}

  // LÓGICA DE VIABILIDAD Y SEMÁFOROS
  // Helper para limpiar valores de semáforos
  const cleanSem = (val?: string): 'ROJO' | 'AMARILLO' | 'VERDE' | 'GRIS' => {
    const v = (val || '').toUpperCase();
    if (['ROJO', 'AMARILLO', 'VERDE'].includes(v)) return v as any;
    return 'GRIS'; // Si no hay dato o es inválido, asumimos neutro/gris para no alterar conteo
  };

  const semaphores: ViabilitySemaphores = {
    tecnica: cleanSem(apiProject.viabilidad_tecnica_semaforo),
    presupuestal: cleanSem(apiProject.viabilidad_presupuestal_semaforo),
    juridica: cleanSem(apiProject.viabilidad_juridica_semaforo),
    temporal: cleanSem(apiProject.viabilidad_temporal_semaforo),
    administrativa: cleanSem(apiProject.viabilidad_administrativa_semaforo),
  };

  // Conteo de alertas
  const reds = Object.values(semaphores).filter(s => s === 'ROJO').length;
  const yellows = Object.values(semaphores).filter(s => s === 'AMARILLO').length;

  let viabilidad: Viability = 'alta'; // Default: 5 Verdes (o < 2 amarillos y 0 rojos)
  
  if (reds >= 1) {
    viabilidad = 'baja'; // 1 Rojo -> Viabilidad Baja
  } else if (yellows >= 2) {
    viabilidad = 'media'; // 2+ Amarillos -> Viabilidad Media
  }
  // Si no cae en los anteriores, se mantiene 'alta'

  // Variables auxiliares para código más limpio
  const avanceFisico = apiProject.avance_fisico_pct || 0;
  const avanceFinanciero = apiProject.avance_financiero_pct || 0;

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
  else if (c6 > 3) {
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


	// 6. RIESGOS (Texto)
	const listaRiesgos = apiProject.problemas_identificados 
		? apiProject.problemas_identificados.split(/[|;]+/).map(s => s.trim()).filter(Boolean)
		: [];

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
    semaphores,
    riesgo: c6,
    puntajePrioridad: Number(puntajeFinal.toFixed(2)), 
    fechaInicio: apiProject.fecha_inicio_prog || new Date().toISOString(),
    fechaFin: apiProject.fecha_termino_prog || new Date().toISOString(),
    beneficiarios: apiProject.beneficiarios_num || 0,
    ubicacion: apiProject.ubicacion_especifica || 'Múltiples',
    zona: 'multiple',
    objetivos: [apiProject.problema_resuelve].filter(Boolean) as string[],
    riesgos: listaRiesgos,
    avance: avanceFisico, 
    indicadores: []
  };
}