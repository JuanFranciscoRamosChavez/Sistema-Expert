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

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'projects':
        return <ProjectsView />;
      case 'risks':
        return <RisksView />;
      // case 'territory':
      //   return <TerritoryView />;
      // case 'timeline':
      //   return <TimelineView />;
      // case 'transparency':
      //   return <TransparencyView />;
      // case 'reports':
      //   return <ReportsView />;
      // case 'settings':
      //   return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

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
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Index;
