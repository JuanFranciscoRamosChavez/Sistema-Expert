import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
	SheetClose
} from "@/components/ui/sheet";

// --- TIPOS ---

export interface FilterOption {
	label: string;
	value: string;
}

export interface FilterConfig {
	key: string;
	label: string;        // Placeholder del select (ej: "Todas las áreas")
	title?: string;       // Título para la vista móvil (ej: "Área Responsable")
	value: string;        // Valor actual
	onChange: (value: string) => void;
	options: FilterOption[];
	disabled?: boolean;
}

interface FilterBarProps {
	// Búsqueda
	onSearchChange?: (term: string) => void;
	searchTerm?: string;
	searchPlaceholder?: string;

	// Configuración de Filtros
	filters: FilterConfig[];
	
	// Acciones de limpieza
	onClearFilters?: () => void;
	
	// Contenido adicional (ej: Toggles de vista, botones de exportar)
	extraActions?: React.ReactNode;
	
	// Clase contenedora opcional
	className?: string;
}

export function FilterBar({
	onSearchChange,
	searchTerm = '',
	searchPlaceholder = "Buscar...",
	filters,
	onClearFilters,
	extraActions,
	className
}: FilterBarProps) {
	
	// Detectar si hay filtros activos (excluyendo 'all' o vacíos)
	const activeFiltersCount = filters.filter(f => f.value !== 'all' && f.value !== '').length;
	const hasSearch = searchTerm.trim() !== '';
	const hasActiveFilters = activeFiltersCount > 0 || hasSearch;

	// --- RENDERIZADO DE UN SELECT INDIVIDUAL ---
	const renderSelect = (filter: FilterConfig, isMobile = false) => (
		<div key={filter.key} className={isMobile ? "space-y-2" : "w-full md:w-[200px] lg:w-[240px]"}>
			{isMobile && filter.title && (
				<span className="text-sm font-medium text-foreground">{filter.title}</span>
			)}
			<Select value={filter.value} onValueChange={filter.onChange} disabled={filter.disabled}>
				<SelectTrigger className="bg-background/60 w-full">
					{!isMobile && <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />}
					<SelectValue placeholder={filter.label} />
				</SelectTrigger>
				<SelectContent className="max-h-[300px]">
					<SelectItem value="all">{filter.label}</SelectItem>
					{filter.options.map((opt) => (
						<SelectItem key={`${filter.key}-${opt.value}`} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);

	return (
		<div className={`flex flex-col gap-4 ${className}`}>
			{/* BARRA PRINCIPAL */}
			<div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-card p-3 rounded-xl border border-border shadow-sm">
				
				{/* 1. BUSCADOR (Si se provee la función) */}
				{onSearchChange && (
					<div className="relative flex-1">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input 
							placeholder={searchPlaceholder}
							className="pl-9 bg-muted/30 border-transparent focus:bg-background transition-colors"
							value={searchTerm}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
						{searchTerm && (
							<button 
								onClick={() => onSearchChange('')} 
								className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
				)}

				{/* 2. FILTROS DESKTOP */}
				<div className="hidden md:flex gap-3 items-center">
					{/* Separador si hay búsqueda y filtros */}
					{onSearchChange && filters.length > 0 && (
						<div className="w-[1px] h-8 bg-border mx-1" />
					)}
					
					{filters.map(filter => renderSelect(filter))}
					
					{/* Botón de Limpiar Desktop */}
					{hasActiveFilters && onClearFilters && (
						<Button 
							variant="ghost" 
							size="sm" 
							onClick={onClearFilters}
							className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
						>
							Limpiar
							<X className="ml-2 h-3 w-3" />
						</Button>
					)}
				</div>

				{/* 3. ACCIONES EXTRA (Siempre visibles, ej: Toggle Grid/List) */}
				{extraActions && (
					<div className="flex items-center gap-2 border-l border-border pl-2 ml-1">
						{extraActions}
					</div>
				)}

				{/* 4. FILTROS MOBILE (Sheet) */}
				<div className="md:hidden flex gap-2">
					{filters.length > 0 && (
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="outline" size="icon" className={activeFiltersCount > 0 ? "border-primary text-primary bg-primary/5 relative" : ""}>
									<SlidersHorizontal className="h-4 w-4" />
									{activeFiltersCount > 0 && (
										<span className="absolute -top-1 -right-1 flex h-3 w-3">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
											<span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
										</span>
									)}
								</Button>
							</SheetTrigger>
							<SheetContent side="bottom" className="rounded-t-[20px] max-h-[85vh] overflow-y-auto">
								<SheetHeader className="mb-4 text-left">
									<SheetTitle>Filtros Avanzados</SheetTitle>
									<SheetDescription>
										Refina los resultados mostrados.
									</SheetDescription>
								</SheetHeader>
								
								<div className="flex flex-col gap-4 py-4">
									{filters.map(filter => renderSelect(filter, true))}
								</div>

								<SheetFooter className="flex-row gap-3 pt-4 border-t border-border mt-2">
									{onClearFilters && (
										<Button 
											variant="outline" 
											className="flex-1"
											onClick={() => {
												onClearFilters();
												// Opcional: Cerrar sheet programáticamente si se desea
											}}
										>
											Limpiar Todo
										</Button>
									)}
									<SheetClose asChild>
										<Button className="flex-1">Ver Resultados</Button>
									</SheetClose>
								</SheetFooter>
							</SheetContent>
						</Sheet>
					)}
				</div>
			</div>

			{/* Indicador de filtros activos (Mobile Only - opcional para mejor UX) */}
			{hasActiveFilters && (
				<div className="md:hidden flex flex-wrap gap-2">
					{activeFiltersCount > 0 && (
						<Badge variant="secondary" className="text-xs">
							{activeFiltersCount} filtros activos
						</Badge>
					)}
				</div>
			)}
		</div>
	);
}