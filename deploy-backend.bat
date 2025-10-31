@echo off
setlocal enabledelayedexpansion

REM ==================================================
REM Deploy backend a Cloud Run - CON REDIS
REM ==================================================
cd /d "%~dp0"

REM ---------- CONFIG ----------
set "PROJECT_ID=dnd5etools-73"
set "SERVICE_NAME=dm-events-backend"
set "REGION=us-central1"
set "GCLOUD_FALLBACK=C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
REM ----------------------------

echo ========================================
echo  DEPLOY BACKEND CON REDIS
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
if not exist "backend\go.mod" (
  echo [ERROR] backend\go.mod no encontrado
  pause
  exit /b 1
)
echo [OK] Archivos verificados
echo.

REM 4) Verificar/Instalar dependencias de Go
echo Verificando dependencias de Go...
cd backend

REM Verificar si Redis ya está en go.mod
findstr /C:"github.com/redis/go-redis" go.mod >nul 2>&1
if errorlevel 1 (
  echo.
  echo [INFO] Instalando dependencia de Redis...
  go get github.com/redis/go-redis/v9
  if errorlevel 1 (
    echo [ERROR] No se pudo instalar go-redis
    cd ..
    pause
    exit /b 1
  )
  echo [OK] Dependencia de Redis instalada
) else (
  echo [OK] Dependencia de Redis ya instalada
)

echo.
echo Ejecutando go mod tidy...
go mod tidy
if errorlevel 1 (
  echo [ERROR] go mod tidy falló
  cd ..
  pause
  exit /b 1
)

cd ..
echo [OK] Dependencias actualizadas
echo.

REM 5) Verificar configuración de Redis
set "REDIS_URL="
set "DEPLOY_WITH_REDIS=false"

if exist "redis-config.env" (
  echo [INFO] Encontrado redis-config.env
  for /f "tokens=1,* delims==" %%a in (redis-config.env) do (
    if "%%a"=="REDIS_URL" set "REDIS_URL=%%b"
  )
  
  if not "!REDIS_URL!"=="" (
    echo [OK] Redis configurado: !REDIS_URL!
    set "DEPLOY_WITH_REDIS=true"
  ) else (
    echo [WARNING] redis-config.env existe pero está vacío
  )
) else (
  echo [INFO] No se encontró redis-config.env
)

if "!DEPLOY_WITH_REDIS!"=="false" (
  echo.
  echo ========================================
  echo  SIN CONFIGURACION DE REDIS
  echo ========================================
  echo.
  echo No se detectó configuración de Redis.
  echo.
  echo Opciones:
  echo 1. Configurar Redis ahora (Recomendado)
  echo 2. Continuar sin Redis (In-Memory Fallback)
  echo.
  
  choice /c 12 /n /m "Selecciona una opcion: "
  
  if errorlevel 2 (
    echo.
    echo Continuando sin Redis...
    goto :skip_redis_setup
  )
  
  echo.
  echo Ejecutando setup-redis.bat...
  call setup-redis.bat
  
  if errorlevel 1 (
    echo.
    echo [WARNING] Setup de Redis falló, continuando sin Redis
    goto :skip_redis_setup
  )
  
  REM Re-leer configuración después del setup
  if exist "redis-config.env" (
    for /f "tokens=1,* delims==" %%a in (redis-config.env) do (
      if "%%a"=="REDIS_URL" set "REDIS_URL=%%b"
    )
    if not "!REDIS_URL!"=="" (
      set "DEPLOY_WITH_REDIS=true"
      echo [OK] Redis configurado exitosamente
    )
  )
)

:skip_redis_setup

REM 6) Limpiar builds anteriores
echo.
echo Limpiando builds anteriores...
if exist "backend\cmd\api\server" del /q "backend\cmd\api\server" 2>nul
if exist "backend\cmd\api\server.exe" del /q "backend\cmd\api\server.exe" 2>nul
echo [OK] Limpieza completada
echo.

REM 7) Construir comando de deploy
echo ========================================
echo  INICIANDO DEPLOY...
echo ========================================
echo.

set "ENV_VARS=ENV=production,GIN_MODE=release"

if "!DEPLOY_WITH_REDIS!"=="true" (
  echo [INFO] Desplegando CON Redis
  set "ENV_VARS=!ENV_VARS!,REDIS_URL=!REDIS_URL!"
) else (
  echo [INFO] Desplegando SIN Redis (in-memory fallback)
)

echo.
echo Variables de entorno:
echo !ENV_VARS!
echo.
echo Region: %REGION%
echo Service: %SERVICE_NAME%
echo.
echo Esto puede tardar 2-4 minutos...
echo.

REM 8) Deploy
"!GCLOUD!" run deploy %SERVICE_NAME% ^
  --source . ^
  --platform managed ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --port 8080 ^
  --memory 512Mi ^
  --cpu 1 ^
  --timeout 300 ^
  --max-instances 10 ^
  --min-instances 0 ^
  --set-env-vars "!ENV_VARS!" ^
  --quiet

if errorlevel 1 (
  echo.
  echo [ERROR] Deploy falló
  echo.
  echo Posibles causas:
  echo - Error en el código
  echo - Problema de permisos
  echo - Timeout de red
  echo - Error en la configuración de Redis
  echo.
  
  if "!DEPLOY_WITH_REDIS!"=="true" (
    echo.
    echo Intenta desplegar sin Redis:
    echo 1. Renombra o elimina redis-config.env
    echo 2. Ejecuta este script de nuevo
  )
  
  pause
  exit /b 1
)

REM 9) Obtener URL
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

REM 10) Health check mejorado
echo ========================================
echo  VERIFICANDO SALUD DEL SERVICIO...
echo ========================================
echo.
echo Esperando 10 segundos para que el servicio inicie...
timeout /t 10 /nobreak >nul

echo.
echo Realizando health check...
echo.

REM Usar curl si está disponible
curl --version >nul 2>&1
if errorlevel 0 (
  echo Usando curl para health check...
  curl -s "!SERVICE_URL!/api/health" > health-response.json
  
  REM Mostrar respuesta
  type health-response.json
  echo.
  echo.
  
  REM Verificar si Redis está activo
  findstr /C:"\"redis\": true" health-response.json >nul 2>&1
  if errorlevel 0 (
    echo ✅ Backend respondiendo con Redis ACTIVO
  ) else (
    findstr /C:"\"redis\": false" health-response.json >nul 2>&1
    if errorlevel 0 (
      echo ⚠️  Backend respondiendo pero Redis está DESACTIVADO
      echo    (Usando rate limiter en memoria)
    ) else (
      echo ❓ No se pudo determinar el estado de Redis
    )
  )
  
  del health-response.json 2>nul
) else (
  echo [INFO] curl no disponible, usando PowerShell...
  powershell -Command "try { $r = Invoke-RestMethod -UseBasicParsing '!SERVICE_URL!/api/health'; Write-Host ($r | ConvertTo-Json -Depth 3); if ($r.services.redis -eq $true) { Write-Host ''; Write-Host 'Redis: ACTIVO' -ForegroundColor Green } else { Write-Host ''; Write-Host 'Redis: DESACTIVADO (in-memory fallback)' -ForegroundColor Yellow } } catch { Write-Host 'Error en health check' -ForegroundColor Red; exit 1 }" 2>nul
  
  if errorlevel 0 (
    echo.
    echo ✅ Backend respondiendo correctamente
  ) else (
    echo.
    echo ⚠️  Backend desplegado pero health check no responde
    echo    Esto puede ser normal, el servicio puede tardar en iniciar
  )
)

REM 11) Resumen y próximos pasos
echo.
echo ========================================
echo  RESUMEN DEL DEPLOY
echo ========================================
echo.
echo URL del Backend: !SERVICE_URL!
echo.

if "!DEPLOY_WITH_REDIS!"=="true" (
  echo Estado de Redis: ✅ CONFIGURADO
  echo Redis URL: !REDIS_URL!
  echo.
  echo Rate Limiting: Consistente entre instancias
  echo Escalabilidad: Alta (múltiples instancias sin problema)
) else (
  echo Estado de Redis: ⚠️  NO CONFIGURADO
  echo.
  echo Rate Limiting: Por instancia (N x 20 req/min)
  echo Escalabilidad: Limitada
  echo.
  echo RECOMENDACION: Ejecuta setup-redis.bat y redeploy
)

echo.
echo ========================================
echo  PROXIMOS PASOS
echo ========================================
echo.
echo 1. Actualiza frontend/.env.production:
echo    VITE_API_URL=!SERVICE_URL!/api
echo.
echo 2. Prueba el backend:
echo    curl "!SERVICE_URL!/api/health"
echo.
echo 3. Verifica logs en Cloud Console:
echo    https://console.cloud.google.com/run/detail/%REGION%/%SERVICE_NAME%/logs
echo.

if "!DEPLOY_WITH_REDIS!"=="false" (
  echo 4. [OPCIONAL] Configura Redis para mejor performance:
  echo    - Ejecuta setup-redis.bat
  echo    - Vuelve a ejecutar este script
  echo.
)

echo Deploy completado exitosamente!
echo.
pause
endlocal
exit /b 0