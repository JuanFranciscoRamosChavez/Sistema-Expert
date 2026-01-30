# Guía de Uso de Colores desde theme.ts

## Objetivo
Todos los componentes deben usar las constantes de color definidas en `src/lib/theme.ts` para mantener consistencia y facilitar el mantenimiento.

## Constantes Disponibles

### 1. **URGENCY_STYLES** - Para indicadores de urgencia
```typescript
import { URGENCY_STYLES } from '@/lib/theme';

// Uso en componentes:
<div className={cn(
  "border",
  urgency === 'high' && URGENCY_STYLES.high.border + " " + URGENCY_STYLES.high.bg,
  urgency === 'medium' && URGENCY_STYLES.medium.border + " " + URGENCY_STYLES.medium.bg,
  urgency === 'low' && URGENCY_STYLES.low.bg
)}>
```

### 2. **MULTIANUAL_STYLES** - Para badges de multianualidad
```typescript
import { MULTIANUAL_STYLES } from '@/lib/theme';

<Badge className={cn(
  MULTIANUAL_STYLES.border,
  MULTIANUAL_STYLES.text,
  MULTIANUAL_STYLES.bg
)}>
  Multianual
</Badge>
```

### 3. **BUDGET_STYLES** - Para secciones de presupuesto
```typescript
import { BUDGET_STYLES } from '@/lib/theme';

<div className={cn(BUDGET_STYLES.bg, BUDGET_STYLES.border, "border p-4")}>
  <h4 className={BUDGET_STYLES.text}>Presupuesto</h4>
  <p className={BUDGET_STYLES.textMuted}>Total</p>
</div>
```

### 4. **TIMELINE_STATUS_STYLES** - Para estados en líneas de tiempo
```typescript
import { TIMELINE_STATUS_STYLES } from '@/lib/theme';

const statusStyle = TIMELINE_STATUS_STYLES[status] || TIMELINE_STATUS_STYLES.planificado;

// Para Gantt/Timeline (desktop):
<div className={statusStyle.bg}></div>

// Para cards móviles:
<div className={statusStyle.bgCard}>
  <Badge className={statusStyle.text}>Estado</Badge>
</div>
```

### 5. **getScoreStyles()** - Para puntuaciones/prioridades
```typescript
import { getScoreStyles } from '@/lib/theme';

const score = project.puntuacion_final_ponderada || 0;
const scoreStyles = getScoreStyles(score);

<Badge className={cn(
  "border-2",
  scoreStyles.border,
  scoreStyles.text
)}>
  {score.toFixed(1)}
</Badge>
```

### 6. **STATUS_COLORS** - Para gráficas (Recharts)
```typescript
import { STATUS_COLORS } from '@/lib/theme';

<Bar dataKey="completado" fill={STATUS_COLORS.completado} />
<Bar dataKey="en_ejecucion" fill={STATUS_COLORS.en_ejecucion} />
```

### 7. **ZONE_PALETTE** - Para mapas territoriales
```typescript
import { ZONE_PALETTE } from '@/lib/theme';

const color = ZONE_PALETTE[zone] || ZONE_PALETTE.sin_asignar;
```

## ❌ NO HACER (colores hardcodeados)
```typescript
// ❌ MAL - colores hardcodeados
<div className="bg-blue-50 border-blue-200 text-blue-700">
<Badge className="border-purple-500 text-purple-700">
const color = score >= 4.5 ? 'bg-red-500' : 'bg-yellow-500';
```

## ✅ HACER (usar constantes de theme)
```typescript
// ✅ BIEN - usar constantes
<div className={cn(BUDGET_STYLES.bg, BUDGET_STYLES.border, BUDGET_STYLES.text)}>
<Badge className={cn(MULTIANUAL_STYLES.border, MULTIANUAL_STYLES.text)}>
const scoreStyles = getScoreStyles(score);
const statusStyle = TIMELINE_STATUS_STYLES[status];
```

## Componentes Ya Actualizados
- ✅ `TimelineView.tsx` - Completamente migrado (urgencias, multianualidad, presupuesto, timeline, hitos, modal, iconos)
- ✅ `TerritoryView.tsx` - Completamente migrado (callouts de información con BUDGET_STYLES)
- ✅ `RisksView.tsx` - Completamente migrado (categorías de riesgo, semáforos, acciones de mitigación)
- ⏳ `DashboardView.tsx` - Usa STATUS_COLORS para gráficas (ya migrado parcialmente)
- ⏳ `ProjectsView.tsx` - Pendiente
- ⏳ `ProjectDetail.tsx` - Pendiente
- ⏳ `ReportsView.tsx` - Pendiente
- ⏳ `TransparencyView.tsx` - Pendiente

## Para Migrar Otros Componentes

1. Buscar colores hardcodeados:
   ```bash
   grep -r "bg-blue-\|bg-red-\|bg-yellow-\|bg-purple-\|text-blue-\|text-red-\|border-blue-" src/components/
   ```

2. Importar las constantes necesarias:
   ```typescript
   import { URGENCY_STYLES, MULTIANUAL_STYLES, BUDGET_STYLES, etc } from '@/lib/theme';
   ```

3. Reemplazar colores hardcodeados con constantes

4. Usar `cn()` de `@/lib/utils` para combinar clases

## Beneficios
- 🎨 Consistencia visual en toda la app
- 🔧 Fácil mantenimiento (cambiar colores en un solo lugar)
- 🌓 Soporte para tema oscuro incluido
- 📊 Compatible con librerías de gráficas (Recharts)
- ♿ Mejor accesibilidad con contraste correcto
