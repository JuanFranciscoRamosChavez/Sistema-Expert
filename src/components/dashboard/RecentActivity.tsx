import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RefreshCcw, TrendingUp, Clock } from "lucide-react";
import { STATUS_COLORS } from "@/lib/theme";
import { H3, Subtitle } from "@/components/ui/typography";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Componente de Actividad Reciente - Sprint 3 Optimizado
 * 
 * Cambios:
 * - ✅ Usa hook useRecentActivity() con datos reales del backend
 * - ✅ Elimina lógica de parsing y filtrado en cliente
 * - ✅ Auto-refresh cada 2 minutos
 * - ✅ Muestra última actualización real de proyectos
 * - ✅ Cache inteligente con TanStack Query
 */
export function RecentActivity() {
  const { data, isLoading, error } = useRecentActivity();

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-full">
        <div className="p-6 border-b border-border">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
        <RefreshCcw className="h-10 w-10 mb-3 opacity-20" />
        <H3 className="text-base mt-2">Error al cargar actividad</H3>
        <Subtitle>No se pudo obtener la actividad reciente</Subtitle>
      </div>
    );
  }

  if (!data || data.latest_projects.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
        <TrendingUp className="h-10 w-10 mb-3 opacity-20" />
        <H3 className="text-base mt-2">Sin actividad reciente</H3>
        <Subtitle>No hay proyectos actualizados recientemente</Subtitle>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-full animate-fade-in delay-300">
      <div className="p-6 border-b border-border">
        <H3>Actividad Reciente</H3>
        <Subtitle>
          {data.summary.updates_24h} actualizaciones en las últimas 24 horas
        </Subtitle>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {data.latest_projects.map((project) => {
            // Usar STATUS_COLORS del theme para consistencia
            const color = STATUS_COLORS[project.status] || STATUS_COLORS.planificado;
            
            // Iconos según estado
            const iconMap = {
              completado: "✓",
              en_riesgo: "⚠",
              en_ejecucion: "▶",
              planificado: "○"
            };
            const initials = iconMap[project.status] || "•";

            return (
              <div key={project.id} className="flex gap-4 group">
                <div className="relative mt-0.5">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback 
                      style={{ 
                        backgroundColor: `${color}15`,
                        color: color,
                        fontWeight: 'bold',
                        fontSize: '10px'
                      }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className="absolute -bottom-1 -right-1 rounded-full p-0.5 bg-card border border-border"
                    style={{ color }}
                  >
                    <Clock className="h-3 w-3" />
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground line-clamp-2" title={project.programa}>
                    {project.programa}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{project.area_responsable}</span>
                    <span>•</span>
                    <span className="font-mono opacity-80">
                      {formatDistanceToNow(new Date(project.ultima_actualizacion), {
                        addSuffix: true,
                        locale: es
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Avance:</span>
                    <span className="font-medium" style={{ color }}>
                      {project.avance_fisico_pct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}