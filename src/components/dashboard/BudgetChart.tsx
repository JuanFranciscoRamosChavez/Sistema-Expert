import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Project } from '@/lib/mockData';
import { APP_COLORS } from '@/lib/theme';

interface Props {
  projects: Project[];
}

export function BudgetChart({ projects }: Props) {
  
  // 1. NORMALIZACIÓN
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

  // 2. ORDENAR
  const topProjects = normalizedData
    .filter(p => p.realBudget > 0)
    .sort((a, b) => b.realBudget - a.realBudget) 
    .slice(0, 6);

  // 3. DATOS
  const data = topProjects.map(project => ({
    name: project.nombre.length > 15 ? project.nombre.substring(0, 15) + '...' : project.nombre,
    fullName: project.nombre,
    presupuesto: project.realBudget,
    devengado: project.devengado,
    avance: project.avanceFisico,
    isOverBudget: project.devengado > project.realBudget
  }));

  const formatMoney = (value: number) => {
    if (value === 0) return '$0';
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)} MMD`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)} MDP`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs z-50">
          <p className="font-bold mb-2 max-w-[200px] text-slate-900 border-b border-slate-100 pb-1">
            {d.fullName}
          </p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4 text-slate-600">
              <span>Presupuesto:</span>
              <span className="font-mono font-bold text-slate-900">{formatMoney(d.presupuesto)}</span>
            </p>
            <p className="flex justify-between gap-4 text-slate-600">
              <span>Avance:</span>
              <span className="font-mono font-bold text-slate-900">{d.avance.toFixed(1)}%</span>
            </p>
            <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 mt-1">
              <span className={d.isOverBudget ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                Devengado:
              </span>
              <span className={d.isOverBudget ? "text-red-500 font-mono font-bold" : "text-emerald-600 font-mono font-bold"}>
                {formatMoney(d.devengado)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-[350px] md:h-[400px] animate-fade-in delay-200">
      <div className="p-5 border-b border-border">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} opacity={0.5} />
            
            <XAxis 
              type="number" 
              tickFormatter={formatMoney} 
              // AHORA USA EL COLOR HEXADECIMAL DIRECTO
              tick={{ fontSize: 10, fill: APP_COLORS.textMain, fontWeight: 600 }} 
              axisLine={false}
              tickLine={false}
            />
            
            <YAxis 
              dataKey="name" 
              type="category" 
              width={140} 
              // AHORA USA EL COLOR HEXADECIMAL DIRECTO
              tick={{ fontSize: 11, fill: APP_COLORS.textMain, fontWeight: 600 }} 
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9', radius: 4}} />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
              // FORMATEADOR CON COLOR HEX
              formatter={(value) => <span style={{ color: APP_COLORS.textMain, fontWeight: 600 }}>{value}</span>}
              payload={[
                { value: 'Presupuesto Total', type: 'circle', color: APP_COLORS.backgroundBar }, 
                { value: 'Devengado (Avance)', type: 'circle', color: APP_COLORS.success },
                { value: 'Sobrecosto', type: 'circle', color: APP_COLORS.danger }
              ]}
            />
            
            <Bar 
              dataKey="presupuesto" 
              name="Presupuesto Total" 
              fill={APP_COLORS.backgroundBar} 
              radius={[0, 4, 4, 0]} 
              barSize={20} 
              isAnimationActive={false} 
            />

            <Bar 
              dataKey="devengado" 
              name="Devengado" 
              radius={[0, 2, 2, 0]} 
              barSize={10} 
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isOverBudget ? APP_COLORS.danger : APP_COLORS.success} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}