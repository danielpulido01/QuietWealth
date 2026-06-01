param environment string
param location string
param frontendAppName string
param apiAppName string
param appServicePlanSku string

@secure()
param supabaseUrl string
@secure()
param supabaseServiceKey string

var planName = 'asp-dp-${environment}'
var frontendOrigin = 'https://${frontendAppName}.azurewebsites.net'
var aspnetEnv = environment == 'prod' ? 'Production' : 'Development'  // qa uses Development so Swagger is available

// Shared App Service Plan (Linux) ─────────────────────────────────────────────
resource plan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: planName
  location: location
  sku: {
    name: appServicePlanSku
  }
  kind: 'linux'
  properties: {
    reserved: true  // required for Linux plans
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
  }
}

// Frontend — React SPA served via Node.js `serve` ─────────────────────────────
// VITE_ build-time variables are injected during the GitHub Actions build step
// (VITE_API_BASE_URL secret), not at runtime. No VITE_ settings are needed here.
resource frontendApp 'Microsoft.Web/sites@2023-01-01' = {
  name: frontendAppName
  location: location
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|24-lts'
      appCommandLine: 'npx --yes serve -s . -l $PORT'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~24' }
        // Disable Oryx build on deployment — we ship pre-built /dist artifacts
        { name: 'SCM_DO_BUILD_DURING_DEPLOYMENT', value: 'false' }
      ]
    }
  }
  tags: {
    environment: environment
    role: 'frontend'
  }
}

// API — ASP.NET Core (.NET 10) ─────────────────────────────────────────────────
resource apiApp 'Microsoft.Web/sites@2023-01-01' = {
  name: apiAppName
  location: location
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      // Verify this version is listed in: az webapp list-runtimes --os linux
      linuxFxVersion: 'DOTNETCORE|10.0'
      appCommandLine: 'dotnet QuietWealth.Api.dll'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        { name: 'ASPNETCORE_ENVIRONMENT', value: aspnetEnv }
        { name: 'Supabase__Url', value: supabaseUrl }
        { name: 'Supabase__ServiceKey', value: supabaseServiceKey }
        // CORS: match the frontend origin exactly (no trailing slash)
        { name: 'AllowedOrigins__0', value: frontendOrigin }
        // Run from uploaded package zip (faster cold start, read-only file system)
        { name: 'WEBSITE_RUN_FROM_PACKAGE', value: '1' }
      ]
    }
  }
  tags: {
    environment: environment
    role: 'api'
  }
}

output frontendUrl string = 'https://${frontendApp.properties.defaultHostName}'
output apiUrl string = 'https://${apiApp.properties.defaultHostName}'
