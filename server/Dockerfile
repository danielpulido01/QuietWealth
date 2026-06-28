# QuietWealth Backend – ASP.NET Core 9
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

# Copy solution and project files first (layer caching)
COPY QuietWealth.Backend.slnx ./
COPY QuietWealth.Backend/QuietWealth.Backend.csproj ./QuietWealth.Backend/

# Auto-restore dependencies (no manual dotnet restore needed)
RUN dotnet restore QuietWealth.Backend/QuietWealth.Backend.csproj

# Copy everything and build
COPY . .
RUN dotnet publish QuietWealth.Backend/QuietWealth.Backend.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

HEALTHCHECK --interval=10s --timeout=5s --retries=10 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "QuietWealth.Backend.dll"]
