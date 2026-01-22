import { useState, useEffect, useMemo } from 'react';
import { 
	Search, 
	Filter, 
	AlertTriangle, 
	LayoutGrid, 
	List as ListIcon, 
	MapPin,
	X,
	SlidersHorizontal 
} from 'lucide-react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
	Select, 
	SelectContent, 
	SelectItem, 
	SelectTrigger, 
	SelectValue 
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
	SheetClose
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Project } from '@/types/index';
import { mapApiToUiProject } from '@/lib/mappers';
import { H1, Subtitle } from "@/components/ui/typography";
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';

export function ProjectsView() {
	// --- ESTADOS ---
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	// Estados de Filtros y Vista
	const [searchTerm, setSearchTerm] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [selectedArea, setSelectedArea] = useState<string>('all');
	const [selectedStatus, setSelectedStatus] = useState<string>('all');

	// --- CARGA DE DATOS ---
	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const response = await fetch('http://127.0.0.1:8000/api/obras/');
				if (!response.ok) {
					throw new Error('No se pudo conectar con el servidor de proyectos');
				}
				const data = await response.json();
				if (Array.isArray(data)) {
					setProjects(data.map(mapApiToUiProject));
				}
			} catch (err) {
				console.error("Error cargando proyectos:", err);
				setError("Hubo un problema al cargar la lista de proyectos.");
			} finally {
				setLoading(false);
			}
		};

		fetchProjects();
	}, []);

	// --- EXTRACCIÓN DE OPCIONES PARA FILTROS ---
	const uniqueAreas = useMemo(() => {
		const areas = projects.map(p => p.direccion).filter(Boolean);
		return Array.from(new Set(areas)).sort();
	}, [projects]);

	const uniqueStatuses = useMemo(() => {
		const statuses = projects.map(p => p.status);
		return Array.from(new Set(statuses));
	}, [projects]);

	// --- LÓGICA DE FILTRADO ---
	const filteredProjects = projects.filter(p => {
		const matchesSearch = 
			p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.responsable?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesArea = selectedArea === 'all' || p.direccion === selectedArea;
		const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
		return matchesSearch && matchesArea && matchesStatus;
	});

	// --- FUNCIÓN PARA LIMPIAR FILTROS ---
	const clearFilters = () => {
		setSearchTerm('');
		setSelectedArea('all');
		setSelectedStatus('all');
	};

	const hasActiveFilters = searchTerm !== '' || selectedArea !== 'all' || selectedStatus !== 'all';

	const formatMoney = (amount: number) => {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			planificado: 'Planificado',
			en_ejecucion: 'En Ejecución',
			completado: 'Completado',
			en_riesgo: 'En Riesgo',
			retrasado: 'Retrasado',
		};
		return labels[status] || status;
	};

	// --- COMPONENTE DE SELECTORES (SOLO DESKTOP) ---
	const FilterControls = () => (
		<>
			{/* Filtro: Áreas */}
			<div className="w-full md:w-[240px]">
				<Select value={selectedArea} onValueChange={setSelectedArea}>
					<SelectTrigger className="bg-background/60">
						<div className="flex items-center gap-2 truncate">
							<Filter className="h-3.5 w-3.5 text-muted-foreground" />
							<SelectValue placeholder="Todas las áreas" />
						</div>
					</SelectTrigger>
					{/* AJUSTE: max-h-[300px] para activar scroll si la lista es larga */}
					<SelectContent className="max-h-[300px]">
						<SelectItem value="all">Todas las áreas</SelectItem>
						{uniqueAreas.map(area => (
							<SelectItem key={area} value={area}>{area}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Filtro: Estatus */}
			<div className="w-full md:w-[200px]">
				<Select value={selectedStatus} onValueChange={setSelectedStatus}>
					<SelectTrigger className="bg-background/60">
						<SelectValue placeholder="Todos los estatus" />
					</SelectTrigger>
					{/* AJUSTE: max-h-[300px] aquí también por si acaso */}
					<SelectContent className="max-h-[300px]">
						<SelectItem value="all">Todos los estatus</SelectItem>
						{uniqueStatuses.map(status => (
							<SelectItem key={status} value={status}>
								{getStatusLabel(status)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</>
	);

	if (loading) return <div className="flex h-96 items-center justify-center gap-2 text-muted-foreground"><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />Cargando cartera...</div>;
	
	if (error) return (
		<div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
			<div className="bg-destructive/10 p-4 rounded-full"><AlertTriangle className="h-8 w-8 text-destructive" /></div>
			<div className="space-y-1"><h3 className="font-semibold text-lg">Error de Carga</h3><p className="text-muted-foreground">{error}</p></div>
			<Button onClick={() => window.location.reload()} variant="outline">Reintentar</Button>
		</div>
	);

	return (
		<div className="space-y-6 animate-fade-in pb-8">
			
			{/* 1. ENCABEZADO */}
			<div className="flex flex-col gap-4">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<H1>Cartera de Proyectos</H1>
						<Subtitle>
							Mostrando {filteredProjects.length} de {projects.length} obras registradas
						</Subtitle>
					</div>

					{/* Toggle View (Solo Desktop) */}
					<div className="hidden md:flex bg-muted p-1 rounded-lg border border-border">
						<button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Cuadrícula">
							<LayoutGrid className="h-4 w-4" />
						</button>
						<button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Lista">
							<ListIcon className="h-4 w-4" />
						</button>
					</div>
				</div>
				
				{/* 2. BARRA DE FILTROS FLUIDA */}
				<div className="flex gap-3 items-center bg-card p-3 rounded-xl border border-border shadow-sm">
					
					{/* BUSCADOR */}
					<div className="relative flex-1">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input 
							placeholder="Buscar proyecto por nombre o responsable..." 
							className="pl-9 bg-muted/30 border-transparent focus:bg-background transition-colors"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						{searchTerm && (
							<button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					{/* FILTROS DESKTOP */}
					<div className="hidden md:flex gap-3 items-center">
						<div className="w-[1px] h-8 bg-border mx-1" />
						<FilterControls />
						
						{hasActiveFilters && (
							<Button 
								variant="ghost" 
								size="sm" 
								onClick={clearFilters}
								className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
							>
								Limpiar
								<X className="ml-2 h-3 w-3" />
							</Button>
						)}
					</div>

					{/* FILTROS MOBILE (Sheet) */}
					<div className="md:hidden">
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="outline" size="icon" className={hasActiveFilters ? "border-primary text-primary bg-primary/5" : ""}>
									<SlidersHorizontal className="h-4 w-4" />
									{(selectedArea !== 'all' || selectedStatus !== 'all') && (
										<span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
									)}
								</Button>
							</SheetTrigger>
							<SheetContent side="bottom" className="rounded-t-[20px] h-auto max-h-[85vh]">
								<SheetHeader className="mb-4 text-left">
									<SheetTitle>Filtros Avanzados</SheetTitle>
									<SheetDescription>
										Refina la búsqueda por área o estado del proyecto.
									</SheetDescription>
								</SheetHeader>
								
								<div className="flex flex-col gap-4 py-4">
									<div className="space-y-2">
										<span className="text-sm font-medium">Área Responsable</span>
										<Select value={selectedArea} onValueChange={setSelectedArea}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Todas" />
											</SelectTrigger>
											{/* AJUSTE: max-h-[300px] para móviles también */}
											<SelectContent className="max-h-[300px]">
												<SelectItem value="all">Todas las áreas</SelectItem>
												{uniqueAreas.map(area => (
													<SelectItem key={area} value={area}>{area}</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<span className="text-sm font-medium">Estatus Actual</span>
										<Select value={selectedStatus} onValueChange={setSelectedStatus}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Todos" />
											</SelectTrigger>
											<SelectContent className="max-h-[300px]">
												<SelectItem value="all">Todos los estatus</SelectItem>
												{uniqueStatuses.map(status => (
													<SelectItem key={status} value={status}>
														{getStatusLabel(status)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<SheetFooter className="flex-row gap-3 pt-4 border-t border-border mt-2">
									<Button 
										variant="outline" 
										className="flex-1"
										onClick={clearFilters}
									>
										Limpiar Todo
									</Button>
									<SheetClose asChild>
										<Button className="flex-1">Ver {filteredProjects.length} Resultados</Button>
									</SheetClose>
								</SheetFooter>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>

			{/* 3. CONTENIDO PRINCIPAL */}
			{filteredProjects.length > 0 ? (
				<>
					{/* GRID VIEW */}
					{viewMode === 'grid' && (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
							{filteredProjects.map((project) => (
								<ProjectCard key={project.id} project={project} />
							))}
						</div>
					)}

					{/* LIST VIEW */}
					{viewMode === 'list' && (
						<div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/30 hover:bg-muted/30">
											<TableHead className="w-[40%] pl-6">Proyecto / Dirección</TableHead>
											<TableHead>Responsable</TableHead>
											<TableHead>Estatus</TableHead>
											<TableHead>Avance</TableHead>
											<TableHead className="text-right pr-6">Presupuesto</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredProjects.map((project) => {
											const statusColor = STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || APP_COLORS.neutral;
											return (
												<Dialog key={project.id}>
													<DialogTrigger asChild>
														<TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
															<TableCell className="pl-6 py-4">
																<div className="flex flex-col gap-1">
																	<span className="font-semibold text-foreground line-clamp-2 leading-tight">{project.nombre}</span>
																	<div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{project.direccion}</div>
																</div>
															</TableCell>
															<TableCell>
																<div className="flex items-center gap-2 text-sm text-foreground">
																	<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
																		{project.responsable ? project.responsable.substring(0,2).toUpperCase() : 'NA'}
																	</div>
																	<span className="truncate max-w-[120px]" title={project.responsable}>{project.responsable || 'Sin asignar'}</span>
																</div>
															</TableCell>
															<TableCell>
																<Badge variant="outline" className="capitalize text-[10px] font-bold tracking-wider" style={{ color: statusColor, borderColor: statusColor, backgroundColor: `${statusColor}10` }}>
																	{getStatusLabel(project.status)}
																</Badge>
															</TableCell>
															<TableCell>
																<div className="w-[100px] space-y-1"><span className="text-xs font-bold">{project.avance.toFixed(1)}%</span><Progress value={project.avance} className="h-1.5" indicatorColor={statusColor} /></div>
															</TableCell>
															<TableCell className="text-right pr-6 font-mono text-sm font-medium">{formatMoney(project.presupuesto)}</TableCell>
														</TableRow>
													</DialogTrigger>
													<ProjectDetail project={project} />
												</Dialog>
											);
										})}
									</TableBody>
								</Table>
							</div>
						</div>
					)}
				</>
			) : (
				<div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl animate-in fade-in zoom-in-95">
					<div className="bg-muted p-4 rounded-full mb-3"><Search className="h-8 w-8 text-muted-foreground" /></div>
					<h3 className="font-semibold text-lg text-foreground">No se encontraron proyectos</h3>
					<p className="text-muted-foreground max-w-sm mt-1">Intenta ajustar los filtros de área, estatus o el término de búsqueda.</p>
					<Button variant="link" onClick={clearFilters} className="mt-2 text-primary">Limpiar filtros</Button>
				</div>
			)}
		</div>
	);
}