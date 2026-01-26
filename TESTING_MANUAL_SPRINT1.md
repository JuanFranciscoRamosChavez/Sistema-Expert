# 🧪 Guía de Testing Manual - Sprint 1

## Pre-requisitos

✅ Backend Django corriendo en `http://127.0.0.1:8000`  
✅ Base de datos con proyectos cargados  
✅ Frontend Vite corriendo en `http://localhost:5173`

---

## 🔧 Paso 1: Validar Backend

### 1.1 Ejecutar script de validación automática

```bash
cd backend
python validate_sprint1.py
```

**Resultado esperado:**
```
✅ VALIDACIÓN EXITOSA - Sprint 1 implementado correctamente
```

### 1.2 Probar endpoint V1 manualmente

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v2/dashboard/territorial/" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**Validar:**
- ✅ Status: 200 OK
- ✅ Contiene: `pie_chart_data` (array)
- ✅ Contiene: `bar_chart_data` (array)
- ✅ Contiene: `_meta.version` = `"v1"`

### 1.3 Probar endpoint V2 manualmente

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v2/dashboard/territorial/?version=v2" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**Validar:**
- ✅ Status: 200 OK
- ✅ `_meta.version` = `"v2"`
- ✅ Tiempo de respuesta ≤ 200ms (ver headers)

---

## 🎨 Paso 2: Validar Frontend

### 2.1 Configurar Feature Flag para V1 (legacy)

**Editar:** `.env.development`
```env
VITE_USE_TERRITORIAL_V2=false
```

**Reiniciar Vite:**
```bash
# Ctrl+C para detener, luego:
npm run dev
```

### 2.2 Probar Dashboard con V1

1. Abrir: `http://localhost:5173`
2. Ir al Dashboard principal
3. **Abrir DevTools → Console**

**Validar:**
```
📊 Territorial API: v1 | Proyectos: XXX
```

4. **Abrir DevTools → Network → Filtrar: "territorial"**
   - ✅ Request URL: `http://127.0.0.1:8000/api/v2/dashboard/territorial/`
   - ✅ Status: 200
   - ✅ Response contiene `_meta.version: "v1"`

5. **Verificar Gráficas Territoriales**
   - ✅ Gráfica de pastel (pie chart) se renderiza
   - ✅ Gráfica de barras se renderiza
   - ✅ Datos coinciden con los del backend

---

### 2.3 Configurar Feature Flag para V2 (optimizado)

**Editar:** `.env.development`
```env
VITE_USE_TERRITORIAL_V2=true
```

**Reiniciar Vite:**
```bash
npm run dev
```

### 2.4 Probar Dashboard con V2

1. Abrir: `http://localhost:5173`
2. Ir al Dashboard principal
3. **Abrir DevTools → Console**

**Validar:**
```
📊 Territorial API: v2 | Proyectos: XXX
```

4. **Abrir DevTools → Network → Filtrar: "territorial"**
   - ✅ Request URL: `http://127.0.0.1:8000/api/v2/dashboard/territorial/?version=v2`
   - ✅ Status: 200
   - ✅ Response contiene `_meta.version: "v2"`
   - ✅ Tiempo ≤ 150ms (ver Timeline en Network)

5. **Verificar Gráficas Territoriales**
   - ✅ Gráficas idénticas a V1 (mismos datos, mismo layout)
   - ✅ Sin errores en consola
   - ✅ Carga más rápida (perceptible con >500 proyectos)

---

## 📊 Paso 3: Testing de Performance (Opcional)

### 3.1 Simular latencia de red lenta

**DevTools → Network → Throttling:**
- Seleccionar: "Slow 3G"

**Comparar:**
1. Con V1: Recargar página, medir tiempo de carga
2. Con V2: Recargar página, medir tiempo de carga

**Resultado esperado:**
- V2 debe cargar significativamente más rápido debido al payload reducido

### 3.2 Inspeccionar tamaño de respuesta

**DevTools → Network → Territorial request → Headers:**

**V1:**
- Content-Length: ~500KB (proyectos completos)

**V2:**
- Content-Length: ~1-5KB (solo datos agregados)

---

## 🐛 Troubleshooting

### Problema: Console muestra "v1" cuando debería ser "v2"

**Solución:**
1. Verificar que `.env.development` tiene `VITE_USE_TERRITORIAL_V2=true`
2. Reiniciar servidor Vite (Ctrl+C → `npm run dev`)
3. Hard refresh del navegador (Ctrl+Shift+R)

### Problema: Gráficas no se renderizan

**Solución:**
1. Verificar que backend está corriendo
2. Revisar Console → buscar errores de fetch
3. Validar CORS en Django settings:
   ```python
   CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
   ```

### Problema: Datos inconsistentes entre V1 y V2

**Solución:**
1. Ejecutar: `python backend/validate_sprint1.py`
2. Revisar archivos generados en `backend/test_outputs/`
3. Comparar JSON de ambas versiones

---

## ✅ Checklist Final

Antes de considerar Sprint 1 completado:

- [ ] Backend V1 responde correctamente
- [ ] Backend V2 responde correctamente y más rápido
- [ ] Frontend con V1 muestra datos
- [ ] Frontend con V2 muestra mismos datos
- [ ] Console log indica versión correcta
- [ ] Network requests usan query parameter correcto
- [ ] No hay errores en Console ni en Terminal de Django
- [ ] Script `validate_sprint1.py` pasa todas las validaciones

---

## 📸 Screenshots Esperados

### Dashboard con Datos Territoriales
- Gráfica de Pastel (Pie Chart) mostrando presupuesto por zona
- Gráfica de Barras mostrando proyectos y beneficiarios por zona

### DevTools Console
```
📊 Territorial API: v2 | Proyectos: 1543
```

### DevTools Network
```
Request URL: http://127.0.0.1:8000/api/v2/dashboard/territorial/?version=v2
Status: 200 OK
Time: 127ms
```

---

**Fecha:** 24 de enero de 2026  
**Sprint:** 1/4  
**Estado:** ✅ Listo para testing
