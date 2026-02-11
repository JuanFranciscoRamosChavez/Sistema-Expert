import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  PlayCircle,
  FileText
} from "lucide-react";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { STATUS_COLORS, APP_COLORS } from "@/lib/theme"; // ✅ Import obligatorio del tema
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPercentage } from "@/lib/formatters";

// --- CONFIGURACIÓN VISUAL (Estática y fuera del componente) ---

// Mapeo de Iconos por Estatus para dar contexto visual inmediato
const STATUS_ICONS: Record<string, React.ElementType> = {
  planificado: FileText,
  en_ejecucion: PlayCircle,
  en_riesgo: AlertTriangle,
  retrasado: Clock,
  completado: CheckCircle2,
  // Fallback
  default: Activity
};

export function RecentActivity() {
  const { data, isLoading } = useRecentActivity();

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  // Fallbacks seguros para evitar pantallas en blanco
  const activities = data?.latest_projects || [];
  const summary = data?.summary || { updates_24h: 0, actions_week: 0 };

  return (
    <Card className="col-span-1 h-full shadow-sm border-border flex flex-col">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              {summary.updates_24h} movimientos en las últimas 24h
            </CardDescription>
          </div>
          {/* Badge Resumen (Opcional, basado en tu hook) */}
          {summary.actions_week > 0 && (
             <div className="text-xs font-mono text-muted-foreground bg-background border px-2 py-1 rounded-md">
                Semana: {summary.actions_week}
             </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-[400px] sm:h-full">
          <div className="flex flex-col">
            {activities.length === 0 ? (
              <EmptyState />
            ) : (
              activities.map((project) => {
                // 1. Obtener Color Seguro desde el Tema
                const statusKey = project.status as keyof typeof STATUS_COLORS;
                const statusColor = STATUS_COLORS[statusKey] || APP_COLORS.neutral;
                
                // 2. Obtener Icono correspondiente
                const IconComponent = STATUS_ICONS[project.status] || STATUS_ICONS.default;

                return (
                  <div
                    key={project.id}
                    className="flex items-start gap-4 p-4 hover:bg-muted/40 transition-colors border-b last:border-0 border-border/50 group"
                  >
                    {/* AVATAR DE ESTADO */}
                    <div className="relative">
                      <Avatar className="h-9 w-9 border mt-0.5" style={{ borderColor: `${statusColor}40` }}>
                        <AvatarFallback 
                          className="transition-colors group-hover:bg-background/80"
                          style={{ 
                            color: statusColor, 
                            backgroundColor: `${statusColor}15` 
                          }}
                        >
                          <IconComponent className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      {/* Pequeño indicador de reloj si es una actualización reciente */}
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full border p-0.5">
                         <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-1">
                      {/* TITULO Y HORA */}
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-medium leading-tight text-foreground line-clamp-2" title={project.programa}>
                          {project.programa}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums shrink-0">
                          {formatTimeAgo(project.ultima_actualizacion)}
                        </span>
                      </div>

                      {/* DETALLES DE CONTEXTO */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={project.area_responsable}>
                          {project.area_responsable}
                        </span>
                        
                        {/* Indicador de Avance condicional */}
                        {project.avance_fisico_pct > 0 && (
                          <>
                            <span className="text-[10px] text-muted-foreground/30">•</span>
                            <span className="text-xs font-semibold" style={{ color: statusColor }}>
                              {formatPercentage(project.avance_fisico_pct, 1)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// --- HELPERS (Nativo, sin librerías pesadas) ---

function formatTimeAgo(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} d`;
  
  return formatDate(date.toISOString()) || 'Sin fecha';
}

// --- COMPONENTES AUXILIARES ---

function ActivitySkeleton() {
  return (
    <Card className="col-span-1 h-full shadow-sm border-border p-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex-1 p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border/50">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-3 w-[40%]" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-4 text-muted-foreground">
      <Clock className="h-10 w-10 opacity-20 mb-3" />
      <p className="text-sm font-medium">Sin actividad reciente</p>
      <p className="text-xs opacity-70">No hay actualizaciones en las últimas 24h.</p>
    </div>
  );
}