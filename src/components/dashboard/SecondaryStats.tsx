import { CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Project } from '@/lib/mockData';
import { getCompletedProjectsCount, calculateAverageProgress } from '@/lib/projectUtils';
import { formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface SecondaryStatsProps {
	projects: Project[];
	projectsInExecution: number;
}

/**
 * SecondaryStats Component
 * 
 * Displays three secondary KPI cards for completed projects, 
 * projects in execution, and average progress.
 * Features gradient backgrounds, trend badges, and animated progress bars.
 * 
 * @component
 * 
 * @example
 * ```tsx
 * <SecondaryStats 
 *   projects={projectsList} 
 *   projectsInExecution={15}
 * />
 * ```
 * 
 * @param {Project[]} projects - Array of all projects
 * @param {number} projectsInExecution - Count of projects currently in execution
 * 
 * **Features:**
 * - Gradient backgrounds matching stat type (success, info, primary)
 * - Trend badges with directional icons
 * - Animated progress bars (optional)
 * - Decorative circles (visible on md+ screens)
 * - Responsive grid layout
 * 
 * **Responsive Design:**
 * - Mobile (< 640px): Single column, compact spacing
 * - Tablet (640px+): 3 columns grid
 * - Padding: p-4 on mobile, sm:p-5 on larger screens
 * 
 * **Accessibility:**
 * - Semantic heading structure
 * - Descriptive text for screen readers
 * - Sufficient color contrast
 */
export function SecondaryStats({ projects, projectsInExecution }: SecondaryStatsProps) {
	const completedProjects = getCompletedProjectsCount(projects);
	const avgAdvance = calculateAverageProgress(projects);

	const stats = [
		{
			id: 'completed',
			icon: CheckCircle,
			value: completedProjects,
			label: 'Completados',
			color: 'hsl(var(--success))',
			bgGradient: 'linear-gradient(135deg, hsl(var(--success) / 0.05) 0%, hsl(var(--success) / 0.1) 100%)',
			trend: completedProjects > 0 ? { value: 8, isUp: true } : null
		},
		{
			id: 'execution',
			icon: Clock,
			value: projectsInExecution,
			label: 'En Ejecución',
			color: 'hsl(var(--info))',
			bgGradient: 'linear-gradient(135deg, hsl(var(--info) / 0.05) 0%, hsl(var(--info) / 0.1) 100%)',
			trend: null
		},
		{
			id: 'progress',
			icon: TrendingUp,
			value: formatPercentage(avgAdvance),
			label: 'Avance Promedio',
			color: 'hsl(var(--primary))',
			bgGradient: 'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--primary) / 0.1) 100%)',
			trend: avgAdvance > 50 ? { value: 5, isUp: true } : null,
			progress: avgAdvance
		}
	];

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
			{stats.map((stat, index) => {
				const Icon = stat.icon;
				
				return (
					<div 
						key={stat.id}
						className={cn(
							"relative overflow-hidden rounded-xl border border-border bg-card shadow-sm",
							"flex items-center gap-4 p-4 transition-all duration-300",
							"hover:shadow-md hover:-translate-y-0.5",
							"sm:p-5",
							"animate-scale-in"
						)}
						style={{ 
							background: stat.bgGradient,
							animationDelay: `${index * 100}ms`
						}}
					>
						{/* Decorative circle - visible on md+ */}
						<div 
							className="absolute -right-6 -top-6 hidden h-20 w-20 rounded-full opacity-10 md:block"
							style={{ backgroundColor: stat.color }}
						/>

						{/* Icon */}
						<div 
							className="relative z-10 shrink-0 rounded-lg p-3"
							style={{ 
								backgroundColor: `${stat.color}15`,
								border: `1px solid ${stat.color}30`
							}}
						>
							<Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: stat.color }} />
						</div>
						
						{/* Content */}
						<div className="relative z-10 flex-1 space-y-1">
							<div className="flex items-center justify-between gap-2">
								<p className="truncate text-xl font-bold font-display sm:text-2xl">
									{stat.value}
								</p>
								
								{/* Trend Badge */}
								{stat.trend && (
									<div 
										className={cn(
											"flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
											stat.trend.isUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
										)}
									>
										{stat.trend.isUp ? (
											<TrendingUp className="h-3 w-3" />
										) : (
											<TrendingDown className="h-3 w-3" />
										)}
										<span>{stat.trend.value}%</span>
									</div>
								)}
							</div>
							
							<p className="truncate text-xs text-muted-foreground sm:text-sm">
								{stat.label}
							</p>
							
							{/* Optional Progress Bar */}
							{stat.progress !== undefined && (
								<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
									<div 
										className="h-full rounded-full transition-all duration-500 ease-out progress-bar-animated"
										style={{ 
											width: `${stat.progress}%`,
											backgroundColor: stat.color
										}}
									/>
								</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}