// src/lib/api.ts
import { Project, ProjectStatus, Priority, Viability } from './mockData';

const API_URL = 'http://127.0.0.1:8000/api/obras/';

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error conectando con Django');
    
    const data = await response.json();
    
    // Si Django pagina los resultados (results), úsalos. Si es array directo, úsalo.
    const results = Array.isArray(data) ? data : data.results || [];

    return results.map((obra: any) => ({
      // CORRECCIÓN AQUÍ: Usamos obra.id (PK de Django) que es 100% único.
      // Si prefieres ver el ID de Excel, podrías concatenar ambos: `OBRA-${obra.id_excel}-${obra.id}`
      id: `OBRA-${obra.id}`, 
      
      nombre: obra.programa || 'Sin nombre',
      descripcion: obra.descripcion || obra.observaciones || 'Sin descripción',
      direccion: obra.area_responsable || 'Dirección General',
      responsable: obra.responsable_operativo || 'No asignado',
      
      // Conversión numérica segura
      presupuesto: Number(obra.presupuesto_modificado || obra.anteproyecto_total || 0),
      ejecutado: Number(obra.monto_ejecutado || 0),
      avance: Number(obra.avance_fisico_pct || 0),
      
      // Mapeos Inteligentes
      status: mapStatus(obra.semaforo), 
      prioridad: mapPriority(obra.urgencia_num, obra.urgencia),
      viabilidad: mapViability(obra.viabilidad_ejecucion_num),
      
      // Fechas
      fechaInicio: obra.fecha_inicio_prog || new Date().toISOString(),
      fechaFin: obra.fecha_termino_prog || new Date().toISOString(),
      
      beneficiarios: parseInt(obra.beneficiarios_directos) || 0,
      ubicacion: obra.ubicacion_especifica || 'Múltiples ubicaciones',
      zona: 'multiple',
      objetivos: [],
      riesgos: [],
      indicadores: []
    }));
  } catch (error) {
    console.error("Fallo al cargar proyectos:", error);
    return [];
  }
}

// Funciones auxiliares (se mantienen igual)
function mapStatus(semaforo: string): ProjectStatus {
  const s = (semaforo || '').toUpperCase();
  if (s === 'ROJO') return 'en_riesgo';
  if (s === 'AMARILLO') return 'retrasado';
  if (s === 'VERDE') return 'en_ejecucion';
  if (s === 'AZUL' || s === 'COMPLETADO') return 'completado';
  return 'planificado';
}

function mapPriority(valNum: number, valStr: string): Priority {
  let num = valNum;
  if (!num && valStr) {
    const match = valStr.match(/\d+/);
    if (match) num = parseInt(match[0]);
  }
  
  if (num >= 5) return 'critica';
  if (num === 4) return 'alta';
  if (num === 3) return 'media';
  return 'baja';
}

function mapViability(num: number): Viability {
  if (num >= 4) return 'alta';
  if (num === 3) return 'media';
  return 'baja';
}