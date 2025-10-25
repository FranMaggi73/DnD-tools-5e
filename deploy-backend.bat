@echo off
setlocal enabledelayedexpansion

REM ==================================================
REM Deploy backend a Cloud Run - OPTIMIZADO
REM ==================================================
cd /d "%~dp0"

REM ---------- CONFIG ----------
set "PROJECT_ID=dnd5etools-73"
set "SERVICE_NAME=dm-events-backend"
set "REGION=us-central1"
set "GCLOUD_FALLBACK=C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
REM ----------------------------

echo ========================================
echo  DEPLOY BACKEND - OPTIMIZADO
echo ========================================
echo.

REM 1) Detectar gcloud
set "GCLOUD="
for /f "delims=" %%G in ('where gcloud 2^>nul ^| findstr /I /R "gcloud.cmd gcloud.exe"') do (
  set "GCLOUD=%%G"
  goto :gcloud_found
)
if not defined GCLOUD (
  if exist "%GCLOUD_FALLBACK%" (
    set "GCLOUD=%GCLOUD_FALLBACK%"
  ) else (
    echo [ERROR] gcloud no encontrado
    pause
    exit /b 1
  )
)
:gcloud_found
echo [OK] gcloud encontrado
echo.

REM 2) Verificar proyecto
set "CURRENT_PROJECT="
for /f "delims=" %%p in ('cmd /c ""!GCLOUD!" config get-value project --quiet 2^>nul"') do (
  set "CURRENT_PROJECT=%%p"
)
if /i not "!CURRENT_PROJECT!"=="%PROJECT_ID%" (
  echo [ERROR] Proyecto incorrecto: !CURRENT_PROJECT!
  echo Ejecuta: "!GCLOUD!" config set project %PROJECT_ID%
  pause
  exit /b 1
)
echo [OK] Proyecto: %PROJECT_ID%
echo.

REM 3) Verificar archivos críticos
echo Verificando archivos...
if not exist "backend\cmd\api\serviceAccountKey.json" (
  echo [ERROR] serviceAccountKey.json no encontrado
  pause
  exit /b 1
)
if not exist "Dockerfile" (
  echo [ERROR] Dockerfile no encontrado
  pause
  exit /b 1
)
echo [OK] Archivos verificados
echo.

REM 4) Limpiar builds anteriores
echo Limpiando builds anteriores...
if exist "backend\cmd\api\server" del /q "backend\cmd\api\server" 2>nul
if exist "backend\cmd\api\server.exe" del /q "backend\cmd\api\server.exe" 2>nul
echo [OK] Limpieza completada
echo.

REM 5) Build & Deploy OPTIMIZADO
echo ========================================
echo  INICIANDO DEPLOY...
echo ========================================
echo.
echo Esto puede tardar 2-3 minutos...
echo.

REM Usar --quiet para reducir output
"!GCLOUD!" run deploy %SERVICE_NAME% --source . --platform managed --region %REGION% --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --timeout 300 --max-instances 10 --min-instances 0 --set-env-vars ENV=production,GIN_MODE=release --quiet

if errorlevel 1 (
  echo.
  echo [ERROR] Deploy falló
  echo.
  echo Posibles causas:
  echo - Error en el codigo
  echo - Problema de permisos
  echo - Timeout de red
  echo.
  pause
  exit /b 1
)

REM 6) Obtener URL
echo.
echo ========================================
echo  OBTENIENDO URL DEL SERVICIO...
echo ========================================
echo.

set "SERVICE_URL="
for /f "delims=" %%u in ('"!GCLOUD!" run services describe %SERVICE_NAME% --platform managed --region %REGION% --format "value(status.url)" 2^>nul') do (
  set "SERVICE_URL=%%u"
)

if "!SERVICE_URL!"=="" (
  echo [WARNING] No se pudo obtener URL automaticamente
  echo.
  echo Servicios disponibles:
  "!GCLOUD!" run services list --platform managed --region %REGION%
  pause
  exit /b 0
)

echo [SUCCESS] Deploy completado!
echo.
echo ========================================
echo  URL DEL BACKEND
echo ========================================
echo.
echo !SERVICE_URL!
echo.

REM 7) Health check
echo Verificando health check (espera 5s)...
timeout /t 5 /nobreak >nul

set "HEALTH_OK=false"
curl -s "!SERVICE_URL!/api/health" | findstr /I "ok" >nul 2>&1
if errorlevel 0 (
  set "HEALTH_OK=true"
)

if not "!HEALTH_OK!"=="true" (
  powershell -Command "try { $r = Invoke-RestMethod -UseBasicParsing '!SERVICE_URL!/api/health'; if ($r.status -eq 'ok') { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
  if errorlevel 0 set "HEALTH_OK=true"
)

echo.
if "!HEALTH_OK!"=="true" (
  echo [SUCCESS] Backend respondiendo correctamente
) else (
  echo [WARNING] Backend desplegado pero health check no responde
  echo Esto puede ser normal, dame unos segundos para iniciar...
)

echo.
echo ========================================
echo  PROXIMOS PASOS
echo ========================================
echo.
echo 1. Actualiza .env.production en frontend:
echo    VITE_API_URL=!SERVICE_URL!/api
echo.
echo 2. Verifica CORS en backend/cmd/api/main.go
echo.
echo 3. Redeploy frontend:
echo    npm run build
echo    firebase deploy --only hosting
echo.
pause
endlocal
exit /b 0