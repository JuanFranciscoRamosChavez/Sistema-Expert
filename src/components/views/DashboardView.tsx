import { FolderKanban, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProjectsStatusChart } from '@/components/dashboard/ProjectsStatusChart';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { CriticalProjectsTable } from '@/components/dashboard/CriticalProjectsTable';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { H1, Subtitle } from "@/components/ui/typography";
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
	formatBudgetValue, 
	formatBudgetSubtitle, 
	formatBeneficiariesValue, 
	formatBeneficiariesSubtitle 
} from '@/lib/formatters';

export function DashboardView() {
	const { projects, kpiData, loading, error } = useDashboardData();

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center gap-2 text-muted-foreground">
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				Cargando datos...
			</div>
		);
	}

	if (error || !kpiData) {
		return (
			<div className="flex h-screen items-center justify-center p-4 text-center">
				<div className="space-y-2">
					<AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
					<p className="text-muted-foreground">{error || 'Error al cargar datos'}</p>
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
					title="Total de Proyecto Actuales"
					value={kpiData.total_proyectos}
					subtitle="En cartera activa"
					icon={FolderKanban}
					variant="default"
				/>
				<KPICard
					title="Presupuesto Total"
					value={formatBudgetValue({ value: kpiData.presupuesto_total })}
					subtitle={formatBudgetSubtitle(kpiData.presupuesto_total)}
					icon={DollarSign}
					variant="success"
					delay={200}
				/>
				<KPICard
					title="Beneficiarios"
					value={formatBeneficiariesValue({ value: kpiData. beneficiarios })}
					subtitle={formatBeneficiariesSubtitle(kpiData.beneficiarios)}
					icon={Users}
					variant="info"
					delay={100}
				/>
				<KPICard
					title="Proyectos en Riesgo"
					value={kpiData.atencion_requerida}
					alert={kpiData.atencion_requerida > 0}
					subtitle="Requieren atención"
					icon={AlertTriangle}
					variant="danger"
					delay={300}
				/>
			</div>

			{/* Gráficas */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ProjectsStatusChart projects={projects} />
				<BudgetChart projects={projects} />
			</div>

			{/* Tabla y actividad reciente */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<CriticalProjectsTable projects={projects} />
				</div>
				<RecentActivity projects={projects} />
			</div>
		</div>
	);
}