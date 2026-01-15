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
import { AlertTriangle, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Project } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface Props {
  projects: Project[];
}

export function CriticalProjectsTable({ projects }: Props) {
  
  // 1. FILTRADO Y ORDENAMIENTO DE PROYECTOS CRÍTICOS
  const criticalProjects = projects
    .filter(p => 
      p.status === 'en_riesgo' || 
      p.prioridad === 'critica' || 
      p.prioridad === 'alta' ||
      (p.viabilidad === 'baja') // También incluimos viabilidad baja como alerta
    )
    .sort((a, b) => {
      // Ordenar: Primero Críticos, luego Alta Prioridad
      const scoreA = (a.prioridad === 'critica' ? 3 : 0) + (a.status === 'en_riesgo' ? 2 : 0);
      const scoreB = (b.prioridad === 'critica' ? 3 : 0) + (b.status === 'en_riesgo' ? 2 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 5); // Top 5 para no saturar

  if (criticalProjects.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="bg-emerald-500/10 p-4 rounded-full mb-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="font-display font-bold text-lg">Todo bajo control</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
          No se detectaron proyectos con riesgo alto o urgencia crítica en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm h-full flex flex-col animate-fade-in delay-300">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Atención Prioritaria
          </h3>
          <p className="text-sm text-muted-foreground">
            Proyectos con alto nivel de riesgo o urgencia crítica
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          {criticalProjects.length} Detectados
        </Badge>
      </div>

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
            {criticalProjects.map((project) => (
              <TableRow key={project.id} className="border-border hover:bg-muted/30">
                
                {/* COLUMNA 1: IDENTIFICACIÓN */}
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

                {/* COLUMNA 2: RIESGO (Visual) */}
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                    project.viabilidad === 'baja' || project.status === 'en_riesgo'
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  )}>
                    <AlertCircle className="w-3 h-3" />
                    {project.status === 'en_riesgo' ? 'Crítico' : 'Alto'}
                  </div>
                </TableCell>

                {/* COLUMNA 3: AVANCE (Barra) */}
                <TableCell>
                  <div className="w-full max-w-[140px] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Progreso</span>
                      <span className="font-bold text-foreground">{project.avance.toFixed(1)}%</span>
                    </div>
                    {/* Barra Roja si es crítico, Amarilla si es advertencia */}
                    <Progress 
                      value={project.avance} 
                      className="h-2 bg-muted" 
                      indicatorClassName={cn(
                        project.status === 'en_riesgo' ? "bg-destructive" : "bg-amber-500"
                      )}
                    />
                  </div>
                </TableCell>

                {/* COLUMNA 4: PRIORIDAD (Badge) */}
                <TableCell className="text-right">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "uppercase tracking-wider text-[10px] font-bold border",
                      project.prioridad === 'critica' 
                        ? "border-destructive text-destructive bg-destructive/5" 
                        : "border-primary text-primary bg-primary/5"
                    )}
                  >
                    {project.prioridad}
                  </Badge>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}