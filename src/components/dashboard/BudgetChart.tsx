import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { APP_COLORS } from '@/lib/theme';
import { H3, Subtitle } from '@/components/ui/typography';
import { useFilteredProjects } from '@/hooks/useFilteredProjects';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * BudgetChart - Optimizado para rendimiento pero visualmente idéntico
 */
export function BudgetChart() {
  // ✅ OPTIMIZACIÓN: Solo traemos los 6 proyectos más costosos del backend
  const { data: projectsData, isLoading } = useFilteredProjects({ 
    page_size: 6, 
    ordering: '-presupuesto_modificado' 
  });
  
  const projects = projectsData?.results || [];
  
  if (isLoading) {
    return <ChartSkeleton />;
  }
  
  // Transformación de datos (Mantiene tu lógica de normalización por si acaso)
  const normalizedData = projects.map(p => {
    const rawBudget = p.presupuesto || 0;
    // Parche para datos legacy que venían en millones
    const realBudget = rawBudget < 1000000 && rawBudget > 0 
      ? rawBudget * 1000000 
      : rawBudget;

    const avanceFactor = (p.avance || 0) / 100;
    const devengado = realBudget * avanceFactor;

    return {
      name: p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre,
      fullName: p.nombre,
      presupuesto: realBudget,
      devengado,
      avance: p.avance || 0,
      isOverBudget: devengado > realBudget
    };
  });

  // Re-ordenamiento visual final (aunque el backend ya los mandó ordenados)
  const chartData = normalizedData
    .sort((a, b) => b.presupuesto - a.presupuesto);

  if (chartData.length === 0) {
    return <EmptyState />;
  }

  // --- HELPERS VISUALES (Tus funciones originales) ---

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
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg text-xs z-50">
          <p className="font-bold mb-2 max-w-[200px] text-foreground border-b border-border pb-1">
            {d.fullName}
          </p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4 text-muted-foreground">
              <span>Presupuesto:</span>
              <span className="font-mono font-bold text-foreground">{formatMoney(d.presupuesto)}</span>
            </p>
            <p className="flex justify-between gap-4 text-muted-foreground">
              <span>Avance:</span>
              <span className="font-mono font-bold text-foreground">{d.avance.toFixed(1)}%</span>
            </p>
            <div className="flex justify-between gap-4 pt-1 border-t border-border mt-1">
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
        <H3>Top 6 Proyectos (Devengado)</H3>
        <Subtitle>Avance financiero real vs Presupuesto Total</Subtitle>
      </div>
      
      <div className="flex-1 w-full min-h-0 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ left: 0, right: 30, top: 10, bottom: 0 }}
            barGap={-24} // ✅ Mantenemos tu efecto visual de superposición
          >
            <CartesianGrid strokeDasharray="3 3" stroke={APP_COLORS.neutral} horizontal={false} opacity={0.3} />
            
            <XAxis 
              type="number" 
              tickFormatter={formatMoney} 
              tick={{ fontSize: 10, fill: APP_COLORS.textMain, fontWeight: 600 }} 
              axisLine={false}
              tickLine={false}
            />
            
            <YAxis 
              dataKey="name" 
              type="category" 
              width={140} 
              tick={{ fontSize: 11, fill: APP_COLORS.textMain, fontWeight: 600 }} 
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{fill: APP_COLORS.neutral, opacity: 0.1, radius: 4}} />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
              // Usamos APP_COLORS.primary con opacidad para simular 'backgroundBar'
              formatter={(value) => <span style={{ color: APP_COLORS.textMain, fontWeight: 600 }}>{value}</span>}
              payload={[
                { value: 'Presupuesto Total', type: 'circle', color: APP_COLORS.primary }, 
                { value: 'Devengado (Avance)', type: 'circle', color: APP_COLORS.success },
                { value: 'Sobrecosto', type: 'circle', color: APP_COLORS.danger }
              ]}
            />
            
            {/* Barra de Fondo (Presupuesto Total) */}
            <Bar 
              dataKey="presupuesto" 
              name="Presupuesto Total" 
              fill={APP_COLORS.primary} 
              fillOpacity={0.2} // ✅ Efecto visual para diferenciar del frente
              radius={[0, 4, 4, 0]} 
              barSize={20} 
              isAnimationActive={false} 
            />

            {/* Barra Frontal (Devengado) */}
            <Bar 
              dataKey="devengado" 
              name="Devengado" 
              radius={[0, 2, 2, 0]} 
              barSize={10} 
            >
              {chartData.map((entry, index) => (
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

// --- SUB-COMPONENTES DE ESTADO ---

function ChartSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-[350px] md:h-[400px] animate-pulse">
      <div className="p-5 border-b border-border">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex-1 p-4 flex flex-col gap-4 justify-center">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex gap-2 items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 flex-1 rounded-r-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 h-[400px] flex items-center justify-center text-muted-foreground">
      No hay datos presupuestales disponibles.
    </div>
  );
}