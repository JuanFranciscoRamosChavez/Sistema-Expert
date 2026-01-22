import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FolderKanban, 
  AlertTriangle, 
  MapPin, 
  Calendar,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type View = 'dashboard' | 'projects' | 'risks' | 'territory' | 'timeline' | 'transparency' | 'reports' | 'settings';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard' as View, label: 'Panel Ejecutivo', icon: LayoutDashboard },
  { id: 'projects' as View, label: 'Cartera de Proyectos', icon: FolderKanban },
  { id: 'risks' as View, label: 'Gestión de Riesgos', icon: AlertTriangle },
  { id: 'territory' as View, label: 'Impacto Territorial', icon: MapPin },
  { id: 'timeline' as View, label: 'Cronograma', icon: Calendar },
  { id: 'transparency' as View, label: 'Transparencia', icon: Users },
  { id: 'reports' as View, label: 'Reportes', icon: FileText },
];

export function Sidebar({ currentView, onViewChange, isOpen, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out",
        "bg-sidebar text-sidebar-foreground shadow-lg lg:shadow-none",
        isCollapsed ? "w-20" : "w-72 sm:w-80 lg:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "flex items-center gap-3 p-4 sm:p-5 lg:p-4 border-b border-sidebar-border",
            isCollapsed && "justify-center"
          )}>
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-10 lg:w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-5 lg:w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-fade-in">
                <span className="font-display font-bold text-lg sm:text-xl lg:text-lg">POA 2026</span>
                <span className="text-xs sm:text-sm lg:text-xs text-sidebar-foreground/70">Plan Operativo Anual</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 lg:p-4 space-y-1 overflow-y-auto 
            [&::-webkit-scrollbar]:w-2 
            [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-sidebar-border/50
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-border/70">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 sm:px-4 lg:px-3 py-2.5 sm:py-3 lg:py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "active:scale-95",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm",
                    !isActive && "text-sidebar-foreground/80",
                    isCollapsed && "justify-center"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6 lg:h-5 lg:w-5 shrink-0", 
                    isActive && "text-sidebar-ring"
                  )} />
                  {!isCollapsed && (
                    <span className="text-sm sm:text-base lg:text-sm truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Settings & Collapse */}
          <div className="p-3 sm:p-4 lg:p-4 border-t border-sidebar-border space-y-1">
            <button
              onClick={() => {
                onViewChange('settings');
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 sm:px-4 lg:px-3 py-2.5 sm:py-3 lg:py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "active:scale-95",
                currentView === 'settings' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm",
                currentView !== 'settings' && "text-sidebar-foreground/80",
                isCollapsed && "justify-center"
              )}
            >
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 lg:h-5 lg:w-5 shrink-0" />
              {!isCollapsed && (
                <span className="text-sm sm:text-base lg:text-sm truncate">Configuración</span>
              )}
            </button>
            
            {/* Collapse button - solo desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 hidden lg:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform duration-200",
                isCollapsed && "rotate-180"
              )} />
              {!isCollapsed && <span className="ml-2 text-xs">Contraer</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}