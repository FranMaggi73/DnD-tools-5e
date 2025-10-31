@echo off
setlocal enabledelayedexpansion

REM ==================================================
REM Setup Redis para DM Events Backend
REM ==================================================
cd /d "%~dp0"

set "PROJECT_ID=dnd5etools-73"
set "REGION=us-central1"
set "REDIS_INSTANCE=dm-events-redis"

echo ========================================
echo  CONFIGURACION DE REDIS
echo ========================================
echo.
echo Opciones:
echo.
echo 1. Usar Redis Cloud (Recomendado - Gratis hasta 30MB)
echo 2. Crear Cloud Memorystore (Google Cloud - Requiere VPC)
echo 3. Desarrollo Local (Docker)
echo 4. Sin Redis (In-Memory Fallback)
echo.

choice /c 1234 /n /m "Selecciona una opcion: "
set "REDIS_OPTION=%errorlevel%"

if "%REDIS_OPTION%"=="1" goto redis_cloud
if "%REDIS_OPTION%"=="2" goto memorystore
if "%REDIS_OPTION%"=="3" goto local_docker
if "%REDIS_OPTION%"=="4" goto no_redis

:redis_cloud
echo.
echo ========================================
echo  REDIS CLOUD (Opcion Recomendada)
echo ========================================
echo.
echo Pasos a seguir:
echo.
echo 1. Ve a https://redis.com/try-free/
echo 2. Crea una cuenta (gratis, no requiere tarjeta)
echo 3. Crea una nueva base de datos:
echo    - Name: dm-events-redis
echo    - Cloud: AWS
echo    - Region: us-east-1 (o mas cercano)
echo    - Plan: Free (30MB)
echo.
echo 4. Obtén la "Public endpoint" que se ve asi:
echo    redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345
echo.
echo 5. Obtén el "Default user password"
echo.
pause

echo.
set /p "REDIS_HOST=Ingresa el endpoint (sin redis://): "
set /p "REDIS_PASSWORD=Ingresa la password: "

REM Construir URL completa
set "REDIS_URL=redis://default:%REDIS_PASSWORD%@%REDIS_HOST%"

echo.
echo ✅ Redis URL configurado:
echo    %REDIS_URL%
echo.
echo Esta URL se guardará en redis-config.env
echo.

REM Guardar en archivo
echo REDIS_URL=%REDIS_URL% > redis-config.env

echo ✅ Configuracion guardada en redis-config.env
echo.
echo SIGUIENTE PASO: Ejecuta deploy-backend.bat para desplegar con Redis
echo.
pause
exit /b 0

:memorystore
echo.
echo ========================================
echo  CLOUD MEMORYSTORE
echo ========================================
echo.
echo ⚠️  ADVERTENCIA: Cloud Memorystore requiere:
echo    - Configuracion VPC compleja
echo    - Costo minimo $50/mes
echo    - No recomendado para este proyecto
echo.
echo ¿Estas seguro de continuar con Memorystore?
pause

echo.
echo Creando instancia de Memorystore...
echo.

gcloud redis instances create %REDIS_INSTANCE% ^
    --size=1 ^
    --region=%REGION% ^
    --redis-version=redis_6_x ^
    --project=%PROJECT_ID%

if errorlevel 1 (
    echo.
    echo [ERROR] No se pudo crear la instancia de Memorystore
    echo.
    echo Posibles causas:
    echo - La API de Redis no está habilitada
    echo - No tienes permisos suficientes
    echo - Ya existe una instancia con ese nombre
    echo.
    echo Intenta con Redis Cloud (Opción 1) en su lugar
    pause
    exit /b 1
)

echo.
echo Obteniendo IP de la instancia...

for /f "delims=" %%i in ('gcloud redis instances describe %REDIS_INSTANCE% --region=%REGION% --format="value(host)"') do set "REDIS_HOST=%%i"

if "%REDIS_HOST%"=="" (
    echo [ERROR] No se pudo obtener la IP de Redis
    pause
    exit /b 1
)

set "REDIS_URL=redis://%REDIS_HOST%:6379"

echo.
echo ✅ Memorystore creado exitosamente
echo    Host: %REDIS_HOST%
echo    URL: %REDIS_URL%
echo.

REM Guardar en archivo
echo REDIS_URL=%REDIS_URL% > redis-config.env

echo ⚠️  IMPORTANTE: Necesitas configurar VPC Connector para Cloud Run
echo    Ver: https://cloud.google.com/run/docs/configuring/connecting-vpc
echo.
pause
exit /b 0

:local_docker
echo.
echo ========================================
echo  REDIS LOCAL (DOCKER)
echo ========================================
echo.
echo Iniciando Redis en Docker...
echo.

docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no está instalado
    echo.
    echo Instala Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Verificar si ya existe el contenedor
docker ps -a | findstr "dm-events-redis" >nul 2>&1
if errorlevel 0 (
    echo Contenedor Redis existente encontrado. Eliminando...
    docker rm -f dm-events-redis >nul 2>&1
)

echo Creando contenedor Redis...
docker run -d ^
    --name dm-events-redis ^
    -p 6379:6379 ^
    redis:7-alpine

if errorlevel 1 (
    echo [ERROR] No se pudo iniciar Redis
    pause
    exit /b 1
)

set "REDIS_URL=redis://localhost:6379"

echo.
echo ✅ Redis iniciado en Docker
echo    URL: %REDIS_URL%
echo.

REM Guardar en archivo
echo REDIS_URL=%REDIS_URL% > redis-config.env

echo NOTA: Este Redis es solo para desarrollo local
echo       Para produccion, usa Redis Cloud (Opcion 1)
echo.
pause
exit /b 0

:no_redis
echo.
echo ========================================
echo  SIN REDIS (IN-MEMORY FALLBACK)
echo ========================================
echo.
echo ⚠️  Sin Redis, el rate limiting será por instancia:
echo    - Con 3 instancias de Cloud Run: 60 req/min efectivos (3 x 20)
echo    - Con 10 instancias: 200 req/min efectivos (10 x 20)
echo.
echo Esto está bien para desarrollo/testing, pero NO para producción
echo con múltiples usuarios concurrentes.
echo.

REM Eliminar archivo de config si existe
if exist redis-config.env del redis-config.env

echo ✅ Configurado para usar rate limiter en memoria
echo.
echo RECOMENDACION: Configura Redis Cloud (gratis) para mejor control
echo.
pause
exit /b 0