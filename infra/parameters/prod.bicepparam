using '../main.bicep'

// ── Non-secret parameters ─────────────────────────────────────────────────────
param environment = 'prod'
param resourceGroupLocation = 'eastus'
param servicesLocation      = 'westcentralus'

param resourceGroupName    = 'DesarrolloProfesional'
param frontendAppName      = 'proddesarrolloprofesional-frontend'  // update if using a custom name
param apiAppName           = 'proddesarrolloprofesional-api'       // update if using a custom name
param appServicePlanSku    = 'B1'

// ── Secrets — read from environment variables at deploy time ──────────────────
// Set these in your shell before running deploy.ps1:
//   $env:SUPABASE_URL         = '...'
//   $env:SUPABASE_SERVICE_KEY = '...'
param supabaseUrl        = readEnvironmentVariable('SUPABASE_URL', '')
param supabaseServiceKey = readEnvironmentVariable('SUPABASE_SERVICE_KEY', '')
