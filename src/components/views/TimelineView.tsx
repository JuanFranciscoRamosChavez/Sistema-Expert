import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, CheckCircle, Filter, ChevronLeft, ChevronRight, MapPin, Target, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { useFilteredProjects, useProjectsByYear, useMilestoneProjects } from '@/hooks/useFilteredProjects';
import type { Project } from '@/types';

const months = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// --- Funciones de Ayuda ---
const formatDate = (dateStr: string | null | undefined): string => {
	if (!dateStr) return 'Sin fecha';
	try {
		const date = new Date(dateStr);
		return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
	} catch {
		return dateStr;
	}
};

// --- Componente Principal ---

export function TimelineView() {
	const currentYear = 2026;
	const now = new Date();

	// Estados de Filtros y Paginación
	const [timeRange, setTimeRange] = useState<'3' | '6' | '9' | '12+'>('12+');
	const [showFilters, setShowFilters] = useState(false);
	
	const [globalAreaFilter, setGlobalAreaFilter] = useState<string>('todos');
	const [globalStatusFilter, setGlobalStatusFilter] = useState<string>('todos');
	const [globalEjeFilter, setGlobalEjeFilter] = useState<string>('todos');
	const [globalMultianualidadFilter, setGlobalMultianualidadFilter] = useState<string>('todos');
	
	const [timelineAreaFilter, setTimelineAreaFilter] = useState<string>('todos');
	const [timelineStatusFilter, setTimelineStatusFilter] = useState<string>('todos');
	const [itemsPerPage, setItemsPerPage] = useState<string>('5');
	const [currentPage, setCurrentPage] = useState(1);
	
	const [milestoneAreaFilter, setMilestoneAreaFilter] = useState<string>('todos');
	const [milestoneStatusFilter, setMilestoneStatusFilter] = useState<string>('todos');
	const [milestoneScoreFilter, setMilestoneScoreFilter] = useState<string>('todos');
	
	const [selectedMilestone, setSelectedMilestone] = useState<Project | null>(null);

	// Mapeo de timeRange a días
	const daysThreshold = useMemo(() => {
		switch (timeRange) {
			case '3': return 90;
			case '6': return 180;
			case '9': return 270;
			case '12+': return 9999;
			default: return 90;
		}
	}, [timeRange]);

	// ✅ HOOK 1: Próximas entregas (Serverside)
	const { data: upcomingData, isLoading: upcomingLoading, error: upcomingError } = useFilteredProjects({
		days_threshold: daysThreshold,
		status: globalStatusFilter !== 'todos' ? globalStatusFilter : undefined,
		direccion: globalAreaFilter !== 'todos' ? globalAreaFilter : undefined,
		eje_institucional: globalEjeFilter !== 'todos' ? globalEjeFilter : undefined,
		multianualidad: globalMultianualidadFilter !== 'todos' ? globalMultianualidadFilter as 'si' | 'no' : undefined,
		ordering: 'fecha_termino_prog',
		page_size: 'todos'
	});

	// ✅ HOOK 1.5: Proyectos Atrasados (Overdue)
	const { data: overdueData, isLoading: overdueLoading, error: overdueError } = useFilteredProjects({
		is_overdue: true,
		status: globalStatusFilter !== 'todos' ? globalStatusFilter : undefined,
		direccion: globalAreaFilter !== 'todos' ? globalAreaFilter : undefined,
		eje_institucional: globalEjeFilter !== 'todos' ? globalEjeFilter : undefined,
		multianualidad: globalMultianualidadFilter !== 'todos' ? globalMultianualidadFilter as 'si' | 'no' : undefined,
		ordering: 'fecha_termino_prog',
		page_size: 'todos'
	});

	// ✅ HOOK 2: Timeline del año (Serverside)
	const { data: timelineData, isLoading: timelineLoading, error: timelineError } = useProjectsByYear(currentYear, {
		status: timelineStatusFilter !== 'todos' ? timelineStatusFilter : undefined,
		direccion: timelineAreaFilter !== 'todos' ? timelineAreaFilter : undefined,
		page: currentPage,
		page_size: itemsPerPage === 'todos' ? 9999 : parseInt(itemsPerPage),
	});

	// ✅ HOOK 3: Hitos comunicacionales (Serverside)
	const scoreRangeMap: Record<string, any> = {
		'critica': 'critica',
		'muy_alta': 'muy_alta',
		'alta': 'alta',
		'media': 'media',
		'baja': 'baja',
		'todos': undefined
	};
	
	const { data: milestonesData, isLoading: milestonesLoading, error: milestonesError } = useMilestoneProjects(
		scoreRangeMap[milestoneScoreFilter],
		{
			direccion: milestoneAreaFilter !== 'todos' ? milestoneAreaFilter : undefined,
			status: milestoneStatusFilter !== 'todos' ? milestoneStatusFilter : undefined,
		}
	);

	// Áreas y Ejes únicos desde los datos (sin useMemo para evitar loop)
	const areas = new Set<string>();
	const ejes = new Set<string>();
	upcomingData?.results.forEach(p => { 
		if (p.area_responsable) areas.add(p.area_responsable);
		if (p.eje_institucional) ejes.add(p.eje_institucional);
	});
	timelineData?.results.forEach(p => { 
		if (p.area_responsable) areas.add(p.area_responsable);
		if (p.eje_institucional) ejes.add(p.eje_institucional);
	});
	milestonesData?.results.forEach(p => { 
		if (p.area_responsable) areas.add(p.area_responsable);
		if (p.eje_institucional) ejes.add(p.eje_institucional);
	});
	const uniqueAreas = Array.from(areas).sort();
	const uniqueEjes = Array.from(ejes).sort();

	const upcomingProjects = upcomingData?.results || [];
	const overdueProjects = overdueData?.results || [];
	const timelineProjects = timelineData?.results || [];
	const paginatedTimelineProjects = timelineProjects;
	const filteredMilestones = milestonesData?.results || [];
	const totalPages = timelineData?.count && itemsPerPage !== 'todos' 
		? Math.ceil(timelineData.count / parseInt(itemsPerPage)) 
		: 1;

	const loading = upcomingLoading || overdueLoading || timelineLoading || milestonesLoading;
	const hasError = upcomingError || overdueError || timelineError || milestonesError;

	if (hasError) {
		return (
			<Card className="border-destructive/50 bg-destructive/5">
				<CardContent className="py-8 text-center text-destructive">
					<p>Error al cargar los datos del cronograma.</p>
					<Button variant="outline" onClick={() => window.location.reload()} className="mt-4 border-destructive/50 hover:bg-destructive/10">
						Reintentar
					</Button>
				</CardContent>
			</Card>
		);
	}

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Cronograma de Proyectos
        </h1>
        <p className="text-muted-foreground mt-1">
          Línea de tiempo y entregas programadas
        </p>
		</div>

		{!loading && (
			<>
				{/* --- SECCIÓN 1: PRÓXIMAS ENTREGAS --- */}
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Próximas Entregas
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                    <SelectTrigger className="w-[150px] sm:w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Próximos 3 meses</SelectItem>
                      <SelectItem value="6">Próximos 6 meses</SelectItem>
                      <SelectItem value="9">Próximos 9 meses</SelectItem>
                      <SelectItem value="12+">Más de un año</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant={showFilters ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filtros</span>
                  </Button>
                </div>
              </div>
              
              {showFilters && (
                <div className="mt-4 p-4 bg-muted/40 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-down">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">Estado</label>
                    <Select value={globalStatusFilter} onValueChange={setGlobalStatusFilter}>
                      <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                        <SelectItem value="completado">Completado</SelectItem>
                        <SelectItem value="planificado">Planificado</SelectItem>
                        <SelectItem value="en_riesgo">En Riesgo</SelectItem>
                        <SelectItem value="retrasado">Retraso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">Área</label>
                    <Select value={globalAreaFilter} onValueChange={setGlobalAreaFilter}>
                      <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas las Áreas</SelectItem>
                        {uniqueAreas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">Eje Institucional</label>
                    <Select value={globalEjeFilter} onValueChange={setGlobalEjeFilter}>
                      <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los Ejes</SelectItem>
                        {uniqueEjes.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">Multianualidad</label>
                    <Select value={globalMultianualidadFilter} onValueChange={setGlobalMultianualidadFilter}>
                      <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="si">Solo Multianuales</SelectItem>
                        <SelectItem value="no">Solo Anuales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {upcomingProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {upcomingProjects.map((project) => {
                    // Lógica mejorada de fecha estimada de finalización
                    const now = new Date();
                    let estimatedEndDate: Date | null = null;
                    let isDelayed = false;
                    
                    // Si ya está completado, usar fecha real
                    if (project.status === 'completado' && project.fecha_termino_real) {
                      estimatedEndDate = new Date(project.fecha_termino_real);
                    }
                    // Si está en ejecución, estimar basado en avance y duración
                    else if (project.fecha_inicio_prog && project.fecha_termino_prog) {
                      const startDate = new Date(project.fecha_inicio_prog);
                      const plannedEndDate = new Date(project.fecha_termino_prog);
                      const totalDuration = plannedEndDate.getTime() - startDate.getTime();
                      const avance = project.avance_fisico_pct || 0;
                      
                      // Si el avance es bajo y ya pasó mucho tiempo, ajustar fecha
                      const elapsedTime = now.getTime() - startDate.getTime();
                      const expectedProgress = (elapsedTime / totalDuration) * 100;
                      
                      // Si el avance real es menor al esperado, estimar retraso
                      if (avance < expectedProgress && avance > 0) {
                        const progressRate = avance / expectedProgress;
                        const adjustedDuration = totalDuration / progressRate;
                        estimatedEndDate = new Date(startDate.getTime() + adjustedDuration);
                        isDelayed = estimatedEndDate > plannedEndDate;
                      } else {
                        estimatedEndDate = plannedEndDate;
                      }
                      
                      // Ajustar por estado
                      if (project.status === 'retrasado' || project.status === 'en_riesgo') {
                        // Agregar 20% más de tiempo si está retrasado/en riesgo
                        const buffer = totalDuration * 0.2;
                        estimatedEndDate = new Date(estimatedEndDate.getTime() + buffer);
                        isDelayed = true;
                      }
                    }
                    // Fallback: usar fecha_termino_prog directamente si no hay inicio
                    else if (project.fecha_termino_prog) {
                      estimatedEndDate = new Date(project.fecha_termino_prog);
                    }
                    // Último fallback: usar fecha_termino_real si existe
                    else if (project.fecha_termino_real) {
                      estimatedEndDate = new Date(project.fecha_termino_real);
                    }
                    
                    const diffDays = estimatedEndDate && !isNaN(estimatedEndDate.getTime()) 
                      ? Math.ceil((estimatedEndDate.getTime() - now.getTime()) / 86400000) 
                      : 0;
                    
                    // Urgencia considerando retrasos
                    const urgency = isDelayed || diffDays <= 30 ? 'high' : diffDays <= 60 ? 'medium' : 'low';
                    
                    return (
                      <div 
                        key={project.id} 
                        className={cn(
                          "p-4 rounded-lg border shadow-sm transition-all hover:shadow-md",
                          urgency === 'high' && "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50",
                          urgency === 'medium' && "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900/50",
                          urgency === 'low' && "bg-card"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-[10px] uppercase bg-background/50">
                              {project.status?.replace('_', ' ') || 'Sin estado'}
                            </Badge>
                            {isDelayed && (
                              <Badge variant="destructive" className="text-[10px]">
                                Retraso estimado
                              </Badge>
                            )}
                            {project.multianualidad?.toLowerCase() === 'si' && (
                              <Badge variant="outline" className="text-[10px] border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/20">
                                Multianual
                              </Badge>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs font-bold",
                            urgency === 'high' ? "text-red-600 dark:text-red-400" : 
                            urgency === 'medium' ? "text-yellow-600 dark:text-yellow-400" : 
                            "text-muted-foreground"
                          )}>
                            {diffDays > 0 ? `${diffDays}d` : diffDays === 0 ? 'Hoy' : `${Math.abs(diffDays)}d atrás`}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2 mb-1" title={project.programa}>
                          {project.programa}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3 truncate">{project.area_responsable}</p>
                        <div className="flex items-center gap-2">
                           <Progress value={project.avance_fisico_pct || 0} className="h-1.5 flex-1" />
                           <span className="text-[10px] font-medium text-muted-foreground">{project.avance_fisico_pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No hay entregas próximas en el rango seleccionado.
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- SECCIÓN 1.5: PROYECTOS ATRASADOS --- */}
          {overdueProjects.length > 0 && (
            <Card className="animate-slide-up border-destructive/40" style={{ animationDelay: '50ms' }}>
              <CardHeader className="bg-destructive/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    Proyectos Atrasados
                    <Badge variant="destructive" className="ml-2">{overdueProjects.length}</Badge>
                  </CardTitle>
                </div>
                <CardDescription className="text-destructive/80">
                  Proyectos que superaron su fecha programada de término sin completarse
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {overdueProjects.map((project) => {
                    const plannedEndDate = project.fecha_termino_prog ? new Date(project.fecha_termino_prog) : null;
                    const daysOverdue = plannedEndDate ? Math.floor((now.getTime() - plannedEndDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (
                      <div 
                        key={project.id} 
                        className="bg-destructive/5 hover:bg-destructive/10 transition-colors border-l-4 border-destructive p-4 rounded-lg space-y-2 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                            {daysOverdue} días atrasado
                          </Badge>
                          {project.multianualidad?.toLowerCase() === 'si' && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-purple-500 text-purple-700">
                              Multianual
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2 mb-1" title={project.programa}>
                          {project.programa}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3 truncate">{project.area_responsable}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Progress value={project.avance_fisico_pct || 0} className="h-1.5 flex-1" />
                            <span className="text-[10px] font-medium text-muted-foreground">{project.avance_fisico_pct}%</span>
                          </div>
                          <p className="text-[10px] text-destructive">
                            Debía terminar: {plannedEndDate?.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* --- SECCIÓN 2: LÍNEA DE TIEMPO (GANTT) --- */}
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Línea de Tiempo {currentYear}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={timelineAreaFilter} onValueChange={setTimelineAreaFilter}>
                    <SelectTrigger className="w-[140px] text-xs h-8"><SelectValue placeholder="Área" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las Áreas</SelectItem>
                      {uniqueAreas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  
                  <Select value={timelineStatusFilter} onValueChange={setTimelineStatusFilter}>
                    <SelectTrigger className="w-[140px] text-xs h-8"><SelectValue placeholder="Estado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="retrasado">Retrasado</SelectItem>
                      <SelectItem value="en_riesgo">En Riesgo</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={itemsPerPage} onValueChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[70px] text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[800px]">
                  <div className="flex border-b border-border pb-2 mb-4">
                    <div className="w-64 shrink-0 px-2 font-medium text-sm text-muted-foreground">Proyecto</div>
                    <div className="flex-1 flex">
                      {months.map(m => (
                        <div key={m} className="flex-1 text-center text-xs text-muted-foreground font-medium">{m}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {paginatedTimelineProjects.map(p => {
                      const start = p.fecha_inicio_prog ? new Date(p.fecha_inicio_prog) : null;
                      const end = p.fecha_termino_real ? new Date(p.fecha_termino_real) : (p.fecha_termino_prog ? new Date(p.fecha_termino_prog) : null);
                      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return null;
                      
                      const startMonth = start.getFullYear() < currentYear ? 0 : start.getMonth();
                      const endMonth = end.getFullYear() > currentYear ? 11 : end.getMonth();
                      const left = (startMonth / 12) * 100;
                      const width = Math.max(((endMonth - startMonth + 1) / 12) * 100, 2);
                      
                      const statusColors: Record<string, string> = {
                        en_ejecucion: 'bg-blue-500',
                        completado: 'bg-green-500',
                        retrasado: 'bg-yellow-500',
                        en_riesgo: 'bg-red-500',
                        planificado: 'bg-gray-400'
                      };
                      const color = statusColors[p.status || ''] || 'bg-gray-300';
                      
                      return (
                        <div key={p.id} className="flex items-center hover:bg-muted/30 py-1.5 rounded transition-colors">
                          <div className="w-64 shrink-0 px-2 pr-4">
                            <p className="text-sm font-medium truncate text-foreground" title={p.programa}>{p.programa}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{p.area_responsable}</p>
                          </div>
                          <div className="flex-1 relative h-6">
                            <div className="absolute inset-0 flex">
                              {months.map((_, i) => (
                                <div key={i} className={cn("flex-1 border-r border-border/40", i === now.getMonth() && "bg-primary/5")} />
                              ))}
                            </div>
                            <div 
                              className={cn("absolute top-1.5 h-3 rounded-full shadow-sm opacity-90", color)}
                              style={{ left: `${left}%`, width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {itemsPerPage !== 'todos' && (timelineData?.count || 0) > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Mostrando {paginatedTimelineProjects.length} de {timelineData?.count || 0}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- SECCIÓN 3: HITOS IMPORTANTES --- */}
          <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Hitos Importantes del Año
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={milestoneAreaFilter} onValueChange={setMilestoneAreaFilter}>
                    <SelectTrigger className="w-[130px] text-xs h-8"><SelectValue placeholder="Área" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las Áreas</SelectItem>
                      {uniqueAreas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  
                  <Select value={milestoneStatusFilter} onValueChange={setMilestoneStatusFilter}>
                    <SelectTrigger className="w-[130px] text-xs h-8"><SelectValue placeholder="Estado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="en_riesgo">En Riesgo</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={milestoneScoreFilter} onValueChange={setMilestoneScoreFilter}>
                    <SelectTrigger className="w-[130px] text-xs h-8"><SelectValue placeholder="Prioridad" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                      <SelectItem value="muy_alta">Muy Alta</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredMilestones.length > 0 ? (
                    filteredMilestones.map((project) => {
                      const statusColor = project.status === 'completado' 
                        ? 'bg-green-500' 
                        : project.status === 'en_riesgo' 
                        ? 'bg-red-500' 
                        : 'bg-blue-500';
                      
                      return (
                        <div
                          key={project.id}
                          className="relative pl-10 cursor-pointer group"
                          onClick={() => setSelectedMilestone(project)}
                        >
                          <div className={cn(
                            "absolute left-[13px] top-4 w-2.5 h-2.5 rounded-full border border-background z-10 ring-2 ring-background",
                            statusColor
                          )} />
                          
                          <div className="border border-border/60 bg-card rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div className="min-w-0">
                                <h4 className="text-sm font-semibold line-clamp-1 text-foreground">{project.programa}</h4>
                                <p className="text-xs text-muted-foreground truncate">{project.area_responsable}</p>
                              </div>
                              <Badge variant="secondary" className="text-[10px] shrink-0 font-normal">
                                Score: {project.puntuacion_final_ponderada?.toFixed(1) || 'N/A'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic border-l-2 border-primary/20 pl-2">
                              "{project.hitos_comunicacionales}"
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/70">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{project.ubicacion_especifica || 'Ubicación no especificada'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm pl-8">
                      No se encontraron hitos con los filtros seleccionados
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* --- MODAL DETALLE --- */}
          <Dialog open={!!selectedMilestone} onOpenChange={(open) => !open && setSelectedMilestone(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedMilestone && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl">{selectedMilestone.programa}</DialogTitle>
                    <DialogDescription className="flex items-center gap-1.5 text-xs md:text-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedMilestone.area_responsable} • {selectedMilestone.ubicacion_especifica || "Sin ubicación"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-2">
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-primary">
                        <CheckCircle className="h-4 w-4" />
                        Hito Comunicacional
                      </h4>
                      <p className="text-sm italic text-foreground/90">
                        "{selectedMilestone.hitos_comunicacionales}"
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          Objetivo
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedMilestone.problema_resuelve || "No hay información disponible"}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Observaciones
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedMilestone.observaciones || "Sin observaciones"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-xs text-muted-foreground">Score Ponderado</span>
                        <p className="text-lg font-bold text-foreground">{selectedMilestone.puntuacion_final_ponderada || 0}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Avance Físico</span>
                        <div className="flex items-center gap-2 justify-end">
                          <Progress value={selectedMilestone.avance_fisico_pct || 0} className="w-24 h-2" />
                          <span className="text-sm font-medium text-foreground">{selectedMilestone.avance_fisico_pct || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}