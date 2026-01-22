import { CalendarDays, MapPin, User, ChevronRight } from 'lucide-react';
import { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ProjectDetail } from './ProjectDetail';
import { cn } from '@/lib/utils';
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';
import { H3, Small } from '@/components/ui/typography';

interface ProjectCardProps {
	project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
	
	// Determinamos el color basado en el estatus
	const statusColor = STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || APP_COLORS.neutral;

	// Formateador de moneda
	const formatMoney = (amount: number) => {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	// Etiquetas de estatus legibles
	const statusLabels: Record<string, string> = {
		planificado: 'Planificado',
		en_ejecucion: 'En Ejecución',
		completado: 'Completado',
		en_riesgo: 'En Riesgo',
		retrasado: 'Retrasado',
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<div 
					className="group relative flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden h-full"
				>
					{/* Borde superior de color según estatus */}
					<div className="h-1.5 w-full" style={{ backgroundColor: statusColor }} />

					<div className="p-5 flex-1 flex flex-col gap-4">
						{/* HEADER DE LA TARJETA */}
						<div className="flex justify-between items-start gap-3">
							<div className="space-y-1">
								<Badge 
									variant="outline" 
									className="capitalize text-[10px] font-bold tracking-wider mb-1"
									style={{ 
										color: statusColor, 
										borderColor: `${statusColor}40`,
										backgroundColor: `${statusColor}10` 
									}}
								>
									{statusLabels[project.status] || project.status}
								</Badge>
								<H3 className="text-base leading-tight line-clamp-2 min-h-[3rem]" title={project.nombre}>
									{project.nombre}
								</H3>
							</div>
						</div>

						{/* INFORMACIÓN CLAVE */}
						<div className="space-y-2 mt-auto">
							<div className="flex items-center gap-2 text-muted-foreground">
								<User className="h-3.5 w-3.5 shrink-0" />
								<Small className="truncate">{project.responsable || 'Sin asignar'}</Small>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<MapPin className="h-3.5 w-3.5 shrink-0" />
								<Small className="truncate">{project.ubicacion}</Small>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<CalendarDays className="h-3.5 w-3.5 shrink-0" />
								<Small>Inicio: {new Date(project.fechaInicio).toLocaleDateString('es-MX')}</Small>
							</div>
						</div>

						{/* PRESUPUESTO Y AVANCE */}
						<div className="pt-4 border-t border-border space-y-3">
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground font-medium">Presupuesto</span>
								<span className="font-mono font-bold text-foreground">
									{formatMoney(project.presupuesto)}
								</span>
							</div>

							<div className="space-y-1.5">
								<div className="flex justify-between text-xs">
									<span className="text-muted-foreground">Avance Físico</span>
									<span className="font-bold">{project.avance.toFixed(1)}%</span>
								</div>
								<Progress 
									value={project.avance} 
									className="h-2" 
									indicatorColor={statusColor} 
								/>
							</div>
						</div>
					</div>

					{/* HOVER EFFECT - Botón ver detalles */}
					<div className="bg-muted/30 p-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-0 right-0 w-full backdrop-blur-[1px]">
						<Button size="sm" variant="secondary" className="gap-1 shadow-sm">
							Ver Detalles <ChevronRight className="h-3 w-3" />
						</Button>
					</div>
				</div>
			</DialogTrigger>
			
			<ProjectDetail project={project} />
		</Dialog>
	);
}