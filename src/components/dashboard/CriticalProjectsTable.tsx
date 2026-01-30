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
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { 
  APP_COLORS, 
  PRIORITY_COLORS, 
  STATUS_COLORS 
} from "@/lib/theme";
import { H3, Subtitle } from "@/components/ui/typography";
import { useFilteredProjects } from "@/hooks/useFilteredProjects";
import { Skeleton } from "@/components/ui/skeleton";

export function CriticalProjectsTable() {
  // ✅ FILTRADO INTELIGENTE:
  // 1. score_range: 'critica,muy_alta,alta' -> Trae proyectos con prioridad Crítica, Muy Alta o Alta (puntuación >= 2.5).
  // 2. viabilidad baja o media -> Proyectos que requieren intervención.
  // 3. ordering: '-presupuesto_modificado' -> Los ordena por impacto financiero.
  // 4. page_size: 10 -> Top 10 para mejor visibilidad.
  const { data: projectsData, isLoading } = useFilteredProjects({ 
    page_size: 10, 
    ordering: '-presupuesto_modificado',
    score_range: 'critica,muy_alta,alta',
    viabilidad: 'baja,media'
  });

  const criticalProjects = projectsData?.results || [];

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (criticalProjects.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm h-full flex flex-col animate-fade-in delay-300 overflow-hidden">
      
      {/* Header */}
      <div className="p-3 sm:p-4 lg:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <H3 className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Atención Prioritaria
          </H3>
          <Subtitle>Proyectos con prioridad alta/crítica y viabilidad baja/media</Subtitle>
        </div>
        <Badge variant="outline" className="flex text-xs font-mono gap-1.5 py-1 self-end sm:self-auto">
          <TrendingUp className="h-3 w-3" />
          Top 10
        </Badge>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto overscroll-contain
        [&::-webkit-scrollbar]:w-2 
        [&::-webkit-scrollbar]:h-2
        [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:bg-border
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:hover:bg-border/70">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border bg-muted/30">
              <TableHead className="w-[35%] font-semibold text-[10px] sm:text-xs uppercase tracking-wider">Proyecto</TableHead>
              <TableHead className="font-semibold text-[10px] sm:text-xs uppercase tracking-wider hidden lg:table-cell">Eje Institucional</TableHead>
              <TableHead className="font-semibold text-[10px] sm:text-xs uppercase tracking-wider hidden sm:table-cell">Estatus</TableHead>
              <TableHead className="font-semibold text-[10px] sm:text-xs uppercase tracking-wider">Avance</TableHead>
              <TableHead className="text-right font-semibold text-[10px] sm:text-xs uppercase tracking-wider pr-3 sm:pr-6">Prioridad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {criticalProjects.map((project) => {
              // Colores dinámicos
              const statusKey = (project.status || 'planificado') as keyof typeof STATUS_COLORS;
              const statusColor = STATUS_COLORS[statusKey] || APP_COLORS.neutral;
              
              const priorityKey = (project.prioridad || 'media') as keyof typeof PRIORITY_COLORS;
              const priorityColor = PRIORITY_COLORS[priorityKey] || APP_COLORS.neutral;

              return (
                <TableRow key={project.id} className="border-border hover:bg-muted/40 transition-colors">
                  
                  {/* Nombre y Responsable */}
                  <TableCell className="py-2 sm:py-3">
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <span className="font-medium text-xs sm:text-sm text-foreground line-clamp-1" title={project.nombre}>
                        {project.nombre}
                      </span>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-border shrink-0" />
                        <span className="truncate max-w-[140px] sm:max-w-[180px]" title={project.responsable}>
                          {project.responsable || "Sin Asignar"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Eje Institucional */}
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2" title={project.eje_institucional}>
                      {project.eje_institucional || "No especificado"}
                    </span>
                  </TableCell>

                  {/* Estatus */}
                  <TableCell className="hidden sm:table-cell">
                    <div 
                      className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase border transition-colors"
                      style={{ 
                        color: statusColor,
                        borderColor: `${statusColor}30`,
                        backgroundColor: `${statusColor}08`
                      }}
                    >
                      <span>{(project.status || '').replace(/_/g, ' ')}</span>
                    </div>
                  </TableCell>

                  {/* Barra de Progreso */}
                  <TableCell>
                    <div className="w-full max-w-[100px] sm:max-w-[120px] space-y-1 sm:space-y-1.5">
                      <div className="flex justify-between text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        <span>Real</span>
                        <span style={{ color: statusColor }}>{project.avance.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={project.avance} 
                        className="h-1 sm:h-1.5 bg-secondary" 
                        indicatorColor={statusColor} 
                      />
                    </div>
                  </TableCell>

                  {/* Badge de Prioridad */}
                  <TableCell className="text-right pr-3 sm:pr-6">
                    <Badge 
                      variant="outline" 
                      className="uppercase tracking-wider text-[9px] sm:text-[10px] font-bold border h-5 sm:h-6 px-1.5 sm:px-2.5 ml-auto w-fit"
                      style={{
                        color: priorityColor,
                        borderColor: `${priorityColor}40`,
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

// --- HELPERS VISUALES ---

function TableSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 h-full flex flex-col">
      <div className="flex justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-[40%]" />
            <Skeleton className="h-6 w-20 hidden sm:block" />
            <Skeleton className="h-6 w-24" />p
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
      <div className="bg-emerald-500/10 p-4 rounded-full mb-3 ring-1 ring-emerald-500/20">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>
      <H3 className="mt-3 text-lg font-semibold">Excelente Estado</H3>
      <Subtitle className="mt-1 max-w-[320px]">
        No hay proyectos que requieran atención prioritaria. Todos los proyectos de alta prioridad tienen viabilidad alta.
      </Subtitle>
    </div>
  );
}