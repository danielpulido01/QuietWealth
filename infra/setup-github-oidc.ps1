<#
.SYNOPSIS
    Wire GitHub Actions OIDC to Azure App Service for QuietWealth.

.DESCRIPTION
    For each web app (frontend + API) in the target environment:
      1. Creates an Entra ID app registration (idempotent — skips if it exists)
      2. Creates a service principal
      3. Adds a federated credential tied to the GitHub environment
      4. Grants Contributor on the Web App resource
      5. Sets the required secrets in the GitHub environment via gh CLI

    Requires: Azure CLI logged in (az login) + GitHub CLI authenticated (gh auth login)
    with repo and environment secret write permissions.

.PARAMETER GitHubRepo
    Repository in owner/repo format. Example: danielpulido01/QuietWealth

.PARAMETER Environment
    Which environments to configure: 'dev', 'qa', 'prod', or 'all'. Default: all

.EXAMPLE
    .\setup-github-oidc.ps1 -GitHubRepo danielpulido01/QuietWealth
    .\setup-github-oidc.ps1 -GitHubRepo danielpulido01/QuietWealth -Environment dev
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$GitHubRepo,

    [ValidateSet('dev', 'qa', 'prod', 'all')]
    [string]$Environment = 'all'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Pre-flight ────────────────────────────────────────────────────────────────

foreach ($tool in @('az', 'gh')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Error "$tool CLI not found. Install it and try again."
    }
}

$account  = az account show | ConvertFrom-Json
$tenantId = $account.tenantId
$subId    = $account.id
$subScope = "/subscriptions/$subId"

Write-Host ""
Write-Host "  Subscription : $($account.name) ($subId)" -ForegroundColor Cyan
Write-Host "  Tenant       : $tenantId"                 -ForegroundColor Cyan
Write-Host "  GitHub repo  : $GitHubRepo"               -ForegroundColor Cyan
Write-Host ""

# ── App definitions ───────────────────────────────────────────────────────────

$apps = @(
    @{
        Env          = 'dev'
        Role         = 'frontend'
        AppName      = 'devquietwealth-frontend'
        RG           = 'rg-quietwealth-dev'
        GitHubEnv    = 'Development'
        SecretClient = 'AZUREAPPSERVICE_CLIENTID_DEV_FRONTEND'
        SecretTenant = 'AZUREAPPSERVICE_TENANTID_DEV'
        SecretSub    = 'AZUREAPPSERVICE_SUBSCRIPTIONID_DEV'
    }
    @{
        Env          = 'dev'
        Role         = 'api'
        AppName      = 'devquietwealth-api'
        RG           = 'rg-quietwealth-dev'
        GitHubEnv    = 'Development'
        SecretClient = 'AZUREAPPSERVICE_CLIENTID_DEV_API'
        SecretTenant = 'AZUREAPPSERVICE_TENANTID_DEV'
        SecretSub    = 'AZUREAPPSERVICE_SUBSCRIPTIONID_DEV'
    }
    @{
        Env          = 'prod'
        Role         = 'frontend'
        AppName      = 'prodquietwealth-frontend'
        RG           = 'rg-quietwealth-prod'
        GitHubEnv    = 'Production'
        SecretClient = 'AZUREAPPSERVICE_CLIENTID_PROD_FRONTEND'
        SecretTenant = 'AZUREAPPSERVICE_TENANTID_PROD'
        SecretSub    = 'AZUREAPPSERVICE_SUBSCRIPTIONID_PROD'
    }
    @{
        Env          = 'prod'
        Role         = 'api'
        AppName      = 'prodquietwealth-api'
        RG           = 'rg-quietwealth-prod'
        GitHubEnv    = 'Production'
        SecretClient = 'AZUREAPPSERVICE_CLIENTID_PROD_API'
        SecretTenant = 'AZUREAPPSERVICE_TENANTID_PROD'
        SecretSub    = 'AZUREAPPSERVICE_SUBSCRIPTIONID_PROD'
    }
    @{
        Env          = 'qa'
        Role         = 'frontend'
        AppName      = 'qaquietwealth-frontend'
        RG           = 'rg-quietwealth-qa'
        GitHubEnv    = 'QA'
        SecretClient = 'AZUREAPPSERVICE_CLIENTID_QA_FRONTEND'
        SecretTenant = 'AZUREAPPSERVICE_TENANTID_QA'
        SecretSub    = 'AZUREAPPSERVICE_SUBSCRIPTIONID_QA'
    }
    @{
        Env          = 'qa'
        Role         = 'api'
        AppName      = 'qaquietwealth-api'
        RG           = 'rg-quietwealth-qa'
        GitHubEnv    = 'QA'
        SecretClient = 'AZUREAPPSERVICE_CLIENTID_QA_API'
        SecretTenant = 'AZUREAPPSERVICE_TENANTID_QA'
        SecretSub    = 'AZUREAPPSERVICE_SUBSCRIPTIONID_QA'
    }
)

if ($Environment -ne 'all') {
    $apps = $apps | Where-Object { $_.Env -eq $Environment }
}

# ── Setup (idempotent) ────────────────────────────────────────────────────────

foreach ($app in $apps) {
    $displayName = "dp-$($app.Env)-$($app.Role)-deploy"
    $resourceId  = "$subScope/resourceGroups/$($app.RG)/providers/Microsoft.Web/sites/$($app.AppName)"

    Write-Host "[$displayName]" -ForegroundColor Yellow

    # App registration
    $existing = az ad app list --display-name $displayName | ConvertFrom-Json
    if ($existing.Count -gt 0) {
        $clientId = $existing[0].appId
        Write-Host "  App registration already exists ($clientId)"
    } else {
        Write-Host "  Creating app registration..."
        $reg      = az ad app create --display-name $displayName | ConvertFrom-Json
        $clientId = $reg.appId
        Write-Host "  Created: $clientId"
    }

    # Service principal
    $sp = az ad sp list --filter "appId eq '$clientId'" | ConvertFrom-Json
    if ($sp.Count -eq 0) {
        Write-Host "  Creating service principal..."
        az ad sp create --id $clientId | Out-Null
    }

    # Federated credential
    # Write JSON to a temp file — az CLI on PowerShell strips quotes from inline JSON strings
    $credName   = "github-$($app.GitHubEnv.ToLower())"
    $subject    = "repo:${GitHubRepo}:environment:$($app.GitHubEnv)"
    $existingCreds = az ad app federated-credential list --id $clientId | ConvertFrom-Json
    $existingCred  = $existingCreds | Where-Object { $_.name -eq $credName }

    if ($existingCred -and $existingCred.subject -eq $subject -and $existingCred.audiences -contains 'api://AzureADTokenExchange') {
        Write-Host "  Federated credential already exists and is correct"
    } else {
        $credJson = @{
            name      = $credName
            issuer    = 'https://token.actions.githubusercontent.com'
            subject   = $subject
            audiences = @('api://AzureADTokenExchange')
        } | ConvertTo-Json -Compress
        $tmpFile = [System.IO.Path]::GetTempFileName()
        try {
            $credJson | Set-Content $tmpFile -Encoding utf8
            if ($existingCred) {
                Write-Host "  Updating federated credential (subject or audience was wrong)..."
                az ad app federated-credential update --id $clientId --federated-credential-id $existingCred.id --parameters "@$tmpFile" | Out-Null
            } else {
                Write-Host "  Adding federated credential..."
                az ad app federated-credential create --id $clientId --parameters "@$tmpFile" | Out-Null
            }
        } finally {
            Remove-Item $tmpFile -ErrorAction SilentlyContinue
        }
    }

    # Role assignment
    $ra = az role assignment list --assignee $clientId --role Contributor --scope $resourceId | ConvertFrom-Json
    if ($ra.Count -eq 0) {
        Write-Host "  Assigning Contributor on $($app.AppName)..."
        az role assignment create --assignee $clientId --role Contributor --scope $resourceId | Out-Null
    } else {
        Write-Host "  Role already assigned"
    }

    # GitHub environment (must exist before secrets can be written)
    Write-Host "  Ensuring GitHub environment '$($app.GitHubEnv)' exists..."
    gh api "repos/$GitHubRepo/environments/$($app.GitHubEnv)" -X PUT --silent | Out-Null

    # GitHub secrets
    Write-Host "  Setting GitHub secrets..."
    gh secret set $app.SecretClient --env $app.GitHubEnv --repo $GitHubRepo --body $clientId
    gh secret set $app.SecretTenant --env $app.GitHubEnv --repo $GitHubRepo --body $tenantId
    gh secret set $app.SecretSub    --env $app.GitHubEnv --repo $GitHubRepo --body $subId

    Write-Host ""
}

Write-Host 'Done. Align your GitHub workflows and environments with dev/qa/prod before using these identities in CI.' -ForegroundColor Green
