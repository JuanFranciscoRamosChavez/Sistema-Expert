import { mockProjects, direcciones, formatCurrency, formatNumber } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FileText, Download, Printer, Calendar, 
  BarChart3, PieChart, TrendingUp, Clock 
} from 'lucide-react';
import { useState } from 'react';

export function ReportsView() {
  const [reportType, setReportType] = useState('ejecutivo');
  const [period, setPeriod] = useState('mensual');
  const [direction, setDirection] = useState('all');

  const reportTemplates = [
    {
      id: 'ejecutivo',
      title: 'Reporte Ejecutivo',
      description: 'Resumen de alto nivel para Secretario con KPIs principales y alertas.',
      icon: TrendingUp,
      color: 'bg-primary/10 text-primary',
    },
    {
      id: 'cartera',
      title: 'Cartera de Proyectos',
      description: 'Listado detallado de todos los proyectos con status y avance.',
      icon: BarChart3,
      color: 'bg-info/10 text-info',
    },
    {
      id: 'presupuestal',
      title: 'Ejecución Presupuestal',
      description: 'Análisis financiero con presupuesto asignado vs ejecutado.',
      icon: PieChart,
      color: 'bg-success/10 text-success',
    },
    {
      id: 'riesgos',
      title: 'Análisis de Riesgos',
      description: 'Proyectos críticos, retrasados y con viabilidad comprometida.',
      icon: Clock,
      color: 'bg-danger/10 text-danger',
    },
  ];

  const recentReports = [
    { title: 'Reporte Ejecutivo - Mayo 2024', date: '01 Jun 2024', type: 'PDF', size: '2.4 MB' },
    { title: 'Cartera de Proyectos Q2', date: '15 May 2024', type: 'XLSX', size: '1.2 MB' },
    { title: 'Ejecución Presupuestal Abril', date: '01 May 2024', type: 'PDF', size: '1.8 MB' },
    { title: 'Análisis de Riesgos Q1', date: '15 Abr 2024', type: 'PDF', size: '945 KB' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Centro de Reportes
        </h1>
        <p className="text-muted-foreground mt-1">
          Genera y descarga reportes ejecutivos automáticos
        </p>
      </div>

      {/* Quick Generate */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generador Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ejecutivo">Ejecutivo</SelectItem>
                  <SelectItem value="cartera">Cartera de Proyectos</SelectItem>
                  <SelectItem value="presupuestal">Ejecución Presupuestal</SelectItem>
                  <SelectItem value="riesgos">Análisis de Riesgos</SelectItem>
                  <SelectItem value="territorial">Impacto Territorial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Dirección</label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Direcciones</SelectItem>
                  {direcciones.map(dir => (
                    <SelectItem key={dir} value={dir}>{dir.replace('Dirección de ', '')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Generar PDF
              </Button>
              <Button variant="outline" size="icon">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview Summary */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="font-medium mb-3">Vista Previa del Reporte</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Proyectos incluidos:</span>
                <p className="font-semibold">{direction === 'all' ? mockProjects.length : mockProjects.filter(p => p.direccion === direction).length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Presupuesto total:</span>
                <p className="font-semibold">{formatCurrency(mockProjects.reduce((sum, p) => sum + p.presupuesto, 0))}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Beneficiarios:</span>
                <p className="font-semibold">{formatNumber(mockProjects.reduce((sum, p) => sum + p.beneficiarios, 0))}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha de corte:</span>
                <p className="font-semibold">{new Date().toLocaleDateString('es-MX')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTemplates.map((template, index) => {
          const Icon = template.icon;
          return (
            <Card 
              key={template.id}
              className="cursor-pointer card-hover animate-slide-up"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              <CardContent className="pt-6">
                <div className={`p-3 rounded-lg ${template.color} w-fit mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{template.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Generar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scheduled Reports */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Reportes Programados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Reporte Ejecutivo Semanal</p>
                  <p className="text-sm text-muted-foreground">Cada lunes a las 8:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-success font-medium">Activo</span>
                <Button variant="ghost" size="sm">Editar</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <BarChart3 className="h-4 w-4 text-info" />
                </div>
                <div>
                  <p className="font-medium">Cartera de Proyectos Mensual</p>
                  <p className="text-sm text-muted-foreground">Primer día del mes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-success font-medium">Activo</span>
                <Button variant="ghost" size="sm">Editar</Button>
              </div>
            </div>
            <Button variant="outline" className="w-full gap-2">
              <Calendar className="h-4 w-4" />
              Programar Nuevo Reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="animate-slide-up" style={{ animationDelay: '250ms' }}>
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentReports.map((report, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors animate-fade-in"
                style={{ animationDelay: `${300 + index * 30}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{report.title}</p>
                    <p className="text-xs text-muted-foreground">{report.date} • {report.type} • {report.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
