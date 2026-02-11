import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/views/DashboardView';
import { ProjectsView } from '@/components/views/ProjectsView';
import { RisksView } from '@/components/views/RisksView';
import { TerritoryView } from '@/components/views/TerritoryView';
import { TimelineView } from '@/components/views/TimelineView';
import { TransparencyView } from '@/components/views/TransparencyView';
import { ReportsView } from '@/components/views/ReportsView';
import { SettingsView } from '@/components/views/SettingsView';

type View = 'dashboard' | 'projects' | 'risks' | 'territory' | 'timeline' | 'transparency' | 'reports' | 'settings';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Mantener todos los componentes montados pero ocultos para preservar estado */}
          <div style={{ display: currentView === 'dashboard' ? 'block' : 'none' }}>
            <DashboardView />
          </div>
          <div style={{ display: currentView === 'projects' ? 'block' : 'none' }}>
            <ProjectsView />
          </div>
          <div style={{ display: currentView === 'risks' ? 'block' : 'none' }}>
            <RisksView />
          </div>
          <div style={{ display: currentView === 'territory' ? 'block' : 'none' }}>
            <TerritoryView />
          </div>
          <div style={{ display: currentView === 'timeline' ? 'block' : 'none' }}>
            <TimelineView />
          </div>
          <div style={{ display: currentView === 'transparency' ? 'block' : 'none' }}>
            <TransparencyView />
          </div>
          <div style={{ display: currentView === 'reports' ? 'block' : 'none' }}>
            <ReportsView />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
