import { useState, useEffect } from 'react';
import { Search, Filter, Plus, LayoutGrid, List as ListIcon, Download } from 'lucide-react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { Project, direcciones, zonas } from '@/lib/mockData'; // Ya no dará error
import { mapApiToUiProject } from '@/lib/mappers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProjectsView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDireccion, setFilterDireccion] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todos');
  
  // Estado para datos reales
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // --- EFECTO DE CARGA (API) ---
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/obras/');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setProjects(data.map(mapApiToUiProject));
          }
        }
      } catch (error) {
        console.error("Error cargando proyectos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filtrado
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDireccion = filterDireccion === 'todas' || project.direccion === filterDireccion;
    const matchesEstado = filterEstado === 'todos' || project.status === filterEstado;
    
    return matchesSearch && matchesDireccion && matchesEstado;
  });

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando catálogo de obras...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Cartera de Proyectos
          </h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} proyectos en seguimiento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre, responsable..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Select value={filterDireccion} onValueChange={setFilterDireccion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Dirección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las áreas</SelectItem>
              {direcciones.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estatus</SelectItem>
              <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
              <SelectItem value="planificado">Planificado</SelectItem>
              <SelectItem value="en_riesgo">En Riesgo</SelectItem>
              <SelectItem value="retrasado">Retrasado</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
            </SelectContent>
          </Select>

          <div className="border-l border-border mx-2 h-8 hidden md:block" />

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')} className="w-auto">
            <TabsList>
              <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="list"><ListIcon className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground">No se encontraron proyectos con los filtros actuales.</p>
          <Button variant="link" onClick={() => {setSearchTerm(''); setFilterDireccion('todas'); setFilterEstado('todos')}}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => setSelectedProject(project)}
              delay={index * 50} 
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <ProjectDetail 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </div>
  );
}