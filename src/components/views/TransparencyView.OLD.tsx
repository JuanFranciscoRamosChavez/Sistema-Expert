import { mockProjects, formatCurrency, formatNumber, getStatusLabel } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, DollarSign, Building2, CheckCircle, Download, 
  ExternalLink, FileText, Eye, TrendingUp, MapPin 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function TransparencyView() {
  const totalBudget = mockProjects.reduce((sum, p) => sum + p.presupuesto, 0);
  const totalExecuted = mockProjects.reduce((sum, p) => sum + p.ejecutado, 0);
  const totalBeneficiaries = mockProjects.reduce((sum, p) => sum + p.beneficiarios, 0);
  const completedProjects = mockProjects.filter(p => p.status === 'completado').length;

  const budgetByDirection = mockProjects.reduce((acc, p) => {
    const dir = p.direccion.replace('Dirección de ', '');
    acc[dir] = (acc[dir] || 0) + p.presupuesto;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(budgetByDirection).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    'hsl(215, 70%, 35%)',
    'hsl(145, 65%, 42%)',
    'hsl(38, 92%, 50%)',
    'hsl(200, 85%, 50%)',
    'hsl(280, 65%, 55%)',
    'hsl(0, 72%, 51%)',
    'hsl(180, 60%, 45%)',
  ];

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
                <p className="text-2xl font-display font-bold">{((totalExecuted / totalBudget) * 100).toFixed(1)}%</p>
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

      {/* Budget Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <CardHeader>
            <CardTitle>¿A dónde van tus impuestos?</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Proyectos Destacados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProjects.slice(0, 4).map((project, index) => (
                <div 
                  key={project.id}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${350 + index * 50}ms` }}
                >
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{project.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{project.ubicacion}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={project.avance} className="flex-1 h-1.5" />
                      <span className="text-xs font-medium">{project.avance}%</span>
                    </div>
                  </div>
                  <Badge variant={project.status as any} className="text-xs shrink-0">
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
              ))}
            </div>
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
