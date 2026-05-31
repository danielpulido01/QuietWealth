targetScope = 'subscription'

@description('Target environment')
@allowed(['qa', 'prod'])
param environment string

@description('Azure region for the resource group metadata')
param resourceGroupLocation string

@description('Azure region where App Service Plan and Web Apps are deployed')
param servicesLocation string

@description('Resource group name')
param resourceGroupName string

@description('Azure Web App name for the React frontend')
param frontendAppName string

@description('Azure Web App name for the .NET API')
param apiAppName string

@description('App Service Plan SKU — B1 for prod')
@allowed(['F1', 'B1', 'B2'])
param appServicePlanSku string

// ── Secrets ──────────────────────────────────────────────────────────────────
// Never commit real values. Pass via env vars read in the .bicepparam file.

@secure()
@description('Supabase project URL — https://<ref>.supabase.co')
param supabaseUrl string

@secure()
@description('Supabase service_role key (server-side only)')
param supabaseServiceKey string

// ─────────────────────────────────────────────────────────────────────────────

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: resourceGroupLocation
  tags: {
    environment: environment
    project: 'QuietWealth'
  }
}

module services 'modules/services.bicep' = {
  name: 'dp-services-${environment}'
  scope: rg
  params: {
    environment: environment
    location: servicesLocation
    frontendAppName: frontendAppName
    apiAppName: apiAppName
    appServicePlanSku: appServicePlanSku
    supabaseUrl: supabaseUrl
    supabaseServiceKey: supabaseServiceKey
  }
}

output frontendUrl string = services.outputs.frontendUrl
output apiUrl string = services.outputs.apiUrl
