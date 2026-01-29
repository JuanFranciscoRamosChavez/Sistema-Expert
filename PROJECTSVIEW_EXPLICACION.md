# 📋 ProjectsView - Explicación Completa por Secciones

## 🎯 Propósito del Componente

**ProjectsView** es la vista de **Cartera de Proyectos**, donde los usuarios pueden:
- Ver todos los proyectos registrados en el sistema
- Filtrar por área responsable y estatus
- Buscar proyectos por nombre o responsable
- Cambiar entre vista de cuadrícula (tarjetas) y vista de lista (tabla)
- Hacer clic en cualquier proyecto para ver detalles completos

---

## 📦 SECCIÓN 1: Imports y Dependencias

```tsx
import { useState, useMemo, useEffect } from 'react';
import { 
	Search,        // Icono de lupa para búsqueda
	Filter,        // Icono de filtro
	AlertTriangle, // Icono de error
	LayoutGrid,    // Icono de vista de cuadrícula
	List as ListIcon, // Icono de vista de lista
	MapPin,        // Icono de ubicación
	X,             // Icono de cerrar/limpiar
	SlidersHorizontal // Icono de filtros avanzados (móvil)
} from 'lucide-react';
```

### Componentes UI Importados
```tsx
import { ProjectCard } from '@/components/projects/ProjectCard';      // Tarjeta individual de proyecto
import { ProjectDetail } from '@/components/projects/ProjectDetail';  // Modal con detalles completos
import { Input } from '@/components/ui/input';                        // Campo de texto
import { Button } from '@/components/ui/button';                      // Botones
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Dropdown
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"; // Panel lateral móvil
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Tabla
import { Badge } from '@/components/ui/badge';      // Etiquetas de estado
import { Progress } from '@/components/ui/progress'; // Barra de progreso
import { Dialog, DialogTrigger } from '@/components/ui/dialog'; // Modal
```

### Hooks y Tipos
```tsx
import { Project } from '@/types/index';            // Tipo TypeScript de Proyecto
import { H1, Subtitle } from "@/components/ui/typography"; // Componentes de texto
import { APP_COLORS, STATUS_COLORS } from '@/lib/theme'; // Colores del tema
import { useFilteredProjects } from '@/hooks/useFilteredProjects'; // Hook principal (Sprint 3)
import { useDashboardData } from '@/hooks/useDashboardData';       // Hook para opciones de filtros
```

**Nota importante:** Este componente fue **migrado a backend en Sprint 3**, por lo que ahora usa `useFilteredProjects` en lugar de filtrar manualmente en el frontend.

---

## 🎮 SECCIÓN 2: Estados del Componente

```tsx
export function ProjectsView() {
	// Estados de Filtros y Vista
	const [searchTerm, setSearchTerm] = useState('');          // Texto de búsqueda
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Vista: tarjetas o tabla
	const [selectedArea, setSelectedArea] = useState<string>('all');   // Filtro de área
	const [selectedStatus, setSelectedStatus] = useState<string>('all'); // Filtro de estatus
```

### Explicación de Estados

| Estado | Tipo | Valor Inicial | Propósito |
|--------|------|---------------|-----------|
| `searchTerm` | `string` | `''` | Texto que el usuario escribe para buscar |
| `viewMode` | `'grid' \| 'list'` | `'grid'` | Modo de visualización (tarjetas o tabla) |
| `selectedArea` | `string` | `'all'` | Área responsable seleccionada (`'all'` = todas) |
| `selectedStatus` | `string` | `'all'` | Estatus seleccionado (`'all'` = todos) |

---

## 🔄 SECCIÓN 3: Construcción de Filtros (useMemo)

```tsx
const filters = useMemo(() => ({
	search: searchTerm || undefined,
	direccion: selectedArea !== 'all' ? selectedArea : undefined,
	status: selectedStatus !== 'all' ? selectedStatus : undefined,
	page_size: 'todos' as const
}), [searchTerm, selectedArea, selectedStatus]);
```

### ¿Qué hace `useMemo` aquí?

`useMemo` **memoriza** (guarda en caché) el objeto `filters` y **solo lo recalcula** cuando cambian sus dependencias: `[searchTerm, selectedArea, selectedStatus]`.

**Beneficio:** Evita crear un nuevo objeto en cada render, lo que mejoraría el rendimiento al prevenir re-fetches innecesarios del hook.

### Objeto Filters Resultante

Si el usuario:
- Escribe "parque" en el buscador
- Selecciona "Dirección de Obras Públicas"
- Deja "Todos los estatus"

El objeto será:
```javascript
{
	search: "parque",
	direccion: "Dirección de Obras Públicas",
	status: undefined,  // undefined = no se envía al backend
	page_size: 'todos'
}
```

**Nota:** `page_size: 'todos'` le dice al backend que devuelva TODOS los proyectos sin paginación.

---

## 🌐 SECCIÓN 4: Fetching de Datos (Backend)

```tsx
// Usar hook del backend para filtrado serverside
const { data, isLoading: loading, error: queryError } = useFilteredProjects(filters);

const filteredProjects = data?.results || [];
const error = queryError ? 'Hubo un problema al cargar la lista de proyectos.' : null;
```

### Flujo de Datos

1. **`useFilteredProjects(filters)`** envía una petición al backend: `/api/v2/obras/filtered/?search=parque&direccion=Dirección%20de%20Obras`
2. **Backend (Django)** aplica los filtros en PostgreSQL
3. **Respuesta:** 
   ```json
   {
     "results": [...proyectos filtrados...],
     "count": 45,
     "_meta": {...}
   }
   ```
4. **Frontend:** Recibe `data.results` con solo los proyectos que cumplen los filtros

### Variables Derivadas

```tsx
const filteredProjects = data?.results || [];
```
- Si `data` existe → usa `data.results`
- Si no existe (aún cargando o error) → usa array vacío `[]`

```tsx
const error = queryError ? 'Hubo un problema...' : null;
```
- Si hay error del hook → muestra mensaje personalizado
- Si no hay error → `null`

---

## 📊 SECCIÓN 5: Opciones de Filtros (useMemo + Dashboard Data)

```tsx
// Obtener opciones de filtros únicas (usar fallback para opciones)
const { projects: allProjectsForOptions } = useDashboardData();

const uniqueAreas = useMemo(() => {
	const areas = allProjectsForOptions.map(p => p.direccion).filter(Boolean);
	return Array.from(new Set(areas)).sort();
}, [allProjectsForOptions]);

const uniqueStatuses = useMemo(() => {
	const statuses = allProjectsForOptions.map(p => p.status);
	return Array.from(new Set(statuses));
}, [allProjectsForOptions]);
```

### ¿Por qué se usa `useDashboardData()` aquí?

Para llenar los **dropdowns de filtros** necesitamos conocer:
- ¿Qué áreas responsables existen en el sistema?
- ¿Qué estatus existen?

**Solución:** Usar los datos del dashboard (que ya están cargados) como "catálogo" de opciones.

### Proceso de `uniqueAreas`

```javascript
// 1. Extraer todas las direcciones
const areas = allProjectsForOptions.map(p => p.direccion).filter(Boolean);
// Resultado: ["Dirección A", "Dirección B", "Dirección A", "Dirección C"]

// 2. Eliminar duplicados con Set
const uniqueSet = new Set(areas);
// Resultado: Set { "Dirección A", "Dirección B", "Dirección C" }

// 3. Convertir a array y ordenar alfabéticamente
return Array.from(uniqueSet).sort();
// Resultado: ["Dirección A", "Dirección B", "Dirección C"]
```

**Resultado:** Dropdown muestra solo opciones únicas y ordenadas.

---

## 🧹 SECCIÓN 6: Funciones Auxiliares

### 6.1 Limpiar Filtros

```tsx
const clearFilters = () => {
	setSearchTerm('');
	setSelectedArea('all');
	setSelectedStatus('all');
};
```

**Uso:** Botón "Limpiar Todo" → Resetea todos los filtros a sus valores por defecto.

### 6.2 Detectar Filtros Activos

```tsx
const hasActiveFilters = searchTerm !== '' || selectedArea !== 'all' || selectedStatus !== 'all';
```

**Uso:** 
- Mostrar botón "Limpiar" solo si hay filtros activos
- Cambiar color del icono de filtros en móvil si hay filtros aplicados

### 6.3 Formatear Dinero

```tsx
const formatMoney = (amount: number) => {
	return new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: 'MXN',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};
```

**Ejemplo:**
```javascript
formatMoney(1500000)  // → "$1,500,000"
formatMoney(250000.5) // → "$250,001" (redondea)
```

### 6.4 Obtener Etiqueta de Estado

```tsx
const getStatusLabel = (status: string) => {
	const labels: Record<string, string> = {
		planificado: 'Planificado',
		en_ejecucion: 'En Ejecución',
		completado: 'Completado',
		en_riesgo: 'En Riesgo',
		retrasado: 'Retrasado',
	};
	return labels[status] || status;
};
```

**Propósito:** Convertir `en_ejecucion` → `"En Ejecución"` (más legible para el usuario).

---

## 🎨 SECCIÓN 7: Sub-Componente FilterControls (Desktop)

```tsx
const FilterControls = () => (
	<>
		{/* Filtro: Áreas */}
		<div className="w-full md:w-[240px]">
			<Select value={selectedArea} onValueChange={setSelectedArea}>
				<SelectTrigger className="bg-background/60">
					<div className="flex items-center gap-2 truncate">
						<Filter className="h-3.5 w-3.5 text-muted-foreground" />
						<SelectValue placeholder="Todas las áreas" />
					</div>
				</SelectTrigger>
				<SelectContent className="max-h-[300px]">
					<SelectItem value="all">Todas las áreas</SelectItem>
					{uniqueAreas.map(area => (
						<SelectItem key={area} value={area}>{area}</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>

		{/* Filtro: Estatus */}
		<div className="w-full md:w-[200px]">
			<Select value={selectedStatus} onValueChange={setSelectedStatus}>
				<SelectTrigger className="bg-background/60">
					<SelectValue placeholder="Todos los estatus" />
				</SelectTrigger>
				<SelectContent className="max-h-[300px]">
					<SelectItem value="all">Todos los estatus</SelectItem>
					{uniqueStatuses.map(status => (
						<SelectItem key={status} value={status}>
							{getStatusLabel(status)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	</>
);
```

### Características

- **Ancho fijo:** 
  - Áreas: 240px
  - Estatus: 200px
- **max-h-[300px]:** Si hay muchas opciones, aparece scroll dentro del dropdown
- **value/onValueChange:** Conectado a los estados `selectedArea` y `selectedStatus`

**Este componente solo se muestra en desktop (≥ 768px).**

---

## 🚨 SECCIÓN 8: Estados de Carga y Error

### 8.1 Estado de Carga

```tsx
if (loading) return (
	<div className="flex h-96 items-center justify-center gap-2 text-muted-foreground">
		<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
		Cargando cartera...
	</div>
);
```

**Cuando se muestra:**
- Al cargar la página por primera vez
- Mientras el backend procesa los filtros

**Aspecto visual:**
- Spinner giratorio (animación CSS: `animate-spin`)
- Texto "Cargando cartera..."
- Centrado vertical y horizontalmente

### 8.2 Estado de Error

```tsx
if (error) return (
	<div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
		<div className="bg-destructive/10 p-4 rounded-full">
			<AlertTriangle className="h-8 w-8 text-destructive" />
		</div>
		<div className="space-y-1">
			<h3 className="font-semibold text-lg">Error de Carga</h3>
			<p className="text-muted-foreground">{error}</p>
		</div>
		<Button onClick={() => window.location.reload()} variant="outline">
			Reintentar
		</Button>
	</div>
);
```

**Cuando se muestra:**
- Si falla la petición al backend (servidor caído, error 500, etc.)

**Elementos:**
1. **Icono rojo de advertencia** en círculo de fondo rojo claro
2. **Título:** "Error de Carga"
3. **Mensaje:** Texto del error
4. **Botón "Reintentar":** Recarga toda la página

---

## 📐 SECCIÓN 9: Layout Principal (Return)

```tsx
return (
	<div className="space-y-6 animate-fade-in pb-8">
```

- **space-y-6:** 24px de espacio vertical entre secciones hijas
- **animate-fade-in:** Animación de entrada (fade in)
- **pb-8:** 32px de padding inferior para evitar que el último elemento quede pegado al borde

---

## 📌 SECCIÓN 10: Encabezado (Header)

```tsx
{/* 1. ENCABEZADO */}
<div className="flex flex-col gap-4">
	<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
		<div>
			<H1>Cartera de Proyectos</H1>
			<Subtitle>
				Mostrando {filteredProjects.length} de {data?.count || allProjectsForOptions.length} obras registradas
			</Subtitle>
		</div>

		{/* Botones de Vista */}
		<div className="flex gap-2 bg-muted/50 p-1 rounded-lg w-fit">
			<button 
				onClick={() => setViewMode('grid')} 
				className={`p-2 rounded-md transition-all ${
					viewMode === 'grid' 
						? 'bg-card shadow-sm text-foreground' 
						: 'text-muted-foreground hover:text-foreground'
				}`} 
				title="Cuadrícula"
			>
				<LayoutGrid className="h-4 w-4" />
			</button>
			<button 
				onClick={() => setViewMode('list')} 
				className={`p-2 rounded-md transition-all ${
					viewMode === 'list' 
						? 'bg-card shadow-sm text-foreground' 
						: 'text-muted-foreground hover:text-foreground'
				}`} 
				title="Lista"
			>
				<ListIcon className="h-4 w-4" />
			</button>
		</div>
	</div>
```

### Estructura

```
┌─────────────────────────────────────────────┐
│ Cartera de Proyectos     [□] [≡]           │ ← flex-row en desktop
│ Mostrando 45 de 156 obras registradas      │
└─────────────────────────────────────────────┘
```

### Contador Dinámico

```tsx
Mostrando {filteredProjects.length} de {data?.count || allProjectsForOptions.length} obras
```

**Ejemplos:**
- Sin filtros: "Mostrando 156 de 156 obras registradas"
- Con filtros: "Mostrando 12 de 156 obras registradas"

### Botones de Vista (Toggle)

**Estado activo (seleccionado):**
- Fondo blanco (`bg-card`)
- Sombra sutil (`shadow-sm`)
- Texto oscuro (`text-foreground`)

**Estado inactivo:**
- Texto gris (`text-muted-foreground`)
- Hover: texto más oscuro

---

## 🔍 SECCIÓN 11: Barra de Filtros (Desktop + Mobile)

```tsx
{/* 2. BARRA DE FILTROS FLUIDA */}
<div className="flex gap-3 items-center bg-card p-3 rounded-xl border border-border shadow-sm">
```

### 11.1 Buscador (Compartido)

```tsx
{/* BUSCADOR */}
<div className="relative flex-1">
	<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
	<Input 
		placeholder="Buscar proyecto por nombre o responsable..." 
		className="pl-9 bg-muted/30 border-transparent focus:bg-background transition-colors"
		value={searchTerm}
		onChange={(e) => setSearchTerm(e.target.value)}
	/>
	{searchTerm && (
		<button 
			onClick={() => setSearchTerm('')} 
			className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
		>
			<X className="h-4 w-4" />
		</button>
	)}
</div>
```

**Elementos:**
1. **Icono de lupa** (posición absoluta a la izquierda)
2. **Input con padding-left:** `pl-9` para que el texto no tape la lupa
3. **Botón X:** Solo aparece si hay texto (`{searchTerm && ...}`)

**Interacción:**
- El usuario escribe → el estado `searchTerm` se actualiza
- El hook `useFilteredProjects` detecta el cambio → hace una nueva petición al backend
- Botón X → limpia el texto

### 11.2 Filtros Desktop

```tsx
{/* FILTROS DESKTOP */}
<div className="hidden md:flex gap-3 items-center">
	<div className="w-[1px] h-8 bg-border mx-1" />  {/* Separador vertical */}
	<FilterControls />
	
	{hasActiveFilters && (
		<Button 
			variant="ghost" 
			size="sm" 
			onClick={clearFilters}
			className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
		>
			Limpiar
			<X className="ml-2 h-3 w-3" />
		</Button>
	)}
</div>
```

**hidden md:flex:** 
- Oculto en móvil (< 768px)
- Visible en tablet/desktop (≥ 768px)

**Botón "Limpiar":**
- Solo aparece si `hasActiveFilters === true`
- Hover: texto rojo + fondo rojo claro

### 11.3 Filtros Mobile (Sheet)

```tsx
{/* FILTROS MOBILE (Sheet) */}
<div className="md:hidden">
	<Sheet>
		<SheetTrigger asChild>
			<Button variant="outline" size="icon" className={hasActiveFilters ? "border-primary text-primary bg-primary/5" : ""}>
				<SlidersHorizontal className="h-4 w-4" />
				{(selectedArea !== 'all' || selectedStatus !== 'all') && (
					<span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
				)}
			</Button>
		</SheetTrigger>
```

**md:hidden:** 
- Visible en móvil (< 768px)
- Oculto en tablet/desktop (≥ 768px)

**Botón con indicador visual:**
- Si `hasActiveFilters === true`: Borde azul, fondo azul claro
- Si hay filtros aplicados: Punto rojo en la esquina superior derecha

#### Contenido del Sheet

```tsx
<SheetContent side="bottom" className="rounded-t-[20px] h-auto max-h-[85vh]">
	<SheetHeader className="mb-4 text-left">
		<SheetTitle>Filtros Avanzados</SheetTitle>
		<SheetDescription>
			Refina la búsqueda por área o estado del proyecto.
		</SheetDescription>
	</SheetHeader>
	
	<div className="flex flex-col gap-4 py-4">
		{/* Dropdown de Áreas */}
		{/* Dropdown de Estatus */}
	</div>

	<SheetFooter className="flex-row gap-3 pt-4 border-t border-border mt-2">
		<Button variant="outline" className="flex-1" onClick={clearFilters}>
			Limpiar Todo
		</Button>
		<SheetClose asChild>
			<Button className="flex-1">Ver {filteredProjects.length} Resultados</Button>
		</SheetClose>
	</SheetFooter>
</SheetContent>
```

**side="bottom":** Panel que sale desde abajo (típico en móviles)

**rounded-t-[20px]:** Bordes redondeados en la parte superior

**max-h-[85vh]:** Altura máxima del 85% de la pantalla (deja espacio arriba)

**Footer con 2 botones:**
1. **"Limpiar Todo":** Llama a `clearFilters()`
2. **"Ver X Resultados":** Cierra el sheet (SheetClose)

---

## 📊 SECCIÓN 12: Contenido Principal (Vista Grid y Lista)

### 12.1 Verificación de Resultados

```tsx
{/* 3. CONTENIDO PRINCIPAL */}
{filteredProjects.length > 0 ? (
	<>
		{/* GRID VIEW */}
		{/* LIST VIEW */}
	</>
) : (
	{/* ESTADO VACÍO */}
)}
```

**Lógica:**
- Si hay proyectos → muestra grid o lista según `viewMode`
- Si NO hay proyectos → muestra mensaje "No se encontraron proyectos"

### 12.2 Grid View (Tarjetas)

```tsx
{/* GRID VIEW */}
{viewMode === 'grid' && (
	<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
		{filteredProjects.map((project) => (
			<ProjectCard key={project.id} project={project} />
		))}
	</div>
)}
```

**Grid responsivo:**
| Dispositivo | Columnas | Breakpoint |
|-------------|----------|------------|
| Móvil | 1 | < 768px |
| Tablet | 2 | 768px - 1280px |
| Desktop | 3 | ≥ 1280px |

**Animación:** `animate-in fade-in zoom-in-95`
- Aparece con fade (opacidad 0 → 1)
- Zoom desde 95% hasta 100%

**Componente ProjectCard:** Recibe el objeto `project` completo como prop.

### 12.3 List View (Tabla)

```tsx
{/* LIST VIEW */}
{viewMode === 'list' && (
	<div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/30 hover:bg-muted/30">
						<TableHead className="w-[40%] pl-6">Proyecto / Dirección</TableHead>
						<TableHead>Responsable</TableHead>
						<TableHead>Estatus</TableHead>
						<TableHead>Avance</TableHead>
						<TableHead className="text-right pr-6">Presupuesto</TableHead>
					</TableRow>
				</TableHeader>
```

**overflow-x-auto:** Si la tabla es muy ancha para la pantalla, aparece scroll horizontal

**Columnas de la tabla:**
1. **Proyecto / Dirección** (40% del ancho)
2. **Responsable**
3. **Estatus** (badge con color)
4. **Avance** (barra de progreso)
5. **Presupuesto** (alineado a la derecha)

#### Cuerpo de la Tabla

```tsx
<TableBody>
	{filteredProjects.map((project) => {
		const statusColor = STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] || APP_COLORS.neutral;
		return (
			<Dialog key={project.id}>
				<DialogTrigger asChild>
					<TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
						{/* Celdas de datos */}
					</TableRow>
				</DialogTrigger>
				<ProjectDetail project={project} />
			</Dialog>
		);
	})}
</TableBody>
```

**Patrón Dialog + DialogTrigger:**
- Cada fila (`<TableRow>`) es un botón que abre un modal
- Al hacer clic → `<ProjectDetail>` se muestra con los detalles completos del proyecto

**statusColor:** Obtiene el color del tema según el estatus (verde, amarillo, rojo, etc.)

#### Celda 1: Proyecto / Dirección

```tsx
<TableCell className="pl-6 py-4">
	<div className="flex flex-col gap-1">
		<span className="font-semibold text-foreground line-clamp-2 leading-tight">
			{project.nombre}
		</span>
		<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
			<MapPin className="h-3 w-3" />
			{project.direccion}
		</div>
	</div>
</TableCell>
```

**line-clamp-2:** Máximo 2 líneas de texto, después muestra "..." (truncamiento)

#### Celda 2: Responsable

```tsx
<TableCell>
	<div className="flex items-center gap-2 text-sm text-foreground">
		<div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
			{project.responsable ? project.responsable.substring(0,2).toUpperCase() : 'NA'}
		</div>
		<span className="truncate max-w-[120px]" title={project.responsable}>
			{project.responsable || 'Sin asignar'}
		</span>
	</div>
</TableCell>
```

**Avatar con iniciales:**
- Toma las primeras 2 letras del nombre: `"Juan Pérez"` → `"JP"`
- Si no hay responsable → muestra `"NA"`

**truncate + max-w-[120px]:** Si el nombre es muy largo, se corta con "..."

#### Celda 3: Estatus

```tsx
<TableCell>
	<Badge 
		variant="outline" 
		className="capitalize text-[10px] font-bold tracking-wider" 
		style={{ 
			color: statusColor, 
			borderColor: statusColor, 
			backgroundColor: `${statusColor}10` 
		}}
	>
		{getStatusLabel(project.status)}
	</Badge>
</TableCell>
```

**Estilo dinámico:**
- Color del texto: `statusColor` (ej: verde para "Completado")
- Borde: mismo color
- Fondo: color al 10% de opacidad (`#00ff0010`)

#### Celda 4: Avance

```tsx
<TableCell>
	<div className="w-[100px] space-y-1">
		<span className="text-xs font-bold">{project.avance.toFixed(1)}%</span>
		<Progress value={project.avance} className="h-1.5" indicatorColor={statusColor} />
	</div>
</TableCell>
```

**Elementos:**
1. Texto: "45.0%"
2. Barra de progreso con color dinámico

#### Celda 5: Presupuesto

```tsx
<TableCell className="text-right pr-6 font-mono text-sm font-medium">
	{formatMoney(project.presupuesto)}
</TableCell>
```

**font-mono:** Fuente monoespaciada (números alineados)

**text-right:** Alineado a la derecha (convención para números)

---

## 🔍 SECCIÓN 13: Estado Vacío (Sin Resultados)

```tsx
) : (
	<div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl animate-in fade-in zoom-in-95">
		<div className="bg-muted p-4 rounded-full mb-3">
			<Search className="h-8 w-8 text-muted-foreground" />
		</div>
		<h3 className="font-semibold text-lg text-foreground">No se encontraron proyectos</h3>
		<p className="text-muted-foreground max-w-sm mt-1">
			Intenta ajustar los filtros de área, estatus o el término de búsqueda.
		</p>
		<Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
			Limpiar filtros
		</Button>
	</div>
)}
```

**Cuándo se muestra:**
- Si `filteredProjects.length === 0` (no hay resultados)

**Elementos:**
1. **Icono de lupa** en círculo gris
2. **Título:** "No se encontraron proyectos"
3. **Descripción:** Sugerencia para ajustar filtros
4. **Botón "Limpiar filtros":** Llama a `clearFilters()`

**border-2 border-dashed:** Borde punteado (estilo "empty state")

---

## 🎯 Flujo de Datos Completo

```
Usuario escribe "parque" en el buscador
         ↓
setSearchTerm("parque")
         ↓
filters se recalcula (useMemo detecta cambio)
         ↓
useFilteredProjects(filters) detecta cambio
         ↓
Backend recibe: GET /api/v2/obras/filtered/?search=parque
         ↓
Django filtra en PostgreSQL: WHERE programa ILIKE '%parque%'
         ↓
Backend devuelve: { results: [12 proyectos], count: 12 }
         ↓
data.results se actualiza en el frontend
         ↓
filteredProjects = data.results (12 proyectos)
         ↓
Vista se re-renderiza mostrando solo esos 12 proyectos
```

---

## 📱 Responsive Behavior

### Móvil (< 768px)
- **Filtros:** Panel sheet desde abajo
- **Grid:** 1 columna
- **Tabla:** Scroll horizontal
- **Header:** Layout vertical (título encima de botones)

### Tablet (768px - 1280px)
- **Filtros:** Dropdowns visibles en barra
- **Grid:** 2 columnas
- **Tabla:** Sin scroll
- **Header:** Layout horizontal

### Desktop (> 1280px)
- **Filtros:** Dropdowns visibles en barra
- **Grid:** 3 columnas
- **Tabla:** Sin scroll
- **Header:** Layout horizontal

---

## 🔥 Optimizaciones Clave

1. **useMemo para filters:** Evita re-fetches innecesarios
2. **useMemo para uniqueAreas/Statuses:** Evita recalcular opciones en cada render
3. **Filtrado serverside:** El backend hace el trabajo pesado (PostgreSQL es más rápido que JavaScript)
4. **page_size: 'todos':** Sin paginación (ideal para vista completa)
5. **Componente FilterControls:** Reutilizable entre desktop y móvil
6. **Estados de carga/error:** Feedback claro para el usuario

---

## 🎨 Paleta de Estados

| Estado | Color | Variable |
|--------|-------|----------|
| Planificado | Gris | `neutral` |
| En Ejecución | Azul | `info` |
| Completado | Verde | `success` |
| En Riesgo | Naranja | `warning` |
| Retrasado | Rojo | `danger` |

---

## 🚀 Próximas Mejoras Posibles

1. **Paginación:** Para datasets > 1000 proyectos
2. **Filtros avanzados:** Por rango de presupuesto, fecha, etc.
3. **Ordenamiento:** Clickable headers en la tabla
4. **Exportación:** Botón para descargar Excel/PDF
5. **Vista de mapa:** Mostrar proyectos en mapa geográfico
6. **Favoritos:** Marcar proyectos importantes
7. **Comparación:** Seleccionar múltiples proyectos para comparar

---

**Fecha de Análisis:** 28 de enero de 2026  
**Analista:** GitHub Copilot (Claude Sonnet 4.5)  
**Estado del Componente:** ✅ Migrado a Backend (Sprint 3)
