import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Project } from '@/types';
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';
import { H3, Subtitle } from '@/components/ui/typography'; // <--- NUEVO IMPORT

interface ProjectsStatusChartProps {
  projects: Project[];
}

export function ProjectsStatusChart({ projects }: ProjectsStatusChartProps) {
  
  const data = [
    { 
      name: 'Completado', 
      value: projects.filter(p => p.status === 'completado').length, 
      color: STATUS_COLORS.completado 
    },
    { 
      name: 'En Ejecución', 
      value: projects.filter(p => p.status === 'en_ejecucion').length, 
      color: STATUS_COLORS.en_ejecucion
    },
    { 
      name: 'En Riesgo', 
      value: projects.filter(p => p.status === 'en_riesgo').length, 
      color: STATUS_COLORS.en_riesgo
    },
    { 
      name: 'Planificado', 
      value: projects.filter(p => p.status === 'planificado').length, 
      color: STATUS_COLORS.planificado
    },
    {
      name: 'Retrasado',
      value: projects.filter(p => p.status === 'retrasado').length,
      color: STATUS_COLORS.retrasado
    }
  ].filter(item => item.value > 0);

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
            {projects.length}
          </span>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">
            Total
          </span>
        </div>
      </div>
    </div>
  );
}