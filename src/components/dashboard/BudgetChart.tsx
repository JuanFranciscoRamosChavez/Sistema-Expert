import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell 
} from 'recharts';
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';
import { H3, Subtitle } from '@/components/ui/typography';
import { useFilteredProjects } from '@/hooks/useFilteredProjects';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * BudgetChart - Optimizado para móviles y alineación vertical
 */
export function BudgetChart() {
  const { data: projectsData, isLoading } = useFilteredProjects({ 
    page_size: 6, 
    ordering: '-presupuesto_modificado' 
  });
  
  const projects = projectsData?.results || [];
  
  // ✅ CORRECCIÓN 1: 'h-full' para llenar espacio y 'overflow-visible' para no cortar tooltips
  const containerClasses = "bg-card rounded-xl border border-border shadow-sm flex flex-col h-full min-h-[350px] animate-fade-in delay-200 overflow-visible";

  if (isLoading) {
    return (
      <div className={containerClasses}>
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
  
  const normalizedData = projects.map(p => {
    const rawBudget = p.presupuesto || 0;
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
  }).sort((a, b) => b.presupuesto - a.presupuesto);

  if (normalizedData.length === 0) {
    return (
      <div className={`${containerClasses} items-center justify-center p-6`}>
        <span className="text-muted-foreground">No hay datos presupuestales disponibles.</span>
      </div>
    );
  }

  const formatMoney = (value: number) => {
    if (value === 0) return '$0';
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)} MMD`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)} MDP`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  // ✅ CORRECCIÓN 2: Tooltip adaptable
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        // max-w limitado en móvil (150px) para que no se salga de la pantalla
        <div className="bg-popover border border-border p-2.5 sm:p-3 rounded-lg shadow-xl text-[10px] sm:text-xs z-[100] max-w-[150px] sm:max-w-[220px]">
          
          {/* break-words y whitespace-normal fuerzan el salto de línea */}
          <p className="font-bold mb-2 text-foreground border-b border-border pb-1.5 break-words whitespace-normal leading-tight">
            {d.fullName}
          </p>
          
          <div className="space-y-1.5">
            <p className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 text-muted-foreground">
              <span>Presupuesto:</span>
              <span className="font-mono font-bold text-foreground">{formatMoney(d.presupuesto)}</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 text-muted-foreground">
              <span>Avance:</span>
              <span className="font-mono font-bold text-foreground">{d.avance.toFixed(1)}%</span>
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 pt-1.5 border-t border-border mt-1">
              <span className="font-bold" style={{ color: d.isOverBudget ? STATUS_COLORS.en_riesgo : STATUS_COLORS.completado }}>
                Devengado:
              </span>
              <span className="font-mono font-bold" style={{ color: d.isOverBudget ? STATUS_COLORS.en_riesgo : STATUS_COLORS.completado }}>
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
    <div className={containerClasses}>
      <div className="p-3 sm:p-4 lg:p-5 border-b border-border">
        <H3>Top 6 Proyectos (Devengado)</H3>
        <Subtitle className="hidden sm:block">Avance financiero real vs Presupuesto Total</Subtitle>
      </div>
      
      <div className="flex-1 w-full min-h-0 p-2 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={normalizedData} 
            layout="vertical" 
            margin={{ left: 0, right: 20, top: 5, bottom: 0 }}
            barGap={-20} 
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
              width={100} 
              className="hidden sm:block" 
              tick={{ fontSize: 11, fill: APP_COLORS.textMain, fontWeight: 600 }} 
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            
            {/* ✅ CORRECCIÓN 3: Z-Index alto para que el tooltip flote sobre todo */}
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{fill: APP_COLORS.neutral, opacity: 0.1, radius: 4}} 
              wrapperStyle={{ outline: 'none', zIndex: 1000 }}
            />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
              formatter={(value) => <span style={{ color: APP_COLORS.textMain, fontWeight: 600 }}>{value}</span>}
              payload={[
                { value: 'Presupuesto Total', type: 'circle', color: APP_COLORS.primary }, 
                { value: 'Devengado (Avance)', type: 'circle', color: APP_COLORS.success },
                { value: 'Sobrecosto', type: 'circle', color: APP_COLORS.danger }
              ]}
            />
            
            <Bar 
              dataKey="presupuesto" 
              name="Presupuesto Total" 
              fill={APP_COLORS.primary} 
              fillOpacity={0.2} 
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
              {normalizedData.map((entry, index) => (
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