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
import { Project } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { APP_COLORS, PRIORITY_COLORS } from "@/lib/theme"; // <--- IMPORTACIÓN DEL TEMA

interface Props {
  projects: Project[];
}

export function CriticalProjectsTable({ projects }: Props) {
  
  // 1. FILTRADO Y ORDENAMIENTO
  const criticalProjects = projects
    .filter(p => 
      p.status === 'en_riesgo' || 
      p.prioridad === 'critica' || 
      p.prioridad === 'alta' ||
      p.viabilidad === 'baja'
    )
    .sort((a, b) => {
      const scoreA = (a.prioridad === 'critica' ? 3 : 0) + (a.status === 'en_riesgo' ? 2 : 0);
      const scoreB = (b.prioridad === 'critica' ? 3 : 0) + (b.status === 'en_riesgo' ? 2 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 5);

  // --- LÓGICA DE COLORES CENTRALIZADA ---
  const getRiskColor = (project: Project) => {
    if (project.status === 'en_riesgo' || project.viabilidad === 'baja') {
      return APP_COLORS.danger; // Rojo del tema
    }
    return APP_COLORS.warning;  // Amarillo del tema
  };

  const getPriorityColor = (priority: string) => {
    // Mapeamos el string de prioridad al objeto de colores del tema
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || APP_COLORS.neutral;
  };

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
            <AlertTriangle className="h-5 w-5" style={{ color: APP_COLORS.danger }} />
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
            {criticalProjects.map((project) => {
              const riskColor = getRiskColor(project);
              const priorityColor = getPriorityColor(project.prioridad);

              return (
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

                  {/* COLUMNA 2: RIESGO (Usando colores del tema) */}
                  <TableCell>
                    <div 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      style={{ 
                        color: riskColor,
                        borderColor: `${riskColor}40`, // 40 es alpha (transparencia) en HEX
                        backgroundColor: `${riskColor}15` // Fondo muy suave
                      }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {project.status === 'en_riesgo' ? 'Crítico' : 'Alto'}
                    </div>
                  </TableCell>

                  {/* COLUMNA 3: AVANCE (Barra conectada al tema) */}
                  <TableCell>
                    <div className="w-full max-w-[140px] space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Progreso</span>
                        <span className="font-bold text-foreground">{project.avance.toFixed(1)}%</span>
                      </div>
                      
                      {/* AQUI USAMOS LA NUEVA PROP indicatorColor */}
                      <Progress 
                        value={project.avance} 
                        className="h-2 bg-muted" 
                        indicatorColor={riskColor} // La barra toma el color del riesgo (Rojo o Amarillo)
                      />
                    </div>
                  </TableCell>

                  {/* COLUMNA 4: PRIORIDAD (Badge conectado al tema) */}
                  <TableCell className="text-right">
                    <Badge 
                      variant="outline" 
                      className="uppercase tracking-wider text-[10px] font-bold border"
                      style={{
                        color: priorityColor,
                        borderColor: priorityColor,
                        backgroundColor: `${priorityColor}10` // Fondo transparente
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