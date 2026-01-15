import { mockProjects, zonas, formatCurrency, formatNumber } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, Users, DollarSign, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const zoneColors = {
  norte: 'hsl(200, 85%, 50%)',
  sur: 'hsl(145, 65%, 42%)',
  centro: 'hsl(38, 92%, 50%)',
  oriente: 'hsl(280, 65%, 55%)',
  poniente: 'hsl(0, 72%, 51%)',
  multiple: 'hsl(220, 15%, 50%)',
  virtual: 'hsl(180, 60%, 45%)',
};

export function TerritoryView() {
  const projectsByZone = mockProjects.reduce((acc, project) => {
    const zone = project.zona || 'multiple';
    if (!acc[zone]) {
      acc[zone] = { count: 0, budget: 0, beneficiaries: 0 };
    }
    acc[zone].count++;
    acc[zone].budget += project.presupuesto;
    acc[zone].beneficiaries += project.beneficiarios;
    return acc;
  }, {} as Record<string, { count: number; budget: number; beneficiaries: number }>);

  const pieData = Object.entries(projectsByZone).map(([zone, data]) => ({
    name: zonas.find(z => z.id === zone)?.nombre || zone.charAt(0).toUpperCase() + zone.slice(1),
    value: data.budget,
    zone,
  }));

  const barData = zonas.map(zona => ({
    name: zona.nombre.replace('Zona ', ''),
    proyectos: projectsByZone[zona.id]?.count || 0,
    beneficiarios: (projectsByZone[zona.id]?.beneficiaries || 0) / 1000,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Impacto Territorial
        </h1>
        <p className="text-muted-foreground mt-1">
          Distribución geográfica de proyectos e inversión
        </p>
      </div>

      {/* Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {zonas.map((zona, index) => {
          const zoneData = projectsByZone[zona.id] || { count: 0, budget: 0, beneficiaries: 0 };
          return (
            <Card 
              key={zona.id} 
              className="animate-slide-up overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div 
                className="h-2 w-full" 
                style={{ backgroundColor: zoneColors[zona.id as keyof typeof zoneColors] }} 
              />
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin 
                    className="h-4 w-4" 
                    style={{ color: zoneColors[zona.id as keyof typeof zoneColors] }} 
                  />
                  <span className="font-semibold text-sm">{zona.nombre}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proyectos</span>
                    <span className="font-medium">{zoneData.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inversión</span>
                    <span className="font-medium">{formatCurrency(zoneData.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beneficiarios</span>
                    <span className="font-medium">{formatNumber(zoneData.beneficiaries)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Distribución de Inversión por Zona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={zoneColors[entry.zone as keyof typeof zoneColors] || 'hsl(220, 15%, 50%)'} 
                      />
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Proyectos y Beneficiarios por Zona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar yAxisId="left" dataKey="proyectos" name="Proyectos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="beneficiarios" name="Beneficiarios (miles)" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Territory Map Placeholder */}
      <Card className="animate-slide-up" style={{ animationDelay: '250ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Mapa de Impacto Territorial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 bg-muted/30 rounded-lg overflow-hidden">
            {/* Simplified visual map representation */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-4">
              <div className="col-start-2 row-start-1 bg-info/20 rounded-lg border-2 border-info/40 flex flex-col items-center justify-center p-2 hover:bg-info/30 transition-colors cursor-pointer">
                <span className="font-semibold text-info text-sm">Norte</span>
                <span className="text-xs text-muted-foreground">{projectsByZone['norte']?.count || 0} proyectos</span>
              </div>
              <div className="col-start-1 row-start-2 bg-purple-500/20 rounded-lg border-2 border-purple-500/40 flex flex-col items-center justify-center p-2 hover:bg-purple-500/30 transition-colors cursor-pointer">
                <span className="font-semibold text-purple-600 text-sm">Poniente</span>
                <span className="text-xs text-muted-foreground">{projectsByZone['poniente']?.count || 0} proyectos</span>
              </div>
              <div className="col-start-2 row-start-2 bg-warning/20 rounded-lg border-2 border-warning/40 flex flex-col items-center justify-center p-2 hover:bg-warning/30 transition-colors cursor-pointer">
                <span className="font-semibold text-warning text-sm">Centro</span>
                <span className="text-xs text-muted-foreground">{projectsByZone['centro']?.count || 0} proyectos</span>
              </div>
              <div className="col-start-3 row-start-2 bg-danger/20 rounded-lg border-2 border-danger/40 flex flex-col items-center justify-center p-2 hover:bg-danger/30 transition-colors cursor-pointer">
                <span className="font-semibold text-danger text-sm">Oriente</span>
                <span className="text-xs text-muted-foreground">{projectsByZone['oriente']?.count || 0} proyectos</span>
              </div>
              <div className="col-start-2 row-start-3 bg-success/20 rounded-lg border-2 border-success/40 flex flex-col items-center justify-center p-2 hover:bg-success/30 transition-colors cursor-pointer">
                <span className="font-semibold text-success text-sm">Sur</span>
                <span className="text-xs text-muted-foreground">{projectsByZone['sur']?.count || 0} proyectos</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Vista esquemática de distribución territorial. Haga clic en una zona para ver detalles.
          </p>
        </CardContent>
      </Card>

      {/* Equity Analysis */}
      <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle>Análisis de Equidad Territorial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zonas.map((zona, index) => {
              const zoneData = projectsByZone[zona.id] || { count: 0, budget: 0, beneficiaries: 0 };
              const investmentPerCapita = zoneData.budget / zona.poblacion;
              const avgInvestment = mockProjects.reduce((sum, p) => sum + p.presupuesto, 0) / mockProjects.reduce((sum, p) => sum + p.beneficiarios, 0);
              const equityScore = (investmentPerCapita / avgInvestment) * 100;
              
              return (
                <div 
                  key={zona.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${350 + index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: zoneColors[zona.id as keyof typeof zoneColors] }}
                      />
                      <span className="font-medium">{zona.nombre}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(investmentPerCapita)} per cápita
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(equityScore, 100)} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
