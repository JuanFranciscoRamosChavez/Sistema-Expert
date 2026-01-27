import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { APP_COLORS, PRIORITY_COLORS } from "@/lib/theme"; 
import { H3, Subtitle } from "@/components/ui/typography";
import { useCriticalProjects } from "@/hooks/useCriticalProjects";

// --- MAPEOS VISUALES (Estáticos y Declarativos) ---

const RISK_COLORS_MAP: Record<string, string> = {
  en_riesgo: APP_COLORS.danger,
  retrasado: APP_COLORS.warning,
  planificado: APP_COLORS.info,
  // Fallback
  default: APP_COLORS.warning
};

export function CriticalProjectsTable() {
  const { data: criticalProjects = [], isLoading } = useCriticalProjects(5);

  // 1. Loading State (Componente pequeño extraído o inline limpio)
  if (isLoading) {
    return <TableSkeleton />;
  }

  // 2. Empty State
  if (criticalProjects.length === 0) {
    return <EmptyState />;
  }

  // 3. Render Principal
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm h-full flex flex-col animate-fade-in delay-300">
      
      {/* Header */}
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <H3 className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" style={{ color: APP_COLORS.danger }} />
            Atención Prioritaria
          </H3>
          <Subtitle>Proyectos con alto nivel de riesgo o urgencia crítica</Subtitle>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          {criticalProjects.length} Detectados
        </Badge>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[40%]">Proyecto / Responsable</TableHead>
              <TableHead>Nivel de Riesgo</TableHead>
              <TableHead>Avance Físico</TableHead>
              <TableHead className="text-right">Prioridad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {criticalProjects.map((project) => {
              // Resolución de colores visuales (SIN lógica de negocio)
              const riskColor = RISK_COLORS_MAP[project.status] || RISK_COLORS_MAP.default;
              const priorityColor = PRIORITY_COLORS[project.prioridad as keyof typeof PRIORITY_COLORS] || APP_COLORS.neutral;

              return (
                <TableRow key={project.id} className="border-border hover:bg-muted/30">
                  
                  {/* Columna: Nombre */}
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground line-clamp-1" title={project.nombre}>
                        {project.nombre}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {project.responsable || "Sin Asignar"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Columna: Riesgo (Badges con estilos dinámicos pero seguros) */}
                  <TableCell>
                    <div 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      style={{ 
                        color: riskColor,
                        borderColor: `${riskColor}40`,
                        backgroundColor: `${riskColor}15`
                      }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {/* Usamos el status limpio del backend, formateado visualmente */}
                      <span className="capitalize">{project.status.replace('_', ' ')}</span>
                    </div>
                  </TableCell>

                  {/* Columna: Avance */}
                  <TableCell>
                    <div className="w-full max-w-[140px] space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Progreso</span>
                        <span className="font-bold text-foreground">{project.avance.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={project.avance} 
                        className="h-2 bg-muted" 
                        indicatorColor={riskColor}
                      />
                    </div>
                  </TableCell>

                  {/* Columna: Prioridad */}
                  <TableCell className="text-right">
                    <Badge 
                      variant="outline" 
                      className="uppercase tracking-wider text-[10px] font-bold border"
                      style={{
                        color: priorityColor,
                        borderColor: priorityColor,
                        backgroundColor: `${priorityColor}10`
                      }}
                    >
                      {project.prioridad}
                    </Badge>
                  </TableCell>

                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTES (Separación de Concerns) ---

function TableSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <div className="h-6 w-48 bg-muted animate-pulse rounded mb-2" />
      <div className="h-4 w-64 bg-muted animate-pulse rounded mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
      <div className="bg-emerald-500/10 p-4 rounded-full mb-3">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>
      <H3 className="mt-3">Todo bajo control</H3>
      <Subtitle className="mt-1 max-w-[250px]">
        No se detectaron proyectos con riesgo alto o urgencia crítica.
      </Subtitle>
    </div>
  );
}