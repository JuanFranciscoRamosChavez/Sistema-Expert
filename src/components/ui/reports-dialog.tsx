import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Download, FileText, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';

interface ReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: string;
}

type TipoReporte = 'ejecutivo' | 'cartera' | 'presupuesto' | 'riesgos' | 'territorial' | 'avance';
type FormatoReporte = 'pdf' | 'excel';
type PeriodoReporte = 'mensual' | 'trimestral' | 'anual';

const TIPOS_REPORTE = [
  { id: 'ejecutivo', nombre: 'Reporte Ejecutivo', descripcion: 'Resumen de KPIs y top proyectos' },
  { id: 'cartera', nombre: 'Cartera de Proyectos', descripcion: 'Listado completo por estado' },
  { id: 'presupuesto', nombre: 'Análisis Presupuestal', descripcion: 'Desglose de presupuesto' },
  { id: 'riesgos', nombre: 'Análisis de Riesgos', descripcion: 'Proyectos de alto riesgo' },
  { id: 'territorial', nombre: 'Distribución Territorial', descripcion: 'Por alcaldías y zonas' },
  { id: 'avance', nombre: 'Avance de Obras', descripcion: 'Estado de ejecución' }
];

export function ReportsDialog({ open, onOpenChange, defaultType = 'ejecutivo' }: ReportsDialogProps) {
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>(defaultType as TipoReporte);
  const [formato, setFormato] = useState<FormatoReporte>('pdf');
  const [periodo, setPeriodo] = useState<PeriodoReporte>('mensual');
  const [fechaCorte, setFechaCorte] = useState<Date>(new Date());
  const [generando, setGenerando] = useState(false);

  // Actualizar tipo cuando cambia defaultType
  useEffect(() => {
    if (open && defaultType) {
      setTipoReporte(defaultType as TipoReporte);
    }
  }, [open, defaultType]);

  const handleGenerar = async () => {
    setGenerando(true);
    
    try {
      const payload = {
        tipo_reporte: tipoReporte,
        formato: formato,
        periodo: periodo,
        fecha_corte: format(fechaCorte, 'yyyy-MM-dd'),
        nombre_reporte: `Reporte_${tipoReporte}_${format(fechaCorte, 'yyyy-MM-dd')}`
      };

      const response = await fetch(`${API_BASE_URL}/api/reportes/generar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      // Descargar archivo
      const blob = await response.blob();
      const contentType = response.headers.get('content-type') || '';
      
      let extension = '';
      if (contentType.includes('pdf')) {
        extension = '.pdf';
      } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
        extension = '.xlsx';
      }

      const nombreArchivo = `reporte_${tipoReporte}_${format(fechaCorte, 'yyyy-MM-dd')}${extension}`;
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success('Reporte generado exitosamente', {
        description: `Se descargó ${nombreArchivo}`,
      });

      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar reporte', {
        description: error.message || 'Intenta nuevamente',
      });
    } finally {
      setGenerando(false);
    }
  };

  const tipoSeleccionado = TIPOS_REPORTE.find(t => t.id === tipoReporte);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#9F2241]" />
            Generar Reporte
          </DialogTitle>
          <DialogDescription>
            Configura y descarga reportes personalizados en PDF o Excel
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Tipo de Reporte */}
          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-sm font-semibold">Tipo de Reporte</Label>
            <Select value={tipoReporte} onValueChange={(value) => setTipoReporte(value as TipoReporte)}>
              <SelectTrigger id="tipo" className="h-auto min-h-[44px]">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {TIPOS_REPORTE.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id} className="cursor-pointer py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-medium text-sm">{tipo.nombre}</span>
                      <span className="text-xs text-muted-foreground">{tipo.descripcion}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Formato */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Formato de Salida</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={formato === 'pdf' ? 'default' : 'outline'}
                onClick={() => setFormato('pdf')}
                className={`flex-1 h-12 transition-all ${formato === 'pdf' ? 'bg-[#9F2241] hover:bg-[#8B1C3A]' : ''}`}
              >
                <span className="text-lg mr-2">📄</span>
                <span className="font-medium">PDF</span>
              </Button>
              <Button
                type="button"
                variant={formato === 'excel' ? 'default' : 'outline'}
                onClick={() => setFormato('excel')}
                className={`flex-1 h-12 transition-all ${formato === 'excel' ? 'bg-[#9F2241] hover:bg-[#8B1C3A]' : ''}`}
              >
                <span className="text-lg mr-2">📊</span>
                <span className="font-medium">Excel</span>
              </Button>
            </div>
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label htmlFor="periodo" className="text-sm font-semibold">Período</Label>
            <Select value={periodo} onValueChange={(value) => setPeriodo(value as PeriodoReporte)}>
              <SelectTrigger id="periodo" className="h-11">
                <SelectValue placeholder="Selecciona período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensual" className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Mensual</span>
                  </span>
                </SelectItem>
                <SelectItem value="trimestral" className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span>📆</span>
                    <span>Trimestral</span>
                  </span>
                </SelectItem>
                <SelectItem value="anual" className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span>🗓️</span>
                    <span>Anual</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha de Corte */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Fecha de Corte</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(fechaCorte, 'PPP', { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaCorte}
                  onSelect={(date) => date && setFechaCorte(date)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Vista Previa Info */}
          {tipoSeleccionado && (
            <div className="rounded-lg border bg-muted/50 dark:bg-muted/20 p-4 text-sm space-y-2 animate-in fade-in-50 duration-200">
              <p className="font-semibold text-foreground">{tipoSeleccionado.nombre}</p>
              <p className="text-muted-foreground text-xs">{tipoSeleccionado.descripcion}</p>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/80 border">
                  <CalendarIcon className="h-3 w-3" />
                  {format(fechaCorte, 'dd/MM/yyyy')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/80 border">
                  <FileText className="h-3 w-3" />
                  {formato.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/80 border">
                  📊 {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generando}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGenerar}
            disabled={generando}
            className="bg-[#9F2241] hover:bg-[#8B1C3A] flex-1 sm:flex-none"
          >
            {generando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generar Reporte
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
