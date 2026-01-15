import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // Asegúrate de tener este componente o quítalo si no lo usas
import { CheckCircle2, AlertTriangle, Rocket, TrendingUp, AlertOctagon } from "lucide-react";
import { Project } from "@/lib/mockData";
import { APP_COLORS } from "@/lib/theme";

interface RecentActivityProps {
  projects: Project[];
}

export function RecentActivity({ projects }: RecentActivityProps) {
  
  // --- MOTOR DE GENERACIÓN DE ACTIVIDAD ---
  // Analizamos los proyectos para crear "noticias" dinámicas
  const activities = projects.flatMap((p) => {
    const items = [];

    // CASO 1: PROYECTO COMPLETADO (Éxito)
    if (p.status === 'completado') {
      items.push({
        id: `comp-${p.id}`,
        project: p.nombre,
        action: "Proyecto finalizado exitosamente",
        time: "Meta cumplida", // Al no tener fecha real, usamos un texto de estado
        icon: CheckCircle2,
        color: APP_COLORS.success,
        initials: "OK"
      });
    }

    // CASO 2: RIESGO CRÍTICO (Alerta)
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

    // CASO 3: INICIO RECIENTE (Arranque)
    // Si tiene poco avance (entre 1 y 15%), asumimos que va arrancando
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

    // CASO 4: SOBRECOSTO (Financiero)
    // Si lo ejecutado es mayor al presupuesto (con margen de error)
    if (p.ejecutado > p.presupuesto && p.presupuesto > 0) {
      items.push({
        id: `cost-${p.id}`,
        project: p.nombre,
        action: "Excede el presupuesto asignado",
        time: "Revisar financiero",
        icon: AlertOctagon,
        color: APP_COLORS.warning, // O danger según prefieras
        initials: "$$"
      });
    }

    return items;
  });

  // Ordenamos para dar prioridad a los Riesgos y luego a los Completados
  // (En un futuro, aquí ordenarías por fecha real)
  const sortedActivities = activities.sort((a, b) => {
    if (a.initials === "AL") return -1; // Riesgos primero
    if (b.initials === "AL") return 1;
    return 0;
  }).slice(0, 10); // Top 10 noticias

  // ESTADO VACÍO
  if (sortedActivities.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
        <TrendingUp className="h-10 w-10 mb-3 opacity-20" />
        <p>No hay actividad destacada por el momento.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-full animate-fade-in delay-300">
      <div className="p-6 border-b border-border">
        <h3 className="font-display font-bold text-lg text-foreground">
          Novedades y Alertas
        </h3>
        <p className="text-sm text-muted-foreground">
          Eventos destacados de la cartera de proyectos
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {sortedActivities.map((activity, i) => (
            <div key={activity.id} className="flex gap-4 group">
              {/* ICONO / AVATAR */}
              <div className="relative mt-0.5">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback 
                    style={{ 
                      backgroundColor: `${activity.color}15`, // Fondo transparente del color
                      color: activity.color,
                      fontWeight: 'bold',
                      fontSize: '10px'
                    }}
                  >
                    {activity.initials}
                  </AvatarFallback>
                </Avatar>
                {/* Pequeño icono flotante superpuesto */}
                <div 
                  className="absolute -bottom-1 -right-1 rounded-full p-0.5 bg-card border border-border"
                  style={{ color: activity.color }}
                >
                  <activity.icon className="h-3 w-3" />
                </div>
              </div>

              {/* CONTENIDO TEXTO */}
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