import { 
  FolderKanban, 
  DollarSign, 
  Users, 
  AlertOctagon, 
  AlertTriangle 
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProjectsStatusChart } from '@/components/dashboard/ProjectsStatusChart';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { CriticalProjectsTable } from '@/components/dashboard/CriticalProjectsTable';
import { H1, H3, Subtitle } from "@/components/ui/typography";
import { useDashboardData } from '@/hooks/useDashboardData';

export function DashboardView() {
  const { kpiData, projects, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center gap-3 text-muted-foreground animate-pulse">
        <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
        <span className="text-base font-medium">Cargando tablero...</span>
      </div>
    );
  }

  if (error || !kpiData) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="flex flex-col items-center text-center space-y-3 max-w-md bg-card p-8 rounded-xl border shadow-sm">
          <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-1">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <H3>Error de conexión</H3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No se pudo cargar la información del tablero.
          </p>
        </div>
      </div>
    );
  }

  // --- CÁLCULOS ---
  // Beneficiarios: Ahora vienen del backend pre-calculados
  const totalBeneficiarios = kpiData.beneficiaries?.total || 0;
  
  // Atención Prioritaria: Puntuación > 3 Y (1 rojo O 2 amarillos)
  const priorityCount = (kpiData as any).priority_attention?.count || 0;
  
  // Proyectos completados
  const completedCount = kpiData.projects?.completed || 
    kpiData.by_status?.find(s => s.estatus_general === 'completado' || s.estatus_general === 'terminado')?.count || 0;

  // ✅ FORMATEADOR VERTICAL OPTIMIZADO (Textos compactos)
  const formatSmartNumber = (val: number, type: 'currency' | 'people') => {
    const isCurrency = type === 'currency';
    const prefix = isCurrency ? '$' : '';
    
    let numStr = '';
    let unit = '';

    // Soporta: Trillones, Billones, Mil Millones, Millones, Miles
    if (val >= 1000000000000) {
      numStr = (val / 1000000000000).toFixed(2);
      unit = isCurrency ? 'Billones de Pesos' : 'Billones de Hab.';
    } else if (val >= 1000000000) {
      numStr = (val / 1000000000).toFixed(2);
      unit = isCurrency ? 'Mil Millones de Pesos' : 'Mil Millones de Hab.';
    } else if (val >= 1000000) {
      numStr = (val / 1000000).toFixed(2);
      unit = isCurrency ? 'Millones de Pesos' : 'Millones de Hab.';
    } else if (val >= 1000) {
      numStr = (val / 1000).toFixed(2);
      unit = isCurrency ? 'Miles de Pesos' : 'Miles de Hab.';
    } else {
      // Números pequeños (< 1000)
      return (
        <div className="flex flex-col items-start justify-center h-full">
          <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
            {isCurrency ? '$' : ''}{new Intl.NumberFormat('es-MX').format(val)}
          </span>
          {!isCurrency && <span className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Habitantes</span>}
        </div>
      );
    }

    // Diseño Apilado: Número gigante arriba, unidad compacta abajo
    return (
      <div className="flex flex-col items-start -space-y-0.5 sm:-space-y-1">
        <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground leading-tight">
          {prefix}{numStr}
        </span>
        <span className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {unit}
        </span>
      </div>
    );
  };

  const formatExactMoney = (amount: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 md:p-6 lg:p-8 pb-20 sm:pb-24 max-w-[1920px] mx-auto animate-in fade-in duration-500 overflow-x-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1 border-b pb-3 sm:pb-4 lg:pb-6">
        <H1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-foreground">
          Tablero de Control
        </H1>
        <Subtitle className="text-xs sm:text-sm lg:text-base text-muted-foreground">
          Panorama general del Plan Operativo Anual 2026
        </Subtitle>
      </div>

      {/* --- SECCIÓN 1: TARJETAS KPI --- */}
      {/* Grid responsivo: 1 col (móvil), 2 cols (tablet), 4 cols (desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        
        {/* 1. TOTAL PROYECTOS */}
        <KPICard
          title="Total de Proyectos"
          value={kpiData.projects.total}
          subtitle={`${completedCount} proyectos finalizados`}
          icon={FolderKanban}
          variant="default"
          delay={0}
        />

        {/* 2. PRESUPUESTO */}
        <KPICard
          title="Presupuesto Asignado"
          value={formatSmartNumber(kpiData.budget.total, 'currency')} 
          subtitle={
            <div className="flex flex-col mt-2 pt-2 border-t border-border/50 w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Real</span>
                <span className="font-mono text-[10px] text-foreground font-medium truncate ml-2">
                  {formatExactMoney(kpiData.budget.total)}
                </span>
              </div>
              {/* Barra de progreso visual */}
              <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(kpiData.budget.execution_rate, 100)}%` }} 
                />
              </div>
              <div className="text-right mt-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                {kpiData.budget.execution_rate.toFixed(1)}% Ejecutado
              </div>
            </div>
          }
          icon={DollarSign}
          variant="success"
          delay={100}
        />

        {/* 3. BENEFICIARIOS */}
        <KPICard
          title="Beneficiarios"
          value={formatSmartNumber(totalBeneficiarios, 'people')}
          subtitle="Impacto directo estimado"
          icon={Users}
          variant="info"
          delay={200}
        />

        {/* 4. ATENCIÓN PRIORITARIA */}
        <KPICard
          title="Atención Prioritaria"
          value={priorityCount}
          subtitle="Proyectos requieren intervención"
          icon={AlertOctagon}
          variant="danger"
          alert={priorityCount > 0}
          delay={300}
        />
      </div>

      {/* --- SECCIÓN 2: GRÁFICAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-auto lg:h-[420px] xl:h-[450px]">
        <div className="h-[320px] sm:h-[350px] lg:h-full w-full min-w-0">
          <ProjectsStatusChart />
        </div>
        <div className="h-[360px] sm:h-[400px] lg:h-full w-full min-w-0">
          <BudgetChart />
        </div>
      </div>

      {/* --- SECCIÓN 3: ATENCIÓN PRIORITARIA --- */}
      <div className="h-[450px] sm:h-[500px] lg:h-[550px]">
        <CriticalProjectsTable />
      </div>

    </div>
  );
}