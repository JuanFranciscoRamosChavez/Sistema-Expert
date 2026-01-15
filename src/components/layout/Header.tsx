import { useLocation } from 'react-router-dom';
import { 
  Bell, 
  Search 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// NOTA: Ya no necesitamos HeaderProps ni onMenuClick porque 
// el Sidebar maneja su propio botón de apertura.

export function Header() {
  const location = useLocation();
  
  // Función para mostrar el título según la página actual
  const getTitle = () => {
    // Detectamos la ruta base para poner un título limpio
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Panel Ejecutivo';
    if (path.includes('/projects')) return 'Cartera de Proyectos';
    if (path.includes('/territory')) return 'Gestión Territorial';
    if (path.includes('/risks')) return 'Riesgos y Alertas';
    if (path.includes('/timeline')) return 'Cronograma';
    if (path.includes('/transparency')) return 'Transparencia';
    if (path.includes('/reports')) return 'Reportes';
    if (path.includes('/settings')) return 'Configuración';
    return 'Sistema POA';
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* AJUSTE DE MARGEN: 
           ml-12 (48px) en móvil para dejar espacio al botón flotante del Sidebar.
           md:ml-0 en escritorio porque el botón desaparece.
        */}
        <h2 className="font-display font-bold text-lg md:text-xl text-foreground ml-12 md:ml-0 transition-all duration-300">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Barra de búsqueda (solo escritorio) */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar proyecto..." 
            className="pl-9 h-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        {/* Botón de notificaciones */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border border-card" />
        </Button>
      </div>
    </header>
  );
}