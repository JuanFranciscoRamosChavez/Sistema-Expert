import { 
	Calendar, 
	MapPin, 
	User, 
	DollarSign, 
	Target, 
	AlertTriangle,
	CheckCircle2
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
import { H3, Subtitle, P, Small } from '@/components/ui/typography';

interface ProjectDetailProps {
	project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
	
	const statusColor = STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || APP_COLORS.neutral;

	const formatMoney = (amount: number) => {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
		}).format(amount);
	};

	return (
		<DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
			
			{/* HEADER DEL MODAL CON COLOR DE ESTATUS */}
			<DialogHeader className="p-6 pb-4 border-b border-border bg-card sticky top-0 z-10">
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Badge 
							variant="outline" 
							className="uppercase tracking-wider font-bold"
							style={{ 
								color: statusColor, 
								borderColor: statusColor,
								backgroundColor: `${statusColor}10` 
							}}
						>
							{project.status.replace('_', ' ')}
						</Badge>
						<Badge variant="secondary" className="text-xs">
							ID: {project.id}
						</Badge>
					</div>
					<DialogTitle className="text-xl md:text-2xl font-display font-bold text-foreground leading-snug">
						{project.nombre}
					</DialogTitle>
					<div className="flex items-center gap-2 text-muted-foreground">
						<MapPin className="h-4 w-4" />
						<DialogDescription className="text-sm mt-0">
							{project.ubicacion} • {project.zona}
						</DialogDescription>
					</div>
				</div>
			</DialogHeader>

			{/* CONTENIDO CON SCROLL */}
			<ScrollArea className="flex-1 p-6">
				<div className="space-y-8">
					
					{/* 1. DESCRIPCIÓN */}
					<div className="space-y-3">
						<H3 className="text-base flex items-center gap-2">
							<Target className="h-4 w-4 text-primary" />
							Objetivo e Impacto
						</H3>
						<div className="bg-muted/30 p-4 rounded-lg border border-border">
							<P className="mt-0 text-sm">{project.descripcion}</P>
							
							<div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
								<div>
									<Small className="block mb-1">Beneficiarios</Small>
									<span className="font-semibold text-foreground">
										{new Intl.NumberFormat('es-MX').format(project.beneficiarios)} personas
									</span>
								</div>
								<div>
									<Small className="block mb-1">Dirección Responsable</Small>
									<span className="font-semibold text-foreground">
										{project.direccion}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* 2. DATOS FINANCIEROS Y AVANCE */}
					<div className="grid md:grid-cols-2 gap-6">
						{/* Tarjeta Financiera */}
						<div className="space-y-3">
							<H3 className="text-base flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-emerald-600" />
								Finanzas
							</H3>
							<div className="p-4 rounded-lg border border-border bg-card space-y-3">
								<div className="flex justify-between items-center">
									<Subtitle>Presupuesto Total</Subtitle>
									<span className="font-bold text-foreground">{formatMoney(project.presupuesto)}</span>
								</div>
								<div className="flex justify-between items-center">
									<Subtitle>Ejercido</Subtitle>
									<span className="font-bold text-primary">{formatMoney(project.ejecutado)}</span>
								</div>
								<Separator />
								<div className="flex justify-between items-center text-xs">
									<span className="text-muted-foreground">Disponibilidad</span>
									<span className="font-mono">{formatMoney(project.presupuesto - project.ejecutado)}</span>
								</div>
							</div>
						</div>

						{/* Tarjeta de Tiempos y Avance */}
						<div className="space-y-3">
							<H3 className="text-base flex items-center gap-2">
								<Calendar className="h-4 w-4 text-blue-500" />
								Cronograma
							</H3>
							<div className="p-4 rounded-lg border border-border bg-card space-y-4">
								<div className="space-y-1.5">
									<div className="flex justify-between text-sm font-medium">
										<span>Avance Físico</span>
										<span style={{ color: statusColor }}>{project.avance.toFixed(1)}%</span>
									</div>
									<Progress value={project.avance} className="h-2" indicatorColor={statusColor} />
								</div>
								
								<div className="grid grid-cols-2 gap-2 text-xs">
									<div className="bg-muted p-2 rounded">
										<span className="block text-muted-foreground mb-0.5">Inicio</span>
										<span className="font-medium text-foreground">
											{new Date(project.fechaInicio).toLocaleDateString()}
										</span>
									</div>
									<div className="bg-muted p-2 rounded">
										<span className="block text-muted-foreground mb-0.5">Fin Prog.</span>
										<span className="font-medium text-foreground">
											{new Date(project.fechaFin).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* 3. RESPONSABLE Y RIESGOS */}
					<div className="grid md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<H3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
								<User className="h-4 w-4" /> Responsable Operativo
							</H3>
							<div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
								<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
									OP
								</div>
								<div>
									<p className="text-sm font-medium text-foreground">{project.responsable}</p>
									<p className="text-xs text-muted-foreground">Coordinador de Obra</p>
								</div>
							</div>
						</div>

						{(project.riesgos && project.riesgos.length > 0) && (
							<div className="space-y-2">
								<H3 className="text-sm uppercase tracking-wider text-destructive font-semibold flex items-center gap-2">
									<AlertTriangle className="h-4 w-4" /> Riesgos Detectados
								</H3>
								<ul className="space-y-2">
									{project.riesgos.map((riesgo, i) => (
										<li key={i} className="text-sm text-muted-foreground flex gap-2 items-start bg-destructive/5 p-2 rounded">
											<span className="text-destructive mt-0.5">•</span>
											{riesgo}
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