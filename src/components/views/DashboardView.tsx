import { useEffect, useState } from 'react';
import { 
	FolderKanban, 
	DollarSign, 
	Users, 
	AlertTriangle,
	TrendingUp,
	CheckCircle,
	Clock
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProjectsStatusChart } from '@/components/dashboard/ProjectsStatusChart';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { CriticalProjectsTable } from '@/components/dashboard/CriticalProjectsTable';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Project, formatCurrency, formatNumber } from '@/lib/mockData';
import { mapApiToUiProject } from '@/lib/mappers';
import { KPIData } from '@/types';

export function DashboardView() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [kpiData, setKpiData] = useState<KPIData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setError(null);
				// Usamos promesas individuales para que si una falla, sepamos cuál fue
				const resumenRes = await fetch('http://127.0.0.1:8000/api/dashboard/resumen/');
				const obrasRes = await fetch('http://127.0.0.1:8000/api/obras/');

				if (!resumenRes.ok || !obrasRes.ok) {
					throw new Error('Error en la respuesta del servidor Django');
				}

				const resumenJson = await resumenRes.json();
				const obrasJson = await obrasRes.json();

				// Verificamos estructura antes de asignar
				if (resumenJson && resumenJson.kpi_tarjetas) {
					setKpiData(resumenJson.kpi_tarjetas);
				}
				
				// SEGURIDAD: Solo mapeamos si es un array
				if (Array.isArray(obrasJson)) {
					setProjects(obrasJson.map(mapApiToUiProject));
				} else {
					console.error("La API de obras no devolvió una lista:", obrasJson);
					setProjects([]); // Evita crash
				}

			} catch (err) {
				console.error("Error cargando datos:", err);
				setError("No se pudo conectar con el servidor. Por favor, intente más tarde.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Cálculos secundarios
	const completedProjects = projects.filter(p => p.status === 'completado').length;
	const avgAdvance = projects.length > 0 
		? Math.round(projects.reduce((sum, p) => sum + p.avance, 0) / projects.length) 
		: 0;
	
	const executionRate = kpiData && kpiData.presupuesto_total > 0
		? ((projects.reduce((sum, p) => sum + p.ejecutado, 0) / kpiData.presupuesto_total) * 100).toFixed(1)
		: "0.0";

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center gap-3 text-muted-foreground">
				<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				Cargando POA ...
			</div>
		);
	}

	if (error || !kpiData) {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-4 text-muted-foreground p-4 text-center">
				<AlertTriangle className="h-10 w-10 text-warning" />
				<p>{error || "No hay datos disponibles para mostrar."}</p>
				<button 
					onClick={() => window.location.reload()}
					className="text-primary hover:underline"
				>
					Reintentar
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="animate-fade-in">
				<h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
					Panel Ejecutivo
				</h1>
				<p className="text-muted-foreground mt-1">
					Vista consolidada del Plan Operativo Anual 2026
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<KPICard
					title="Total de Proyectos"
					value={kpiData.total_proyectos}
					subtitle="En cartera activa"
					icon={FolderKanban}
					variant="default"
				/>
				<KPICard
					title="Presupuesto Total"
					value={formatCurrency(kpiData.presupuesto_total)}
					subtitle={`${executionRate}% ejecutado`}
					icon={DollarSign}
					variant="success"
					delay={100}
				/>
				<KPICard
					title="Beneficiarios"
					value={formatNumber(kpiData.beneficiarios)}
					subtitle="Ciudadanos impactados"
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

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
					<div className="p-3 rounded-lg bg-success/10"><CheckCircle className="h-6 w-6 text-success" /></div>
					<div>
						<p className="text-2xl font-display font-bold">{completedProjects}</p>
						<p className="text-sm text-muted-foreground">Completados</p>
					</div>
				</div>
				<div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
					<div className="p-3 rounded-lg bg-info/10"><Clock className="h-6 w-6 text-info" /></div>
					<div>
						<p className="text-2xl font-display font-bold">{kpiData.en_ejecucion}</p>
						<p className="text-sm text-muted-foreground">En Ejecución</p>
					</div>
				</div>
				<div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
					<div className="p-3 rounded-lg bg-primary/10"><TrendingUp className="h-6 w-6 text-primary" /></div>
					<div>
						<p className="text-2xl font-display font-bold">{avgAdvance}%</p>
						<p className="text-sm text-muted-foreground">Avance Promedio</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ProjectsStatusChart projects={projects} />
				<BudgetChart projects={projects} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-3">
					<CriticalProjectsTable projects={projects} />
				</div>
			</div>
		</div>
	);
}