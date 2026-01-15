import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Project } from '@/lib/mockData';

interface Props {
  projects: Project[];
}

export function BudgetChart({ projects }: Props) {
  
  // 1. NORMALIZACIÓN Y CÁLCULO DE DEVENGADO
  const normalizedData = projects.map(p => {
    const rawBudget = p.presupuesto || 0;
    
    // Normalizar a Pesos Reales
    const realBudget = rawBudget < 1000000 && rawBudget > 0 
      ? rawBudget * 1000000 
      : rawBudget;

    const avanceFactor = (p.avance || 0) / 100;
    const devengado = realBudget * avanceFactor;

    return {
      ...p,
      realBudget,
      devengado,
      avanceFisico: p.avance || 0
    };
  });

  // 2. ORDENAR POR PRESUPUESTO
  const topProjects = normalizedData
    .filter(p => p.realBudget > 0)
    .sort((a, b) => b.realBudget - a.realBudget) 
    .slice(0, 6);

  // 3. PREPARAR DATOS
  const data = topProjects.map(project => ({
    name: project.nombre.length > 20 ? project.nombre.substring(0, 20) + '...' : project.nombre,
    fullName: project.nombre,
    presupuesto: project.realBudget,
    devengado: project.devengado,
    avance: project.avanceFisico,
    isOverBudget: project.devengado > project.realBudget
  }));

  // 4. FORMATEADORES
  const formatMoney = (value: number) => {
    if (value === 0) return '$0';
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)} MMD`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)} MDP`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-lg text-xs animate-in fade-in zoom-in-95 duration-200 z-50">
          <p className="font-semibold mb-2 max-w-[250px] text-foreground border-b border-border pb-1 text-wrap">
            {data.fullName}
          </p>
          <div className="space-y-1.5">
            <p className="flex items-center justify-between gap-4 text-foreground">
              <span className="font-medium">Presupuesto Total:</span>
              <span className="font-mono font-bold">{formatMoney(data.presupuesto)}</span>
            </p>
            <p className="flex items-center justify-between gap-4 text-foreground">
              <span className="font-medium">Avance Físico:</span>
              <span className="font-mono font-bold">{data.avance.toFixed(1)}%</span>
            </p>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-border mt-1">
              <span className="font-bold" style={{ color: data.isOverBudget ? '#ef4444' : '#10b981' }}>
                Devengado (Valor Ganado):
              </span>
              <span className="font-mono font-bold" style={{ color: data.isOverBudget ? '#ef4444' : '#10b981' }}>
                {formatMoney(data.devengado)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-[400px] animate-fade-in delay-200">
      <div className="p-6 border-b border-border">
        <h3 className="font-display font-bold text-lg text-foreground">Top 6 Proyectos (Devengado)</h3>
        <p className="text-sm text-muted-foreground">Avance financiero real vs Presupuesto Total</p>
      </div>
      
      <div className="flex-1 w-full min-h-0 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ left: 0, right: 30, top: 10, bottom: 0 }}
            barGap={-24} 
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} opacity={0.5} />
            
            <XAxis 
              type="number" 
              tickFormatter={formatMoney} 
              tick={{ fontSize: 10, fill: 'hsl(var(--foreground))', fontWeight: 500 }} 
              axisLine={false}
              tickLine={false}
            />
            
            <YAxis 
              dataKey="name" 
              type="category" 
              width={140} 
              tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', fontWeight: 600 }} 
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted)/0.2)', radius: 4}} />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
              formatter={(value) => <span style={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}>{value}</span>}
              payload={[
                { value: 'Presupuesto Total', type: 'circle', color: 'hsl(var(--muted))' }, // El icono sigue gris (coincide con barra)
                { value: 'Devengado (Avance)', type: 'circle', color: '#10b981' },
                { value: 'Sobrecosto / Excedente', type: 'circle', color: '#ef4444' }
              ]}
            />
            
            {/* Barra de Fondo (Presupuesto) - Muted/Gris */}
            <Bar 
              dataKey="presupuesto" 
              name="Presupuesto Total" 
              fill="hsl(var(--muted))" 
              radius={[0, 4, 4, 0]} 
              barSize={24} 
              isAnimationActive={false} 
            />

            {/* Barra de Frente (Devengado) */}
            <Bar 
              dataKey="devengado" 
              name="Devengado" 
              radius={[0, 2, 2, 0]} 
              barSize={12} 
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isOverBudget ? '#ef4444' : '#10b981'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}