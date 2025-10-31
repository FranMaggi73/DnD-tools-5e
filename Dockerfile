# Dockerfile
# IMPORTANTE: Este archivo debe estar en la RAÍZ del proyecto (no en backend/)

# ===== Stage 1: Build =====
FROM golang:1.24-alpine AS builder

# Instalar dependencias de build
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

# Copiar go.mod y go.sum primero (mejor caching)
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copiar código fuente
COPY backend/ ./

# Compilar binario estático
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o /server ./cmd/api/main.go

# ===== Stage 2: Runtime =====
FROM alpine:latest

# Instalar certificados SSL y timezone data
RUN apk --no-cache add ca-certificates tzdata

# Crear usuario no-root
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

WORKDIR /app

# Copiar binario desde builder
COPY --from=builder /server .

# Copiar serviceAccountKey.json
COPY backend/cmd/api/serviceAccountKey.json .

# Cambiar permisos
RUN chown -R appuser:appuser /app

# Usar usuario no-root
USER appuser

# Exponer puerto
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Ejecutar
ENTRYPOINT ["./server"]