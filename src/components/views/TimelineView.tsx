import { getStatusLabel, formatCurrency } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, CheckCircle, AlertTriangle, Filter, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { Project } from '@/types';

const months = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

/**
 * Parsea fechas flexibles incluyendo parciales (solo mes/año).
 * Soporta:
 * - Fechas completas: "28 de noviembre de 2025", "2025-11-28"
 * - Fechas parciales: "abril 2026", "mayo 2026", "agosto 2026"
 * - Fechas ISO: "2026-04-01T00:00:00"
 * Si solo tiene mes/año, asigna día 1 automáticamente.
 */
function parseFlexibleDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  try {
    // Intentar parsing directo primero (ISO, formatos estándar)
    const directParse = new Date(dateStr);
    if (!isNaN(directParse.getTime())) {
      return directParse;
    }

    // Detectar formato "mes año" (ej: "abril 2026", "mayo 2026")
    const mesesEs: Record<string, number> = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
      'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
      'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };

    const mesAnioRegex = /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{4})/i;
    const match = dateStr.toLowerCase().match(mesAnioRegex);
    
    if (match) {
      const mes = mesesEs[match[1].toLowerCase()];
      const anio = parseInt(match[2]);
      return new Date(anio, mes, 1); // Día 1 del mes
    }

    // Formato "DD de mes de YYYY" (ej: "28 de noviembre de 2025")
    const formatoLargoRegex = /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i;
    const matchLargo = dateStr.toLowerCase().match(formatoLargoRegex);
    
    if (matchLargo) {
      const dia = parseInt(matchLargo[1]);
      const mes = mesesEs[matchLargo[2].toLowerCase()];
      const anio = parseInt(matchLargo[3]);
      return new Date(anio, mes, dia);
    }

    // Si todo falla, retornar null
    return null;
  } catch (error) {
    console.warn('Error parseando fecha:', dateStr, error);
    return null;
  }
}

/**
 * Obtiene la fecha de término efectiva del proyecto:
 * - Si está completado: usa fecha_termino_real (fecha real de finalización)
 * - Si está en ejecución: usa fecha_termino_prog (fecha estimada)
 * Permite identificar desviaciones temporales y ajustar expectativas de entrega.
 */
function getEffectiveEndDate(project: any): Date | null {
  // Si el proyecto está completado y tiene fecha real, úsala
  if (project.status === 'completado' && project.fecha_termino_real) {
    const realDate = parseFlexibleDate(project.fecha_termino_real);
    if (realDate) return realDate;
  }
  
  // Para proyectos en ejecución, planificados o con retrasos, usa fecha programada/estimada
  // Prioridad: fecha_termino_prog > fechaFin (fallback para compatibilidad)
  if (project.fecha_termino_prog) {
    const progDate = parseFlexibleDate(project.fecha_termino_prog);
    if (progDate) return progDate;
  }
  
  if (project.fechaFin) {
    const finDate = parseFlexibleDate(project.fechaFin);
    if (finDate) return finDate;
  }
  
  // Si no hay ninguna fecha válida, retornar null
  return null;
}

/**
 * Calcula la duración del proyecto en meses.
 * Usa duracion_meses si está disponible, sino calcula entre fechas.
 * Soporta duraciones decimales (ej: 11.5 meses).
 */
function getProjectDuration(project: any): number | null {
  // Prioridad 1: Usar duracion_meses si está disponible (puede ser decimal)
  if (project.duracion_meses !== null && project.duracion_meses !== undefined) {
    return Number(project.duracion_meses);
  }
  
  // Prioridad 2: Calcular entre fecha inicio y término programadas
  const startDate = parseFlexibleDate(project.fecha_inicio_prog || project.fechaInicio);
  const endDate = parseFlexibleDate(project.fecha_termino_prog || project.fechaFin);
  
  if (!startDate || !endDate) {
    return null; // No se puede calcular sin fechas válidas
  }
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = diffDays / 30.44; // Promedio de días por mes
  
  // Redondear a 1 decimal para mostrar duraciones como 11.5 meses
  return Math.round(months * 10) / 10;
}

/**
 * Calcula la desviación temporal (días de retraso o adelanto).
 * Positivo = retraso, Negativo = adelanto, 0 = a tiempo
 */
function getTemporalDeviation(project: any): number | null {
  if (!project.fecha_termino_real || !project.fecha_termino_prog) {
    return null;
  }
  
  const realDate = parseFlexibleDate(project.fecha_termino_real);
  const progDate = parseFlexibleDate(project.fecha_termino_prog);
  
  if (!realDate || !progDate) {
    return null;
  }
  
  const diffTime = realDate.getTime() - progDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function TimelineView() {
  // Obtener datos reales de la API
  const { projects, loading, error } = useDashboardData();
  
  // Filter states
  const [timeRange, setTimeRange] = useState<'3' | '6' | '9' | '12+'>('6');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [executionOnly, setExecutionOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state for milestones
  const [selectedMilestone, setSelectedMilestone] = useState<Project | null>(null);

  // Get unique areas
  const uniqueAreas = useMemo(() => 
    Array.from(new Set(projects.map(p => p.direccion))).sort(),
    [projects]
  );

  // Calculate days threshold based on time range
  const daysThreshold = useMemo(() => {
    switch (timeRange) {
      case '3': return 90;
      case '6': return 180;
      case '9': return 270;
      case '12+': return 365;
    }
  }, [timeRange]);

  // Filter projects based on all criteria
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Execution status filter
      if (executionOnly && p.status !== 'en_ejecucion') return false;
      
      // Area filter
      if (selectedAreas.length > 0 && !selectedAreas.includes(p.direccion)) return false;
      
      return true;
    });
  }, [projects, executionOnly, selectedAreas]);

  // Sort projects by effective end date (real or estimated)
  const sortedProjects = useMemo(() => 
    [...filteredProjects].sort((a, b) => {
      const dateA = getEffectiveEndDate(a);
      const dateB = getEffectiveEndDate(b);
      
      // Proyectos sin fecha van al final
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return dateA.getTime() - dateB.getTime();
    }),
    [filteredProjects]
  );

  // Upcoming deadlines based on selected time range
  const now = new Date();
  const upcomingDeadlines = useMemo(() => {
    console.log('=== ANÁLISIS DE PROYECTOS ===');
    console.log('Fecha actual:', now.toISOString());
    console.log('Threshold:', daysThreshold, 'dias');
    console.log('Total proyectos a analizar:', sortedProjects.length);
    
    // Analizar TODOS los proyectos para ver qué fechas tienen
    sortedProjects.slice(0, 5).forEach(p => {
      console.log('Proyecto:', p.nombre, {
        fecha_termino_prog: p.fecha_termino_prog,
        fecha_termino_real: p.fecha_termino_real,
        fechaFin: p.fechaFin,
        status: p.status
      });
    });
    
    const deadlines = sortedProjects.filter(project => {
      const endDate = getEffectiveEndDate(project);
      
      // Excluir proyectos sin fecha válida
      if (!endDate) {
        return false;
      }
      
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isInRange = diffDays > 0 && diffDays <= daysThreshold && project.status !== 'completado';
      
      // Log de todos los proyectos con fechas para debug
      if (diffDays > 0 && diffDays <= 400) {
        console.log('Proyecto analizado:', {
          nombre: project.nombre,
          endDate: endDate.toLocaleDateString('es-MX'),
          diffDays,
          status: project.status,
          isInRange,
          razon: !isInRange ? (diffDays <= 0 ? 'fecha pasada' : diffDays > daysThreshold ? 'fuera de rango' : 'completado') : 'OK'
        });
      }
      
      return isInRange;
    });
    
    console.log('Total deadlines encontrados:', deadlines.length);
    
    return deadlines;
  }, [sortedProjects, daysThreshold]);

  const currentYear = 2024;

  // Active filters count
  const activeFiltersCount = selectedAreas.length + (executionOnly ? 0 : 1);

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

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground">Cargando proyectos...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-danger mx-auto mb-2" />
              <p className="text-danger font-medium">Error al cargar proyectos</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content - only show when not loading */}
      {!loading && !error && (
      <>
      {/* Upcoming Deadlines with Filters */}
      <Card className="animate-slide-up">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Próximas Entregas
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Time Range Selector */}
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                <SelectTrigger className="w-[140px] sm:w-[160px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="9">9 meses</SelectItem>
                  <SelectItem value="12+">1+ años</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Filter Toggle */}
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-3 sm:p-4 bg-muted/30 rounded-lg space-y-4 animate-slide-down">
              <div className="space-y-3">
                {/* Area Filter */}
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 block text-foreground">Áreas ({selectedAreas.length} seleccionadas)</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {uniqueAreas.map(area => {
                      const isSelected = selectedAreas.includes(area);
                      return (
                        <button
                          key={area}
                          onClick={() => {
                            setSelectedAreas(prev => 
                              prev.includes(area) 
                                ? prev.filter(a => a !== area)
                                : [...prev, area]
                            );
                          }}
                          className={cn(
                            "px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all",
                            "hover:scale-105 active:scale-95",
                            isSelected 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          )}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Status Filter */}
                <div className="pt-2 border-t border-border/50">
                  <label className="text-xs sm:text-sm font-medium mb-2 block text-foreground">Estado</label>
                  <button
                    onClick={() => setExecutionOnly(!executionOnly)}
                    className={cn(
                      "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all w-full sm:w-auto",
                      "hover:scale-[1.02] active:scale-95",
                      executionOnly
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {executionOnly && <CheckCircle className="h-3.5 w-3.5" />}
                      Solo en ejecución
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="pt-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAreas([]);
                      setExecutionOnly(false);
                    }}
                    className="w-full sm:w-auto text-xs gap-1.5 hover:bg-danger/10 hover:text-danger"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpiar {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-3 sm:p-4 md:p-6">
          {upcomingDeadlines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {upcomingDeadlines.map((project, index) => {
                const endDate = getEffectiveEndDate(project);
                
                // Si no hay fecha, no mostrar (ya filtrado arriba, pero por seguridad)
                if (!endDate) return null;
                
                const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const urgency = diffDays <= 30 ? 'high' : diffDays <= 60 ? 'medium' : 'low';
                const duration = getProjectDuration(project);
                const deviation = getTemporalDeviation(project);
                const isRealDate = project.status === 'completado' && project.fecha_termino_real;
                const isEstimatedDate = project.status !== 'completado';

                return (
                  <div 
                    key={project.id} 
                    className={cn(
                      "p-3 sm:p-4 bg-card rounded-lg border shadow-sm",
                      "hover:shadow-md transition-all duration-200 animate-slide-up",
                      urgency === 'high' && "border-danger/50 bg-danger/5",
                      urgency === 'medium' && "border-warning/50 bg-warning/5",
                      urgency === 'low' && "border-info/50"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                        <div className="flex items-start gap-2 sm:gap-3 mb-3">
                          <div className={cn(
                            "p-1.5 sm:p-2 rounded-lg shrink-0",
                            urgency === 'high' && "bg-danger/10 text-danger",
                            urgency === 'medium' && "bg-warning/10 text-warning",
                            urgency === 'low' && "bg-info/10 text-info"
                          )}>
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 leading-tight">{project.nombre}</h4>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{project.direccion}</p>
                          </div>
                          <Badge 
                            variant={urgency === 'high' ? 'danger' : urgency === 'medium' ? 'warning' : 'info'}
                            className="shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1"
                          >
                            {diffDays}d
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] sm:text-xs">
                            <span className="text-muted-foreground">Avance</span>
                            <span className="font-semibold">{project.avance}%</span>
                          </div>
                          <Progress value={project.avance} className="h-1.5 sm:h-2" />
                          
                          <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1">
                            <span className="text-muted-foreground truncate">
                              {isRealDate ? 'Término real' : 'Estimado'}
                            </span>
                            <span className="font-medium">{endDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                          </div>
                          
                          {duration !== null && (
                            <div className="flex items-center justify-between text-[10px] sm:text-xs">
                              <span className="text-muted-foreground">Duración</span>
                              <span className="font-medium">
                                {duration % 1 === 0 ? duration : duration.toFixed(1)} {duration === 1 ? 'mes' : 'meses'}
                              </span>
                            </div>
                          )}
                          
                          {deviation !== null && (
                            <div className="flex items-center justify-between text-[10px] sm:text-xs">
                              <span className="text-muted-foreground">Desviación</span>
                              <span className={cn(
                                "font-medium",
                                deviation > 0 && "text-danger",
                                deviation < 0 && "text-success",
                                deviation === 0 && "text-muted-foreground"
                              )}>
                                {deviation > 0 ? '+' : ''}{deviation} días
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {project.avance < 50 && diffDays <= 60 && (
                          <div className="flex items-center gap-1.5 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border text-[10px] sm:text-xs text-warning">
                            <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                            <span className="font-medium">Requiere atención</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
          ) : (
            <div className="text-center py-12 px-4">
              <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground font-medium">
                No hay entregas programadas en los próximos {timeRange === '12+' ? '12+' : timeRange} meses
              </p>
              {selectedAreas.length > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground/70 mt-2">
                  para las áreas seleccionadas
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gantt-style Timeline 2026 */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Línea de Tiempo 2026
            </CardTitle>
            
            {/* Filtros para Timeline */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro por áreas */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Toggle areas selector
                  }}
                  className="gap-2"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Áreas
                  {selectedAreas.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                      {selectedAreas.length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Filtro por estado */}
              <Select value={executionOnly ? 'ejecucion' : 'todos'} onValueChange={(val) => setExecutionOnly(val === 'ejecucion')}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ejecucion">En Ejecución</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por viabilidad */}
              <Select defaultValue="todos">
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Viabilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  // Usar parseFlexibleDate para manejar fechas parciales
                  const startDate = parseFlexibleDate(project.fecha_inicio_prog || project.fechaInicio);
                  const endDate = getEffectiveEndDate(project);
                  
                  // Si no hay fechas válidas, skip este proyecto en el Gantt
                  if (!startDate || !endDate) {
                    return null;
                  }
                  
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

      {/* Milestones - Hitos Comunicacionales */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Hitos Importantes del Año
            </CardTitle>
            
            {/* Filtros para Hitos */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro por áreas */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Filter className="h-3.5 w-3.5" />
                Áreas
                {selectedAreas.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                    {selectedAreas.length}
                  </Badge>
                )}
              </Button>

              {/* Filtro por puntuación ponderada */}
              <Select defaultValue="todos">
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Puntuación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="alta">Alta (≥80)</SelectItem>
                  <SelectItem value="media">Media (50-79)</SelectItem>
                  <SelectItem value="baja">Baja (&lt;50)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {filteredProjects
                .filter(p => p.hitos_comunicacionales && p.hitos_comunicacionales.trim() !== '')
                .map((project, index) => {
                  // Determinar estado basado en el status del proyecto
                  const statusBadge = project.status === 'completado' ? 'completed' : 
                                     project.status === 'en_riesgo' ? 'at_risk' : 'upcoming';
                  
                  return (
                    <div 
                      key={project.id} 
                      className="relative pl-10 animate-fade-in cursor-pointer hover:bg-muted/20 rounded-lg p-2 -ml-2 transition-colors"
                      style={{ animationDelay: `${250 + index * 50}ms` }}
                      onClick={() => setSelectedMilestone(project)}
                    >
                      <div className={cn(
                        "absolute left-2.5 w-3 h-3 rounded-full border-2 border-card",
                        statusBadge === 'completed' && "bg-success",
                        statusBadge === 'upcoming' && "bg-info",
                        statusBadge === 'at_risk' && "bg-danger",
                      )} />
                      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium line-clamp-1">{project.nombre}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{project.direccion}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge 
                              variant={statusBadge === 'completed' ? 'success' : statusBadge === 'at_risk' ? 'danger' : 'info'}
                              className="text-xs"
                            >
                              {statusBadge === 'completed' ? 'Completado' : statusBadge === 'at_risk' ? 'En riesgo' : 'Próximo'}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Info className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {project.fecha_inicio_prog && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(project.fecha_inicio_prog).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          )}
                          {project.responsable && (
                            <div className="truncate">
                              Resp: {project.responsable}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {project.hitos_comunicacionales}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal para detalles del hito */}
      <Dialog open={!!selectedMilestone} onOpenChange={(open) => !open && setSelectedMilestone(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedMilestone && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selectedMilestone.nombre}</DialogTitle>
                <DialogDescription className="text-sm">
                  {selectedMilestone.direccion}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Objetivo */}
                {selectedMilestone.objetivo && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1 text-foreground">Objetivo del Proyecto</h4>
                    <p className="text-sm text-muted-foreground">{selectedMilestone.objetivo}</p>
                  </div>
                )}
                
                {/* Hito Comunicacional */}
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-foreground">Hito Comunicacional</h4>
                  <p className="text-sm text-muted-foreground">{selectedMilestone.hitos_comunicacionales}</p>
                </div>
                
                {/* Responsable */}
                {selectedMilestone.responsable && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1 text-foreground">Responsable</h4>
                    <p className="text-sm text-muted-foreground">{selectedMilestone.responsable}</p>
                  </div>
                )}
                
                {/* Información adicional */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {selectedMilestone.fecha_inicio_prog && (
                    <div>
                      <span className="text-xs text-muted-foreground">Fecha Inicio</span>
                      <p className="text-sm font-medium">
                        {new Date(selectedMilestone.fecha_inicio_prog).toLocaleDateString('es-MX', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-xs text-muted-foreground">Estado</span>
                    <p className="text-sm font-medium capitalize">{selectedMilestone.status.replace('_', ' ')}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground">Avance</span>
                    <p className="text-sm font-medium">{selectedMilestone.avance}%</p>
                  </div>
                  
                  {selectedMilestone.puntuacion_final_ponderada && (
                    <div>
                      <span className="text-xs text-muted-foreground">Puntuación</span>
                      <p className="text-sm font-medium">{selectedMilestone.puntuacion_final_ponderada.toFixed(1)}</p>
                    </div>
                  )}
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
