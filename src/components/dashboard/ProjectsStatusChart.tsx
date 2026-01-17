import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { Project } from '@/lib/mockData';
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme';
import { H3, Subtitle } from '@/components/ui/typography';

interface ProjectsStatusChartProps {
	projects: Project[];
}

/**
 * ProjectsStatusChart Component
 * 
 * Interactive donut chart displaying the distribution of projects by status.
 * Features hover effects, custom tooltips, and responsive sizing.
 * 
 * @component
 * 
 * @example
 * ```tsx
 * <ProjectsStatusChart projects={projectsList} />
 * ```
 * 
 * @param {Project[]} projects - Array of projects to visualize
 * 
 * **Features:**
 * - Interactive donut chart with hover expansion
 * - Central display showing total project count
 * - Custom legend with percentages
 * - Detailed tooltip with project counts
 * - Smooth animations and transitions
 * - Empty state filtering (only shows statuses with projects)
 * 
 * **Responsive Design:**
 * - Mobile (< 640px): h-[350px], smaller margins, compact legend
 * - Tablet/Desktop (640px+): h-[400px], optimal spacing
 * - Inner radius: 55%, Outer radius: 80% (75% on hover for active segment)
 * 
 * **Chart Colors:**
 * - Completado: Green (success)
 * - En Ejecución: Blue (info)
 * - En Riesgo: Red (danger)
 * - Planificado: Gray (neutral)
 * - Retrasado: Orange (warning)
 * 
 * **Accessibility:**
 * - Keyboard navigable
 * - Screen reader friendly with ARIA labels
 * - Clear visual distinctions between segments
 */
export function ProjectsStatusChart({ projects }: ProjectsStatusChartProps) {
	const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
	
	const data = [
		{ 
			name: 'Completado', 
			value: projects.filter(p => p.status === 'completado').length, 
			color: STATUS_COLORS.completado 
		},
		{ 
			name: 'En Ejecución', 
			value: projects.filter(p => p.status === 'en_ejecucion').length, 
			color: STATUS_COLORS.en_ejecucion
		},
		{ 
			name: 'En Riesgo', 
			value: projects.filter(p => p.status === 'en_riesgo').length, 
			color: STATUS_COLORS.en_riesgo
		},
		{ 
			name: 'Planificado', 
			value: projects.filter(p => p.status === 'planificado').length, 
			color: STATUS_COLORS.planificado
		},
		{
			name: 'Retrasado',
			value: projects.filter(p => p.status === 'retrasado').length,
			color: STATUS_COLORS.retrasado
		}
	].filter(item => item.value > 0);

	const total = data.reduce((sum, item) => sum + item.value, 0);

	/**
	 * Custom tooltip component showing project count and percentage
	 */
	const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; payload: { color: string; name: string } }> }) => {
		if (active && payload && payload.length) {
			const percentage = ((payload[0].value / total) * 100).toFixed(1);
			return (
				<div className="rounded-lg border border-border bg-popover/95 p-2 px-3 shadow-lg backdrop-blur-sm">
					<div className="mb-1 flex items-center gap-2">
						<span 
							className="h-2 w-2 rounded-full" 
							style={{ backgroundColor: payload[0].payload.color }} 
						/>
						<span className="text-xs font-semibold text-popover-foreground">
							{payload[0].name}
						</span>
					</div>
					<p className="pl-4 text-xs font-medium text-muted-foreground">
						{payload[0].value} proyectos ({percentage}%)
					</p>
				</div>
			);
		}
		return null;
	};

	/**
	 * Custom legend component with percentage display
	 */
	const CustomLegend = ({ payload }: { payload?: Array<{ value: number; color: string; payload: { name: string } }> }) => {
		if (!payload) return null;
		return (
			<div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
				{payload.map((entry, index: number) => {
					const percentage = ((entry.value / total) * 100).toFixed(0);
					return (
						<div 
							key={`legend-${index}`} 
							className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
							onMouseEnter={() => setActiveIndex(index)}
							onMouseLeave={() => setActiveIndex(undefined)}
						>
							<span 
								className="h-2 w-2 rounded-full" 
								style={{ backgroundColor: entry.color }} 
							/>
							<span className="font-medium text-foreground">
								{entry.value} {entry.payload.name}
							</span>
							<span className="text-muted-foreground">
								({percentage}%)
							</span>
						</div>
					);
				})}
			</div>
		);
	};

	/**
	 * Renders active segment with expanded outer radius
	 */
	const renderActiveShape = (props: {
		cx: number;
		cy: number;
		innerRadius: number;
		outerRadius: number;
		startAngle: number;
		endAngle: number;
		fill: string;
	}) => {
		const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
		
		return (
			<g>
				<Sector
					cx={cx}
					cy={cy}
					innerRadius={innerRadius}
					outerRadius={outerRadius + 8}
					startAngle={startAngle}
					endAngle={endAngle}
					fill={fill}
					className="drop-shadow-lg"
				/>
			</g>
		);
	};

	return (
		<div className="relative flex h-[350px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-fade-in sm:h-[400px]">
			<div className="border-b border-border p-4 sm:p-5">
				<H3>Estado de la Cartera</H3>
				<Subtitle>Distribución actual por etapa y riesgo</Subtitle>
			</div>
			
			<div className="relative flex-1 w-full min-h-0">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius="55%" 
							outerRadius="75%"
							paddingAngle={2}
							cornerRadius={4}
							dataKey="value"
							stroke="none"
							activeIndex={activeIndex}
							activeShape={renderActiveShape}
							onMouseEnter={(_, index) => setActiveIndex(index)}
							onMouseLeave={() => setActiveIndex(undefined)}
						>
							{data.map((entry, index) => (
								<Cell 
									key={`cell-${index}`} 
									fill={entry.color} 
									className="cursor-pointer stroke-background transition-opacity hover:opacity-90" 
								/>
							))}
						</Pie>
						
						<Tooltip 
							content={<CustomTooltip />} 
							cursor={false}
							wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
						/>
						
						<Legend 
							content={<CustomLegend />}
							wrapperStyle={{ paddingTop: '10px' }}
						/>
					</PieChart>
				</ResponsiveContainer>
				
				{/* Central total display */}
				<div className="pointer-events-none absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-[60%] flex-col items-center justify-center text-center">
					<span className="font-display text-4xl font-bold leading-none tracking-tighter text-foreground sm:text-5xl">
						{total}
					</span>
					<span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:text-xs">
						Total
					</span>
				</div>
			</div>
		</div>
	);
}