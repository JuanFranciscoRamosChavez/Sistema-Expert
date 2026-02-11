import { useState } from 'react';
import { 
	Calendar, 
	MapPin, 
	User, 
	DollarSign, 
	Target, 
	AlertTriangle,
	X,
	ArrowLeft,
	Building2,
	ChevronDown,
	ChevronUp
} from 'lucide-react';
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Project } from '@/types';
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';
import { H3, P, Small, Subtitle } from '@/components/ui/typography';
import { analyzeTerritorialCoverage, formatDate } from '@/lib/formatters';
import { formatPercentage, formatNumber } from '@/lib/formatters';

interface ProjectDetailProps {
	project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
	
	const statusColor = STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || APP_COLORS.neutral;
	const territorial = analyzeTerritorialCoverage(project.alcaldias);
	
	// Estado para colapsar/expandir alcaldías
	const [isAlcaldiasExpanded, setIsAlcaldiasExpanded] = useState(false);

	const formatMoney = (amount: number) => {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			maximumFractionDigits: 0
		}).format(amount);
	};

	return (
		<DialogContent className="w-[95vw] max-w-[95vw] sm:w-[90vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[92vh] sm:max-h-[90vh] flex flex-col p-0 gap-0 bg-card border-border overflow-hidden">
			
			{/* HEADER: Título y Botón X Grande */}
			<DialogHeader className="p-3 sm:p-4 md:p-6 pb-3 sm:pb-4 border-b border-border bg-card shrink-0 z-10 flex flex-row items-start justify-between space-y-0">
				<div className="flex flex-col gap-3 md:gap-2 pr-4">
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

					{/* Ubicación Territorial */}
					<div className="space-y-3 mt-3">
						{/* Alcaldías */}
						<div className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
							{/* Header con botón toggle */}
							<div className={isAlcaldiasExpanded && territorial.type !== 'unknown' && Object.keys(territorial.grouped || {}).length > 0 ? '' : 'pb-0'}>
								<button
									onClick={() => setIsAlcaldiasExpanded(!isAlcaldiasExpanded)}
									className="w-full flex items-center justify-between px-3 pt-3 pb-3 hover:bg-muted/50 transition-colors active:bg-muted/70"
								>
									<div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
										<Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-primary" />
										<span className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wide truncate">
											Alcaldía(s)
										</span>
										<Badge variant="secondary" className="text-[9px] sm:text-[10px] shrink-0">
											{territorial.display}
										</Badge>
									</div>
									{territorial.type !== 'unknown' && Object.keys(territorial.grouped || {}).length > 0 && (
										<div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground shrink-0">
											<span className="hidden sm:inline">
												{isAlcaldiasExpanded ? 'Ocultar' : 'Ver detalles'}
											</span>
											{isAlcaldiasExpanded ? (
												<ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
											) : (
												<ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
											)}
										</div>
									)}
								</button>
							</div>
							
							{/* Contenido colapsable */}
							{isAlcaldiasExpanded && territorial.type !== 'unknown' && territorial.grouped && Object.keys(territorial.grouped).length > 0 && (
								<div className="px-3 pb-3 border-t border-border/50">
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mt-3">
										{Object.entries(territorial.grouped).map(([zone, alcaldias]) => (
											<div key={zone} className="space-y-1.5 sm:space-y-2">
												<span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider block">
													{zone}
												</span>
												<div className="flex flex-wrap gap-1 sm:gap-1.5">
													{(alcaldias as string[]).map((alcaldia, idx) => (
														<span key={idx} className="text-[10px] sm:text-xs bg-background px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-border shadow-sm break-words">
															{alcaldia}
														</span>
													))}
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
						
						{/* Ubicación Específica */}
						{project.ubicacion_especifica && (
							<div className="bg-muted/30 rounded-lg p-3 border border-border/50">
								<div className="flex items-start gap-1.5 sm:gap-2">
									<MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 shrink-0 text-primary" />
									<div className="flex-1 min-w-0">
										<span className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wide block mb-1 sm:mb-1.5">
											Ubicación Específica
										</span>
										<DialogDescription className="text-xs sm:text-sm m-0 text-muted-foreground leading-relaxed break-words">
											{project.ubicacion_especifica}
										</DialogDescription>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* BOTÓN CERRAR (X) SUPERIOR */}
				<DialogClose asChild>
					<Button variant="ghost" size="icon" className="-mt-1 -mr-2 h-8 w-8 text-muted-foreground hover:text-foreground">
						<X className="h-5 w-5" />
						<span className="sr-only">Cerrar</span>
					</Button>
				</DialogClose>
			</DialogHeader>

			{/* CUERPO CON SCROLL */}
			<div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 scroll-smooth overscroll-contain">
				<div className="space-y-4 sm:space-y-6 md:space-y-8">
					
					{/* 1. OBJETIVO */}
					<div className="space-y-3">
						<H3 className="text-sm md:text-base flex items-center gap-2">
							<Target className="h-4 w-4 text-primary" />
							Objetivo e Impacto
						</H3>
						<div className="bg-muted/30 p-4 rounded-lg border border-border">
							<P className="mt-0 text-xs md:text-sm leading-relaxed text-muted-foreground text-pretty">
								{project.descripcion || "Sin descripción detallada disponible para este proyecto."}
							</P>
							
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
								<div>
									<Small className="block mb-1 opacity-70 text-xs">Beneficiarios Directos</Small>
									<span className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-1.5 sm:gap-2">
									{formatNumber(project.beneficiarios)} 
										<span className="text-[10px] sm:text-xs font-normal text-muted-foreground">personas</span>
									</span>
								</div>
								<div className="min-w-0">
									<Small className="block mb-1 opacity-70 text-xs">Dirección Responsable</Small>
									<span className="font-semibold text-sm sm:text-base text-foreground block truncate" title={project.direccion}>
										{project.direccion}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* 1.5. INFORMACIÓN DEL PROYECTO */}
					<div className="space-y-3">
						<H3 className="text-sm md:text-base flex items-center gap-2">
							<Building2 className="h-4 w-4 text-primary" />
							Información del Proyecto
						</H3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
							{/* Tipo de Obra */}
							<div className="bg-muted/30 p-3 sm:p-4 rounded-lg border border-border">
								<Small className="block mb-1.5 sm:mb-2 opacity-70 text-xs font-semibold uppercase tracking-wider">
									Tipo de Obra
								</Small>
								<span className="text-xs sm:text-sm text-foreground font-medium leading-snug block">
									{project.tipo_obra || 'No especificado'}
								</span>
							</div>

							{/* Tipo de Recurso */}
							<div className="bg-muted/30 p-3 sm:p-4 rounded-lg border border-border">
								<Small className="block mb-1.5 sm:mb-2 opacity-70 text-xs font-semibold uppercase tracking-wider">
									Tipo de Recurso
								</Small>
								<span className="text-xs sm:text-sm text-foreground font-medium leading-snug block">
									{project.tipo_recurso || 'No especificado'}
								</span>
							</div>

							{/* Fuente de Financiamiento */}
							<div className="bg-muted/30 p-3 sm:p-4 rounded-lg border border-border">
								<Small className="block mb-1.5 sm:mb-2 opacity-70 text-xs font-semibold uppercase tracking-wider">
									Fuente de Financiamiento
								</Small>
								<span className="text-xs sm:text-sm text-foreground font-medium leading-snug block">
									{project.fuente_financiamiento || 'No especificado'}
								</span>
							</div>
						</div>
					</div>

					{/* 2. DATOS FINANCIEROS Y CRONOGRAMA */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
						
						{/* Tarjeta Financiera */}
						<div className="space-y-2 sm:space-y-3">
							<H3 className="text-sm sm:text-base flex items-center gap-2">
								<DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
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
								<div className="space-y-1">
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">Avance Financiero</span>
									<span className="font-semibold text-emerald-600">{formatPercentage(project.avance_financiero_pct, 1)}</span>
									</div>
									<Progress value={project.avance_financiero_pct} className="h-1.5" indicatorColor="#10b981" />
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
						<div className="space-y-2 sm:space-y-3">
							<H3 className="text-sm sm:text-base flex items-center gap-2">
								<Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: STATUS_COLORS.info }} />
								Cronograma y Avance
							</H3>
							<div className="p-4 rounded-lg border border-border bg-card space-y-4 shadow-sm">
								<div className="space-y-2">
									<div className="flex justify-between text-xs md:text-sm font-medium">
										<span>Avance Físico Reportado</span>
										<span style={{ color: statusColor }}>{formatPercentage(project.avance, 1)}</span>
									</div>
									<Progress value={project.avance} className="h-2.5" indicatorColor={statusColor} />
								</div>
								
								<div className="grid grid-cols-2 gap-3 text-xs">
									<div className="bg-muted/50 p-2.5 rounded border border-border/50">
										<span className="block text-muted-foreground mb-1">Fecha Inicio</span>
										<span className="font-medium text-foreground">
											{formatDate(project.fechaInicio) || 'No definida'}
										</span>
									</div>
									<div className="bg-muted/50 p-2.5 rounded border border-border/50">
										<span className="block text-muted-foreground mb-1">Fecha Término</span>
										<span className="font-medium text-foreground">
											{formatDate(project.fechaFin) || 'No definida'}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* 3. RESPONSABLE Y RIESGOS */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
						{/* Responsable */}
						<div className="space-y-2">
							<H3 className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 sm:gap-2">
								<User className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Responsable Operativo
							</H3>
							<div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-secondary/20 border border-secondary/20 rounded-lg">
								<div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-[10px] sm:text-xs shrink-0 shadow-sm">
									{project.responsable ? project.responsable.substring(0,2).toUpperCase() : 'NA'}
								</div>
								<div className="min-w-0">
									<p className="text-xs sm:text-sm font-medium text-foreground truncate" title={project.responsable}>
										{project.responsable || "No asignado"}
									</p>
									<p className="text-[10px] sm:text-xs text-muted-foreground truncate">Coordinador de Obra</p>
									{project.contratista && (
										<p className="text-[10px] sm:text-xs text-primary/80 truncate font-medium mt-1" title={project.contratista}>
											 <span className="text-muted-foreground">Contratista:</span> {project.contratista}
										</p>
									)}
								</div>
							</div>
						</div>

						{(project.riesgos && project.riesgos.length > 0 && project.riesgos[0] !== "") && (
							<div className="space-y-2">
								<H3 className="text-[10px] sm:text-xs uppercase tracking-wider text-destructive font-semibold flex items-center gap-1.5 sm:gap-2">
									<AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Riesgos Detectados
								</H3>
								<ul className="space-y-1.5 sm:space-y-2">
									{project.riesgos.map((riesgo, i) => (
										<li key={i} className="text-xs sm:text-sm text-foreground/80 flex gap-1.5 sm:gap-2 items-start bg-destructive/5 p-2 sm:p-2.5 rounded border border-destructive/10">
											<span className="text-destructive mt-0.5 shrink-0">•</span>
											<span className="leading-snug break-words">{riesgo}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* FOOTER MÓVIL (Sticky bottom) */}
			{/* Este botón asegura que el usuario siempre sepa cómo salir o regresar */}
			<div className="p-3 sm:p-4 border-t border-border bg-card shrink-0 lg:hidden">
				<DialogClose asChild>
					<Button className="w-full" size="lg" variant="secondary">
						<ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span className="text-xs sm:text-sm">Regresar a la lista</span>
					</Button>
				</DialogClose>
			</div>

		</DialogContent>
	);
}
