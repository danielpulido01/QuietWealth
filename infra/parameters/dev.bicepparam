using '../main.bicep'

param environment = 'dev'
param resourceGroupLocation = 'eastus'
param servicesLocation = 'westcentralus'

param resourceGroupName = 'rg-quietwealth-dev'
param namePrefix = 'qw-dev'

param frontendAppName = 'devquietwealth-frontend'
param frontendSlotName = 'staging'
param apiAppName = 'devquietwealth-api'
param apiSlotName = 'staging'
param enableDeploymentSlots = false

param appServicePlanSku = 'B1'
param frontendRuntimeStack = 'NODE|24-lts'
param frontendNodeVersion = '~24'
param frontendStartupCommand = 'npx --yes serve -s . -l $PORT'
param apiRuntimeStack = 'DOTNETCORE|10.0'
param apiStartupCommand = 'dotnet QuietWealth.Api.dll'
param apiPort = '8080'

param sqlServerName = 'qw-dev-sql'
param sqlDatabaseName = 'quietwealth-dev'
param sqlAdministratorLogin = 'qwadmindev'

param storageAccountName = 'qwdevstorage001'
param blobContainerName = 'app-data'
param queueName = 'jobs'
param blobLifecycleArchiveAfterDays = 14

param redisName = 'qw-dev-redis'
param eventGridTopicName = 'qw-dev-eventgrid'
param functionAppName = 'qw-dev-functions'
param functionWorkerRuntime = 'dotnet-isolated'
param functionRuntimeStack = 'DOTNET-ISOLATED|8.0'
param dataFactoryName = 'qw-dev-adf'
param notificationHubNamespaceName = 'qw-dev-notify'
param notificationHubName = 'quietwealth-dev'
param appInsightsName = 'qw-dev-ai'
param logAnalyticsWorkspaceName = 'qw-dev-law'
param apiManagementName = 'qw-dev-apim'
param apiManagementPublisherName = 'REPLACE_DEV_PUBLISHER_NAME'
param apiManagementPublisherEmail = 'replace-dev@example.com'
param apiManagementSkuName = 'Developer'
param apiManagementSkuCapacity = 1
param redisSkuName = 'Basic'
param redisSkuFamily = 'C'
param redisSkuCapacity = 0

param sqlAdministratorPassword = readEnvironmentVariable('AZURE_SQL_ADMIN_PASSWORD', '')
param sqlConnectionString = readEnvironmentVariable('AZURE_SQL_CONNECTION_STRING', '')
param blobStorageConnectionString = readEnvironmentVariable('AZURE_BLOB_CONNECTION_STRING', '')
param notificationHubConnectionString = readEnvironmentVariable('AZURE_NOTIFICATION_HUB_CONNECTION_STRING', '')
param supabaseUrl = readEnvironmentVariable('SUPABASE_URL', '')
param supabaseServiceKey = readEnvironmentVariable('SUPABASE_SERVICE_KEY', '')
