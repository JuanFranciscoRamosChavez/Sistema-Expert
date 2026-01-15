import { 
	Calendar, 
	MapPin, 
	User, 
	DollarSign, 
	Target, 
	AlertTriangle,
} from 'lucide-react';
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Project } from '@/lib/mockData';
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';
import { H3, P, Small, Subtitle } from '@/components/ui/typography';

interface ProjectDetailProps {
	project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
	
	const statusColor = STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || APP_COLORS.neutral;

	const formatMoney = (amount: number) => {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			maximumFractionDigits: 0
		}).format(amount);
	};

	return (
		// AJUSTE 1: w-full y max-w-[95vw] aseguran que quepa en celulares. 
		// max-h-[90vh] evita que sea más alto que la pantalla.
		<DialogContent className="w-full max-w-[95vw] md:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 bg-card border-border overflow-hidden">
			
			{/* HEADER FIJO (No hace scroll) */}
			<DialogHeader className="p-4 md:p-6 pb-4 border-b border-border bg-card shrink-0">
				<div className="flex flex-col gap-3 md:gap-2">
					{/* Badges de estado */}
					<div className="flex flex-wrap items-center gap-2">
						<Badge 
							variant="outline" 
							className="uppercase tracking-wider font-bold px-2 py-0.5 text-[10px] md:text-xs"
							style={{ 
								color: statusColor, 
								borderColor: statusColor,
								backgroundColor: `${statusColor}10` 
							}}
						>
							{project.status.replace('_', ' ')}
						</Badge>
						<Badge variant="secondary" className="text-[10px] md:text-xs text-muted-foreground">
							ID: {project.id}
						</Badge>
					</div>

					{/* Título adaptable */}
					<DialogTitle className="text-lg md:text-2xl font-display font-bold text-foreground leading-tight text-balance">
						{project.nombre}
					</DialogTitle>

					{/* Ubicación */}
					<div className="flex items-start md:items-center gap-2 text-muted-foreground mt-1">
						<MapPin className="h-4 w-4 mt-0.5 md:mt-0 shrink-0" />
						<DialogDescription className="text-xs md:text-sm m-0 line-clamp-2">
							{project.ubicacion} • {project.zona}
						</DialogDescription>
					</div>
				</div>
			</DialogHeader>

			{/* CUERPO CON SCROLL (El contenido se mueve, el header no) */}
			<ScrollArea className="flex-1">
				<div className="p-4 md:p-6 space-y-6 md:space-y-8">
					
					{/* 1. OBJETIVO (Texto descriptivo) */}
					<div className="space-y-3">
						<H3 className="text-sm md:text-base flex items-center gap-2">
							<Target className="h-4 w-4 text-primary" />
							Objetivo e Impacto
						</H3>
						<div className="bg-muted/30 p-4 rounded-lg border border-border">
							<P className="mt-0 text-xs md:text-sm leading-relaxed text-muted-foreground">
								{project.descripcion || "Sin descripción detallada disponible para este proyecto."}
							</P>
							
							{/* AJUSTE 2: Grid 1 columna en móvil, 2 en escritorio */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
								<div>
									<Small className="block mb-1 opacity-70">Beneficiarios Directos</Small>
									<span className="font-semibold text-sm md:text-base text-foreground flex items-center gap-2">
										{new Intl.NumberFormat('es-MX').format(project.beneficiarios)} 
										<span className="text-xs font-normal text-muted-foreground">personas</span>
									</span>
								</div>
								<div>
									<Small className="block mb-1 opacity-70">Dirección Responsable</Small>
									<span className="font-semibold text-sm md:text-base text-foreground block truncate" title={project.direccion}>
										{project.direccion}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* 2. DATOS FINANCIEROS Y CRONOGRAMA */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						
						{/* Tarjeta Financiera */}
						<div className="space-y-3">
							<H3 className="text-sm md:text-base flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-emerald-600" />
								Estatus Financiero
							</H3>
							<div className="p-4 rounded-lg border border-border bg-card space-y-3 shadow-sm">
								<div className="flex justify-between items-center">
									<Subtitle>Presupuesto Total</Subtitle>
									<span className="font-bold text-sm md:text-base text-foreground">{formatMoney(project.presupuesto)}</span>
								</div>
								<div className="flex justify-between items-center">
									<Subtitle>Ejercido (Pagado)</Subtitle>
									<span className="font-bold text-sm md:text-base text-primary">{formatMoney(project.ejecutado)}</span>
								</div>
								<Separator />
								<div className="flex justify-between items-center text-xs">
									<span className="text-muted-foreground">Por ejercer</span>
									<span className="font-mono font-medium opacity-80">
										{formatMoney(project.presupuesto - project.ejecutado)}
									</span>
								</div>
							</div>
						</div>

						{/* Tarjeta de Tiempos y Avance */}
						<div className="space-y-3">
							<H3 className="text-sm md:text-base flex items-center gap-2">
								<Calendar className="h-4 w-4 text-blue-500" />
								Cronograma y Avance
							</H3>
							<div className="p-4 rounded-lg border border-border bg-card space-y-4 shadow-sm">
								<div className="space-y-2">
									<div className="flex justify-between text-xs md:text-sm font-medium">
										<span>Avance Físico Reportado</span>
										<span style={{ color: statusColor }}>{project.avance.toFixed(1)}%</span>
									</div>
									<Progress value={project.avance} className="h-2.5" indicatorColor={statusColor} />
								</div>
								
								<div className="grid grid-cols-2 gap-3 text-xs">
									<div className="bg-muted/50 p-2.5 rounded border border-border/50">
										<span className="block text-muted-foreground mb-1">Fecha Inicio</span>
										<span className="font-medium text-foreground">
											{new Date(project.fechaInicio).toLocaleDateString('es-MX')}
										</span>
									</div>
									<div className="bg-muted/50 p-2.5 rounded border border-border/50">
										<span className="block text-muted-foreground mb-1">Fecha Término</span>
										<span className="font-medium text-foreground">
											{new Date(project.fechaFin).toLocaleDateString('es-MX')}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* 3. RESPONSABLE Y RIESGOS */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Responsable */}
						<div className="space-y-2">
							<H3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
								<User className="h-3.5 w-3.5" /> Responsable Operativo
							</H3>
							<div className="flex items-center gap-3 p-3 bg-secondary/20 border border-secondary/20 rounded-lg">
								<div className="h-9 w-9 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 shadow-sm">
									{project.responsable ? project.responsable.substring(0,2).toUpperCase() : 'NA'}
								</div>
								<div className="min-w-0">
									<p className="text-sm font-medium text-foreground truncate" title={project.responsable}>
										{project.responsable || "No asignado"}
									</p>
									<p className="text-xs text-muted-foreground truncate">Coordinador de Obra</p>
								</div>
							</div>
						</div>

						{/* Riesgos (Solo si existen) */}
						{(project.riesgos && project.riesgos.length > 0 && project.riesgos[0] !== "") && (
							<div className="space-y-2">
								<H3 className="text-xs uppercase tracking-wider text-destructive font-semibold flex items-center gap-2">
									<AlertTriangle className="h-3.5 w-3.5" /> Riesgos Detectados
								</H3>
								<ul className="space-y-2">
									{project.riesgos.map((riesgo, i) => (
										<li key={i} className="text-xs md:text-sm text-foreground/80 flex gap-2 items-start bg-destructive/5 p-2.5 rounded border border-destructive/10">
											<span className="text-destructive mt-0.5">•</span>
											<span className="leading-snug">{riesgo}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

				</div>
			</ScrollArea>
		</DialogContent>
	);
}