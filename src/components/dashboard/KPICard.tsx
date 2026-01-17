import { ReactNode } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_COLORS } from '@/lib/theme';
import { H2, Subtitle, Small } from '@/components/ui/typography';

/**
 * KPICard Component
 * 
 * Displays a Key Performance Indicator card with icon, value, subtitle, and optional trend.
 * Features responsive design, subtle gradients, and smooth animations.
 * 
 * @component
 * 
 * @example
 * ```tsx
 * <KPICard
 *   title="Total Projects"
 *   value={42}
 *   subtitle="Active in portfolio"
 *   icon={FolderKanban}
 *   variant="success"
 *   trend={{ value: 12, label: "vs last month" }}
 *   trendUp={true}
 *   delay={100}
 * />
 * ```
 * 
 * @param {string} title - Card title (shown in small caps)
 * @param {string|number|ReactNode} value - Main KPI value to display
 * @param {LucideIcon} icon - Icon component from lucide-react
 * @param {string} [subtitle] - Additional context below the value
 * @param {string|object} [trend] - Trend indicator (percentage or custom object)
 * @param {boolean} [trendUp] - Whether trend is positive (green) or negative (red)
 * @param {'default'|'success'|'info'|'danger'|'warning'} [variant='default'] - Color theme
 * @param {number} [delay=0] - Animation delay in milliseconds for staggered entrance
 * @param {boolean} [alert] - If true, forces 'danger' variant with left border
 * 
 * **Responsive Sizing:**
 * - Mobile (< 640px): Smaller padding (p-4), text (text-2xl)
 * - Tablet (640px - 1024px): Medium padding (sm:p-5), text (sm:text-3xl)
 * - Desktop (> 1024px): Large padding (lg:p-6), text (lg:text-4xl)
 * 
 * **Features:**
 * - Subtle gradient backgrounds based on variant color
 * - Animated decorative circle (hidden on mobile)
 * - Hover effect: lift and shadow enhancement
 * - Staggered entrance animations
 * - Trend section with directional icons
 * 
 * **Accessibility:**
 * - Semantic HTML with proper heading levels
 * - Title attributes for truncated text
 * - Color-blind friendly with icons for trends
 */
interface KPICardProps {
	title: string;
	value: string | number | ReactNode;
	icon: LucideIcon;
	subtitle?: string;
	trend?: string | { value: number; label: string };
	trendUp?: boolean;
	variant?: 'default' | 'success' | 'info' | 'danger' | 'warning';
	delay?: number;
	alert?: boolean;
}

export function KPICard({ 
	title, 
	value, 
	subtitle,
	icon: Icon, 
	trend, 
	trendUp, 
	variant = 'default',
	delay = 0,
	alert 
}: KPICardProps) {
	
	const themeMap = {
		default: APP_COLORS.textMain,
		success: APP_COLORS.success,
		info: APP_COLORS.info,
		danger: APP_COLORS.danger,
		warning: APP_COLORS.warning
	};

	const finalVariant = alert ? 'danger' : variant;
	const activeColor = themeMap[finalVariant] || APP_COLORS.textMain;

	// Generate gradient background
	const gradientStyle = finalVariant !== 'default' ? {
		background: `linear-gradient(135deg, ${activeColor}05 0%, ${activeColor}10 100%)`
	} : {};

	return (
		<div 
			className={cn(
				"group relative overflow-hidden bg-card rounded-xl border border-border/60",
				"flex flex-col gap-3 transition-all duration-300 ease-out",
				"hover:shadow-lg hover:-translate-y-1 hover:border-border",
				"p-4 sm:p-5 lg:p-6",
				"animate-scale-in"
			)}
			style={{ 
				animationDelay: `${delay}ms`,
				borderLeft: finalVariant === 'danger' ? `6px solid ${activeColor}` : undefined,
				paddingLeft: finalVariant === 'danger' ? '1rem' : undefined,
				...gradientStyle
			}}
		>
			{/* Decorative circle - hidden on small screens */}
			<div 
				className="absolute -right-8 -top-8 hidden h-24 w-24 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-110 sm:block"
				style={{ backgroundColor: activeColor }}
			/>

			{/* Header: Title & Icon */}
			<div className="flex items-start justify-between gap-3">
				<Small className="flex-1 truncate font-medium uppercase tracking-wider opacity-90" title={title}>
					{title}
				</Small>
				
				<div 
					className="shrink-0 rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110 sm:p-3"
					style={{
						backgroundColor: finalVariant === 'default' 
							? 'hsl(var(--primary) / 0.1)' 
							: `${activeColor}15`,
						color: finalVariant === 'default'
							? 'hsl(var(--primary))'
							: activeColor,
						border: `1px solid ${finalVariant === 'default' ? 'hsl(var(--primary) / 0.2)' : activeColor + '30'}`
					}}
				>
					<Icon className="h-4 w-4 sm:h-5 sm:w-5" />
				</div>
			</div>
			
			{/* Value */}
			<div className="relative z-10 flex min-h-[2.5rem] items-center">
				{typeof value === 'object' ? (
					value 
				) : (
					<H2 className="truncate text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl" title={String(value)}>
						{value}
					</H2>
				)}
			</div>
			
			{/* Subtitle & Trend */}
			<div className="relative z-10 flex items-center justify-between gap-2">
				{subtitle && (
					<Subtitle className="flex-1 truncate text-xs leading-relaxed sm:text-sm">
						{subtitle}
					</Subtitle>
				)}
				
				{trend && (
					<div 
						className={cn(
							"flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
							trendUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
						)}
					>
						{trendUp ? (
							<TrendingUp className="h-3 w-3" />
						) : (
							<TrendingDown className="h-3 w-3" />
						)}
						<span>
							{typeof trend === 'object' ? `${trend.value}%` : trend}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}