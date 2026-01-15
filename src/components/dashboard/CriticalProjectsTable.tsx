import { Project } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';

interface Props {
  projects: Project[];
}

export function CriticalProjectsTable({ projects }: Props) {
  // Filtrar y tomar solo los primeros 5
  const criticalProjects = projects
    .filter(p => p.prioridad === 'critica' || p.status === 'en_riesgo' || p.status === 'retrasado')
    .slice(0, 5);

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg">Proyectos Críticos</h3>
        <Badge variant="outline">{criticalProjects.length} detectados</Badge>
      </div>
      
      <div className="space-y-4">
        {criticalProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Todo bajo control.</p>
        ) : (
          criticalProjects.map((project) => (
            <div key={project.id} className="flex items-start justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-medium text-sm line-clamp-1">{project.nombre}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{project.responsable}</span>
                  <span>•</span>
                  <span>Avance: {project.avance}%</span>
                </div>
              </div>
              <Badge variant={project.prioridad === 'critica' ? 'destructive' : 'secondary'} className="ml-2 shrink-0">
                {project.prioridad === 'critica' ? 'Crítica' : 'Riesgo'}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}