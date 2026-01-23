import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, CheckCircle, Filter, ChevronLeft, ChevronRight, MapPin, Target, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { Project } from '@/types';

const months = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// --- Funciones de Ayuda (Fechas Robustas) ---

function parseFlexibleDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // 1. Intento ISO directo
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) return isoDate;
    
    // 2. Mapeo de meses en español
    const mesesEs: Record<string, number> = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
      'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
      'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11,
      'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
    };
    
    const lowerStr = dateStr.toLowerCase();

    // 3. Formato largo: "1 de enero de 2024"
    const formatoLargoRegex = /(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/;
    const matchLargo = lowerStr.match(formatoLargoRegex);
    if (matchLargo) {
      const [, day, month, year] = matchLargo;
      if (mesesEs[month] !== undefined) {
        return new Date(parseInt(year), mesesEs[month], parseInt(day));
      }
    }
    
    // 4. Formato corto: "Enero 2024" o "Ene 2024"
    const mesAnioRegex = /([a-z]+)\s+(\d{4})/;
    const match = lowerStr.match(mesAnioRegex);
    if (match) {
      const [, month, year] = match;
      if (mesesEs[month] !== undefined) {
        return new Date(parseInt(year), mesesEs[month], 1);
      }
    }
    
    return null;
  } catch (e) {
    console.warn('Error parseando fecha:', dateStr);
    return null;
  }
}

function getEffectiveEndDate(project: Project): Date | null {
  // Prioridad: Real > Programada > FechaFin genérica
  const candidates = [
    project.fecha_termino_real,
    project.fecha_termino_prog,
    project.fechaFin
  ];

  for (const dateStr of candidates) {
    const parsed = parseFlexibleDate(dateStr);
    if (parsed) return parsed;
  }
  return null;
}

// --- Componente Principal ---

export function TimelineView() {
  const { projects, loading, error } = useDashboardData();
  const now = new Date();
  const currentYear = 2026;

  // Estados de Filtros y Paginación
  const [timeRange, setTimeRange] = useState<'3' | '6' | '9' | '12+'>('3');
  const [showFilters, setShowFilters] = useState(false);
  
  const [globalAreaFilter, setGlobalAreaFilter] = useState<string[]>([]);
  const [globalStatusFilter, setGlobalStatusFilter] = useState<string>('todos');
  
  const [timelineAreaFilter, setTimelineAreaFilter] = useState<string>('todos');
  const [timelineStatusFilter, setTimelineStatusFilter] = useState<string>('todos');
  const [itemsPerPage, setItemsPerPage] = useState<string>('5');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [milestoneAreaFilter, setMilestoneAreaFilter] = useState<string>('todos');
  const [milestoneStatusFilter, setMilestoneStatusFilter] = useState<string>('todos');
  const [milestoneScoreFilter, setMilestoneScoreFilter] = useState<string>('todos');
  
  const [selectedMilestone, setSelectedMilestone] = useState<Project | null>(null);

  // Áreas únicas (Memoizado)
  const uniqueAreas = useMemo(() => {
    const areas = new Set<string>();
    projects.forEach(p => { if (p.direccion) areas.add(p.direccion); });
    return Array.from(areas).sort();
  }, [projects]);

  // --- Lógica 1: Próximas Entregas ---
  const daysThreshold = useMemo(() => {
    switch (timeRange) {
      case '3': return 90;
      case '6': return 180;
      case '9': return 270;
      case '12+': return 9999;
      default: return 90;
    }
  }, [timeRange]);

  const upcomingProjects = useMemo(() => {
    return projects
      .filter(p => {
        if (globalStatusFilter !== 'todos' && p.status !== globalStatusFilter) return false;
        if (globalAreaFilter.length > 0 && !globalAreaFilter.includes(p.direccion || '')) return false;
        
        const endDate = getEffectiveEndDate(p);
        if (!endDate) return false;
        
        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        // Filtrar solo proyectos futuros dentro del rango
        return diffDays > 0 && diffDays <= daysThreshold;
      })
      .sort((a, b) => {
        const dateA = getEffectiveEndDate(a)?.getTime() || 0;
        const dateB = getEffectiveEndDate(b)?.getTime() || 0;
        return dateA - dateB;
      });
  }, [projects, globalStatusFilter, globalAreaFilter, daysThreshold]);

  // --- Lógica 2: Línea de Tiempo (Gantt) ---
  const timelineProjects = useMemo(() => {
    return projects.filter(p => {
      if (timelineStatusFilter !== 'todos' && p.status !== timelineStatusFilter) return false;
      if (timelineAreaFilter !== 'todos' && p.direccion !== timelineAreaFilter) return false;
      
      const start = parseFlexibleDate(p.fecha_inicio_prog || p.fechaInicio);
      const end = getEffectiveEndDate(p);
      
      if (!start || !end) return false;
      // Intersección con el año objetivo
      return start.getFullYear() <= currentYear && end.getFullYear() >= currentYear;
    }).sort((a, b) => {
      const dateA = parseFlexibleDate(a.fecha_inicio_prog || a.fechaInicio)?.getTime() || 0;
      const dateB = parseFlexibleDate(b.fecha_inicio_prog || b.fechaInicio)?.getTime() || 0;
      return dateA - dateB;
    });
  }, [projects, timelineStatusFilter, timelineAreaFilter, currentYear]);

  const totalPages = itemsPerPage === 'todos' ? 1 : Math.ceil(timelineProjects.length / parseInt(itemsPerPage));
  const paginatedTimelineProjects = useMemo(() => {
    if (itemsPerPage === 'todos') return timelineProjects;
    const start = (currentPage - 1) * parseInt(itemsPerPage);
    return timelineProjects.slice(start, start + parseInt(itemsPerPage));
  }, [timelineProjects, itemsPerPage, currentPage]);

  // --- Lógica 3: Hitos Importantes ---
  const filteredMilestones = useMemo(() => {
    return projects.filter(p => {
      if (!p.hitos_comunicacionales || p.hitos_comunicacionales.trim() === '') return false;
      if (milestoneAreaFilter !== 'todos' && p.direccion !== milestoneAreaFilter) return false;
      if (milestoneStatusFilter !== 'todos' && p.status !== milestoneStatusFilter) return false;
      
      if (milestoneScoreFilter !== 'todos') {
        const score = p.puntuacion_final_ponderada || 0;
        switch (milestoneScoreFilter) {
          case 'critica': return score >= 4.5;
          case 'muy_alta': return score >= 3.5 && score < 4.5;
          case 'alta': return score >= 2.5 && score < 3.5;
          case 'media': return score >= 1.5 && score < 2.5;
          case 'baja': return score < 1.5;
          default: return true;
        }
      }
      return true;
    });
  }, [projects, milestoneAreaFilter, milestoneStatusFilter, milestoneScoreFilter]);

  if (error) {
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

      {loading && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              <p>Cargando información...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
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
                <div className="mt-4 p-4 bg-muted/40 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-down">
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
                    <label className="text-sm font-medium mb-2 block text-foreground">Áreas</label>
                    <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto p-1">
                      {uniqueAreas.map(area => (
                        <button
                          key={area}
                          onClick={() => setGlobalAreaFilter(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                            globalAreaFilter.includes(area)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:bg-muted"
                          )}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {upcomingProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {upcomingProjects.map((project) => {
                    const endDate = getEffectiveEndDate(project);
                    const diffDays = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / 86400000) : 0;
                    const urgency = diffDays <= 30 ? 'high' : diffDays <= 60 ? 'medium' : 'low';
                    
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
                          <Badge variant="outline" className="text-[10px] uppercase bg-background/50">
                            {project.status?.replace('_', ' ') || 'Sin estado'}
                          </Badge>
                          <span className={cn(
                            "text-xs font-bold",
                            urgency === 'high' ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                          )}>
                            {diffDays}d
                          </span>
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2 mb-1" title={project.nombre}>
                          {project.nombre}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3 truncate">{project.direccion}</p>
                        <div className="flex items-center gap-2">
                           <Progress value={project.avance || 0} className="h-1.5 flex-1" />
                           <span className="text-[10px] font-medium text-muted-foreground">{project.avance}%</span>
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
                      const start = parseFlexibleDate(p.fecha_inicio_prog || p.fechaInicio);
                      const end = getEffectiveEndDate(p);
                      if (!start || !end) return null;
                      
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
                            <p className="text-sm font-medium truncate text-foreground" title={p.nombre}>{p.nombre}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{p.direccion}</p>
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
              
              {itemsPerPage !== 'todos' && timelineProjects.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Mostrando {paginatedTimelineProjects.length} de {timelineProjects.length}
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
                                <h4 className="text-sm font-semibold line-clamp-1 text-foreground">{project.nombre}</h4>
                                <p className="text-xs text-muted-foreground truncate">{project.direccion}</p>
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
                              <span className="truncate">{project.alcaldias || 'Ubicación no especificada'}</span>
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
                    <DialogTitle className="text-lg md:text-xl">{selectedMilestone.nombre}</DialogTitle>
                    <DialogDescription className="flex items-center gap-1.5 text-xs md:text-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedMilestone.direccion} • {selectedMilestone.alcaldias || "Sin alcaldía"}
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
                          <Progress value={selectedMilestone.avance || 0} className="w-24 h-2" />
                          <span className="text-sm font-medium text-foreground">{selectedMilestone.avance || 0}%</span>
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