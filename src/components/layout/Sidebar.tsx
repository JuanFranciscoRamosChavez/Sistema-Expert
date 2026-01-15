import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Map, 
  AlertTriangle, 
  FileBarChart, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  Eye,
  CalendarDays
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Configuración de items del menú
const menuItems = [
  { icon: LayoutDashboard, label: 'Panel Ejecutivo', path: '/dashboard' },
  { icon: FolderKanban, label: 'Cartera de Proyectos', path: '/projects' },
  { icon: Map, label: 'Gestión Territorial', path: '/territory' },
  { icon: AlertTriangle, label: 'Riesgos y Alertas', path: '/risks' },
  { icon: CalendarDays, label: 'Cronograma', path: '/timeline' },
  { icon: Eye, label: 'Transparencia', path: '/transparency' },
  { icon: FileBarChart, label: 'Reportes', path: '/reports' },
  { icon: Settings, label: 'Configuración', path: '/settings' },
];

export function Sidebar() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  // En móvil usamos el Sheet (menú hamburguesa), en escritorio el Sidebar lateral
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 border-r border-border bg-card">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out relative z-40",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <SidebarContent collapsed={collapsed} />
      
      {/* Botón de colapsar flotante */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-8 h-8 w-8 rounded-full border border-border bg-card shadow-sm z-50 hover:bg-muted"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </aside>
  );
}

// Componente interno para reutilizar el contenido en Móvil y Escritorio
function SidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Logo Area */}
      <div className={cn(
        "flex items-center h-16 border-b border-border px-6",
        collapsed ? "justify-center px-0" : "justify-start"
      )}>
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold font-display text-lg">G</span>
        </div>
        {!collapsed && (
          <div className="ml-3 font-display font-bold text-lg text-foreground truncate">
            Gestor POA
          </div>
        )}
      </div>

      {/* Menu Items - Scroll independiente si hay muchos items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md font-medium" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn("h-5 w-5 shrink-0", collapsed ? "h-6 w-6" : "")} />
            {!collapsed && (
              <span className="truncate text-sm">{item.label}</span>
            )}
            
            {/* Tooltip nativo o badge si está colapsado */}
            {collapsed && (
              <span className="absolute left-full ml-2 p-2 rounded bg-popover text-popover-foreground text-xs shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Area (Usuario o info) */}
      <div className={cn(
        "p-4 border-t border-border bg-muted/10 mt-auto",
        collapsed ? "flex justify-center" : ""
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              AD
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">Admin Usuario</span>
              <span className="text-xs text-muted-foreground truncate">admin@gob.mx</span>
            </div>
          </div>
        ) : (
          <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 cursor-help" title="Admin">
            AD
          </div>
        )}
      </div>
    </div>
  );
}