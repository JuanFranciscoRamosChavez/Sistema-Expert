# ⚡ Comandos Rápidos - Sprint 1

## 🔥 Quick Start (Copiar y Pegar)

### 1️⃣ Validar Backend (desde carpeta raíz del proyecto)

```powershell
# Activar entorno virtual y validar
cd backend
.\venv\Scripts\Activate.ps1
python validate_sprint1.py
```

**Resultado esperado:**
```
✅ VALIDACIÓN EXITOSA - Sprint 1 implementado correctamente
```

---

### 2️⃣ Probar Endpoints Manualmente

#### Endpoint V1 (Python iteration)
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v2/dashboard/territorial/" | ConvertTo-Json -Depth 5
```

#### Endpoint V2 (SQL optimizado)
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v2/dashboard/territorial/?version=v2" | ConvertTo-Json -Depth 5
```

---

### 3️⃣ Habilitar V2 en Frontend

```powershell
# Crear archivo .env si no existe
if (-not (Test-Path ".env.development")) {
    Copy-Item ".env.example" ".env.development"
}

# Habilitar V2
(Get-Content ".env.development") -replace "VITE_USE_TERRITORIAL_V2=false", "VITE_USE_TERRITORIAL_V2=true" | Set-Content ".env.development"

# Reiniciar Vite (primero detener con Ctrl+C, luego:)
npm run dev
```

---

### 4️⃣ Ver Logs en Tiempo Real

#### Backend Django
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

#### Frontend Vite
```powershell
npm run dev
```

---

## 🧪 Testing One-Liner

### Validación completa en un solo comando
```powershell
cd backend; .\venv\Scripts\Activate.ps1; python validate_sprint1.py; cd ..
```

---

## 🔍 Debugging

### Ver respuesta completa del endpoint V2
```powershell
$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v2/dashboard/territorial/?version=v2"
$json = $response.Content | ConvertFrom-Json
Write-Host "Version: $($json._meta.version)"
Write-Host "Total Proyectos: $($json._meta.total_projects)"
Write-Host "Zonas: $($json.pie_chart_data.Count)"
```

### Comparar tiempos de respuesta V1 vs V2
```powershell
# V1
Measure-Command { Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v2/dashboard/territorial/" }

# V2
Measure-Command { Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v2/dashboard/territorial/?version=v2" }
```

---

## 📊 Ver JSONs de Salida

```powershell
# Abrir samples generados por el script de validación
code backend/test_outputs/v1_sample.json
code backend/test_outputs/v2_sample.json
```

---

## 🔄 Cambiar entre V1 y V2 en Frontend

### Habilitar V1
```powershell
(Get-Content ".env.development") -replace "VITE_USE_TERRITORIAL_V2=true", "VITE_USE_TERRITORIAL_V2=false" | Set-Content ".env.development"
```

### Habilitar V2
```powershell
(Get-Content ".env.development") -replace "VITE_USE_TERRITORIAL_V2=false", "VITE_USE_TERRITORIAL_V2=true" | Set-Content ".env.development"
```

**Importante:** Reiniciar Vite después de cambiar el `.env`

---

## 🐛 Troubleshooting One-Liners

### Backend no responde
```powershell
# Verificar puerto 8000
netstat -ano | findstr :8000
# Si aparece algo, matar el proceso:
# taskkill /PID <número_del_PID> /F
```

### Frontend no compila
```powershell
# Limpiar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Django no encuentra módulos
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## 📦 Exportar Resultados para Análisis

```powershell
# Ejecutar validación y guardar output
cd backend
.\venv\Scripts\Activate.ps1
python validate_sprint1.py > test_results.txt 2>&1
notepad test_results.txt
```

---

## 🎨 Ver Estructura de Proyecto

```powershell
# Ver archivos modificados en Sprint 1
tree /F backend\poa | findstr "services.py views.py tests_performance.py validate_sprint1.py"
tree /F src | findstr "api.ts index.ts useDashboardData.ts"
```

---

## 🚀 Deploy a Producción (Cuando esté listo)

```powershell
# Frontend: Build optimizado
npm run build

# Backend: Colectar estáticos
cd backend
.\venv\Scripts\Activate.ps1
python manage.py collectstatic --noinput

# Habilitar V2 en producción (editar .env.production)
VITE_USE_TERRITORIAL_V2=true
```

---

## 📝 Notas Rápidas

- **Port Backend:** `8000`
- **Port Frontend:** `5173`
- **Endpoint Base:** `http://127.0.0.1:8000/api/`
- **V2 Query Param:** `?version=v2`

---

**¿Dudas?** Revisar `TESTING_MANUAL_SPRINT1.md` o `SPRINT_1_TERRITORIAL.md`
