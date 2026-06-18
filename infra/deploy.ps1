<#
.SYNOPSIS
    Provision QuietWealth Azure infrastructure via Bicep.

.DESCRIPTION
    Creates or updates the resource group and platform resources for the target
    environment using the matching .bicepparam file in infra/parameters.

    Secrets are read from environment variables so they never need to be stored
    in source control. See deploy.secrets.example.ps1 for the required names.

    Requires Azure CLI (az) logged in with access to the target subscription.

.PARAMETER Environment
    Target environment: dev, qa, or prod.

.PARAMETER WhatIf
    Run an Azure deployment what-if instead of creating resources.

.EXAMPLE
    .\deploy.ps1 -Environment dev

.EXAMPLE
    .\deploy.ps1 -Environment prod -WhatIf
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('dev', 'qa', 'prod')]
    [string]$Environment,

    [switch]$WhatIf
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$required = @(
    'AZURE_SQL_ADMIN_PASSWORD'
    'AZURE_SQL_CONNECTION_STRING'
    'AZURE_BLOB_CONNECTION_STRING'
    'AZURE_NOTIFICATION_HUB_CONNECTION_STRING'
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

$paramFile = Join-Path $PSScriptRoot "parameters\$Environment.bicepparam"
$mainBicep = Join-Path $PSScriptRoot 'main.bicep'

if (-not (Test-Path -LiteralPath $paramFile)) {
    Write-Error "Parameter file not found: $paramFile"
}

$deploymentName = "qw-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmm')"
$metadataLocation = 'westcentralus'
$command = if ($WhatIf) { 'what-if' } else { 'create' }

Write-Host ''
Write-Host "  Environment : $Environment" -ForegroundColor Cyan
Write-Host "  Parameters  : $paramFile"
Write-Host "  Template    : $mainBicep"
Write-Host "  Action      : $command"
Write-Host "  Deployment  : $deploymentName"
Write-Host ''

az deployment sub $command `
    --name $deploymentName `
    --location $metadataLocation `
    --template-file $mainBicep `
    --parameters $paramFile `
    --output table

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment command failed. Review the Azure CLI output above."
}

Write-Host ''
if ($WhatIf) {
    Write-Host 'What-if completed.' -ForegroundColor Green
} else {
    Write-Host 'Provisioning complete.' -ForegroundColor Green
}
