import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Project, getStatusLabel, formatCurrency } from '@/lib/mockData';
import { fetchProjects } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { H1, P, Subtitle, Small } from '@/components/ui/typography';
import { PRIORITY_COLORS } from '@/lib/theme';
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
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';

// --- CONFIGURACIÓN ESTÁTICA ---
const RISK_CATEGORIES = [
  { name: 'Crítica', description: 'Punt. 4.5-5.0', icon: AlertTriangle, color: PRIORITY_COLORS.critica, bgColor: 'bg-red-50 dark:bg-red-900/20' },
  { name: 'Muy Alta', description: 'Punt. 3.5-4.4', icon: AlertCircle, color: PRIORITY_COLORS.muy_alta, bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  { name: 'Alta', description: 'Punt. 2.5-3.4', icon: TrendingUp, color: PRIORITY_COLORS.alta, bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  { name: 'Media', description: 'Punt. 1.5-2.4', icon: Activity, color: PRIORITY_COLORS.media, bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Baja', description: 'Punt. 1.0-1.4', icon: CheckCircle2, color: PRIORITY_COLORS.baja, bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
];

// --- HOOKS PERSONALIZADOS ---
const useRiskData = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error cargando proyectos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { projects, loading, refresh: loadData, lastUpdated };
};

// --- COMPONENTES AUXILIARES (MEMOIZADOS) ---

const SemaphoreIcon = React.memo(({ label, status, Icon }: { label: string, status: string, Icon: any }) => {
  if (status !== 'ROJO' && status !== 'AMARILLO') return null;
  const isRed = status === 'ROJO';
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("p-1.5 rounded-full hover:bg-muted transition-colors cursor-help", isRed ? "bg-red-100/80" : "bg-yellow-100/80")}>
            <Icon className="h-3.5 w-3.5" style={{ color: isRed ? PRIORITY_COLORS.critica : PRIORITY_COLORS.alta }} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs font-semibold">{label}: {status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

const MobileProjectCard = React.memo(({ project, isExpanded, onToggle }: { project: Project, isExpanded: boolean, onToggle: () => void }) => {
  const budgetExecution = project.presupuesto > 0 ? (project.ejecutado / project.presupuesto) * 100 : 0;

  return (
    <div className="border border-border rounded-lg p-4 mb-3 bg-card shadow-sm animate-fade-in">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant={project.status as any} className="whitespace-nowrap shadow-none text-[10px] h-5">
                {getStatusLabel(project.status)}
              </Badge>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider"
                style={{
                  borderColor: project.viabilidad === 'baja' ? PRIORITY_COLORS.critica : 
                               project.viabilidad === 'media' ? PRIORITY_COLORS.alta : PRIORITY_COLORS.baja,
                  color: project.viabilidad === 'baja' ? '#991b1b' : 
                         project.viabilidad === 'media' ? '#92400e' : '#166534',
                  backgroundColor: project.viabilidad === 'baja' ? '#fef2f2' : 
                                   project.viabilidad === 'media' ? '#fffbeb' : '#f0fdf4'
                }}
              >
                {project.viabilidad}
              </span>
            </div>
            <p className="font-semibold text-sm text-foreground leading-tight">{project.nombre}</p>
            <Small className="font-mono text-muted-foreground/70 text-[10px] mt-1 block">{project.id}</Small>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Avance</span>
              <span className="font-bold text-foreground">{project.avance.toFixed(0)}%</span>
            </div>
            <Progress value={project.avance} className="h-1.5" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Ejecución</span>
              <span className="font-bold text-foreground">{budgetExecution.toFixed(0)}%</span>
            </div>
            <Progress value={budgetExecution} className={cn("h-1.5", budgetExecution > 95 && project.avance < 80 && "[&>div]:bg-destructive")} />
          </div>
        </div>

        {/* Semáforos */}
        <div className="flex items-center gap-2 flex-wrap pt-1 pb-1">
          <SemaphoreIcon label="Técnica" status={project.semaphores.tecnica} Icon={Activity} />
          <SemaphoreIcon label="Presupuestal" status={project.semaphores.presupuestal} Icon={Scale} />
          <SemaphoreIcon label="Jurídica" status={project.semaphores.juridica} Icon={Gavel} />
          <SemaphoreIcon label="Temporal" status={project.semaphores.temporal} Icon={Clock} />
          <SemaphoreIcon label="Administrativa" status={project.semaphores.administrativa} Icon={Briefcase} />
        </div>

        {/* Expandible */}
        {isExpanded && (
          <div className="pt-3 border-t border-border/50 space-y-3 animate-slide-down">
            {project.riesgos.length > 0 && (
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Riesgos</p>
                <ul className="space-y-2">
                  {project.riesgos.map((riesgo, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                      <span className="leading-snug">{riesgo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.accionesCorrectivas && (
              <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Mitigación</p>
                <div className="flex items-start gap-2">
                  <ClipboardCheck className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground/90 leading-relaxed">{project.accionesCorrectivas}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// --- COMPONENTE PRINCIPAL ---
export function RisksView() {
  const { projects, loading, refresh, lastUpdated } = useRiskData();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((projectId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) newSet.delete(projectId);
      else newSet.add(projectId);
      return newSet;
    });
  }, []);

  // Lógica de Negocio Memoizada
  const { matrixProjects, allRisks, mitigationProjects, categories } = useMemo(() => {
    // 1. Matriz de Riesgos
    const matrix = projects.filter(p => {
      const { red, yellow } = {
        red: Object.values(p.semaphores).filter(s => s === 'ROJO').length,
        yellow: Object.values(p.semaphores).filter(s => s === 'AMARILLO').length
      };
      const score = p.puntajePrioridad || 0;
      return (score > 3 && yellow >= 2) || (red >= 1);
    }).sort((a, b) => {
        const vOrder = { 'baja': 0, 'media': 1, 'alta': 2 };
        return vOrder[a.viabilidad] - vOrder[b.viabilidad];
    });

    // 2. Catálogo
    const risks = matrix.flatMap(p => 
      p.riesgos.map(risk => ({ 
        project: p.nombre, risk, projectId: p.id, responsable: p.responsable, direccion: p.direccion 
      }))
    );

    // 3. Mitigación
    const mitigations = projects.filter(p => {
      const hasAction = p.accionesCorrectivas && p.accionesCorrectivas.trim().length > 0;
      const isRiskContext = p.viabilidad === 'baja' || matrix.some(mp => mp.id === p.id);
      return hasAction && isRiskContext;
    });

    // 4. Categorías con contadores reales
    const cats = RISK_CATEGORIES.map(cat => ({
      ...cat,
      count: projects.filter(p => p.prioridad === (cat.name === 'Muy Alta' ? 'muy_alta' : cat.name.toLowerCase())).length
    }));

    return { matrixProjects: matrix, allRisks: risks, mitigationProjects: mitigations, categories: cats };
  }, [projects]);

  if (loading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh] w-full gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p>Cargando análisis de riesgos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8 px-3 sm:px-4 md:px-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <H1 className="text-2xl md:text-3xl">Gestión de Riesgos</H1>
          <Subtitle className="text-sm md:text-base text-muted-foreground">
            Matriz de Priorización Ponderada y Viabilidad Integral.
          </Subtitle>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {/* TARJETAS DE CATEGORÍA */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.name} className="hover:shadow-sm transition-all duration-300 border-border/60" style={{ borderTop: `3px solid ${cat.color}` }}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-lg shrink-0 shadow-sm", cat.bgColor)}>
                    <Icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: cat.color }} />
                  </div>
                  <div className="min-w-0">
                    <H1 className="text-2xl md:text-3xl font-display mb-0 leading-none">{cat.count}</H1>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mt-1 truncate">{cat.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* MATRIZ DE RIESGOS (Adaptable) */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 md:pb-4 border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-display">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Matriz de Riesgos por Proyecto
          </CardTitle>
          <P className="text-xs md:text-sm text-muted-foreground mt-0">
            Proyectos con Viabilidad Baja (1+ Rojos) o Prioridad Alta con Viabilidad Media (2+ Amarillos).
          </P>
        </CardHeader>
        <CardContent className="p-0">
          
          {/* MÓVIL: Tarjetas */}
          <div className="block md:hidden p-4">
            {matrixProjects.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground"><P>Sin riesgos críticos.</P></div>
            ) : (
              matrixProjects.map(project => (
                <MobileProjectCard 
                  key={project.id} 
                  project={project} 
                  isExpanded={expandedRows.has(project.id)}
                  onToggle={() => toggleRow(project.id)}
                />
              ))
            )}
          </div>

          {/* DESKTOP: Tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground uppercase text-xs w-[30%]">Proyecto</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground uppercase text-xs">Estado</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground uppercase text-xs">Viabilidad</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground uppercase text-xs w-[15%]">Avance</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground uppercase text-xs w-[15%]">Ejecución</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground uppercase text-xs">Alertas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {matrixProjects.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Excelente. No hay riesgos críticos.</td></tr>
                ) : (
                  matrixProjects.map(project => {
                    const budgetExec = project.presupuesto > 0 ? (project.ejecutado / project.presupuesto) * 100 : 0;
                    return (
                      <tr key={project.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-foreground line-clamp-2" title={project.nombre}>{project.nombre}</span>
                            <Small className="font-mono text-muted-foreground/70">{project.id}</Small>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <Badge variant={project.status as any} className="shadow-none">{getStatusLabel(project.status)}</Badge>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider"
                            style={{
                              borderColor: project.viabilidad === 'baja' ? PRIORITY_COLORS.critica : 
                                           project.viabilidad === 'media' ? PRIORITY_COLORS.alta : PRIORITY_COLORS.baja,
                              color: project.viabilidad === 'baja' ? '#991b1b' : 
                                     project.viabilidad === 'media' ? '#92400e' : '#166534',
                              backgroundColor: project.viabilidad === 'baja' ? '#fef2f2' : 
                                               project.viabilidad === 'media' ? '#fffbeb' : '#f0fdf4'
                            }}>
                            {project.viabilidad}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Físico</span><span className="font-bold">{project.avance.toFixed(0)}%</span></div>
                            <Progress value={project.avance} className="h-1.5" />
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Financiero</span><span className="font-bold">{budgetExec.toFixed(0)}%</span></div>
                            <Progress value={budgetExec} className={cn("h-1.5", budgetExec > 95 && project.avance < 80 && "[&>div]:bg-destructive")} />
                            <Small className="block text-right">{formatCurrency(project.ejecutado)}</Small>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-center gap-2 flex-wrap">
                            <SemaphoreIcon label="Técnica" status={project.semaphores.tecnica} Icon={Activity} />
                            <SemaphoreIcon label="Presupuestal" status={project.semaphores.presupuestal} Icon={Scale} />
                            <SemaphoreIcon label="Jurídica" status={project.semaphores.juridica} Icon={Gavel} />
                            <SemaphoreIcon label="Temporal" status={project.semaphores.temporal} Icon={Clock} />
                            <SemaphoreIcon label="Administrativa" status={project.semaphores.administrativa} Icon={Briefcase} />
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

      {/* GRID INFERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Catálogo */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 font-display text-base md:text-lg">
              <AlertTriangle className="h-5 w-5 text-warning" /> Catálogo de Riesgos
            </CardTitle>
            <Subtitle className="text-xs md:text-sm">Obstáculos en proyectos críticos.</Subtitle>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="space-y-3 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {allRisks.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed"><p className="text-sm">No hay riesgos registrados.</p></div>
              ) : (
                allRisks.map((item, index) => (
                  <div key={`${item.projectId}-${index}`} className="flex flex-col gap-2 p-3 bg-background border border-border rounded-lg shadow-sm hover:border-warning/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 bg-warning/10 p-1.5 rounded-md shrink-0"><AlertTriangle className="h-4 w-4 text-warning" /></div>
                      <div className="space-y-1 min-w-0 flex-1">
                         <p className="text-sm font-medium text-foreground leading-snug">{item.risk}</p>
                         <p className="text-xs font-semibold text-primary/80 truncate">{item.project}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-1 pt-2 border-t border-border/40 pl-10 text-xs text-muted-foreground">
                       <div className="flex items-center gap-1.5"><User className="h-3 w-3" /><span className="truncate max-w-[120px]">{item.responsable}</span></div>
                       <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /><span className="truncate max-w-[120px]">{item.direccion}</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mitigación */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 font-display text-base md:text-lg">
              <ClipboardCheck className="h-5 w-5 text-success" /> Acciones de Mitigación
            </CardTitle>
            <Subtitle className="text-xs md:text-sm">Pasos para recuperar viabilidad.</Subtitle>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="space-y-3 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {mitigationProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed"><p className="text-sm">Sin acciones pendientes.</p></div>
              ) : (
                mitigationProjects.map(project => (
                  <div key={project.id} className={cn("flex flex-col md:flex-row items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-sm", project.viabilidad === 'baja' ? "bg-red-50/50 border-red-100" : "bg-orange-50/50 border-orange-100")}>
                    <div className="p-2 rounded-full shrink-0 shadow-sm bg-background mt-0.5" style={{ color: project.viabilidad === 'baja' ? PRIORITY_COLORS.critica : PRIORITY_COLORS.alta }}>
                      {project.viabilidad === 'baja' ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 w-full min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-sm text-foreground truncate max-w-[200px]" title={project.nombre}>{project.nombre}</span>
                        <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 whitespace-nowrap bg-background/50 backdrop-blur-sm"
                          style={{ borderColor: project.viabilidad === 'baja' ? PRIORITY_COLORS.critica : PRIORITY_COLORS.alta, color: project.viabilidad === 'baja' ? PRIORITY_COLORS.critica : PRIORITY_COLORS.alta }}>
                          {project.viabilidad.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="bg-background/60 p-2.5 rounded-md border border-black/5 text-sm shadow-sm backdrop-blur-sm">
                        <p className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Acción Requerida</p>
                        <p className="text-foreground/90 leading-relaxed text-xs md:text-sm break-words">{project.accionesCorrectivas}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}