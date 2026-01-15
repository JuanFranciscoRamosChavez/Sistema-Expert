import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Importación de vistas
import { DashboardView } from './components/views/DashboardView';
import { ProjectsView } from './components/views/ProjectsView';
import { RisksView } from './components/views/RisksView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { TerritoryView } from './components/views/TerritoryView';
import { TransparencyView } from './components/views/TransparencyView';
import { TimelineView } from './components/views/TimelineView';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        {/* CORRECCIÓN DE LAYOUT:
           1. h-screen: Fuerza a que la app mida exactamente lo que mide la pantalla.
           2. overflow-hidden: Evita que aparezca doble scrollbar.
           3. bg-muted/30: Fondo base gris suave.
        */}
        <div className="flex h-screen w-full bg-muted/30 overflow-hidden">
          
          {/* SIDEBAR: Fija a la izquierda */}
          <Sidebar />

          {/* CONTENEDOR DERECHO: Columna flex que contiene Header + Contenido */}
          <div className="flex flex-col flex-1 h-full min-w-0">
            
            <Header />

            {/* ÁREA DE CONTENIDO (MAIN):
               1. flex-1: Ocupa todo el espacio sobrante (debajo del header).
               2. overflow-y-auto: AQUÍ es donde ocurre el scroll. 
                  Si la tabla es larga, solo esta parte se mueve, la Sidebar se queda quieta.
               3. p-4 md:p-6: Padding consistente.
            */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
              <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardView />} />
                  <Route path="/projects" element={<ProjectsView />} />
                  <Route path="/territory" element={<TerritoryView />} />
                  <Route path="/risks" element={<RisksView />} />
                  <Route path="/transparency" element={<TransparencyView />} />
                  <Route path="/reports" element={<ReportsView />} />
                  <Route path="/timeline" element={<TimelineView />} />
                  <Route path="/settings" element={<SettingsView />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;