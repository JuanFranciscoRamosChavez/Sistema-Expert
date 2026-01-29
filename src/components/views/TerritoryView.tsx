import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin, Users, DollarSign, Loader2, AlertCircle, Info, Map } from 'lucide-react';
import { 
	PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

import { useTerritories } from '@/hooks/useTerritories';
import { useDashboardData } from '@/hooks/useDashboardData';
import { formatBudgetValue, formatNumber } from '@/lib/formatters';
import { ZONE_COLORS } from '@/lib/zones';
import { APP_COLORS } from '@/lib/theme';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { H1, H3, P, Subtitle, Small } from '@/components/ui/typography';
import { filterProjectsByZone } from '@/lib/territoryCalculations';

/**
 * TerritoryView - Sprint 3 usando backend
 * Usa useTerritories para agregaciones territoriales serverside
 */
export function TerritoryView() {
	// Obtener agregaciones territoriales del backend
	const { data: territoriesData, isLoading: loadingTerritories, error: territoriesError } = useTerritories();
	
	// Mantener useDashboardData solo para filtrar proyectos individuales al hacer click en zona
	const { projects, kpiData, loading: loadingProjects } = useDashboardData();
	
	const loading = loadingTerritories || loadingProjects;
	const error = territoriesError ? 'Error al cargar datos territoriales' : null;
	
	const [selectedZone, setSelectedZone] = useState<string | null>(null);
	const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);

	// Convertir datos del backend al formato esperado por la UI
	const zoneStats = useMemo(() => {
		if (!territoriesData?.territories) return {};
		
		const stats: Record<string, any> = {};
		territoriesData.territories.forEach(territory => {
			stats[territory.name] = {
				count: territory.projects,
				budget: territory.total_budget,
				beneficiaries: territory.beneficiaries || 0
			};
		});
		return stats;
	}, [territoriesData]);

	// Filtrar proyectos por zona seleccionada
	const filteredProjects = useMemo(() => {
		if (!selectedZone) return [];
		return filterProjectsByZone(projects, selectedZone);
	}, [projects, selectedZone]);

	const handleZoneClick = (zoneName: string) => {
		setSelectedZone(zoneName);
		setIsMapDialogOpen(true);
	};

	// Preparar datos para gráficas
	const pieData = useMemo(() => {
		return Object.entries(zoneStats)
			.map(([name, data]) => ({
				name,
				value: data.budget
			}));
	}, [zoneStats]);

	const barData = useMemo(() => {
		return Object.entries(zoneStats)
			.map(([name, data]) => ({
				name,
				proyectos: data.count,
				beneficiarios: data.beneficiaries
			}));
	}, [zoneStats]);

	// Calcular totales
	const presupuestoZonasCalculado = Object.values(zoneStats)
		.reduce((sum: number, z: any) => sum + (z.budget || 0), 0);
	const proyectosTotalesReales = projects.length;
	const asignacionesZonales = Object.values(zoneStats)
		.reduce((sum: number, z: any) => sum + (z.count || 0), 0);
	const beneficiariosTotales = Object.values(zoneStats)
		.reduce((sum: number, z: any) => sum + (z.beneficiaries || 0), 0);
	
	const presupuestoTotalReal = kpiData?.budget?.total || presupuestoZonasCalculado;

	// --- Estados de Carga y Error ---
	if (loading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-muted-foreground">Cargando análisis territorial...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-64 flex-col items-center justify-center text-destructive">
				<AlertCircle className="h-10 w-10 mb-2" />
				<P>No se pudo cargar la información territorial</P>
				<Small className="mt-1">{error}</Small>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6 animate-fade-in px-2 sm:px-0">
			{/* Encabezado */}
			<div>
					<H1>
						Impacto Territorial
					</H1>
					<Subtitle className="mt-1">
						Distribución geográfica de la inversión y alcance social por zonas estratégicas de la CDMX.
					</Subtitle>
					<div className="mt-2 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
						<Small className="text-blue-800 dark:text-blue-300 flex items-start gap-2">
							<Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
							<span>
								<strong>Metodología de cálculo:</strong> Se utiliza el campo "Alcance Territorial" para determinar la distribución: 
								proyectos de <em>una alcaldía</em> asignan el 100% a su zona; 
								<em>múltiples alcaldías</em> prorratean entre zonas afectadas; 
								y <em>ciudad completa</em> divide equitativamente entre las 5 zonas.
							</span>
						</Small>
					</div>
				</div>

			{/* Panel de Estadísticas Totales */}
			<div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg">
					<div className="text-center py-2 sm:py-0">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="cursor-help">
										<Small className="flex items-center justify-center gap-1">
											Total Proyectos
											<Info className="h-3 w-3" />
										</Small>
											<P className="text-base sm:text-lg font-bold text-foreground">{proyectosTotalesReales}</P>
										{asignacionesZonales > proyectosTotalesReales && (
											<Small>
												({asignacionesZonales} asignaciones zonales)
											</Small>
										)}
									</div>
								</TooltipTrigger>
								<TooltipContent side="top" className="max-w-xs">
									<Small>
										Número real de proyectos únicos. Los proyectos multiterritoriales se cuentan una sola vez aquí, pero aparecen en cada zona que afectan.
									</Small>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<div className="text-center py-2 sm:py-0 border-y sm:border-y-0 sm:border-x border-slate-200 dark:border-slate-700">
					<Small>Presupuesto Total</Small>
						<P className="text-base sm:text-lg font-bold text-foreground break-words">{formatBudgetValue({ value: presupuestoTotalReal })}</P>
						{presupuestoZonasCalculado !== presupuestoTotalReal && (
							<Small className="mt-0.5 hidden sm:block">
								(Distribuido: {formatBudgetValue({ value: presupuestoZonasCalculado })})
							</Small>
						)}
					</div>
					<div className="text-center py-2 sm:py-0">
					<Small>Beneficiarios Totales</Small>
						<P className="text-base sm:text-lg font-bold text-foreground">{formatNumber(Math.round(beneficiariosTotales))}</P>
					</div>
				</div>

			{/* Tarjetas de Resumen por Zona */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
				{Object.entries(zoneStats).map(([zoneName, data], index) => {
						const color = ZONE_COLORS[zoneName] || 'hsl(var(--muted))';
						
						return (
							<Card 
								key={zoneName} 
								className="overflow-hidden transition-all hover:shadow-md border-t-4"
								style={{ borderTopColor: color, animationDelay: `${index * 50}ms`, minHeight: '160px' }}
							>
								<CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
									<div className="flex items-center gap-2 mb-2 sm:mb-3">
										<MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" style={{ color }} />
										<H3 className="text-sm truncate" title={zoneName}>
											{zoneName}
										</H3>
									</div>
									
									<div className="space-y-2 sm:space-y-3 text-sm">
										<div className="flex justify-between items-center">
											<Small>Proyectos</Small>
											<span className="font-bold bg-muted px-2 py-0.5 rounded-full text-xs">
												{data.count}
											</span>
										</div>
										
										<div className="space-y-1">
											<div className="flex justify-between text-xs">
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Small className="flex items-center gap-1 cursor-help">
																Inversión
																<Info className="h-3 w-3" />
															</Small>
														</TooltipTrigger>
														<TooltipContent side="top" className="max-w-xs">
															<Small>Presupuesto prorrateado entre zonas afectadas por proyectos multiterritoriales</Small>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
												<span className="font-bold">{formatBudgetValue({ value: data.budget })}</span>
											</div>
											<Progress value={100} className="h-1" style={{ backgroundColor: `${color}30` }}>
												<div 
													className="h-full rounded-full" 
													style={{ width: '100%', backgroundColor: color }} 
												/>
											</Progress>
										</div>

										<div className="flex justify-between items-center pt-1 border-t border-border/50">
											<Small>Beneficiarios</Small>
											<span className="font-medium text-xs flex items-center gap-1">
												<Users className="h-3 w-3" />
												{formatNumber(data.beneficiaries)}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						);
				})}
			</div>

			{/* Sección de Gráficas */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
				
				{/* Gráfica de Pastel: Distribución de Inversión */}
				<Card className="flex flex-col animate-slide-up" style={{ animationDelay: '100ms' }}>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
							<DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
							Distribución de Inversión por Zona
						</CardTitle>
						<Subtitle className="hidden sm:block">
							Presupuesto prorrateado. Proyectos multiterritoriales se dividen equitativamente entre sus zonas.
						</Subtitle>
					</CardHeader>
					<CardContent className="flex-1 flex items-center justify-center p-4 sm:p-6">
						<div className="w-full h-[280px] sm:h-[320px] md:h-[350px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={pieData}
										cx="50%"
										cy="50%"
										innerRadius={50}
										outerRadius={90}
										paddingAngle={2}
										dataKey="value"
										label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
										labelLine={false}
									>
										{pieData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={ZONE_COLORS[entry.name] || 'hsl(var(--muted))'} />
										))}
									</Pie>
									<RechartsTooltip 
										formatter={(value: number) => formatBudgetValue({ value })}
										contentStyle={{ 
											backgroundColor: 'hsl(var(--popover))',
											borderColor: 'hsl(var(--border))',
											borderRadius: 'var(--radius)',
											color: 'hsl(var(--popover-foreground))'
										}}
									/>
									<Legend verticalAlign="bottom" height={36} iconType="circle" />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Gráfica de Barras: Comparativa de Proyectos y Beneficiarios */}
				<Card className="flex flex-col animate-slide-up" style={{ animationDelay: '200ms' }}>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
							<Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
							Proyectos y Beneficiarios por Zona
						</CardTitle>
						<Subtitle className="hidden sm:block">
							Comparativa de proyectos (eje izquierdo) vs beneficiarios (eje derecho).
						</Subtitle>
					</CardHeader>
					<CardContent className="flex-1 flex items-center justify-center p-4 sm:p-6">
						<div className="w-full h-[280px] sm:h-[320px] md:h-[350px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={barData} margin={{ top: 10, right: 5, left: -10, bottom: 50 }}>

									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
									<XAxis 
										dataKey="name" 
										tick={{ fontSize: 9 }} 
										angle={-45}
										textAnchor="end"
										height={60}
										interval={0}
									/>
									<YAxis yAxisId="left" tick={{ fontSize: 9 }} width={35} />
									<YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} width={35} />
									<RechartsTooltip 
										contentStyle={{ 
											backgroundColor: 'hsl(var(--card))',
											border: '1px solid hsl(var(--border))',
											borderRadius: '8px',
										}}
										formatter={(value: number, name: string) => {
											if (name === 'Proyectos') {
												return [value, name];
											}
											return [formatNumber(value), 'Beneficiarios'];
										}}
									/>
									<Legend />
									<Bar yAxisId="left" dataKey="proyectos" name="Proyectos" fill={APP_COLORS.info} radius={[4, 4, 0, 0]} />
									<Bar yAxisId="right" dataKey="beneficiarios" name="Beneficiarios" fill={APP_COLORS.success} radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Mapa Esquemático de Zonas */}
			<Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
						<Map className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
						Mapa de Impacto Territorial
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="relative h-80 bg-muted/30 rounded-lg overflow-hidden">
						{/* Vista esquemática en forma de cruz - Grid 3x3 */}
						<div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-4">
							{/* Norte - Fila 1, Columna 2 */}
							<button
								onClick={() => handleZoneClick('Zona Norte')}
								className="col-start-2 row-start-1 rounded-lg border-2 flex flex-col items-center justify-center p-2 sm:p-4 hover:scale-105 transition-all cursor-pointer"
								style={{
									backgroundColor: `${ZONE_COLORS['Zona Norte']}20`,
									borderColor: `${ZONE_COLORS['Zona Norte']}60`
								}}
							>
								<H3 className="text-sm sm:text-base" style={{ color: ZONE_COLORS['Zona Norte'] }}>
									Norte
								</H3>
								<Small className="mt-1">
									{zoneStats['Zona Norte']?.count || 0} proyectos
								</Small>
							</button>

							{/* Poniente - Fila 2, Columna 1 */}
							<button
								onClick={() => handleZoneClick('Zona Poniente')}
								className="col-start-1 row-start-2 rounded-lg border-2 flex flex-col items-center justify-center p-2 sm:p-4 hover:scale-105 transition-all cursor-pointer"
								style={{
									backgroundColor: `${ZONE_COLORS['Zona Poniente']}20`,
									borderColor: `${ZONE_COLORS['Zona Poniente']}60`
								}}
							>
								<H3 className="text-sm sm:text-base" style={{ color: ZONE_COLORS['Zona Poniente'] }}>
									Poniente
								</H3>
								<Small className="mt-1">
									{zoneStats['Zona Poniente']?.count || 0} proyectos
								</Small>
							</button>

							{/* Centro - Fila 2, Columna 2 */}
							<button
								onClick={() => handleZoneClick('Centro Histórico')}
								className="col-start-2 row-start-2 rounded-lg border-2 flex flex-col items-center justify-center p-2 sm:p-4 hover:scale-105 transition-all cursor-pointer"
								style={{
									backgroundColor: `${ZONE_COLORS['Centro Histórico']}20`,
									borderColor: `${ZONE_COLORS['Centro Histórico']}60`
								}}
							>
								<H3 className="text-sm sm:text-base" style={{ color: ZONE_COLORS['Centro Histórico'] }}>
									Centro
								</H3>
								<Small className="mt-1">
									{zoneStats['Centro Histórico']?.count || 0} proyectos
								</Small>
							</button>

							{/* Oriente - Fila 2, Columna 3 */}
							<button
								onClick={() => handleZoneClick('Zona Oriente')}
								className="col-start-3 row-start-2 rounded-lg border-2 flex flex-col items-center justify-center p-2 sm:p-4 hover:scale-105 transition-all cursor-pointer"
								style={{
									backgroundColor: `${ZONE_COLORS['Zona Oriente']}20`,
									borderColor: `${ZONE_COLORS['Zona Oriente']}60`
								}}
							>
								<H3 className="text-sm sm:text-base" style={{ color: ZONE_COLORS['Zona Oriente'] }}>
									Oriente
								</H3>
								<Small className="mt-1">
									{zoneStats['Zona Oriente']?.count || 0} proyectos
								</Small>
							</button>

							{/* Sur - Fila 3, Columna 2 */}
							<button
								onClick={() => handleZoneClick('Zona Sur')}
								className="col-start-2 row-start-3 rounded-lg border-2 flex flex-col items-center justify-center p-2 sm:p-4 hover:scale-105 transition-all cursor-pointer"
								style={{
									backgroundColor: `${ZONE_COLORS['Zona Sur']}20`,
									borderColor: `${ZONE_COLORS['Zona Sur']}60`
								}}
							>
								<H3 className="text-sm sm:text-base" style={{ color: ZONE_COLORS['Zona Sur'] }}>
									Sur
								</H3>
								<Small className="mt-1">
									{zoneStats['Zona Sur']?.count || 0} proyectos
								</Small>
							</button>
						</div>
					</div>
					<Subtitle className="text-center mt-4">
						Vista esquemática de distribución territorial. Haz clic en una zona para ver sus proyectos.
					</Subtitle>
				</CardContent>
			</Card>

			{/* Análisis de Equidad Territorial */}
			<Card className="animate-slide-up" style={{ animationDelay: '350ms' }}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
						<DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
						Análisis de Equidad Territorial
					</CardTitle>
					<Subtitle>
						Distribución del presupuesto entre las zonas estratégicas de la Ciudad de México.
					</Subtitle>
				</CardHeader>
				<CardContent className="p-4 sm:p-6">
					<div className="space-y-3">
						{Object.entries(zoneStats)

							.sort((a, b) => b[1].budget - a[1].budget) // Ordenar por presupuesto descendente
							.map(([zoneName, data], index) => {
								const color = ZONE_COLORS[zoneName] || 'hsl(var(--muted))';
								const porcentajeDelTotal = presupuestoTotalReal > 0 
									? (data.budget / presupuestoTotalReal) * 100 
									: 0;

								return (
									<div 
										key={zoneName}
										className="group p-3 sm:p-4 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-md bg-card"
									>
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
											{/* Nombre y color de zona */}
											<div className="flex items-center gap-3 flex-1">
												<div 
													className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
													style={{ backgroundColor: color }}
												/>
												<div className="flex-1 min-w-0">
											<H3 className="text-sm sm:text-base truncate">{zoneName}</H3>
													<Small>
														{data.count} proyecto{data.count !== 1 ? 's' : ''} · {formatNumber(data.beneficiaries)} beneficiarios
													</Small>
												</div>
											</div>

											{/* Presupuesto y porcentaje */}
											<div className="flex items-center gap-3 sm:gap-4">
												<div className="text-right">
													<P className="font-bold text-base sm:text-lg" style={{ color }}>
														{formatBudgetValue({ value: data.budget })}
													</P>
													<Small>
														{porcentajeDelTotal.toFixed(1)}% del total
													</Small>
												</div>
												<div className="hidden sm:block w-12 text-right">
													<span className="text-2xl font-bold text-muted-foreground/30">
														#{index + 1}
													</span>
												</div>
											</div>
										</div>

										{/* Barra de progreso visual */}
										<div className="mt-3">
											<Progress value={porcentajeDelTotal} className="h-2">
												<div 
													className="h-full rounded-full transition-all"
													style={{ 
														width: `${porcentajeDelTotal}%`, 
														backgroundColor: color 
													}} 
												/>
											</Progress>
										</div>
									</div>
								);
							})
						}
					</div>
		</CardContent>
	</Card>


			<Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<MapPin className="h-5 w-5 text-primary" />
							Proyectos en {selectedZone}
						</DialogTitle>
						<DialogDescription>
							{filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''} en esta zona
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
						{filteredProjects.length > 0 ? (
							filteredProjects.map(project => (
								<ProjectCard key={project.id} project={project} />
							))
						) : (
							<div className="col-span-2 text-center py-8 text-muted-foreground">
								<AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
							<P>No se encontraron proyectos en esta zona</P>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

