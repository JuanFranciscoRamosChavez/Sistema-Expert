import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_COLORS } from '@/lib/theme';
import { H2, Subtitle, Small } from '@/components/ui/typography'; 

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

	return (
		<div 
			className={cn(
				"group relative bg-card rounded-xl p-6 shadow-sm border border-border/60",
				"flex items-start justify-between transition-all duration-300 ease-out",
				"hover:shadow-md hover:-translate-y-1 hover:border-border"
			)}
			style={{ 
				animationDelay: `${delay}ms`,
				borderLeft: finalVariant === 'danger' ? `6px solid ${APP_COLORS.danger}` : undefined,
				paddingLeft: finalVariant === 'danger' ? '1.25rem' : '1.5rem'
			}}
		>
			<div className="space-y-2 max-w-[calc(100%-3.5rem)] w-full">
				<Small className="block truncate font-medium uppercase tracking-wider opacity-90" title={title}>
					{title}
				</Small>
				
				<div className="text-foreground min-h-[2.5rem] flex items-center">
					{typeof value === 'object' ? (
						value 
					) : (
						<H2 className="text-2xl lg:text-3xl font-bold tracking-tight truncate" title={String(value)}>
							{value}
						</H2>
					)}
				</div>
				
				{subtitle && (
					<Subtitle className="line-clamp-2 leading-relaxed">
						{subtitle}
					</Subtitle>
				)}
			</div>
			
			<div 
				className="p-3.5 rounded-xl transition-colors duration-300 group-hover:scale-110 shrink-0"
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
				<Icon className="h-6 w-6" />
			</div>
		</div>
	);
}