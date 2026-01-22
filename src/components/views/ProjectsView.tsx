import { useState, useEffect, useMemo } from 'react';
import { 
	AlertTriangle, 
	LayoutGrid, 
	List as ListIcon, 
	MapPin,
	Search
} from 'lucide-react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { Button } from '@/components/ui/button';
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
import { Project } from '@/types';
import { useDashboardData } from '@/hooks/useDashboardData';
import { H1, Subtitle } from "@/components/ui/typography";
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';
// Importamos el nuevo componente
import { FilterBar, FilterConfig } from '@/components/shared/FilterBar';

export function ProjectsView() {
	// --- DATOS ---
	const { projects, loading, error } = useDashboardData();
	
	// Estados de Filtros y Vista
	const [searchTerm, setSearchTerm] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [selectedArea, setSelectedArea] = useState<string>('all');
	const [selectedStatus, setSelectedStatus] = useState<string>('all');

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

	// --- CONFIGURACIÓN DEL COMPONENTE FILTERBAR ---
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

	const filterConfigs: FilterConfig[] = [
		{
			key: 'area',
			label: 'Todas las áreas',
			title: 'Área Responsable',
			value: selectedArea,
			onChange: setSelectedArea,
			options: uniqueAreas.map(area => ({ label: area, value: area }))
		},
		{
			key: 'status',
			label: 'Todos los estatus',
			title: 'Estatus Actual',
			value: selectedStatus,
			onChange: setSelectedStatus,
			options: uniqueStatuses.map(status => ({ label: getStatusLabel(status), value: status }))
		}
	];

	const clearFilters = () => {
		setSearchTerm('');
		setSelectedArea('all');
		setSelectedStatus('all');
	};

	// Contenido extra para el FilterBar (Toggle Grid/List)
	const ViewToggle = (
		<div className="flex bg-muted p-1 rounded-lg border border-border">
			<button 
				onClick={() => setViewMode('grid')} 
				className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`} 
				title="Cuadrícula"
			>
				<LayoutGrid className="h-4 w-4" />
			</button>
			<button 
				onClick={() => setViewMode('list')} 
				className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`} 
				title="Lista"
			>
				<ListIcon className="h-4 w-4" />
			</button>
		</div>
	);

	const formatMoney = (amount: number) => {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

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
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<H1>Cartera de Proyectos</H1>
					<Subtitle>
						Mostrando {filteredProjects.length} de {projects.length} obras registradas
					</Subtitle>
				</div>
			</div>
				
			{/* 2. BARRA DE FILTROS REUTILIZABLE */}
			<FilterBar 
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				searchPlaceholder="Buscar proyecto por nombre o responsable..."
				filters={filterConfigs}
				onClearFilters={clearFilters}
				extraActions={ViewToggle}
			/>

			{/* 3. CONTENIDO PRINCIPAL */}
			{filteredProjects.length > 0 ? (
				<>
					{/* GRID VIEW */}
					{viewMode === 'grid' && (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
							{filteredProjects.map((project) => (
								<ProjectCard key={project.id} project={project as any} />
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
													<ProjectDetail project={project as any} />
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