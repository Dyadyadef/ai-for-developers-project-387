# syntax=docker/dockerfile:1

# --- Stage 1: сборка SPA (React + Vite) ------------------------------------
# Node 20 на Debian (glibc) — как в CI (.github/workflows/e2e.yml). Совпадение
# окружения важно: package-lock.json чувствителен к платформе/версии npm.
FROM node:20 AS frontend
WORKDIR /frontend

# Сначала только манифесты — слой с npm ci кэшируется, пока не меняются зависимости.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Исходники фронта. Типы API (src/api/types.ts) закоммичены, TypeSpec не нужен.
COPY frontend/ ./
RUN npm run build          # -> /frontend/dist

# --- Stage 2: публикация backend (.NET 10) ---------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
WORKDIR /src

# Сначала csproj — слой restore кэшируется отдельно от исходников.
COPY backend/BookCalls.Api/BookCalls.Api.csproj backend/BookCalls.Api/
RUN dotnet restore backend/BookCalls.Api/BookCalls.Api.csproj

COPY backend/ backend/
RUN dotnet publish backend/BookCalls.Api/BookCalls.Api.csproj -c Release -o /app/publish

# --- Stage 3: runtime ------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production

# API + собранный SPA в wwwroot (отдаётся тем же приложением, single origin).
COPY --from=backend /app/publish ./
COPY --from=frontend /frontend/dist ./wwwroot

# Порт берётся из переменной окружения PORT (см. Program.cs). Приложение
# стартует автоматически при запуске контейнера.
ENTRYPOINT ["dotnet", "BookCalls.Api.dll"]
