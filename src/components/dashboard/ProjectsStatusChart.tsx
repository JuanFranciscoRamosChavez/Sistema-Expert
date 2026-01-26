import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';
import { H3, Subtitle } from '@/components/ui/typography';
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * ProjectsStatusChart - Sprint 3 Optimizado
 * 
 * Cambios:
 * - ✅ Usa useDashboardKPIs() hook con agregaciones del backend
 * - ✅ Elimina múltiples .filter() en cliente
 * - ✅ Datos ya procesados desde SQL
 * - ✅ Cache automático con TanStack Query
 */
export function ProjectsStatusChart() {
  const { data: kpis, isLoading, error } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center text-muted-foreground">
        <p>Error al cargar estado de proyectos</p>
      </div>
    );
  }

  // Mapear estados del backend a nombres en español y colores
  const statusMapping: Record<string, { name: string; color: string }> = {
    'planificado': { name: 'Planificado', color: STATUS_COLORS.planificado },
    'en_ejecucion': { name: 'En Ejecución', color: STATUS_COLORS.en_ejecucion },
    'en_riesgo': { name: 'En Riesgo', color: STATUS_COLORS.en_riesgo },
    'completado': { name: 'Completado', color: STATUS_COLORS.completado },
  };

  const data = kpis.by_status
    .map(item => {
      const mapped = statusMapping[item.estatus_general] || {
        name: item.estatus_general,
        color: APP_COLORS.neutral
      };
      return {
        name: mapped.name,
        value: item.count,
        color: mapped.color
      };
    })
    .filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border p-2 px-3 rounded-lg shadow-lg text-xs min-w-[120px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
            <span className="font-semibold text-popover-foreground">{payload[0].name}</span>
          </div>
          <p className="text-muted-foreground pl-4 font-medium">
            {payload[0].value} proyectos
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-[350px] md:h-[400px] animate-fade-in delay-100 relative overflow-hidden">
      <div className="p-5 border-b border-border">
        <H3>Estado de la Cartera</H3>
        <Subtitle>Distribución actual por etapa y riesgo</Subtitle>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%" 
              outerRadius="80%"
              paddingAngle={2}
              cornerRadius={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="stroke-background hover:opacity-80 transition-opacity cursor-pointer" />
              ))}
            </Pie>
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={false} 
              position={{ x: 10, y: 10 }} 
              wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
            />
            
            <Legend 
              verticalAlign="bottom" 
              height={40} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ 
                paddingBottom: '15px', 
                fontSize: '12px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: '15px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[65%] text-center pointer-events-none flex flex-col justify-center items-center z-0">
          <span className="text-4xl md:text-5xl font-bold font-display text-foreground tracking-tighter leading-none">
            {kpis.projects.total}
          </span>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">
            Total
          </span>
        </div>
      </div>
    </div>
  );
}