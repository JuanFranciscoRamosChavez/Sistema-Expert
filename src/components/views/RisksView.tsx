import { mockProjects, getStatusLabel, getPriorityLabel, formatCurrency } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, Clock, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RisksView() {
  const riskyProjects = mockProjects.filter(p => 
    p.status === 'en_riesgo' || p.status === 'retrasado' || p.viabilidad === 'baja'
  );
  
  const allRisks = mockProjects.flatMap(p => 
    p.riesgos.map(risk => ({ project: p.nombre, risk, projectId: p.id }))
  );

  const riskCategories = [
    { 
      name: 'Proyectos en Riesgo', 
      count: mockProjects.filter(p => p.status === 'en_riesgo').length,
      icon: AlertTriangle,
      color: 'text-danger bg-danger/10'
    },
    { 
      name: 'Proyectos Retrasados', 
      count: mockProjects.filter(p => p.status === 'retrasado').length,
      icon: Clock,
      color: 'text-warning bg-warning/10'
    },
    { 
      name: 'Viabilidad Baja', 
      count: mockProjects.filter(p => p.viabilidad === 'baja').length,
      icon: TrendingDown,
      color: 'text-danger bg-danger/10'
    },
    { 
      name: 'Sobrepresupuesto', 
      count: mockProjects.filter(p => p.ejecutado > p.presupuesto * 0.9 && p.avance < 90).length,
      icon: DollarSign,
      color: 'text-warning bg-warning/10'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Gestión de Riesgos
        </h1>
        <p className="text-muted-foreground mt-1">
          Identificación y seguimiento de riesgos en proyectos
        </p>
      </div>

      {/* Risk Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {riskCategories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <Card 
              key={cat.name} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-lg", cat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{cat.count}</p>
                    <p className="text-xs text-muted-foreground">{cat.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk Matrix */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-danger" />
            Matriz de Riesgos por Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Proyecto</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Viabilidad</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Avance</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ejecución Presup.</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Riesgos</th>
                </tr>
              </thead>
              <tbody>
                {riskyProjects.map((project, index) => {
                  const budgetExecution = (project.ejecutado / project.presupuesto) * 100;
                  return (
                    <tr 
                      key={project.id} 
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${200 + index * 50}ms` }}
                    >
                      <td className="py-4 px-2">
                        <div>
                          <p className="font-medium">{project.nombre}</p>
                          <p className="text-xs text-muted-foreground">{project.direccion}</p>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant={project.status as any}>{getStatusLabel(project.status)}</Badge>
                      </td>
                      <td className="py-4 px-2">
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          project.viabilidad === 'alta' && "bg-success/20 text-success",
                          project.viabilidad === 'media' && "bg-warning/20 text-warning",
                          project.viabilidad === 'baja' && "bg-danger/20 text-danger",
                        )}>
                          {project.viabilidad.charAt(0).toUpperCase() + project.viabilidad.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <Progress value={project.avance} className="w-16 h-2" />
                          <span className="text-sm">{project.avance}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={budgetExecution} 
                            className={cn("w-16 h-2", budgetExecution > 90 && project.avance < 90 && "[&>div]:bg-danger")} 
                          />
                          <span className="text-sm">{budgetExecution.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-sm text-muted-foreground">{project.riesgos.length} identificados</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* All Risks List */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Catálogo de Riesgos Identificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {allRisks.map((item, index) => (
              <div 
                key={`${item.projectId}-${index}`} 
                className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg animate-fade-in"
                style={{ animationDelay: `${300 + index * 30}ms` }}
              >
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm">{item.risk}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.project}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mitigation Actions */}
      <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Acciones de Mitigación Sugeridas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
              <div>
                <p className="font-medium">Parque Ecológico Metropolitano</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Recomendación: Reunión urgente con stakeholders para resolver conflictos de uso de suelo. 
                  Considerar reasignación presupuestal o reducción de alcance.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <Clock className="h-5 w-5 text-warning shrink-0" />
              <div>
                <p className="font-medium">Programa de Pavimentación Integral</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Recomendación: Acelerar procesos de licitación. Programar trabajos intensivos en temporada seca.
                  Establecer comunicación proactiva con vecinos afectados.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
