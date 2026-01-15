import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  User, Bell, Shield, Palette, Database, 
  Users, Save, RefreshCw 
} from 'lucide-react';
import { useState } from 'react';

export function SettingsView() {
  const [notifications, setNotifications] = useState({
    riskAlerts: true,
    deadlines: true,
    budgetAlerts: true,
    weeklyReport: true,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Configuración
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra tu cuenta y preferencias del sistema
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Perfil de Usuario
          </CardTitle>
          <CardDescription>Información básica de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" defaultValue="Secretario de Desarrollo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" defaultValue="secretario@gobierno.mx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select defaultValue="admin">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="director">Director General</SelectItem>
                  <SelectItem value="analyst">Analista</SelectItem>
                  <SelectItem value="viewer">Solo Lectura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direction">Dirección Asignada</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Direcciones</SelectItem>
                  <SelectItem value="obras">Obras Públicas</SelectItem>
                  <SelectItem value="social">Desarrollo Social</SelectItem>
                  <SelectItem value="ambiente">Medio Ambiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura tus alertas y avisos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de Riesgo</p>
              <p className="text-sm text-muted-foreground">Recibe avisos cuando un proyecto entre en riesgo</p>
            </div>
            <Switch 
              checked={notifications.riskAlerts}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, riskAlerts: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Recordatorios de Entregas</p>
              <p className="text-sm text-muted-foreground">Notificaciones antes de fechas límite</p>
            </div>
            <Switch 
              checked={notifications.deadlines}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, deadlines: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas Presupuestales</p>
              <p className="text-sm text-muted-foreground">Avisos de sobregasto o subejecución</p>
            </div>
            <Switch 
              checked={notifications.budgetAlerts}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, budgetAlerts: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reporte Semanal</p>
              <p className="text-sm text-muted-foreground">Resumen ejecutivo cada lunes</p>
            </div>
            <Switch 
              checked={notifications.weeklyReport}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Seguridad
          </CardTitle>
          <CardDescription>Protege tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña Actual</Label>
              <Input id="current-password" type="password" />
            </div>
            <div />
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="font-medium">Autenticación de dos factores</p>
              <p className="text-sm text-muted-foreground">Agrega una capa extra de seguridad</p>
            </div>
            <Button variant="outline">Configurar</Button>
          </div>
        </CardContent>
      </Card>

      {/* System */}
      <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Sistema
          </CardTitle>
          <CardDescription>Configuración del sistema POA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sincronización de Datos</p>
              <p className="text-sm text-muted-foreground">Última sincronización: hace 5 minutos</p>
            </div>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sincronizar
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Exportar Todos los Datos</p>
              <p className="text-sm text-muted-foreground">Descarga una copia de seguridad completa</p>
            </div>
            <Button variant="outline">Exportar</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Gestión de Usuarios</p>
              <p className="text-sm text-muted-foreground">Administra permisos y accesos</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Gestionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Sistema POA v1.0.0</span>
            <span>© 2024 Gobierno Municipal</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
