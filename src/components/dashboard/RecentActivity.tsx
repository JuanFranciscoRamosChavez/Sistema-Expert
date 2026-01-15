// src/components/dashboard/RecentActivity.tsx
import { Activity } from 'lucide-react';
import { text } from 'stream/consumers';

export function RecentActivity() {
  // Datos simulados estáticos para actividad reciente (logs del sistema)
  const activities = [
    { id: 1, text: "Actualización masiva de avances", time: "Hace 2 horas" },
    { id: 2, text: "Sincronización con POA 2026", time: "Hace 5 horas" },
    { id: 3, text: "Reporte mensual generado", time: "Ayer" },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4" /> Actividad Reciente
      </h3>
      <div className="space-y-6">
        {activities.map((item, i) => (
          <div key={item.id} className="flex gap-3 relative">
            {i !== activities.length - 1 && (
              <div className="absolute left-[9px] top-6 bottom-[-24px] w-[2px] bg-border" />
            )}
            <div className="relative z-10 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center border border-background">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="flex-1 -mt-1">
              <p className="text-sm font-medium">{item.text}</p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}