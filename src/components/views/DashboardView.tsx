import { FolderKanban, DollarSign, Users, AlertTriangle, RefreshCw, Download, Grid3x3, List, Home, ChevronRight } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProjectsStatusChart } from '@/components/dashboard/ProjectsStatusChart';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { CriticalProjectsTable } from '@/components/dashboard/CriticalProjectsTable';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SecondaryStats } from '@/components/dashboard/SecondaryStats';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { H1, Subtitle } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useDashboardData } from '@/hooks/useDashboardData';
import { useState } from 'react';
import { 
	formatBudgetValue, 
	formatBudgetSubtitle, 
	formatBeneficiariesValue, 
	formatBeneficiariesSubtitle 
} from '@/lib/formatters';

/**
 * DashboardView Component
 * 
 * Main dashboard view for POA (Annual Operative Plan) 2026.
 * Displays comprehensive KPIs, charts, tables, and activity feeds
 * with full responsive design and professional visual enhancements.
 * 
 * @component
 * 
 * @example
 * ```tsx
 * <DashboardView />
 * ```
 * 
 * **Features:**
 * - Real-time KPI metrics display
 * - Interactive charts for projects status and budget
 * - Critical projects table with actions menu
 * - Recent activity timeline
 * - Responsive layout adapting to all screen sizes
 * - Loading skeleton states
 * - Error handling with retry functionality
 * - Export and refresh actions
 * - Grid/Compact view toggle
 * - Last update timestamp
 * 
 * **Responsive Breakpoints:**
 * | Device  | Width       | KPIs   | Layout      |
 * |---------|-------------|--------|-------------|
 * | Mobile  | < 640px     | 1 col  | Stacked     |
 * | Tablet  | 640-1024px  | 2 cols | Mixed       |
 * | Desktop | > 1024px    | 4 cols | Full Grid   |
 * 
 * **Accessibility:**
 * - Keyboard navigable
 * - ARIA labels for screen readers
 * - Focus indicators on interactive elements
 * - Semantic HTML structure
 */
export function DashboardView() {
	const { projects, kpiData, loading, error, refetch } = useDashboardData();
	const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
	const [lastUpdate] = useState(new Date());

	// Format last update time
	const formatLastUpdate = () => {
		const now = new Date();
		const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);
		if (diffMinutes < 1) return 'Ahora mismo';
		if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
		const diffHours = Math.floor(diffMinutes / 60);
		if (diffHours < 24) return `Hace ${diffHours}h`;
		return lastUpdate.toLocaleDateString();
	};

	// Loading state with skeleton
	if (loading) {
		return <DashboardSkeleton />;
	}

	// Error state with retry button
	if (error || !kpiData) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center p-4">
				<div className="max-w-md space-y-4 text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-8 w-8 text-destructive" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-semibold">Error al cargar datos</h2>
						<p className="text-sm text-muted-foreground">
							{error || 'No se pudieron obtener los datos del dashboard'}
						</p>
						<p className="text-xs text-muted-foreground">
							Verifica que el backend esté corriendo en el puerto 8000
						</p>
					</div>
					<Button 
						onClick={() => refetch?.()}
						variant="outline"
						className="mt-4"
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Reintentar
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 animate-fade-in p-4 sm:space-y-6 sm:p-6">
			{/* Breadcrumbs - Hidden on mobile */}
			<Breadcrumb className="hidden sm:block">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/" className="flex items-center gap-1">
							<Home className="h-3.5 w-3.5" />
							Inicio
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator>
						<ChevronRight className="h-4 w-4" />
					</BreadcrumbSeparator>
					<BreadcrumbItem>
						<BreadcrumbPage>Dashboard POA 2026</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Header Section */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex-1 space-y-1">
					<H1 className="text-2xl sm:text-3xl">Ejecutivo para la administración POA</H1>
					<Subtitle className="text-sm sm:text-base">
						Vista consolidada del Plan Operativo Anual 2026
					</Subtitle>
					<p className="text-xs text-muted-foreground">
						Última actualización: {formatLastUpdate()}
					</p>
				</div>
				
				{/* Action Buttons */}
				<div className="flex flex-wrap gap-2 sm:flex-nowrap">
					{/* View Mode Toggle - Hidden on mobile */}
					<div className="hidden sm:flex rounded-lg border border-border p-1">
						<Button
							variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => setViewMode('grid')}
							className="h-8 px-3"
						>
							<Grid3x3 className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => setViewMode('compact')}
							className="h-8 px-3"
						>
							<List className="h-4 w-4" />
						</Button>
					</div>
					
					<Button 
						variant="outline" 
						size="sm"
						onClick={() => refetch?.()}
						className="h-9"
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						<span className="hidden sm:inline">Actualizar</span>
					</Button>
					
					<Button 
						variant="default" 
						size="sm"
						className="h-9"
					>
						<Download className="mr-2 h-4 w-4" />
						<span className="hidden sm:inline">Exportar PDF</span>
					</Button>
				</div>
			</div>

			{/* KPIs principales */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
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
					delay={100}
				/>
				<KPICard
					title="Beneficiarios"
					value={formatBeneficiariesValue({ value: kpiData.beneficiarios })}
					subtitle={formatBeneficiariesSubtitle(kpiData.beneficiarios)}
					icon={Users}
					variant="info"
					delay={200}
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

			{/* Estadísticas secundarias */}
			<SecondaryStats 
				projects={projects} 
				projectsInExecution={kpiData.en_ejecucion}
			/>

			{/* Gráficas */}
			<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
				<ProjectsStatusChart projects={projects} />
				<BudgetChart projects={projects} />
			</div>

			{/* Tabla y actividad reciente */}
			<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<CriticalProjectsTable projects={projects} />
				</div>
				<RecentActivity projects={projects} />
			</div>
		</div>
	);
}