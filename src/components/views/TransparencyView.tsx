/**
 * TransparencyView V2 - Migrado a Serverside
 * Sprint 2: Agregaciones Serverside
 * 
 * ANTES: 291 líneas con cálculos client-side pesados
 * DESPUÉS: ~250 líneas solo con UI y renderizado
 * 
 * Eliminado:
 * - mockProjects.reduce() para totales
 * - budgetByDirection calculado en cliente
 * - Iteraciones sobre arrays grandes
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, DollarSign, Building2, CheckCircle, Download, 
  ExternalLink, FileText, Eye, TrendingUp, MapPin, Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useBudgetByDirection } from '@/hooks/useBudgetByDirection';
import { useFilteredProjects } from '@/hooks/useFilteredProjects';

export function TransparencyView() {
  // ✅ HOOK: Agregaciones serverside
  const { data: budgetData, isLoading: budgetLoading } = useBudgetByDirection();
  
  // ✅ HOOK: Proyectos destacados (primeros 4)
  const { data: projectsData, isLoading: projectsLoading } = useFilteredProjects({
    page_size: 4,
    ordering: '-avance_fisico_pct',
  });

  // Formateadores
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'completado': 'Completado',
      'en_ejecucion': 'En Ejecución',
      'en_riesgo': 'En Riesgo',
      'retrasado': 'Retrasado',
      'planificado': 'Planificado'
    };
    return labels[status] || status;
  };

  const COLORS = [
    'hsl(215, 70%, 35%)',
    'hsl(145, 65%, 42%)',
    'hsl(38, 92%, 50%)',
    'hsl(200, 85%, 50%)',
    'hsl(280, 65%, 55%)',
    'hsl(0, 72%, 51%)',
    'hsl(180, 60%, 45%)',
  ];

  // KPIs desde el backend
  const totalBudget = budgetData?.total_budget || 0;
  const totalExecuted = budgetData?.total_executed || 0;
  const totalBeneficiaries = budgetData?.total_beneficiaries || 0;
  const completedProjects = budgetData?.completed_projects_count || 0;

  // Datos del pie chart desde el backend
  const pieData = budgetData?.pie_chart_data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Portal de Transparencia
        </h1>
        <p className="text-muted-foreground mt-1">
          Información pública sobre el uso de recursos y avance de proyectos
        </p>
      </div>

      {/* Public Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground animate-slide-up">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold mb-2">
              Rendición de Cuentas 2024
            </h2>
            <p className="text-primary-foreground/80 text-sm">
              Consulta el destino de tus impuestos y el impacto de las obras públicas en tu comunidad.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Descargar Informe
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <ExternalLink className="h-4 w-4" />
              Datos Abiertos
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics for Citizens */}
      {budgetLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(totalBudget)}</p>
                  <p className="text-xs text-muted-foreground">Inversión Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">
                    {totalBudget > 0 ? ((totalExecuted / totalBudget) * 100).toFixed(1) : '0.0'}%
                  </p>
                  <p className="text-xs text-muted-foreground">Ejecutado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-info/10">
                  <Users className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{formatNumber(totalBeneficiaries)}</p>
                  <p className="text-xs text-muted-foreground">Beneficiarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{completedProjects}</p>
                  <p className="text-xs text-muted-foreground">Obras Terminadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle>¿A dónde van tus impuestos?</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetLoading ? (
              <div className="flex items-center justify-center h-72">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pieData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend 
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay datos disponibles
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Proyectos Destacados</CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : projectsData?.results && projectsData.results.length > 0 ? (
              <div className="space-y-4">
                {projectsData.results.map((project, index) => (
                  <div 
                    key={project.id}
                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${350 + index * 50}ms` }}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{project.programa}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{project.ubicacion_especifica}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={project.avance_fisico_pct} className="flex-1 h-1.5" />
                        <span className="text-xs font-medium">{project.avance_fisico_pct}%</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay proyectos para mostrar
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Citizen Reports */}
      <Card className="animate-slide-up" style={{ animationDelay: '350ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documentos Públicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Informe Trimestral Q1 2024', type: 'PDF', size: '2.4 MB', date: 'Abr 2024' },
              { title: 'Presupuesto de Egresos 2024', type: 'PDF', size: '1.8 MB', date: 'Ene 2024' },
              { title: 'Catálogo de Proyectos', type: 'XLSX', size: '856 KB', date: 'May 2024' },
              { title: 'Indicadores de Gestión', type: 'PDF', size: '1.2 MB', date: 'May 2024' },
              { title: 'Auditoría Interna Q1', type: 'PDF', size: '3.1 MB', date: 'Abr 2024' },
              { title: 'Mapa de Obras Públicas', type: 'KML', size: '512 KB', date: 'May 2024' },
            ].map((doc, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in"
                style={{ animationDelay: `${400 + index * 30}ms` }}
              >
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.type} • {doc.size}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Stories */}
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Impacto en la Comunidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                <h4 className="font-semibold text-success mb-2">Centro Cultural Inaugurado</h4>
                <p className="text-sm text-muted-foreground">
                  "El nuevo centro cultural nos ha permitido ofrecer talleres de arte y música 
                  a más de 500 niños del barrio. Es un espacio que une a la comunidad."
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  — Asociación de Vecinos del Centro Histórico
                </p>
              </div>
              <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
                <h4 className="font-semibold text-info mb-2">Agua Potable 24/7</h4>
                <p className="text-sm text-muted-foreground">
                  "Después de 15 años, finalmente tenemos agua a cualquier hora del día. 
                  Esto ha mejorado la calidad de vida de todas las familias de la colonia."
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  — Habitantes de Colonia Las Palmas
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <Eye className="h-12 w-12 text-primary mb-4" />
              <h4 className="font-semibold mb-2">¿Tienes algo que compartir?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Tu opinión es importante. Ayúdanos a mejorar nuestros proyectos.
              </p>
              <Button>Enviar Comentario</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
