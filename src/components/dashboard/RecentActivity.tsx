import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; 
import { CheckCircle2, AlertTriangle, Rocket, TrendingUp, AlertOctagon } from "lucide-react";
import { Project } from "@/types";
import { APP_COLORS } from "@/lib/theme";
import { H3, Subtitle } from "@/components/ui/typography"; // <--- NUEVO IMPORT

interface RecentActivityProps {
  projects: Project[];
}

export function RecentActivity({ projects }: RecentActivityProps) {
  
  const activities = projects.flatMap((p) => {
    const items = [];

    if (p.status === 'completado') {
      items.push({
        id: `comp-${p.id}`,
        project: p.nombre,
        action: "Proyecto finalizado exitosamente",
        time: "Meta cumplida",
        icon: CheckCircle2,
        color: APP_COLORS.success,
        initials: "OK"
      });
    }

    if (p.status === 'en_riesgo' || p.prioridad === 'critica') {
      items.push({
        id: `risk-${p.id}`,
        project: p.nombre,
        action: "Reporta nivel de riesgo crítico",
        time: "Requiere atención",
        icon: AlertTriangle,
        color: APP_COLORS.danger,
        initials: "AL"
      });
    }

    if (p.avance > 0 && p.avance <= 15 && p.status === 'en_ejecucion') {
      items.push({
        id: `start-${p.id}`,
        project: p.nombre,
        action: "Ha iniciado operaciones físicas",
        time: `${p.avance}% Avance`,
        icon: Rocket,
        color: APP_COLORS.info,
        initials: "IN"
      });
    }

    if (p.ejecutado > p.presupuesto && p.presupuesto > 0) {
      items.push({
        id: `cost-${p.id}`,
        project: p.nombre,
        action: "Excede el presupuesto asignado",
        time: "Revisar financiero",
        icon: AlertOctagon,
        color: APP_COLORS.warning,
        initials: "$$"
      });
    }

    return items;
  });

  const sortedActivities = activities.sort((a, b) => {
    if (a.initials === "AL") return -1;
    if (b.initials === "AL") return 1;
    return 0;
  }).slice(0, 10);

  if (sortedActivities.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
        <TrendingUp className="h-10 w-10 mb-3 opacity-20" />
        <H3 className="text-base mt-2">Sin novedades recientes</H3>
        <Subtitle>No hay actividad destacada por el momento.</Subtitle>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-full animate-fade-in delay-300">
      <div className="p-6 border-b border-border">
        <H3>Novedades y Alertas</H3>
        <Subtitle>
          Eventos destacados de la cartera de proyectos
        </Subtitle>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {sortedActivities.map((activity, i) => (
            <div key={activity.id} className="flex gap-4 group">
              <div className="relative mt-0.5">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback 
                    style={{ 
                      backgroundColor: `${activity.color}15`,
                      color: activity.color,
                      fontWeight: 'bold',
                      fontSize: '10px'
                    }}
                  >
                    {activity.initials}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute -bottom-1 -right-1 rounded-full p-0.5 bg-card border border-border"
                  style={{ color: activity.color }}
                >
                  <activity.icon className="h-3 w-3" />
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none text-foreground line-clamp-2" title={activity.project}>
                  {activity.project}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={activity.initials === 'AL' ? 'text-destructive font-medium' : ''}>
                    {activity.action}
                  </span>
                  <span>•</span>
                  <span className="font-mono opacity-80">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}