import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Project } from '@/lib/mockData';

interface Props {
  projects: Project[];
}

export function BudgetChart({ projects }: Props) {
  // Filtramos obras con presupuesto > 0 y tomamos el Top 6
  const topProjects = [...projects]
    .filter(p => p.presupuesto > 0)
    .sort((a, b) => b.presupuesto - a.presupuesto)
    .slice(0, 6);

  const data = topProjects.map(project => ({
    name: project.nombre.length > 25 ? project.nombre.substring(0, 25) + '...' : project.nombre,
    fullName: project.nombre, // Guardamos el nombre completo para el tooltip
    presupuesto: project.presupuesto, 
    ejecutado: project.ejecutado,
  }));

  // Formateador de moneda para tooltips y ejes
  const formatMoney = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg text-sm">
          {/* Mostramos el nombre completo aquí si en el eje está cortado */}
          <p className="font-semibold mb-2 max-w-[200px]">{payload[0].payload.fullName}</p>
          <p style={{ color: payload[0].color }}>
            Presupuesto: {formatMoney(payload[0].value)}
          </p>
          <p style={{ color: payload[1].color }}>
            Ejecutado: {formatMoney(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-slide-up">
      <h3 className="font-display font-semibold text-lg mb-4">Top Presupuesto vs Ejecutado</h3>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 5, right: 30, top: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tickFormatter={formatMoney} tick={{ fontSize: 12 }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={150} 
              tick={{ fontSize: 11 }} 
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            <Legend />
            <Bar dataKey="presupuesto" name="Presupuesto" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
            <Bar dataKey="ejecutado" name="Ejecutado" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}