import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';
import { H3, Subtitle } from '@/components/ui/typography';
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';
import { Skeleton } from '@/components/ui/skeleton';

// Etiquetas legibles para el humano (Mapeo: Backend Key -> UI Label)
const STATUS_LABELS: Record<string, string> = {
  planificado: 'Por Iniciar',
  en_ejecucion: 'En Ejecución',
  en_riesgo: 'En Riesgo',
  retrasado: 'Retrasado',
  completado: 'Completado',
  cancelado: 'Cancelado'
};

export function ProjectsStatusChart() {
  // El hook ya devuelve la agregación hecha por el backend (Sprint 3)
  const { data: kpis, isLoading, error } = useDashboardKPIs();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error || !kpis) {
    return <ErrorState />;
  }

  // Transformación segura de datos
  const chartData = (kpis.by_status || []).map((item) => {
    // Normalizamos la key por si acaso viene con espacios/mayúsculas
    const statusKey = item.estatus_general.toLowerCase().trim() as keyof typeof STATUS_COLORS;
    
    return {
      name: STATUS_LABELS[statusKey] || item.estatus_general, // Fallback al string original
      value: item.count,
      color: STATUS_COLORS[statusKey] || APP_COLORS.neutral
    };
  }).filter(item => item.value > 0); // Ocultar segmentos con 0

  const totalProjects = kpis.projects.total || 0;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-full min-h-[350px]">
      <div className="p-6 border-b border-border">
        <H3>Estado de Proyectos</H3>
        <Subtitle>Distribución actual del portafolio</Subtitle>
      </div>

      <div className="flex-1 relative p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="stroke-background hover:opacity-80 transition-opacity cursor-pointer" 
                />
              ))}
            </Pie>
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={false} 
            />
            
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* KPI Central (Donut Hole) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
          <span className="text-3xl font-bold text-foreground block">
            {totalProjects}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            Total
          </span>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTES ---

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-popover border border-border px-3 py-2 rounded-lg shadow-md text-xs">
        <span className="font-semibold" style={{ color: data.payload.fill }}>
          {data.name}
        </span>
        <div className="text-foreground mt-1">
          <span className="font-mono font-bold text-base">{data.value}</span> proyectos
        </div>
      </div>
    );
  }
  return null;
}

function ChartSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 h-[350px] flex flex-col">
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-32" />
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-40 w-40 rounded-full" />
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center text-muted-foreground h-[350px] flex items-center justify-center">
      <p>No se pudo cargar la información del gráfico.</p>
    </div>
  );
}