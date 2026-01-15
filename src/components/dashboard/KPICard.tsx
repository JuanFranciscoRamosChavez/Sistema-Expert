import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_COLORS } from '@/lib/theme'; // <--- 1. Importamos los colores maestros

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
	
	// 2. Mapeamos las variantes a los colores de tu tema central
	const themeMap = {
		default: APP_COLORS.textMain, // O primary del CSS si prefieres
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
			// 3. Aplicamos estilo dinámico para el borde izquierdo en caso de alerta
			style={{ 
				animationDelay: `${delay}ms`,
				borderLeft: finalVariant === 'danger' ? `6px solid ${APP_COLORS.danger}` : undefined,
				paddingLeft: finalVariant === 'danger' ? '1.25rem' : '1.5rem'
			}}
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
				
				{subtitle && (
					<p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
						{subtitle}
					</p>
				)}
			</div>
			
			{/* 4. Aquí inyectamos el color exacto del tema */}
			<div 
				className="p-3.5 rounded-xl transition-colors duration-300 group-hover:scale-110 shrink-0"
				style={{
					backgroundColor: finalVariant === 'default' 
						? 'hsl(var(--primary) / 0.1)' // Default sigue usando el tema CSS
						: `${activeColor}15`,         // Hex con 15% de opacidad (fondo suave)
					color: finalVariant === 'default'
						? 'hsl(var(--primary))'
						: activeColor,                // Color principal del icono
					border: `1px solid ${finalVariant === 'default' ? 'hsl(var(--primary) / 0.2)' : activeColor + '30'}` // Borde sutil
				}}
			>
				<Icon className="h-6 w-6" />
			</div>
		</div>
	);
}