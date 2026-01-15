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
import { Project } from '@/lib/mockData';
import { mapApiToUiProject } from '@/lib/mappers';
import { KPIData } from '@/types';
import { H1, Subtitle } from "@/components/ui/typography"; // <--- NUEVO IMPORT

export function DashboardView() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [kpiData, setKpiData] = useState<KPIData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// --- TU LÓGICA DE FETCH ORIGINAL (INTACTA) ---
	useEffect(() => {
		const fetchData = async () => {
			try {
				setError(null);
				const [resumenRes, obrasRes] = await Promise.all([
					fetch('http://127.0.0.1:8000/api/dashboard/resumen/'),
					fetch('http://127.0.0.1:8000/api/obras/')
				]);

				if (!resumenRes.ok || !obrasRes.ok) {
					throw new Error('Error de conexión con el servidor (Backend)');
				}

				const resumenJson = await resumenRes.json();
				const obrasJson = await obrasRes.json();

				if (Array.isArray(obrasJson)) {
					setProjects(obrasJson.map(mapApiToUiProject));
				} else {
					setProjects([]);
				}

				if (resumenJson && resumenJson.kpi_tarjetas) {
					setKpiData(resumenJson.kpi_tarjetas);
				}

			} catch (err) {
				console.error("Fallo crítico en dashboard:", err);
				setError("No se pudo cargar la información. Revisa que el backend esté corriendo.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// --- TUS HELPERS DE CÁLCULO (INTACTOS) ---

	const getBudgetValue = (val: any) => {
		const num = Number(val) || 0;
		const realAmount = num < 1000000 ? num * 1000000 : num;

		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(realAmount);
	};

	const getBudgetSubtitle = (val: any) => {
		const num = Number(val) || 0;
		let millionsDisplay = 0;

		if (num < 1000000) {
			millionsDisplay = num;
		} else {
			millionsDisplay = num / 1000000;
		}

		const formattedMillions = millionsDisplay.toLocaleString('es-MX', { 
			maximumFractionDigits: 2 
		});
		
		return `${formattedMillions} millones de pesos Presupuesto vigente`; 
	};

	const getBeneficiariesValue = (val: any) => {
		const num = Number(val) || 0;
		return `${new Intl.NumberFormat('es-MX').format(num)} personas`; 
	};

	const getBeneficiariesSubtitle = (val: any) => {
		const num = Number(val) || 0;
		const miles = (num / 1000).toLocaleString('es-MX', { maximumFractionDigits: 0 });
		return `${miles} mil personas Ciudadanos impactados registrados`; 
	};

	const completedProjects = projects.filter(p => p.status === 'completado').length;
	const avgAdvance = projects.length > 0 
		? Math.round(projects.reduce((sum, p) => sum + p.avance, 0) / projects.length) 
		: 0;
	
	if (loading) {
		return <div className="flex h-screen items-center justify-center gap-2 text-muted-foreground"><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />Cargando datos...</div>;
	}

	if (error || !kpiData) {
		return <div className="flex h-screen items-center justify-center p-4 text-center"><AlertTriangle className="h-10 w-10 text-destructive mb-2" /><p className="text-muted-foreground">{error}</p></div>;
	}

	return (
		<div className="space-y-6 animate-fade-in">
			{/* HEADER ACTUALIZADO CON TIPOGRAFÍA CENTRALIZADA */}
			<div className="flex flex-col gap-1">
				<H1>Ejecutivo para la administración POA</H1>
				<Subtitle>
					Vista consolidada del Plan Operativo Anual 2026
				</Subtitle>
			</div>

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
					value={getBudgetValue(kpiData.presupuesto_total)}
					subtitle={getBudgetSubtitle(kpiData.presupuesto_total)}
					icon={DollarSign}
					variant="success"
					delay={200}
				/>
				<KPICard
					title="Beneficiarios"
					value={getBeneficiariesValue(kpiData.beneficiarios)}
					subtitle={getBeneficiariesSubtitle(kpiData.beneficiarios)}
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

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
					<div className="p-3 rounded-lg bg-success/10"><CheckCircle className="h-6 w-6 text-success" /></div>
					<div><p className="text-2xl font-display font-bold">{completedProjects}</p><p className="text-sm text-muted-foreground">Completados</p></div>
				</div>
				<div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
					<div className="p-3 rounded-lg bg-info/10"><Clock className="h-6 w-6 text-info" /></div>
					<div><p className="text-2xl font-display font-bold">{kpiData.en_ejecucion}</p><p className="text-sm text-muted-foreground">En Ejecución</p></div>
				</div>
				<div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
					<div className="p-3 rounded-lg bg-primary/10"><TrendingUp className="h-6 w-6 text-primary" /></div>
					<div><p className="text-2xl font-display font-bold">{avgAdvance}%</p><p className="text-sm text-muted-foreground">Avance Promedio</p></div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ProjectsStatusChart projects={projects} />
				<BudgetChart projects={projects} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<CriticalProjectsTable projects={projects} />
				</div>
				<RecentActivity projects={projects} />
			</div>
		</div>
	);
}