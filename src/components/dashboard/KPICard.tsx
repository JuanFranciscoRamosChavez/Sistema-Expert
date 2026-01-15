import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	subtitle?: string;      
	trend?: string | { value: number; label: string };
	trendUp?: boolean;
	variant?: 'default' | 'success' | 'info' | 'danger' | 'warning'; // Agregado
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
	
	let trendContent;
	if (typeof trend === 'object') {
		trendContent = (
			<>
				<span className="font-bold">{trend.value > 0 ? '+' : ''}{trend.value}</span> 
				{' '}{trend.label}
			</>
		);
	} else {
		trendContent = trend;
	}

	const variantStyles = {
		default: "bg-primary/10 text-primary",
		success: "bg-emerald-500/10 text-emerald-600",
		info: "bg-blue-500/10 text-blue-600",
		danger: "bg-destructive/10 text-destructive",
		warning: "bg-amber-500/10 text-amber-600"
	};

	const finalVariant = alert ? 'danger' : variant;

	return (
		<div 
			className={cn(
				"bg-card rounded-xl p-5 shadow-sm border border-border flex items-start justify-between animate-slide-up hover:shadow-md transition-all",
				finalVariant === 'danger' && "border-l-4 border-l-destructive"
			)}
			style={{ animationDelay: `${delay}ms` }}
		>
			<div>
				<p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
				<h3 className="text-2xl font-display font-bold text-foreground">{value}</h3>
				
				{subtitle && (
					<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
				)}

				{trend && (
					<div className={cn(
						"flex items-center gap-1 text-xs mt-2 font-medium",
						trendUp ? "text-emerald-600" : "text-destructive"
					)}>
						{trendUp ? (
							<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
						) : (
							<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
						)}
						<span>{trendContent}</span>
					</div>
				)}
			</div>
			
			<div className={cn("p-3 rounded-lg", variantStyles[finalVariant] || variantStyles.default)}>
				<Icon className="h-5 w-5" />
			</div>
		</div>
	);
}