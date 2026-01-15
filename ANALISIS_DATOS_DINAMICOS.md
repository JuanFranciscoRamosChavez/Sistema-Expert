# Análisis: Datos Estáticos vs Dinámicos

## 📋 Resumen Ejecutivo

Este documento identifica todas las secciones del código que actualmente usan datos estáticos/hardcodeados y propone qué campos del modelo `Obra` deberían usarse para hacerlas dinámicas.

---

## 🔍 Secciones Identificadas con Datos Estáticos

### 1. **DashboardView.tsx** - Tarjetas KPI

#### Datos Estáticos Encontrados:
- **Línea 87**: `trend={{ value: 12, label: "vs mes anterior" }}` - Valor hardcodeado
- **Línea 95**: `trend={{ value: 5, label: "nuevas zonas" }}` - Valor hardcodeado

#### Campos del Modelo Obra Recomendados:
- **Para "vs mes anterior"**: Comparar `ultima_actualizacion` (col 54) con fecha actual
- **Para "nuevas zonas"**: Contar `alcaldias` (col 34) únicas o `alcance_territorial` (col 16)

---

### 2. **RecentActivity.tsx** - Actividad Reciente

#### Datos Estáticos Encontrados:
- Todo el componente tiene datos hardcodeados:
  ```javascript
  const activities = [
    { id: 1, text: "Actualización masiva de avances", time: "Hace 2 horas" },
    { id: 2, text: "Sincronización con POA 2026", time: "Hace 5 horas" },
    { id: 3, text: "Reporte mensual generado", time: "Ayer" },
  ];
  ```

#### Campos del Modelo Obra Recomendados:
- **`ultima_actualizacion`** (col 54): Fecha de última actualización del proyecto
- **`control_notas`** (col 66): Notas de control que podrían ser actividades
- **`acciones_correctivas`** (col 53): Acciones recientes tomadas

#### Propuesta:
Crear un endpoint o calcular actividades basadas en:
- Proyectos actualizados recientemente (`ultima_actualizacion`)
- Cambios en `avance_fisico_pct` o `avance_financiero_pct`
- Nuevas `acciones_correctivas` registradas

---

### 3. **RisksView.tsx** - Vista de Riesgos

#### Datos Estáticos Encontrados:
- Usa `mockProjects` en lugar de datos reales
- Líneas: 9, 13, 20, 26, 32, 38

#### Campos del Modelo Obra Recomendados:
- **`problemas_identificados`** (col 52): Ya mapeado en api.ts
- **`riesgo_nivel`** (col 26): Ya disponible
- **`viabilidad_*_semaforo`** (cols 29-33): Ya disponibles
- **`acciones_correctivas`** (col 53): Para mostrar acciones tomadas

#### Estado Actual:
✅ Ya está parcialmente implementado en `api.ts` pero `RisksView.tsx` no usa `fetchProjects()`

---

### 4. **TerritoryView.tsx** - Vista Territorial

#### Datos Estáticos Encontrados:
- Usa `mockProjects` y `zonas` hardcodeadas
- Líneas: 1, 18, 30, 35

#### Campos del Modelo Obra Recomendados:
- **`alcaldias`** (col 34): Texto con alcaldías
- **`ubicacion_especifica`** (col 35): Ya mapeado
- **`alcance_territorial`** (col 16): Alcance del proyecto

#### Propuesta:
- Extraer zonas/alcaldías únicas de `alcaldias` o `alcance_territorial`
- Agrupar proyectos por alcaldía/territorio dinámicamente

---

### 5. **TransparencyView.tsx** - Vista de Transparencia

#### Datos Estáticos Encontrados:
- Usa `mockProjects` completamente
- Líneas: 1, 13-16, 18, 176

#### Campos del Modelo Obra Recomendados:
- Todos los campos financieros ya disponibles:
  - `presupuesto_modificado` / `anteproyecto_total` (cols 7-8)
  - `avance_financiero_pct` (col 44)
  - `fuente_financiamiento` (col 17)
- **`area_responsable`** (col 2): Para agrupar por dirección

#### Estado Actual:
✅ Los datos están disponibles, solo necesita usar `fetchProjects()` en lugar de `mockProjects`

---

### 6. **TimelineView.tsx** - Vista de Línea de Tiempo

#### Datos Estáticos Encontrados:
- Usa `mockProjects`
- Línea: 1, 14

#### Campos del Modelo Obra Recomendados:
- **`fecha_inicio_prog`** (col 38): Ya mapeado
- **`fecha_termino_prog`** (col 39): Ya mapeado
- **`fecha_inicio_real`** (col 41): Fecha real de inicio
- **`fecha_termino_real`** (col 42): Fecha real de término
- **`ultima_actualizacion`** (col 54): Para eventos recientes

#### Estado Actual:
✅ Fechas ya están mapeadas en `api.ts`, solo necesita usar datos reales

---

### 7. **ReportsView.tsx** - Vista de Reportes

#### Datos Estáticos Encontrados:
- Usa `mockProjects` y `direcciones` hardcodeadas
- Líneas: 1, 119, 142, 146, 150

#### Campos del Modelo Obra Recomendados:
- **`area_responsable`** (col 2): Para lista dinámica de direcciones
- Todos los campos financieros y de avance ya disponibles

#### Propuesta:
- Extraer `area_responsable` únicas de la BD para generar lista dinámica
- Usar `fetchProjects()` en lugar de `mockProjects`

---

### 8. **ProjectsView.tsx** - Vista de Proyectos

#### Datos Estáticos Encontrados:
- Usa `direcciones` hardcodeadas para filtro
- Línea: 2, 142

#### Campos del Modelo Obra Recomendados:
- **`area_responsable`** (col 2): Ya mapeado como `direccion` en api.ts

#### Propuesta:
- Extraer valores únicos de `area_responsable` de los proyectos cargados
- Generar lista de filtros dinámicamente

---

## 📊 Mapeo de Campos del Modelo Obra

### Campos Ya Mapeados en `api.ts`:
✅ `programa` → `nombre`
✅ `area_responsable` → `direccion`
✅ `responsable_operativo` → `responsable`
✅ `ubicacion_especifica` → `ubicacion`
✅ `presupuesto_modificado` / `anteproyecto_total` → `presupuesto`
✅ `avance_fisico_pct` → `avance`
✅ `fecha_inicio_prog` → `fechaInicio`
✅ `fecha_termino_prog` → `fechaFin`
✅ `poblacion_objetivo_num` → `beneficiarios`
✅ `solucion_ofrece` / `beneficio_ciudadania` → `objetivos`
✅ `problemas_identificados` → `riesgos`
✅ `viabilidad_*_semaforo` → `viabilidades`

### Campos NO Mapeados que Podrían Ser Útiles:

#### Para Actividad Reciente:
- `ultima_actualizacion` (col 54)
- `control_notas` (col 66)
- `acciones_correctivas` (col 53)

#### Para Territorio/Zonas:
- `alcaldias` (col 34)
- `alcance_territorial` (col 16)

#### Para Fechas Reales:
- `fecha_inicio_real` (col 41)
- `fecha_termino_real` (col 42)

#### Para Información Adicional:
- `tipo_obra` (col 15)
- `fuente_financiamiento` (col 17)
- `etapa_desarrollo` (col 18)
- `estatus_general` (col 45)
- `contratista` (col 50)
- `duracion_meses` (col 40)

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Reemplazar mockProjects
1. ✅ `DashboardView.tsx` - Ya usa `fetchProjects()`
2. ❌ `RisksView.tsx` - Cambiar a `fetchProjects()`
3. ❌ `TransparencyView.tsx` - Cambiar a `fetchProjects()`
4. ❌ `TimelineView.tsx` - Cambiar a `fetchProjects()`
5. ❌ `ReportsView.tsx` - Cambiar a `fetchProjects()`

### Fase 2: Generar Listas Dinámicas
1. Extraer `area_responsable` únicas para filtros
2. Extraer `alcaldias` / zonas únicas para territorio
3. Calcular tendencias basadas en `ultima_actualizacion`

### Fase 3: Actividad Reciente
1. Crear endpoint o lógica para calcular actividades
2. Basarse en `ultima_actualizacion` y cambios recientes

---

## 📝 Notas Importantes

1. **Mantener compatibilidad**: Los componentes que usan `mockProjects` deben poder funcionar con datos reales sin cambios mayores
2. **Manejo de nulls**: Muchos campos pueden ser null, asegurar validaciones
3. **Performance**: Si hay muchos proyectos, considerar paginación o agregaciones en el backend
4. **Caché**: Considerar caché para listas estáticas como direcciones/zonas que no cambian frecuentemente
