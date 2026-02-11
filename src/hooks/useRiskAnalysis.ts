import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface Semaphores {
  tecnica: string;
  presupuestal: string;
  juridica: string;
  temporal: string;
  administrativa: string;
}

interface MatrixProject {
  id: number;
  nombre: string;
  responsable: string;
  direccion: string;
  viabilidad: 'baja' | 'media' | 'alta';
  prioridad_label: 'critica' | 'muy_alta' | 'alta' | 'media' | 'baja';
  score: number;
  semaphores: Semaphores;
  riesgos: string[];
  avance: number;
  avance_financiero: number;
  presupuesto: number;
}

interface Risk {
  project: string;
  project_id: number;
  risk: string;
  responsable: string;
  direccion: string;
}

interface MitigationProject {
  id: number;
  nombre: string;
  acciones: string;
  responsable: string;
  avance: number;
}

interface RiskCategory {
  name: string;
  count: number;
}

interface RiskAnalysisData {
  matrix: MatrixProject[];
  risks: Risk[];
  mitigations: MitigationProject[];
  categories: RiskCategory[];
  summary: {
    total_matrix: number;
    total_risks: number;
    total_mitigations: number;
  };
  timestamp: string;
}

/**
 * Hook para obtener análisis completo de riesgos del dashboard.
 * 
 * Sprint 3 - Migración completa de RisksView:
 * - Matriz de riesgos (proyectos con score >= 3 y viabilidad baja o media)
 * - Catálogo de riesgos identificados
 * - Proyectos con acciones de mitigación
 * - Categorías de riesgo con contadores
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useRiskAnalysis();
 * 
 * if (isLoading) return <Loader />;
 * 
 * return (
 *   <div>
 *     <h2>Matriz de Riesgos ({data.matrix.length})</h2>
 *     {data.matrix.map(project => (
 *       <div key={project.id}>
 *         {project.nombre} - Viabilidad: {project.viabilidad}
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export const useRiskAnalysis = () => {
  return useQuery({
    queryKey: ['dashboard', 'risk-analysis'],
    queryFn: async (): Promise<RiskAnalysisData> => {
      const response = await fetch(`${API_BASE_URL}/v2/dashboard/risk-analysis/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch risk analysis: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (análisis de riesgos cambia moderadamente)
    gcTime: 15 * 60 * 1000,   // 15 minutos en caché
  });
};
