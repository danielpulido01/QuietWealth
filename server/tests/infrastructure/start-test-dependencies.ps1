[CmdletBinding()]
param(
    [string]$ComposeFile = "$PSScriptRoot/docker-compose.integration.yml"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is required but was not found on PATH."
}

if (-not $env:QW_SQL_SA_PASSWORD) {
    $env:QW_SQL_SA_PASSWORD = "QuietWealth_Test_123!"
}

Write-Host "Starting backend test dependencies from $ComposeFile"
docker compose -f $ComposeFile up -d

Write-Host ""
Write-Host "Container status:"
docker compose -f $ComposeFile ps

Write-Host ""
Write-Host "Suggested local test settings:"
Write-Host "AzureSql__ConnectionString=Server=localhost,14333;Database=QuietWealthTestDb;User Id=sa;Password=$($env:QW_SQL_SA_PASSWORD);TrustServerCertificate=True;Encrypt=False"
Write-Host "BlobStorage__ConnectionString=UseDevelopmentStorage=true"
Write-Host "BlobStorage__DocumentsContainer=documents"
Write-Host "BlobStorage__TemplatesContainer=templates"
Write-Host "BlobStorage__ArtifactsContainer=artifacts"
Write-Host "Redis__ConnectionString=localhost:6380"
Write-Host "NotificationHub__ConnectionString=<placeholder-for-tests>"
Write-Host "NotificationHub__HubName=quietwealth-test-hub"
