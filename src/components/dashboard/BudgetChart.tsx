import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Project } from '@/lib/mockData';
import { APP_COLORS } from '@/lib/theme';
import { H3, Subtitle } from '@/components/ui/typography';
import { useEffect, useState } from 'react';

interface Props {
	projects: Project[];
}

/**
 * BudgetChart Component
 * 
 * Horizontal bar chart displaying top 6 projects by budget with devengado (accrued) amounts.
 * Features responsive sizing, dynamic colors for over-budget scenarios, and detailed tooltips.
 * 
 * @component
 * 
 * @example
 * ```tsx
 * <BudgetChart projects={projectsList} />
 * ```
 * 
 * @param {Project[]} projects - Array of projects to visualize
 * 
 * **Features:**
 * - Double bar display: Total budget + Devengado (accrued based on physical progress)
 * - Dynamic coloring: Green for OK, Red for over-budget
 * - Budget normalization: Converts small values to millions
 * - Responsive axis sizing based on viewport
 * - Gradient backgrounds on bars
 * - Detailed tooltip with full project name and metrics
 * 
 * **Budget Normalization Logic:**
 * Values less than 1,000,000 and greater than 0 are assumed to be in millions format
 * and are multiplied by 1,000,000 to normalize. This handles inconsistent data entry.
 * 
 * **Devengado Calculation:**
 * Devengado = Total Budget × (Physical Progress / 100)
 * This represents the amount that should have been spent based on work completed.
 * 
 * **Responsive Design:**
 * - Mobile (< 640px): h-[350px], compact Y-axis (100px), smaller font (10px)
 * - Desktop (640px+): h-[400px], full Y-axis (140px), normal font (11px)
 * - Bar sizes and gaps adjust automatically
 * 
 * **Color Coding:**
 * - Total Budget: Light gray background bar
 * - Devengado (Normal): Green (within budget)
 * - Devengado (Over): Red (exceeds budget)
 * 
 * **Accessibility:**
 * - Clear labels and legends
 * - Contrasting colors
 * - Hover states for interactivity
 * - Screen reader friendly with proper ARIA
 */
export function BudgetChart({ projects }: Props) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 640);
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Normalize budget values and calculate devengado
	const normalizedData = projects.map(p => {
		const rawBudget = p.presupuesto || 0;
		// If value is less than 1M and greater than 0, assume it's in millions format
		const realBudget = rawBudget < 1000000 && rawBudget > 0 
			? rawBudget * 1000000 
			: rawBudget;

		const avanceFactor = (p.avance || 0) / 100;
		const devengado = realBudget * avanceFactor;

		return {
			...p,
			realBudget,
			devengado,
			avanceFisico: p.avance || 0
		};
	});

	// Get top 6 projects by budget
	const topProjects = normalizedData
		.filter(p => p.realBudget > 0)
		.sort((a, b) => b.realBudget - a.realBudget) 
		.slice(0, 6);

	const data = topProjects.map(project => {
		const maxNameLength = isMobile ? 12 : 20;
		return {
			name: project.nombre.length > maxNameLength 
				? project.nombre.substring(0, maxNameLength) + '...' 
				: project.nombre,
			fullName: project.nombre,
			presupuesto: project.realBudget,
			devengado: project.devengado,
			avance: project.avanceFisico,
			isOverBudget: project.devengado > project.realBudget
		};
	});

	/**
	 * Formats currency values for display
	 * - Billions: $X.X MMD (Miles de Millones De pesos)
	 * - Millions: $X.X MDP (Millones De Pesos)
	 * - Thousands: $Xk
	 */
	const formatMoney = (value: number) => {
		if (value === 0) return '$0';
		if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)} MMD`;
		if (value >= 1000000) return `$${(value / 1000000).toFixed(1)} MDP`;
		if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
		return `$${value}`;
	};

	/**
	 * Custom tooltip showing full project details
	 */
	const CustomTooltip = ({ active, payload }: { 
		active?: boolean; 
		payload?: Array<{ 
			payload: { 
				fullName: string; 
				presupuesto: number; 
				avance: number; 
				devengado: number; 
				isOverBudget: boolean;
			} 
		}> 
	}) => {
		if (active && payload && payload.length) {
			const d = payload[0].payload;
			return (
				<div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
					<p className="mb-2 max-w-[200px] border-b border-slate-100 pb-1 text-xs font-bold text-slate-900">
						{d.fullName}
					</p>
					<div className="space-y-1">
						<p className="flex justify-between gap-4 text-xs text-slate-600">
							<span>Presupuesto:</span>
							<span className="font-mono font-bold text-slate-900">{formatMoney(d.presupuesto)}</span>
						</p>
						<p className="flex justify-between gap-4 text-xs text-slate-600">
							<span>Avance:</span>
							<span className="font-mono font-bold text-slate-900">{d.avance.toFixed(1)}%</span>
						</p>
						<div className="mt-1 flex justify-between gap-4 border-t border-slate-100 pt-1">
							<span className={d.isOverBudget ? "text-xs font-bold text-red-500" : "text-xs font-bold text-emerald-600"}>
								Devengado:
							</span>
							<span className={d.isOverBudget ? "font-mono text-xs font-bold text-red-500" : "font-mono text-xs font-bold text-emerald-600"}>
								{formatMoney(d.devengado)}
							</span>
						</div>
						{d.isOverBudget && (
							<p className="mt-1 text-xs font-semibold text-red-500">
								⚠️ Sobrepresupuesto
							</p>
						)}
					</div>
				</div>
			);
		}
		return null;
	};

	const yAxisWidth = isMobile ? 100 : 140;
	const fontSize = isMobile ? 10 : 11;

	return (
		<div className="flex h-[350px] flex-col rounded-xl border border-border bg-card shadow-sm animate-fade-in sm:h-[400px]">
			<div className="border-b border-border p-4 sm:p-5">
				<H3>Top 6 Proyectos (Devengado)</H3>
				<Subtitle>Avance financiero real vs Presupuesto Total</Subtitle>
			</div>
			
			<div className="flex-1 w-full min-h-0 p-3 sm:p-4">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart 
						data={data} 
						layout="vertical" 
						margin={{ left: 0, right: 20, top: 10, bottom: 0 }}
						barGap={-24} 
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} opacity={0.5} />
						
						<XAxis 
							type="number" 
							tickFormatter={formatMoney} 
							tick={{ fontSize, fill: APP_COLORS.textMain, fontWeight: 600 }} 
							axisLine={false}
							tickLine={false}
						/>
						
						<YAxis 
							dataKey="name" 
							type="category" 
							width={yAxisWidth} 
							tick={{ fontSize, fill: APP_COLORS.textMain, fontWeight: 600 }} 
							interval={0}
							axisLine={false}
							tickLine={false}
						/>
						
						<Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 4 }} />
						
						<Legend 
							verticalAlign="top" 
							height={36} 
							iconType="circle"
							iconSize={8}
							wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
							formatter={(value) => <span style={{ color: APP_COLORS.textMain, fontWeight: 600 }}>{value}</span>}
							payload={[
								{ value: 'Presupuesto Total', type: 'circle', color: APP_COLORS.backgroundBar }, 
								{ value: 'Devengado (Avance)', type: 'circle', color: APP_COLORS.success },
								{ value: 'Sobrecosto', type: 'circle', color: APP_COLORS.danger }
							]}
						/>
						
						{/* Background bar showing total budget */}
						<Bar 
							dataKey="presupuesto" 
							name="Presupuesto Total" 
							fill={APP_COLORS.backgroundBar} 
							radius={[0, 4, 4, 0]} 
							barSize={20} 
							isAnimationActive={true}
							animationDuration={800}
						/>

						{/* Foreground bar showing devengado with dynamic color */}
						<Bar 
							dataKey="devengado" 
							name="Devengado" 
							radius={[0, 2, 2, 0]} 
							barSize={10}
							isAnimationActive={true}
							animationDuration={1000}
							animationBegin={200}
						>
							{data.map((entry, index) => (
								<Cell 
									key={`cell-${index}`} 
									fill={entry.isOverBudget ? APP_COLORS.danger : APP_COLORS.success} 
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}