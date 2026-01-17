import { 
	Table, 
	TableBody, 
	TableCell, 
	TableHead, 
	TableHeader, 
	TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, CheckCircle2, MoreVertical, Eye, Edit, Flag } from "lucide-react";
import { Project } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { APP_COLORS, PRIORITY_COLORS } from "@/lib/theme"; 
import { H3, Subtitle } from "@/components/ui/typography";

interface Props {
	projects: Project[];
}

/**
 * CriticalProjectsTable Component
 * 
 * Displays a table of projects requiring urgent attention based on risk level,
 * priority, or low viability. Features responsive design with horizontal scroll
 * on mobile and action dropdown menus.
 * 
 * @component
 * 
 * @example
 * ```tsx
 * <CriticalProjectsTable projects={projectsList} />
 * ```
 * 
 * @param {Project[]} projects - Array of all projects to filter and display
 * 
 * **Features:**
 * - Automatic filtering of critical projects (risk, high/critical priority, low viability)
 * - Priority-based sorting (critical + at-risk projects first)
 * - Action dropdown menu (View, Edit, Report) per project
 * - Animated priority badges with pulsing dot
 * - Risk indicator with colored sidebar
 * - Progress bars with dynamic colors
 * - Empty state when no critical projects exist
 * 
 * **Responsive Design:**
 * - Mobile (< 640px): Horizontal scroll, compact columns, touch-friendly (min-h-[36px])
 * - Tablet/Desktop (640px+): Full table visible, hover actions
 * - Table has min-width to prevent squishing on small screens
 * 
 * **Columns:**
 * 1. Project/Responsible (40% width, truncated on mobile)
 * 2. Risk Level (with colored badge)
 * 3. Physical Progress (percentage + progress bar)
 * 4. Priority (badge with dynamic color)
 * 5. Actions (dropdown menu, hidden until hover on desktop)
 * 
 * **Color Coding:**
 * - Critical Risk: Red (danger)
 * - High Risk: Orange (warning)
 * - Priority badges: Dynamic based on priority level
 * 
 * **Accessibility:**
 * - Keyboard navigable dropdown menus
 * - Touch-friendly buttons on mobile
 * - Screen reader friendly labels
 * - Clear visual hierarchy
 */
export function CriticalProjectsTable({ projects }: Props) {
	
	const criticalProjects = projects
		.filter(p => 
			p.status === 'en_riesgo' || 
			p.prioridad === 'critica' || 
			p.prioridad === 'alta' ||
			p.viabilidad === 'baja'
		)
		.sort((a, b) => {
			const scoreA = (a.prioridad === 'critica' ? 3 : 0) + (a.status === 'en_riesgo' ? 2 : 0);
			const scoreB = (b.prioridad === 'critica' ? 3 : 0) + (b.status === 'en_riesgo' ? 2 : 0);
			return scoreB - scoreA;
		})
		.slice(0, 5);

	const getRiskColor = (project: Project) => {
		if (project.status === 'en_riesgo' || project.viabilidad === 'baja') {
			return APP_COLORS.danger;
		}
		return APP_COLORS.warning;
	};

	const getPriorityColor = (priority: string) => {
		return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || APP_COLORS.neutral;
	};

	// Empty state - no critical projects
	if (criticalProjects.length === 0) {
		return (
			<div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm animate-fade-in">
				<div className="mb-3 rounded-full bg-emerald-500/10 p-4">
					<CheckCircle2 className="h-8 w-8 text-emerald-600" />
				</div>
				<H3 className="mt-3">Todo bajo control</H3>
				<Subtitle className="mt-1 max-w-[250px]">
					No se detectaron proyectos con riesgo alto o urgencia crítica en este momento.
				</Subtitle>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-sm animate-fade-in">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4 sm:p-6">
				<div className="flex-1">
					<H3 className="flex items-center gap-2">
						<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: APP_COLORS.danger }} />
						<span className="text-base sm:text-lg">Atención Prioritaria</span>
					</H3>
					<Subtitle className="text-xs sm:text-sm">
						Proyectos con alto nivel de riesgo o urgencia crítica
					</Subtitle>
				</div>
				<Badge variant="outline" className="text-xs font-mono">
					{criticalProjects.length} Detectados
				</Badge>
			</div>

			{/* Table with horizontal scroll on mobile */}
			<div className="flex-1 overflow-auto custom-scrollbar">
				<div className="min-w-[600px]">
					<Table>
						<TableHeader>
							<TableRow className="border-border hover:bg-transparent">
								<TableHead className="w-[35%]">Proyecto / Responsable</TableHead>
								<TableHead className="w-[20%]">Nivel de Riesgo</TableHead>
								<TableHead className="w-[20%]">Avance Físico</TableHead>
								<TableHead className="w-[15%]">Prioridad</TableHead>
								<TableHead className="w-[10%] text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{criticalProjects.map((project) => {
								const riskColor = getRiskColor(project);
								const priorityColor = getPriorityColor(project.prioridad);

								return (
									<TableRow 
										key={project.id} 
										className="group border-border transition-colors hover:bg-muted/30"
									>
										{/* Project Name & Responsible */}
										<TableCell className="font-medium">
											<div className="relative flex flex-col gap-1 pl-3">
												{/* Risk indicator sidebar */}
												<div 
													className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
													style={{ backgroundColor: riskColor }}
												/>
												<span className="line-clamp-1 font-semibold text-foreground" title={project.nombre}>
													{project.nombre}
												</span>
												<span className="flex items-center gap-1 text-xs text-muted-foreground">
													<span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-pulse-subtle" />
													{project.responsable || "Sin Asignar"}
												</span>
											</div>
										</TableCell>

										{/* Risk Level Badge */}
										<TableCell>
											<div 
												className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
												style={{ 
													color: riskColor,
													borderColor: `${riskColor}40`,
													backgroundColor: `${riskColor}15`
												}}
											>
												<AlertCircle className="h-3 w-3" />
												{project.status === 'en_riesgo' ? 'Crítico' : 'Alto'}
											</div>
										</TableCell>

										{/* Progress */}
										<TableCell>
											<div className="w-full max-w-[140px] space-y-1.5">
												<div className="flex justify-between text-xs">
													<span className="font-medium text-muted-foreground">Progreso</span>
													<span className="font-bold text-foreground">{project.avance.toFixed(1)}%</span>
												</div>
												
												<Progress 
													value={project.avance} 
													className="h-2 bg-muted" 
													indicatorColor={riskColor}
												/>
											</div>
										</TableCell>

										{/* Priority Badge */}
										<TableCell>
											<Badge 
												variant="outline" 
												className="border uppercase tracking-wider text-[10px] font-bold"
												style={{
													color: priorityColor,
													borderColor: priorityColor,
													backgroundColor: `${priorityColor}10`
												}}
											>
												{project.prioridad}
											</Badge>
										</TableCell>

										{/* Actions Dropdown */}
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button 
														variant="ghost" 
														size="sm"
														className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100"
													>
														<MoreVertical className="h-4 w-4" />
														<span className="sr-only">Abrir menú</span>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="w-40">
													<DropdownMenuLabel className="text-xs">Acciones</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuItem className="cursor-pointer text-xs">
														<Eye className="mr-2 h-3.5 w-3.5" />
														Ver detalles
													</DropdownMenuItem>
													<DropdownMenuItem className="cursor-pointer text-xs">
														<Edit className="mr-2 h-3.5 w-3.5" />
														Editar proyecto
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem className="cursor-pointer text-xs text-destructive">
														<Flag className="mr-2 h-3.5 w-3.5" />
														Reportar problema
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>

									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}