import { mockProjects, getStatusLabel, formatCurrency } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const months = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function TimelineView() {
  const sortedProjects = [...mockProjects].sort((a, b) => 
    new Date(a.fechaFin).getTime() - new Date(b.fechaFin).getTime()
  );

  const upcomingDeadlines = sortedProjects.filter(p => {
    const endDate = new Date(p.fechaFin);
    const now = new Date();
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90 && p.status !== 'completado';
  });

  const currentYear = 2024;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Cronograma de Proyectos
        </h1>
        <p className="text-muted-foreground mt-1">
          Línea de tiempo y entregas programadas
        </p>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Próximas Entregas (90 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((project, index) => {
                const endDate = new Date(project.fechaFin);
                const now = new Date();
                const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = diffDays <= 30;
                
                return (
                  <div 
                    key={project.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border animate-fade-in",
                      isUrgent ? "bg-warning/5 border-warning/30" : "bg-muted/30 border-border"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      isUrgent ? "bg-warning/20 text-warning" : "bg-primary/10 text-primary"
                    )}>
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{project.nombre}</p>
                        <Badge variant={project.status as any} className="text-xs">
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.direccion}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        "font-semibold",
                        isUrgent ? "text-warning" : "text-foreground"
                      )}>
                        {diffDays} días
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {endDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <div className="w-20 shrink-0">
                      <Progress value={project.avance} className="h-2" />
                      <p className="text-xs text-center mt-1">{project.avance}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No hay entregas programadas en los próximos 90 días
            </p>
          )}
        </CardContent>
      </Card>

      {/* Gantt-style Timeline */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Línea de Tiempo {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Month Headers */}
              <div className="flex border-b border-border pb-2 mb-4">
                <div className="w-48 shrink-0 px-2 font-medium text-sm text-muted-foreground">
                  Proyecto
                </div>
                <div className="flex-1 flex">
                  {months.map((month, i) => (
                    <div key={month} className="flex-1 text-center text-xs text-muted-foreground">
                      {month}
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Rows */}
              <div className="space-y-3">
                {sortedProjects.map((project, index) => {
                  const startDate = new Date(project.fechaInicio);
                  const endDate = new Date(project.fechaFin);
                  const startMonth = startDate.getMonth();
                  const endMonth = endDate.getMonth();
                  const startYear = startDate.getFullYear();
                  const endYear = endDate.getFullYear();
                  
                  // Calculate position (simplified for current year)
                  const effectiveStart = startYear < currentYear ? 0 : startMonth;
                  const effectiveEnd = endYear > currentYear ? 11 : endMonth;
                  const left = (effectiveStart / 12) * 100;
                  const width = ((effectiveEnd - effectiveStart + 1) / 12) * 100;

                  const statusColors = {
                    en_ejecucion: 'bg-info',
                    planificado: 'bg-muted-foreground',
                    completado: 'bg-success',
                    retrasado: 'bg-warning',
                    en_riesgo: 'bg-danger',
                  };

                  return (
                    <div 
                      key={project.id} 
                      className="flex items-center animate-fade-in"
                      style={{ animationDelay: `${150 + index * 30}ms` }}
                    >
                      <div className="w-48 shrink-0 px-2">
                        <p className="text-sm font-medium truncate" title={project.nombre}>
                          {project.nombre.length > 25 ? project.nombre.substring(0, 25) + '...' : project.nombre}
                        </p>
                      </div>
                      <div className="flex-1 relative h-8">
                        {/* Background grid */}
                        <div className="absolute inset-0 flex">
                          {months.map((_, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "flex-1 border-r border-border/50",
                                i === new Date().getMonth() && "bg-primary/5"
                              )} 
                            />
                          ))}
                        </div>
                        {/* Project bar */}
                        <div
                          className={cn(
                            "absolute top-1 h-6 rounded-full flex items-center px-2 transition-all duration-300 hover:opacity-80",
                            statusColors[project.status]
                          )}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            minWidth: '60px'
                          }}
                        >
                          <span className="text-xs text-white font-medium truncate">
                            {project.avance}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border flex-wrap">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-info" />
                  <span className="text-xs">En Ejecución</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-xs">Completado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-xs">Retrasado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <span className="text-xs">En Riesgo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                  <span className="text-xs">Planificado</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Hitos Importantes del Año
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {[
                { date: '15 Mar 2024', title: 'Centro Cultural Inaugurado', project: 'Centro Comunitario Cultural', status: 'completed' },
                { date: '30 Jun 2024', title: 'Meta de Digitalización', project: 'Digitalización de Trámites', status: 'upcoming' },
                { date: '30 Ago 2024', title: 'Red de Agua Norte', project: 'Rehabilitación Agua Potable', status: 'upcoming' },
                { date: '31 Oct 2024', title: 'Ciclovías Fase 1', project: 'Red de Ciclovías Urbanas', status: 'upcoming' },
                { date: '31 Dic 2024', title: 'Pavimentación Anual', project: 'Programa de Pavimentación', status: 'at_risk' },
              ].map((milestone, index) => (
                <div 
                  key={index} 
                  className="relative pl-10 animate-fade-in"
                  style={{ animationDelay: `${250 + index * 50}ms` }}
                >
                  <div className={cn(
                    "absolute left-2.5 w-3 h-3 rounded-full border-2 border-card",
                    milestone.status === 'completed' && "bg-success",
                    milestone.status === 'upcoming' && "bg-info",
                    milestone.status === 'at_risk' && "bg-warning",
                  )} />
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{milestone.title}</span>
                      <Badge 
                        variant={milestone.status === 'completed' ? 'success' : milestone.status === 'at_risk' ? 'warning' : 'info'}
                        className="text-xs"
                      >
                        {milestone.status === 'completed' ? 'Completado' : milestone.status === 'at_risk' ? 'En riesgo' : 'Próximo'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{milestone.project}</p>
                    <p className="text-xs text-muted-foreground mt-1">{milestone.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
