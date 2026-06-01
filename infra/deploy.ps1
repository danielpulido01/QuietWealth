<#
.SYNOPSIS
    Provision QuietWealth Azure infrastructure via Bicep.

.DESCRIPTION
    Creates (or updates) the Resource Group, App Service Plan, frontend Web App
    (Node.js), and API Web App (.NET 10) for the target environment.

    Secrets are read from environment variables — never from this file.
    Set them before running:

        $env:SUPABASE_URL         = 'https://<ref>.supabase.co'
        $env:SUPABASE_SERVICE_KEY = '<service_role key>'

    Requires: Azure CLI (az) logged in with Contributor on the target subscription.

.PARAMETER Environment
    Target environment: 'dev' or 'prod'.

.EXAMPLE
    .\deploy.ps1 -Environment qa
    .\deploy.ps1 -Environment prod
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('qa', 'prod')]
    [string]$Environment
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Pre-flight checks ─────────────────────────────────────────────────────────

$required = @(
    'SUPABASE_URL'
    'SUPABASE_SERVICE_KEY'
)

$missing = $required | Where-Object { -not [System.Environment]::GetEnvironmentVariable($_) }
if ($missing) {
    Write-Error "Missing required environment variables:`n  $($missing -join "`n  ")"
}

$az = Get-Command az -ErrorAction SilentlyContinue
if (-not $az) {
    Write-Error "Azure CLI not found. Install from https://learn.microsoft.com/cli/azure/install-azure-cli"
}

# ── Deployment ────────────────────────────────────────────────────────────────

$paramFile   = Join-Path $PSScriptRoot "parameters\$Environment.bicepparam"
$mainBicep   = Join-Path $PSScriptRoot "main.bicep"
$deployName  = "dp-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmm')"

# Subscription-level deployments require a metadata location (any valid region).
# Actual resource locations are controlled by the .bicepparam file.
$metaLocation = 'westcentralus'

Write-Host ""
Write-Host "  Environment : $Environment" -ForegroundColor Cyan
Write-Host "  Parameters  : $paramFile"
Write-Host "  Deployment  : $deployName"
Write-Host ""

az deployment sub create `
    --name        $deployName `
    --location    $metaLocation `
    --template-file $mainBicep `
    --parameters  $paramFile `
    --output      table

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed. Check the output above."
}

Write-Host ""
Write-Host "Provisioning complete." -ForegroundColor Green
Write-Host "App code is deployed separately via GitHub Actions (push to main)."
