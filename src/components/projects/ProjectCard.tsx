import { CalendarDays, MapPin, User, ChevronRight } from 'lucide-react';
import { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ProjectDetail } from './ProjectDetail';
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';
import { H3, Small } from '@/components/ui/typography';
import { analyzeTerritorialCoverage } from '@/lib/formatters';

// ✅ CONSTANTES FUERA DEL RENDER
const STATUS_LABELS: Record<string, string> = {
  planificado: 'Planificado',
  en_ejecucion: 'En Ejecución',
  completado: 'Completado',
  en_riesgo: 'En Riesgo',
  retrasado: 'Retrasado',
};

// Helper de formato (idealmente mover a src/lib/formatters.ts)
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return 'Sin fecha';
  return new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Color seguro con fallback
  const statusKey = project.status as keyof typeof STATUS_COLORS;
  const statusColor = STATUS_COLORS[statusKey] || APP_COLORS.neutral;

  // Analizar cobertura territorial
  const territorial = analyzeTerritorialCoverage(project.alcaldias);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group relative flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden h-full">
          {/* Indicador superior de estado */}
          <div className="h-1.5 w-full transition-colors" style={{ backgroundColor: statusColor }} />

          <div className="p-5 flex-1 flex flex-col gap-4">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-start gap-3">
              <div className="space-y-1 w-full">
                <Badge 
                  variant="outline" 
                  className="capitalize text-[10px] font-bold tracking-wider mb-1 w-fit"
                  style={{ 
                    color: statusColor, 
                    borderColor: `${statusColor}40`,
                    backgroundColor: `${statusColor}10` 
                  }}
                >
                  {STATUS_LABELS[project.status] || project.status}
                </Badge>
                <H3 className="text-base leading-tight line-clamp-2 min-h-[3rem]" title={project.nombre}>
                  {project.nombre}
                </H3>
              </div>
            </div>

            {/* --- METADATA --- */}
            <div className="space-y-2 mt-auto text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 shrink-0" />
                <Small className="truncate">{project.responsable}</Small>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <Small className="truncate">
                  <span className="font-medium">{territorial.display}</span>
                  {territorial.type !== 'unknown' && territorial.count > 1 && (
                    <span className="text-xs text-muted-foreground/70 ml-1">({territorial.count})</span>
                  )}
                </Small>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <Small>Inicio: {formatDate(project.fechaInicio)}</Small>
              </div>
            </div>

            {/* --- KPI FOOTER --- */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Presupuesto</span>
                <span className="font-mono font-bold text-foreground">
                  {formatCurrency(project.presupuesto)}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avance Físico</span>
                  <span className="font-bold">{project.avance.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={project.avance} 
                  className="h-2" 
                  indicatorColor={statusColor} 
                />
              </div>
            </div>
          </div>

          {/* --- ACTION OVERLAY --- */}
          <div className="bg-muted/30 p-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-0 right-0 w-full backdrop-blur-[1px]">
            <Button size="sm" variant="secondary" className="gap-1 shadow-sm">
              Ver Detalles <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </DialogTrigger>
      
      <ProjectDetail project={project} />
    </Dialog>
  );
}