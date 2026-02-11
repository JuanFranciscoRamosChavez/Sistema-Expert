import { useState } from 'react';
import { FileText, Download, Calendar, FileSpreadsheet, TrendingUp, AlertTriangle, MapPin, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ReportsDialog } from '@/components/ui/reports-dialog';
import { H1, Subtitle } from "@/components/ui/typography";

const TIPOS_REPORTE = [
  {
    id: 'ejecutivo',
    nombre: 'Reporte Ejecutivo',
    descripcion: 'Resumen de KPIs y top proyectos por presupuesto',
    icon: TrendingUp,
    color: 'bg-blue-50 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'cartera',
    nombre: 'Cartera de Proyectos',
    descripcion: 'Listado completo de obras por estado y área',
    icon: BarChart3,
    color: 'bg-purple-50 dark:bg-purple-950',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'presupuesto',
    nombre: 'Análisis Presupuestal',
    descripcion: 'Desglose detallado de presupuesto modificado y ejecutado',
    icon: FileSpreadsheet,
    color: 'bg-green-50 dark:bg-green-950',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'riesgos',
    nombre: 'Análisis de Riesgos',
    descripcion: 'Proyectos de alto riesgo y necesidades de atención',
    icon: AlertTriangle,
    color: 'bg-red-50 dark:bg-red-950',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  {
    id: 'territorial',
    nombre: 'Distribución Territorial',
    descripcion: 'Obras por alcaldías y distribución geográfica',
    icon: MapPin,
    color: 'bg-amber-50 dark:bg-amber-950',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'avance',
    nombre: 'Avance de Obras',
    descripcion: 'Estado de ejecución físico y financiero',
    icon: Calendar,
    color: 'bg-cyan-50 dark:bg-cyan-950',
    iconColor: 'text-cyan-600 dark:text-cyan-400'
  }
];

export function ReportsView() {
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('ejecutivo');

  const handleGenerateReport = (tipo: string) => {
    setSelectedType(tipo);
    setReportsDialogOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8 px-2 sm:px-0">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#9F2241]/10 via-[#9F2241]/5 to-transparent border border-[#9F2241]/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#9F2241]/5 rounded-full blur-3xl -z-10" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-[#9F2241]/10 border border-[#9F2241]/20">
            <FileText className="h-4 w-4 text-[#9F2241]" />
            <span className="text-xs font-medium text-[#9F2241]">Gestión de Reportes</span>
          </div>
          <H1 className="text-2xl sm:text-3xl lg:text-4xl mb-2">Centro de Reportes</H1>
          <Subtitle className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Genera y descarga reportes personalizados en PDF o Excel con datos en tiempo real
          </Subtitle>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-[#9F2241]/20 hover:border-[#9F2241] hover:shadow-lg hover:shadow-[#9F2241]/10 transition-all duration-300 cursor-pointer group" onClick={() => setReportsDialogOpen(true)}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#9F2241] to-[#8B1C3A] group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base lg:text-lg mb-1 group-hover:text-[#9F2241] transition-colors">Generar Reporte Rápido</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Configuración personalizada</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-[#9F2241]/10 flex items-center justify-center">
                <span className="text-[#9F2241] text-lg">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-muted-foreground/30 hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent opacity-50" />
          <CardContent className="flex items-center gap-4 p-6 relative z-10">
            <div className="p-3 rounded-xl bg-muted flex-shrink-0">
              <Download className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base lg:text-lg mb-1">Historial de Reportes</h3>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Próximamente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tipos de Reportes */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">Tipos de Reportes Disponibles</h2>
            <p className="text-sm text-muted-foreground">Selecciona el tipo de reporte que necesitas generar</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border">
            <span className="text-xs font-medium text-muted-foreground">{TIPOS_REPORTE.length} tipos</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIPOS_REPORTE.map((tipo) => {
            const Icon = tipo.icon;
            return (
              <Card 
                key={tipo.id} 
                className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-2 hover:border-[#9F2241]/30 relative overflow-hidden"
                onClick={() => handleGenerateReport(tipo.id)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon className="w-full h-full" />
                </div>
                <CardHeader className="pb-3 p-5 relative z-10">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl ${tipo.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0 shadow-sm`}>
                      <Icon className={`h-5 w-5 ${tipo.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-bold leading-tight mb-1">{tipo.nombre}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 relative z-10">
                  <CardDescription className="text-xs sm:text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
                    {tipo.descripcion}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-[#9F2241] group-hover:text-white group-hover:border-[#9F2241] transition-all duration-300 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateReport(tipo.id);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Información Adicional */}
      <Card className="bg-gradient-to-br from-[#9F2241]/8 via-[#9F2241]/4 to-transparent border-[#9F2241]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#9F2241]/5 rounded-full blur-3xl" />
        <CardHeader className="p-5 sm:p-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#9F2241]/10">
              <span className="text-xl">💡</span>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold">Información Importante</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm p-5 sm:p-6 pt-0 relative z-10">
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
            <p className="text-muted-foreground">Los reportes se generan con <strong className="text-foreground">datos en tiempo real</strong></p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
            <p className="text-muted-foreground">Formato <strong className="text-foreground">PDF</strong> (presentaciones) o <strong className="text-foreground">Excel</strong> (análisis)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
            <p className="text-muted-foreground">Define <strong className="text-foreground">fecha de corte</strong> para reportes históricos</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
            <p className="text-muted-foreground">Incluye <strong className="text-foreground">gráficos, tablas y estadísticas</strong> detalladas</p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Reportes */}
      <ReportsDialog 
        open={reportsDialogOpen} 
        onOpenChange={setReportsDialogOpen}
        defaultType={selectedType}
      />
    </div>
  );
}
