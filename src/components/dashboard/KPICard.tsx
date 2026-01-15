import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
	title: string;
	value: string | number | ReactNode;
	icon: LucideIcon;
	subtitle?: string; // IMPORTANTE: Debe aceptar subtitle
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
	
	const variantStyles = {
		default: "bg-primary/10 text-primary border-primary/20",
		success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
		info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
		danger: "bg-destructive/10 text-destructive border-destructive/20",
		warning: "bg-amber-500/10 text-amber-600 border-amber-500/20"
	};

	const finalVariant = alert ? 'danger' : variant;

	return (
		<div 
			className={cn(
				"group relative bg-card rounded-xl p-6 shadow-sm border border-border/60",
				"flex items-start justify-between transition-all duration-300 ease-out",
				"hover:shadow-md hover:-translate-y-1 hover:border-border",
				finalVariant === 'danger' && "border-l-[6px] border-l-destructive pl-5"
			)}
			style={{ animationDelay: `${delay}ms` }}
		>
			<div className="space-y-2 max-w-[calc(100%-3.5rem)] w-full">
				<p className="text-sm font-medium text-muted-foreground truncate" title={title}>
					{title}
				</p>
				
				<div className="text-foreground min-h-[2.5rem] flex items-center">
					{typeof value === 'object' ? (
						value 
					) : (
						<h3 className="text-2xl lg:text-3xl font-display font-bold tracking-tight truncate" title={String(value)}>
							{value}
						</h3>
					)}
				</div>
				
				{/* ESTE BLOQUE MUESTRA EL SUBTITULO */}
				{subtitle && (
					<p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
						{subtitle}
					</p>
				)}
			</div>
			
			<div className={cn(
				"p-3.5 rounded-xl transition-colors duration-300 group-hover:scale-110 shrink-0",
				variantStyles[finalVariant] || variantStyles.default
			)}>
				<Icon className="h-6 w-6" />
			</div>
		</div>
	);
}