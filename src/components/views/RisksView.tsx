import { useState, useEffect, useMemo } from 'react';
import { 
	AlertTriangle, 
	ShieldAlert, 
	TrendingUp, 
	AlertOctagon,
	ArrowRight,
	Search,
	Activity,
	FileWarning
} from 'lucide-react';
import { 
	BarChart, 
	Bar, 
	XAxis, 
	YAxis, 
	CartesianGrid, 
	Tooltip, 
	ResponsiveContainer,
	Cell
} from 'recharts';
import { Project } from '@/lib/mockData';
import { mapApiToUiProject } from '@/lib/mappers';
import { H1, H3, Subtitle, Small } from "@/components/ui/typography";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card'; // Usamos componentes base para mejor estructura
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { APP_COLORS } from '@/lib/theme';

export function RisksView() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');

	// 1. CARGA DE DATOS
	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const response = await fetch('http://127.0.0.1:8000/api/obras/');
				if (!response.ok) throw new Error('Error al cargar');
				const data = await response.json();
				if (Array.isArray(data)) {
					// Filtramos: Proyectos que son CRÍTICOS o tienen RIESGOS explícitos
					const riskyProjects = data
						.map(mapApiToUiProject)
						.filter(p => p.status === 'en_riesgo' || p.riesgos.length > 0 || p.prioridad === 'critica');
					setProjects(riskyProjects);
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchProjects();
	}, []);

	// 2. ANÁLISIS ESTADÍSTICO (Lógica de la Guía: Identificar causas raíz)
	const stats = useMemo(() => {
		let critical = 0;
		let financial = 0;
		let social = 0;
		const riskCounts: Record<string, number> = {};

		projects.forEach(p => {
			if (p.prioridad === 'critica' || p.status === 'en_riesgo') critical++;
			
			p.riesgos.forEach(r => {
				const riskLower = r.toLowerCase();
				
				// Categorización para KPIs
				if (riskLower.includes('presupuesto') || riskLower.includes('costo') || riskLower.includes('recurso')) financial++;
				if (riskLower.includes('vecin') || riskLower.includes('social') || riskLower.includes('manifest')) social++;

				// Categorización para Gráfica (Top Causas)
				let category = "Factores Técnicos";
				if (riskLower.includes('presupuesto') || riskLower.includes('financiero')) category = "Suficiencia Presupuestal";
				else if (riskLower.includes('material') || riskLower.includes('suministro')) category = "Cadena de Suministro";
				else if (riskLower.includes('clima') || riskLower.includes('lluvia')) category = "Factores Climáticos";
				else if (riskLower.includes('permiso') || riskLower.includes('legal') || riskLower.includes('trámite')) category = "Gestión Administrativa";
				else if (riskLower.includes('social') || riskLower.includes('vecin')) category = "Gestión Social";
				
				riskCounts[category] = (riskCounts[category] || 0) + 1;
			});
		});

		const chartData = Object.entries(riskCounts)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value)
			.slice(0, 5); // Top 5

		return { critical, financial, social, total: projects.length, chartData };
	}, [projects]);

	// 3. FILTRADO
	const filteredList = projects.filter(p => 
		p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
		p.riesgos.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	if (loading) return <div className="flex h-96 items-center justify-center text-muted-foreground"><Activity className="animate-spin mr-2" /> Analizando cartera...</div>;

	return (
		<div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
			
			{/* HEADER: Alineado a la izquierda en desktop, centrado en móvil si se desea, pero aquí mantenemos izquierda */}
			<div className="flex flex-col gap-2">
				<H1 className="flex items-center gap-3 text-destructive">
					<ShieldAlert className="h-7 w-7 md:h-9 md:w-9" />
					Tablero de Riesgos
				</H1>
				<Subtitle className="max-w-2xl">
					Herramienta de detección temprana para la toma de decisiones. 
					Actualmente hay <span className="font-bold text-foreground">{stats.total} proyectos</span> con alertas activas.
				</Subtitle>
			</div>

			{/* SECCIÓN 1: KPIs (Grid Responsivo 2x2 en móvil, 4 en línea en desktop) */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
				<Card className="bg-destructive/5 border-destructive/20 shadow-none">
					<CardContent className="p-4 flex flex-col justify-between h-full">
						<div className="flex justify-between items-start">
							<span className="text-xs font-medium text-destructive/80 uppercase tracking-wider">Críticos</span>
							<AlertOctagon className="h-4 w-4 text-destructive" />
						</div>
						<div className="mt-2">
							<span className="text-2xl md:text-3xl font-display font-bold text-destructive">{stats.critical}</span>
							<p className="text-[10px] md:text-xs text-muted-foreground leading-tight mt-1">Requieren intervención inmediata</p>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card shadow-sm">
					<CardContent className="p-4 flex flex-col justify-between h-full">
						<div className="flex justify-between items-start">
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Financieros</span>
							<span className="h-2 w-2 rounded-full bg-orange-500" />
						</div>
						<div className="mt-2">
							<span className="text-2xl md:text-3xl font-display font-bold text-foreground">{stats.financial}</span>
							<p className="text-[10px] md:text-xs text-muted-foreground leading-tight mt-1">Problemas presupuestales</p>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card shadow-sm">
					<CardContent className="p-4 flex flex-col justify-between h-full">
						<div className="flex justify-between items-start">
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Social/Legal</span>
							<span className="h-2 w-2 rounded-full bg-blue-500" />
						</div>
						<div className="mt-2">
							<span className="text-2xl md:text-3xl font-display font-bold text-foreground">{stats.social}</span>
							<p className="text-[10px] md:text-xs text-muted-foreground leading-tight mt-1">Gestión externa requerida</p>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card shadow-sm">
					<CardContent className="p-4 flex flex-col justify-between h-full">
						<div className="flex justify-between items-start">
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Técnicos</span>
							<span className="h-2 w-2 rounded-full bg-slate-500" />
						</div>
						<div className="mt-2">
							<span className="text-2xl md:text-3xl font-display font-bold text-foreground">
								{stats.total - stats.financial - stats.social}
							</span>
							<p className="text-[10px] md:text-xs text-muted-foreground leading-tight mt-1">Retrasos operativos</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* SECCIÓN 2: GRÁFICA Y FILTROS (Layout Híbrido) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
				
				{/* Gráfica: Ocupa 2 columnas en Desktop, Full en Mobile */}
				<div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-5 md:p-6">
					<div className="mb-4">
						<H3 className="text-base md:text-lg">Diagnóstico de Causas</H3>
						<Subtitle>Principales factores de riesgo detectados en la cartera</Subtitle>
					</div>
					
					{/* Altura dinámica: Menos alto en móvil para que no ocupe toda la pantalla */}
					<div className="h-[250px] md:h-[300px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={stats.chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.4} />
								<XAxis type="number" hide />
								<YAxis 
									dataKey="name" 
									type="category" 
									width={130} 
									tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} 
									axisLine={false}
									tickLine={false}
								/>
								<Tooltip 
									cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
									contentStyle={{ 
										backgroundColor: 'hsl(var(--popover))',
										borderColor: 'hsl(var(--border))',
										borderRadius: '8px',
										fontSize: '12px',
										color: 'hsl(var(--popover-foreground))'
									}}
								/>
								<Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
									{stats.chartData.map((entry, index) => (
										<Cell 
											key={`cell-${index}`} 
											fill={index === 0 ? APP_COLORS.danger : APP_COLORS.warning} 
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Columna Derecha: Buscador y Tips (Guía Pedagógica) */}
				<div className="flex flex-col gap-4">
					<div className="bg-muted/30 p-4 rounded-xl border border-border">
						<H3 className="text-sm font-semibold flex items-center gap-2 mb-2">
							<Search className="h-4 w-4" /> Búsqueda Rápida
						</H3>
						<Input 
							placeholder="Filtrar por nombre o tipo de riesgo..." 
							className="bg-card mb-2"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Ej: "Presupuesto", "Permisos", "Lluvia"
						</p>
					</div>

					{/* "Widget" Informativo basado en la Guía */}
					<div className="flex-1 bg-blue-50/50 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
						<H3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2">
							<Activity className="h-4 w-4" /> Criterio de Prioridad
						</H3>
						<p className="text-xs text-muted-foreground leading-relaxed">
							Según la <strong>Guía Institucional</strong>, se consideran prioritarios los proyectos con alto impacto social o riesgo de inviabilidad financiera.
						</p>
						<div className="mt-3 flex gap-2 flex-wrap">
							<Badge variant="outline" className="text-[10px] bg-background">Alto Impacto</Badge>
							<Badge variant="outline" className="text-[10px] bg-background">Urgencia</Badge>
						</div>
					</div>
				</div>
			</div>

			{/* SECCIÓN 3: LISTADO DE ALERTAS */}
			<div>
				<div className="mb-4 flex items-center gap-2">
					<FileWarning className="h-5 w-5 text-muted-foreground" />
					<H3 className="text-lg">Proyectos con Alertas Activas</H3>
				</div>

				{filteredList.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
						{filteredList.map((project) => (
							<Dialog key={project.id}>
								<DialogTrigger asChild>
									<div className="group relative bg-card hover:bg-muted/40 transition-all duration-200 border border-border hover:border-destructive/30 rounded-xl p-0 cursor-pointer shadow-sm overflow-hidden flex flex-col h-full">
										
										{/* Indicador lateral de severidad */}
										<div className={`absolute left-0 top-0 bottom-0 w-1 ${project.prioridad === 'critica' ? 'bg-destructive' : 'bg-warning'}`} />

										<div className="p-5 pl-6 flex-1">
											<div className="flex justify-between items-start mb-2">
												<Badge 
													variant="outline" 
													className={`text-[10px] font-bold uppercase tracking-wider ${
														project.prioridad === 'critica' 
															? 'text-destructive border-destructive/20 bg-destructive/5' 
															: 'text-warning border-warning/20 bg-warning/5'
													}`}
												>
													{project.prioridad === 'critica' ? 'Atención Inmediata' : 'Riesgo Moderado'}
												</Badge>
												<Small className="text-muted-foreground font-mono">ID: {project.id}</Small>
											</div>
											
											<H3 className="text-base font-bold leading-tight mb-3 line-clamp-2">
												{project.nombre}
											</H3>

											{/* Mini lista de riesgos */}
											<div className="space-y-1.5">
												{project.riesgos.slice(0, 2).map((riesgo, idx) => (
													<div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
														<AlertTriangle className="h-3 w-3 mt-0.5 text-destructive shrink-0" />
														<span className="line-clamp-1">{riesgo}</span>
													</div>
												))}
												{project.riesgos.length > 2 && (
													<p className="text-[10px] text-muted-foreground pl-5 italic">
														+ {project.riesgos.length - 2} alertas adicionales
													</p>
												)}
											</div>
										</div>

										<div className="p-3 pl-6 border-t border-border/50 bg-muted/20 flex justify-between items-center group-hover:bg-muted/30 transition-colors">
											<Small className="text-muted-foreground">Ver diagnóstico completo</Small>
											<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
										</div>
									</div>
								</DialogTrigger>
								
								{/* REUTILIZACIÓN: Mismo Modal de Detalle */}
								<ProjectDetail project={project} />
							</Dialog>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
						<TrendingUp className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
						<H3 className="text-base text-muted-foreground">No se encontraron riesgos</H3>
						<p className="text-sm text-muted-foreground max-w-xs mt-1">
							Intenta buscar con otros términos o limpia los filtros.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}