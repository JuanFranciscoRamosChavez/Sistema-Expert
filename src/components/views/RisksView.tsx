import React, { useState, useCallback } from 'react';
import { getStatusLabel } from '@/lib/mockData';
import { formatCurrency } from '@/lib/formatters';
import { useRiskAnalysis } from '@/hooks/useRiskAnalysis';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { H1, P, Subtitle, Small } from '@/components/ui/typography';
import { PRIORITY_COLORS, SCORE_STYLES, URGENCY_STYLES } from '@/lib/theme';
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

/**
 * RisksView - Sprint 3 migrado 100% a backend
 * Usa useRiskAnalysis con análisis completo serverside
 */

// --- CONFIGURACIÓN ESTÁTICA ---
const RISK_CATEGORIES = [
  { name: 'Crítica', description: 'Punt. 4.5-5.0', icon: AlertTriangle, color: PRIORITY_COLORS.critica, bgColor: SCORE_STYLES.critica.bg.replace('bg-', 'bg-') + '-50 dark:' + SCORE_STYLES.critica.bg.replace('bg-', 'bg-') + '-900/20' },
  { name: 'Muy Alta', description: 'Punt. 3.5-4.4', icon: AlertCircle, color: PRIORITY_COLORS.muy_alta, bgColor: SCORE_STYLES.muy_alta.bg.replace('bg-', 'bg-') + '-50 dark:' + SCORE_STYLES.muy_alta.bg.replace('bg-', 'bg-') + '-900/20' },
  { name: 'Alta', description: 'Punt. 2.5-3.4', icon: TrendingUp, color: PRIORITY_COLORS.alta, bgColor: SCORE_STYLES.alta.bg.replace('bg-', 'bg-') + '-50 dark:' + SCORE_STYLES.alta.bg.replace('bg-', 'bg-') + '-900/20' },
  { name: 'Media', description: 'Punt. 1.5-2.4', icon: Activity, color: PRIORITY_COLORS.media, bgColor: SCORE_STYLES.media.bg.replace('bg-', 'bg-') + '-50 dark:' + SCORE_STYLES.media.bg.replace('bg-', 'bg-') + '-900/20' },
  { name: 'Baja', description: 'Punt. 1.0-1.4', icon: CheckCircle2, color: PRIORITY_COLORS.baja, bgColor: SCORE_STYLES.baja.bg.replace('bg-', 'bg-') + '-50 dark:' + SCORE_STYLES.baja.bg.replace('bg-', 'bg-') + '-900/20' },
];

// --- COMPONENTES AUXILIARES (MEMOIZADOS) ---

const SemaphoreIcon = React.memo(({ label, status, Icon }: { label: string, status: string, Icon: any }) => {
  // Normalizar el estado a mayúsculas para comparación case-insensitive
  const statusUpper = (status || '').toUpperCase();
  
  // Definir colores según el estado del semáforo
  const isRed = statusUpper === 'ROJO';
  const isYellow = statusUpper === 'AMARILLO';
  const isGreen = statusUpper === 'VERDE';
  const isGray = !statusUpper || statusUpper === 'GRIS';
  
  // Colores y estilos dinámicos
  const bgClass = isRed ? 'bg-red-100 dark:bg-red-950/30' : 
                  isYellow ? 'bg-amber-100 dark:bg-amber-950/30' : 
                  isGreen ? 'bg-emerald-100 dark:bg-emerald-950/30' :
                  'bg-gray-100 dark:bg-gray-950/30';
  
  const iconColor = isRed ? PRIORITY_COLORS.critica : 
                    isYellow ? PRIORITY_COLORS.alta : 
                    isGreen ? '#16a34a' :
                    '#94a3b8'; // Gris para sin información
  
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("p-1.5 rounded-full hover:bg-muted transition-colors cursor-help", bgClass)}>
            <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs font-semibold">{label}: {status || 'Sin datos'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

const MobileProjectCard = React.memo(({ project, isExpanded, onToggle }: { project: any, isExpanded: boolean, onToggle: () => void }) => {
  const budgetExecution = project.presupuesto > 0 ? ((project.avance_financiero / 100) * project.presupuesto) : 0;
  const budgetExecutionPct = project.avance_financiero;

  return (
    <div className="border border-border rounded-lg p-4 mb-3 bg-card shadow-sm animate-fade-in">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant="outline" className="whitespace-nowrap shadow-none text-[10px] h-5">
                Score: {project.score.toFixed(1)}
              </Badge>
              <Badge 
                variant="outline" 
                className="whitespace-nowrap text-[10px] h-5 font-bold"
                style={{ 
                  borderColor: PRIORITY_COLORS[project.prioridad_label as keyof typeof PRIORITY_COLORS],
                  color: PRIORITY_COLORS[project.prioridad_label as keyof typeof PRIORITY_COLORS]
                }}
              >
                {project.prioridad_label.replace('_', ' ').toUpperCase()}
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
            <Small className="font-mono text-muted-foreground/70 text-[10px] mt-1 block">ID: {project.id}</Small>
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
              <span className="font-bold text-foreground">{budgetExecutionPct.toFixed(0)}%</span>
            </div>
            <Progress value={budgetExecutionPct} className={cn("h-1.5", budgetExecutionPct > 95 && project.avance < 80 && "[&>div]:bg-destructive")} />
          </div>
        </div>

        {/* 5 Viabilidades */}
        <div className="pt-2 border-t border-border/50">
          <Small className="block mb-2 text-muted-foreground font-semibold">Viabilidades:</Small>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <SemaphoreIcon label="Técnica" status={project.semaphores.tecnica} Icon={Activity} />
              <span className="text-[9px] text-muted-foreground">Téc</span>
            </div>
            <div className="flex items-center gap-0.5">
              <SemaphoreIcon label="Presupuestal" status={project.semaphores.presupuestal} Icon={Scale} />
              <span className="text-[9px] text-muted-foreground">Pre</span>
            </div>
            <div className="flex items-center gap-0.5">
              <SemaphoreIcon label="Jurídica" status={project.semaphores.juridica} Icon={Gavel} />
              <span className="text-[9px] text-muted-foreground">Jur</span>
            </div>
            <div className="flex items-center gap-0.5">
              <SemaphoreIcon label="Temporal" status={project.semaphores.temporal} Icon={Clock} />
              <span className="text-[9px] text-muted-foreground">Tmp</span>
            </div>
            <div className="flex items-center gap-0.5">
              <SemaphoreIcon label="Administrativa" status={project.semaphores.administrativa} Icon={Briefcase} />
              <span className="text-[9px] text-muted-foreground">Adm</span>
            </div>
          </div>
        </div>

        {/* Expandible */}
        {isExpanded && (
          <div className="pt-3 border-t border-border/50 space-y-3 animate-slide-down">
            {project.riesgos && project.riesgos.length > 0 ? (
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Riesgos Identificados ({project.riesgos.length})
                </p>
                <ul className="space-y-2">
                  {project.riesgos.map((riesgo: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                      <span className="leading-snug">{riesgo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-muted/30 p-3 rounded-md text-center">
                <p className="text-xs text-muted-foreground">Sin riesgos específicos registrados</p>
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
  const { data, isLoading: loading, error, refetch } = useRiskAnalysis();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = useCallback((projectId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) newSet.delete(projectId);
      else newSet.add(projectId);
      return newSet;
    });
  }, []);

  // Obtener datos del backend
  const matrixProjects = data?.matrix || [];
  const allRisks = data?.risks || [];
  const mitigationProjects = data?.mitigations || [];
  
  // Mapear categorías del backend con los datos estáticos de UI
  const categories = (data?.categories || []).map(cat => {
    const riskCat = RISK_CATEGORIES.find(rc => rc.name === cat.name);
    return {
      name: cat.name,
      count: cat.count,
      icon: riskCat?.icon || AlertCircle,
      color: riskCat?.color || PRIORITY_COLORS.media,
      bgColor: riskCat?.bgColor || 'bg-blue-50 dark:bg-blue-900/20',
      description: riskCat?.description || `Count: ${cat.count}`
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] w-full gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p>Cargando análisis de riesgos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] w-full gap-4 text-center">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Error al cargar análisis de riesgos</h3>
          <p className="text-muted-foreground text-sm">
            {error.message || 'Hubo un problema al conectar con el servidor'}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-fade-in pb-6 sm:pb-8 px-2 sm:px-4 md:px-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <H1>Gestión de Riesgos</H1>
          <Subtitle className="hidden sm:block">
            Matriz de Priorización Ponderada y Viabilidad Integral.
          </Subtitle>
          <Subtitle className="block sm:hidden text-xs">
            Matriz de Priorización y Viabilidad.
          </Subtitle>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 shrink-0 h-9">
          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>

      {/* TARJETAS DE CATEGORÍA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <p className="text-sm">No hay datos de categorías disponibles</p>
          </div>
        ) : (
          categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <Card key={cat.name} className="hover:shadow-sm transition-all duration-300 border-border/60" style={{ borderTop: `3px solid ${cat.color}` }}>
                <CardContent className="p-3 sm:p-4 md:p-5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={cn("p-2 sm:p-2.5 rounded-lg shrink-0 shadow-sm", cat.bgColor)}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" style={{ color: cat.color }} />
                    </div>
                    <div className="min-w-0">
                      <H1 className="text-xl sm:text-2xl md:text-3xl font-display mb-0 leading-none">{cat.count}</H1>
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-muted-foreground mt-0.5 sm:mt-1 truncate">{cat.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* MATRIZ DE RIESGOS (Adaptable) */}
      <Card className="shadow-sm border-border">
        <CardHeader className="p-3 sm:p-4 md:p-6 pb-3 md:pb-4 border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-display">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            <span className="hidden sm:inline">Matriz de Riesgos por Proyecto</span>
            <span className="inline sm:hidden">Matriz de Riesgos</span>
          </CardTitle>
          <Subtitle className="text-xs md:text-sm mt-1 sm:mt-2">
            Proyectos con Viabilidad Baja o Media y Prioridad Alta (Score ≥ 3.0).
          </Subtitle>
        </CardHeader>
        <CardContent className="p-0">
          
          {/* MÓVIL: Tarjetas */}
          <div className="block md:hidden p-3 sm:p-4">
            {matrixProjects.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground"><Subtitle>Sin riesgos críticos.</Subtitle></div>
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
                    const budgetExec = project.avance_financiero;
                    const ejecutadoMonto = (project.avance_financiero / 100) * project.presupuesto;
                    return (
                      <tr key={project.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-foreground line-clamp-2" title={project.nombre}>{project.nombre}</span>
                            <Small className="font-mono text-muted-foreground/70">ID: {project.id}</Small>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <Badge variant="outline" className="shadow-none w-fit">Score: {project.score.toFixed(1)}</Badge>
                            <Badge 
                              variant="outline" 
                              className="text-[10px] font-bold w-fit"
                              style={{ 
                                borderColor: PRIORITY_COLORS[project.prioridad_label as keyof typeof PRIORITY_COLORS],
                                color: PRIORITY_COLORS[project.prioridad_label as keyof typeof PRIORITY_COLORS]
                              }}
                            >
                              {project.prioridad_label.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
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
                            <Small className="block text-right">{formatCurrency(ejecutadoMonto)}</Small>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              <SemaphoreIcon label="Técnica" status={project.semaphores.tecnica} Icon={Activity} />
                              <span className="text-[10px] text-muted-foreground">Téc</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <SemaphoreIcon label="Presupuestal" status={project.semaphores.presupuestal} Icon={Scale} />
                              <span className="text-[10px] text-muted-foreground">Pre</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <SemaphoreIcon label="Jurídica" status={project.semaphores.juridica} Icon={Gavel} />
                              <span className="text-[10px] text-muted-foreground">Jur</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <SemaphoreIcon label="Temporal" status={project.semaphores.temporal} Icon={Clock} />
                              <span className="text-[10px] text-muted-foreground">Tmp</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <SemaphoreIcon label="Administrativa" status={project.semaphores.administrativa} Icon={Briefcase} />
                              <span className="text-[10px] text-muted-foreground">Adm</span>
                            </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        
        {/* Catálogo */}
        <Card className="flex flex-col h-full">
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-3 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 font-display text-base md:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" /> 
              <span className="hidden sm:inline">Catálogo de Riesgos</span>
              <span className="inline sm:hidden">Riesgos</span>
            </CardTitle>
            <Subtitle className="text-xs md:text-sm">Obstáculos en proyectos críticos.</Subtitle>
          </CardHeader>
          <CardContent className="flex-1 p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
              {allRisks.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed"><p className="text-sm">No hay riesgos registrados.</p></div>
              ) : (
                allRisks.map((item, index) => (
                  <div key={`${item.project_id}-${index}`} className="flex flex-col gap-2 p-2.5 sm:p-3 bg-background border border-border rounded-lg shadow-sm hover:border-warning/50 transition-colors">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="mt-0.5 bg-warning/10 p-1.5 rounded-md shrink-0"><AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-warning" /></div>
                      <div className="space-y-1 min-w-0 flex-1">
                         <p className="text-xs sm:text-sm font-medium text-foreground leading-snug">{item.risk}</p>
                         <p className="text-[10px] sm:text-xs font-semibold text-primary/80 truncate">{item.project}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1 pt-2 border-t border-border/40 pl-8 sm:pl-10 text-[10px] sm:text-xs text-muted-foreground">
                       <div className="flex items-center gap-1 sm:gap-1.5"><User className="h-3 w-3" /><span className="truncate max-w-[100px] sm:max-w-[120px]">{item.responsable}</span></div>
                       <div className="flex items-center gap-1 sm:gap-1.5"><Building2 className="h-3 w-3" /><span className="truncate max-w-[100px] sm:max-w-[120px]">{item.direccion}</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mitigación */}
        <Card className="flex flex-col h-full">
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-3 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 font-display text-base md:text-lg">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-success" /> 
              <span className="hidden sm:inline">Acciones de Mitigación</span>
              <span className="inline sm:hidden">Mitigación</span>
            </CardTitle>
            <Subtitle className="text-xs md:text-sm">Pasos para recuperar viabilidad.</Subtitle>
          </CardHeader>
          <CardContent className="flex-1 p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
              {mitigationProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed"><p className="text-sm">Sin acciones pendientes.</p></div>
              ) : (
                mitigationProjects.map(project => (
                  <div key={project.id} className={cn("flex flex-col md:flex-row items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all hover:shadow-sm", SCORE_STYLES.alta.bg.replace('bg-', 'bg-') + '-50/50', SCORE_STYLES.alta.border.replace('border-', 'border-') + '-100')}>
                    <div className="p-1.5 sm:p-2 rounded-full shrink-0 shadow-sm bg-background mt-0.5" style={{ color: PRIORITY_COLORS.alta }}>
                      <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex-1 w-full min-w-0 space-y-1.5 sm:space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[150px] sm:max-w-[200px]" title={project.nombre}>{project.nombre}</span>
                        <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 whitespace-nowrap bg-background/50 backdrop-blur-sm"
                          style={{ borderColor: PRIORITY_COLORS.alta, color: PRIORITY_COLORS.alta }}>
                          MITIGACIÓN
                        </Badge>
                      </div>
                      <div className="bg-background/60 p-2.5 rounded-md border border-black/5 text-sm shadow-sm backdrop-blur-sm">
                        <p className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Acción Requerida</p>
                        <p className="text-foreground/90 leading-relaxed text-xs md:text-sm break-words">{project.acciones}</p>
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