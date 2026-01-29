import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_COLORS } from '@/lib/theme';
import { H2, Small } from '@/components/ui/typography'; 

interface KPICardProps {
  title: string;
  value: string | number | ReactNode;
  icon: LucideIcon;
  subtitle?: string | ReactNode;
  trend?: string | { value: number; label: string };
  trendUp?: boolean;
  variant?: 'default' | 'success' | 'info' | 'danger' | 'warning';
  delay?: number;
  alert?: boolean;
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  variant = 'default',
  delay = 0,
  alert,
  className 
}: KPICardProps) {
  
  const themeMap = {
    default: APP_COLORS.primary,
    success: APP_COLORS.success,
    info: APP_COLORS.info,
    danger: APP_COLORS.danger,
    warning: APP_COLORS.warning
  };

  const finalVariant = alert ? 'danger' : variant;
  const activeColor = themeMap[finalVariant] || APP_COLORS.primary;

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-lg sm:rounded-xl border bg-card p-3 sm:p-4 lg:p-5 shadow-sm",
        "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 sm:hover:-translate-y-1",
        "animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards",
		className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        borderLeft: `4px solid ${activeColor}`
      }}
    >
      <div className="flex justify-between items-start gap-3 sm:gap-4">
        {/* CONTENIDO PRINCIPAL (Flex-1 para ocupar espacio y min-w-0 para permitir truncate interno) */}
        <div className="flex-1 min-w-0 relative z-10 flex flex-col gap-0.5 sm:gap-1">
          <Small className="font-medium text-muted-foreground uppercase tracking-wider text-[9px] sm:text-[10px] truncate" title={title}>
            {title}
          </Small>
          
          <div className="flex items-baseline text-foreground">
            {typeof value === 'object' ? (
              value 
            ) : (
              <H2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                {value}
              </H2>
            )}
          </div>
          
          {subtitle && (
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight break-words">
              {subtitle}
            </div>
          )}
        </div>

        {/* ICONO (Tamaño fijo, no se encoge) */}
        <div 
          className="shrink-0 p-2 sm:p-3 rounded-full transition-colors duration-300"
          style={{ 
            backgroundColor: `${activeColor}15`, 
            color: activeColor 
          }}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
      
      {/* Decoración de fondo */}
      <div 
        className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: activeColor }}
      />
    </div>
  );
}