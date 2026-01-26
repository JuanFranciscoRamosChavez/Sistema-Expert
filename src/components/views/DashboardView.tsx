import { FolderKanban, DollarSign, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProjectsStatusChart } from '@/components/dashboard/ProjectsStatusChart';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { CriticalProjectsTable } from '@/components/dashboard/CriticalProjectsTable';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { H1, Subtitle } from "@/components/ui/typography";
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';

/**
 * DashboardView - Sprint 3 totalmente migrado a backend
 * Usa solo useDashboardKPIs, sin dependencia de useDashboardData
 */
export function DashboardView() {
	const { data: kpis, isLoading: loading, error } = useDashboardKPIs();

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center gap-2 text-muted-foreground">
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				Cargando datos...
			</div>
		);
	}

	if (error || !kpis) {
		return (
			<div className="flex h-screen items-center justify-center p-4 text-center">
				<div className="space-y-2">
					<AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
					<p className="text-muted-foreground">{error?.message || 'Error al cargar datos'}</p>
					<p className="text-sm text-muted-foreground">
						Verifica que el backend esté corriendo en el puerto 8000
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<H1>Ejecutivo para la administración POA</H1>
				<Subtitle>
					Vista consolidada del Plan Operativo Anual 2026
				</Subtitle>
			</div>

			{/* KPIs principales */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
				<KPICard
					title="Total de Proyectos"
					value={kpis.projects?.total || 0}
					subtitle="proyectos registrados"
					icon={FolderKanban}
					variant="default"
				/>
				<KPICard
					title="Presupuesto Total"
					value={kpis.budget?.formatted_total || '$0'}
					subtitle={`${(kpis.budget?.execution_rate || 0).toFixed(1)}% ejecutado`}
					icon={DollarSign}
					variant="success"
					delay={100}
				/>
				<KPICard
					title="Zonas Cubiertas"
					value={kpis.zones?.total || 0}
					subtitle={kpis.zones?.label || 'Sin datos'}
					icon={Users}
					variant="info"
					delay={200}
				/>
				<KPICard
					title="Avance Promedio"
					value={`${(kpis.progress?.average || 0).toFixed(1)}%`}
					subtitle={kpis.progress?.label || 'Sin datos'}
					icon={AlertTriangle}
					variant="warning"
					delay={300}
				/>
			</div>

			{/* Gráficas */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ProjectsStatusChart />
				<BudgetChart />
			</div>

			{/* Tabla y actividad reciente */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<CriticalProjectsTable />
				</div>
			<RecentActivity />
			</div>
		</div>
	);
}