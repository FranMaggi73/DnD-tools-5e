@echo off
setlocal enabledelayedexpansion

REM ==================================================
REM Deploy backend a Cloud Run - Windows (.bat) - robusto
REM ==================================================
cd /d "%~dp0"

REM ---------- CONFIG ----------
set "PROJECT_ID=dnd5etools-73"
set "SERVICE_NAME=dm-events-backend"
set "REGION=us-central1"
set "GCLOUD_FALLBACK=C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
REM ----------------------------

REM 1) Detectar gcloud en PATH o usar fallback
set "GCLOUD="
for /f "delims=" %%G in ('where gcloud 2^>nul ^| findstr /I /R "gcloud.cmd gcloud.exe"') do (
  set "GCLOUD=%%G"
  goto :gcloud_found
)
if not defined GCLOUD (
  if exist "%GCLOUD_FALLBACK%" (
    set "GCLOUD=%GCLOUD_FALLBACK%"
  ) else (
    echo ERROR: no se encuentra gcloud. Instalalo o ajusta GCLOUD_FALLBACK en el script.
    pause
    exit /b 1
  )
)
:gcloud_found
echo Usando gcloud: !GCLOUD!
echo.

REM 2) Verificar proyecto activo (usamos cmd /c para ejecutar la ruta con comillas)
set "CURRENT_PROJECT="
for /f "delims=" %%p in ('cmd /c ""!GCLOUD!" config get-value project --quiet 2^>nul"') do (
  set "CURRENT_PROJECT=%%p"
)
if "!CURRENT_PROJECT!"=="" (
  echo Proyecto actual: (no configurado)
) else (
  echo Proyecto actual: !CURRENT_PROJECT!
)
if /i not "!CURRENT_PROJECT!"=="%PROJECT_ID%" (
  echo ERROR: Proyecto incorrecto.
  echo Ejecuta: "!GCLOUD!" config set project %PROJECT_ID%
  pause
  exit /b 1
)
echo Proyecto correcto: %PROJECT_ID%
echo.

REM 3) Verificar serviceAccountKey.json
echo Verificando serviceAccountKey.json...
if not exist "backend\cmd\api\serviceAccountKey.json" (
  echo ERROR: backend\cmd\api\serviceAccountKey.json no encontrada.
  echo Descargala desde Firebase Console y guardala en backend\cmd\api\serviceAccountKey.json
  pause
  exit /b 1
)
echo OK: serviceAccountKey.json encontrado.
echo.

REM 4) Verificar estructura del proyecto
echo Verificando estructura del proyecto...
set "FILES=Dockerfile backend\go.mod backend\cmd\api\main.go backend\internal\handlers\events.go"
for %%f in (%FILES%) do (
  if not exist "%%f" (
    echo ERROR: Falta archivo %%f
    pause
    exit /b 1
  )
)
echo Estructura correcta.
echo.

REM 5) Limpiar builds anteriores
echo Limpiando builds anteriores...
if exist "backend\cmd\api\server" del /q "backend\cmd\api\server" 2>nul
if exist "backend\cmd\api\server.exe" del /q "backend\cmd\api\server.exe" 2>nul
echo Limpieza completada.
echo.

REM 6) Build & Deploy (ejecuta gcloud con la ruta completa)
echo Iniciando build y deploy...
cmd /c ""!GCLOUD!" run deploy %SERVICE_NAME% --source . --platform managed --region %REGION% --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --timeout 300 --max-instances 10 --min-instances 0 --set-env-vars ENV=production,GIN_MODE=release --quiet"
if errorlevel 1 (
  echo ERROR: Deploy falló.
  pause
  exit /b 1
)

REM 7) Obtener URL del servicio
set "SERVICE_URL="
for /f "delims=" %%u in ('cmd /c ""!GCLOUD!" run services describe %SERVICE_NAME% --platform managed --region %REGION% --format "value(status.url)" 2^>nul"') do (
  set "SERVICE_URL=%%u"
)

if "!SERVICE_URL!"=="" (
  echo WARNING: No se pudo obtener la URL del servicio.
  echo Listando servicios en la región...
  cmd /c ""!GCLOUD!" run services list --platform managed --region %REGION%"
  pause
  exit /b 0
)

echo Deploy exitoso!
echo URL del Backend: !SERVICE_URL!
echo.

REM 8) Health check (esperar 5s)
echo Verificando health check...
timeout /t 5 /nobreak >nul

REM Intentar curl; si falla, usar PowerShell
set "HEALTH_RESPONSE="
curl -s "!SERVICE_URL!/api/health" > temp_health.txt 2>nul
if errorlevel 1 (
  powershell -Command "try { (Invoke-RestMethod -UseBasicParsing '!SERVICE_URL!/api/health') } catch { Write-Output 'ERROR' }" > temp_health.txt 2>nul
)

if exist temp_health.txt (
  set /p HEALTH_RESPONSE=<temp_health.txt
  del /f /q temp_health.txt 2>nul
)

echo Respuesta health: !HEALTH_RESPONSE!
echo !HEALTH_RESPONSE! | findstr /I "ok" >nul
if errorlevel 0 (
  echo Backend respondiendo correctamente.
) else (
  echo El backend se desplegó pero el health check no devolvió 'ok'.
  echo Respuesta: !HEALTH_RESPONSE!
)

echo.
echo PROXIMOS PASOS:
echo 1) Actualiza frontend: VITE_API_URL=!SERVICE_URL!/api
echo 2) Revisa CORS en backend\cmd\api\main.go
echo.
pause
endlocal
exit /b 0
