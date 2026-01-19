import { useEffect, useState } from 'react';
import { Project, getStatusLabel, formatCurrency } from '@/lib/mockData';
import { fetchProjects } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  Loader2,
  Scale,
  Gavel,
  Clock,
  Briefcase,
  User,
  Building2,
  ClipboardCheck,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function RisksView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Error cargando proyectos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- 1. LÓGICA DE FILTRADO PARA LA MATRIZ ---
  const matrixProjects = projects.filter(p => {
    const sem = p.semaphores;
    const reds = Object.values(sem).filter(s => s === 'ROJO').length;
    const yellows = Object.values(sem).filter(s => s === 'AMARILLO').length;
    const score = p.puntajePrioridad || 0;

    // Regla: Prioridad Alta+ con Viabilidad Media (2+ Amarillos) O Viabilidad Baja (1+ Rojo)
    const isHighPriorityRisk = (score > 3 && yellows >= 2);
    const isCriticalRisk = (reds >= 1);

    return isHighPriorityRisk || isCriticalRisk;
  }).sort((a, b) => {
    const vOrder = { 'baja': 0, 'media': 1, 'alta': 2 };
    return vOrder[a.viabilidad] - vOrder[b.viabilidad];
  });

  // --- 2. CATÁLOGO DE RIESGOS (Filtrado por matriz) ---
  const allRisks = matrixProjects.flatMap(p => 
    p.riesgos.map(risk => ({ 
      project: p.nombre, 
      risk, 
      projectId: p.id,
      responsable: p.responsable,
      direccion: p.direccion 
    }))
  );

  // --- 3. ACCIONES DE MITIGACIÓN (Proyectos críticos con acciones definidas) ---
  // Filtramos proyectos que:
  // a) Tienen texto en 'accionesCorrectivas'
  // b) Están en la matriz de riesgo (viabilidad baja/media-crítica) para ser consistentes
  //    O tienen viabilidad 'baja' explícitamente como solicitaste.
  const mitigationProjects = projects.filter(p => {
    const hasAction = p.accionesCorrectivas && p.accionesCorrectivas.trim().length > 0;
    const isRiskContext = p.viabilidad === 'baja' || matrixProjects.some(mp => mp.id === p.id);
    return hasAction && isRiskContext;
  });

  // Categorías para las tarjetas superiores
  const riskCategories = [
    { 
      name: 'Prioridad Crítica', 
      description: 'Puntuación 4.5 - 5.0',
      count: projects.filter(p => p.prioridad === 'critica').length,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100 dark:bg-red-900/20'
    },
    { 
      name: 'Prioridad Muy Alta', 
      description: 'Puntuación 3.5 - 4.4',
      count: projects.filter(p => p.prioridad === 'muy_alta').length,
      icon: AlertCircle,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
    },
    { 
      name: 'Prioridad Alta', 
      description: 'Puntuación 2.5 - 3.4',
      count: projects.filter(p => p.prioridad === 'alta').length,
      icon: TrendingUp,
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    },
    { 
      name: 'Prioridad Media', 
      description: 'Puntuación 1.5 - 2.4',
      count: projects.filter(p => p.prioridad === 'media').length,
      icon: Activity,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    },
    { 
      name: 'Prioridad Baja', 
      description: 'Puntuación 1.0 - 1.4',
      count: projects.filter(p => p.prioridad === 'baja').length,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20'
    },
  ];

  const renderSemaphoreIcon = (label: string, status: string, Icon: any) => {
    if (status !== 'ROJO' && status !== 'AMARILLO') return null;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={cn(
              "p-1.5 rounded-full",
              status === 'ROJO' ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
            )}>
              <Icon className="h-3 w-3" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs font-semibold">{label}: {status}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Gestión de Riesgos y Priorización
        </h1>
        <p className="text-muted-foreground mt-1">
          Seguimiento basado en la Matriz de Priorización Ponderada y Viabilidad
        </p>
      </div>

      {/* Risk Categories (Tarjetas Superiores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {riskCategories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <Card 
              key={cat.name} 
              className="animate-slide-up hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="pt-6 px-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg shrink-0", cat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-display font-bold">{cat.count}</p>
                    <p className="text-sm font-medium leading-none truncate" title={cat.name}>{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{cat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Matrix Table */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-danger" />
            Matriz de Riesgos por Proyecto
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Proyectos con Viabilidad Baja (1+ Rojos) o Prioridad Alta con Viabilidad Media (2+ Amarillos).
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground w-[30%]">Proyecto</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Viabilidad</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Avance</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ejecución Presup.</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Riesgos (Semáforos)</th>
                </tr>
              </thead>
              <tbody>
                {matrixProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No hay proyectos que cumplan los criterios de riesgo actuales.
                    </td>
                  </tr>
                ) : (
                  matrixProjects.map((project, index) => {
                    const budgetExecution = project.presupuesto > 0 
                      ? (project.ejecutado / project.presupuesto) * 100 
                      : 0;
                    const sem = project.semaphores;
                    return (
                      <tr 
                        key={project.id} 
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                        style={{ animationDelay: `${200 + index * 50}ms` }}
                      >
                        <td className="py-4 px-2">
                          <div>
                            <p className="font-medium truncate max-w-[280px]" title={project.nombre}>
                              {project.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{project.id}</p>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <Badge variant={project.status as any} className="whitespace-nowrap">
                            {getStatusLabel(project.status)}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full border",
                            project.viabilidad === 'alta' && "bg-green-100 text-green-700 border-green-200",
                            project.viabilidad === 'media' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                            project.viabilidad === 'baja' && "bg-red-100 text-red-700 border-red-200",
                          )}>
                            {project.viabilidad.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-2 min-w-[120px]">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Físico</span>
                              <span className="font-medium">{project.avance.toFixed(0)}%</span>
                            </div>
                            <Progress value={project.avance} className="h-1.5" />
                          </div>
                        </td>
                        <td className="py-4 px-2 min-w-[120px]">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Financiero</span>
                              <span className="font-medium">{budgetExecution.toFixed(0)}%</span>
                            </div>
                            <Progress 
                              value={budgetExecution} 
                              className={cn("h-1.5", budgetExecution > 90 && project.avance < 80 && "bg-red-100 [&>div]:bg-red-500")} 
                            />
                            <p className="text-[10px] text-muted-foreground text-right">{formatCurrency(project.ejecutado)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1 flex-wrap">
                            {renderSemaphoreIcon('Técnica', sem.tecnica, Activity)}
                            {renderSemaphoreIcon('Presupuestal', sem.presupuestal, Scale)}
                            {renderSemaphoreIcon('Jurídica', sem.juridica, Gavel)}
                            {renderSemaphoreIcon('Temporal', sem.temporal, Clock)}
                            {renderSemaphoreIcon('Administrativa', sem.administrativa, Briefcase)}
                            {Object.values(sem).every(s => s === 'VERDE' || s === 'GRIS') && (
                              <span className="text-xs text-muted-foreground italic">Sin alertas específicas</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
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
            Catálogo de Riesgos Identificados (Texto)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Detalle de obstáculos registrados para los proyectos en matriz de riesgo.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {allRisks.length === 0 ? (
               <p className="text-muted-foreground col-span-2 text-center py-4">No se han registrado descripciones de riesgos para los proyectos críticos.</p>
            ) : (
              allRisks.map((item, index) => (
                <div 
                  key={`${item.projectId}-${index}`} 
                  className="flex flex-col gap-2 p-4 bg-muted/30 border border-border/50 rounded-lg animate-fade-in hover:bg-muted/50 transition-colors"
                  style={{ animationDelay: `${300 + index * 30}ms` }}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-1" />
                    <p className="text-sm font-medium text-foreground leading-relaxed">{item.risk}</p>
                  </div>
                  <div className="pl-6 space-y-1.5 mt-1">
                     <p className="text-xs font-semibold text-primary/80">{item.project}</p>
                     <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[120px]" title={item.responsable}>{item.responsable}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate max-w-[120px]" title={item.direccion}>{item.direccion}</span>
                        </div>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mitigation Actions - SECCIÓN ACTUALIZADA */}
      <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-success" />
            Acciones de Mitigación Sugeridas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Acciones correctivas requeridas para proyectos con Viabilidad Baja o en Riesgo Crítico.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mitigationProjects.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay acciones correctivas registradas para los proyectos en riesgo actualmente.
              </p>
            ) : (
              mitigationProjects.map((project, index) => (
                <div 
                  key={project.id}
                  className={cn(
                    "flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border animate-fade-in",
                    project.viabilidad === 'baja' 
                      ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30" 
                      : "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30"
                  )}
                  style={{ animationDelay: `${400 + index * 50}ms` }}
                >
                  <div className={cn(
                    "p-2 rounded-full shrink-0 mt-1",
                    project.viabilidad === 'baja' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                  )}>
                    {project.viabilidad === 'baja' ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{project.nombre}</p>
                      <Badge variant={project.status as any} className="w-fit">
                        Viabilidad {project.viabilidad.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="bg-background/60 p-3 rounded-md border border-border/50 text-sm">
                      <p className="font-medium text-muted-foreground mb-1 text-xs uppercase tracking-wider">Acción Requerida:</p>
                      <p className="text-foreground leading-relaxed">
                        {project.accionesCorrectivas}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}