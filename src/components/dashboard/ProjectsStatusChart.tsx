import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Project } from '@/lib/mockData'; // Interfaz

interface Props {
  projects: Project[]; // Recibe datos reales
}

export function ProjectsStatusChart({ projects }: Props) {
  // Calculamos conteos reales
  const data = [
    { name: 'En Ejecución', value: projects.filter(p => p.status === 'en_ejecucion').length, color: '#3b82f6' },
    { name: 'Planificado', value: projects.filter(p => p.status === 'planificado').length, color: '#94a3b8' },
    { name: 'Completado', value: projects.filter(p => p.status === 'completado').length, color: '#22c55e' },
    { name: 'Retrasado', value: projects.filter(p => p.status === 'retrasado').length, color: '#eab308' },
    { name: 'En Riesgo', value: projects.filter(p => p.status === 'en_riesgo').length, color: '#ef4444' },
  ].filter(item => item.value > 0); // Ocultar segmentos vacíos

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border h-full">
      <h3 className="font-display font-semibold text-lg mb-4">Estatus de Proyectos</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}