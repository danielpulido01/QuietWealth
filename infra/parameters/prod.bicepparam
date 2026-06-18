using '../main.bicep'

param environment = 'prod'
param resourceGroupLocation = 'eastus'
param servicesLocation = 'westcentralus'

param resourceGroupName = 'rg-quietwealth-prod'
param namePrefix = 'qw-prod'

param frontendAppName = 'prodquietwealth-frontend'
param frontendSlotName = 'staging'
param apiAppName = 'prodquietwealth-api'
param apiSlotName = 'staging'
param enableDeploymentSlots = true

param appServicePlanSku = 'B1'
param frontendRuntimeStack = 'NODE|24-lts'
param frontendNodeVersion = '~24'
param frontendStartupCommand = 'npx --yes serve -s . -l $PORT'
param apiRuntimeStack = 'DOTNETCORE|10.0'
param apiStartupCommand = 'dotnet QuietWealth.Api.dll'
param apiPort = '8080'

param sqlServerName = 'qw-prod-sql'
param sqlDatabaseName = 'quietwealth-prod'
param sqlAdministratorLogin = 'qwadminprod'

param storageAccountName = 'qwprodstorage001'
param blobContainerName = 'app-data'
param queueName = 'jobs'
param blobLifecycleArchiveAfterDays = 90

param redisName = 'qw-prod-redis'
param eventGridTopicName = 'qw-prod-eventgrid'
param functionAppName = 'qw-prod-functions'
param functionWorkerRuntime = 'dotnet-isolated'
param functionRuntimeStack = 'DOTNET-ISOLATED|8.0'
param dataFactoryName = 'qw-prod-adf'
param notificationHubNamespaceName = 'qw-prod-notify'
param notificationHubName = 'quietwealth-prod'
param appInsightsName = 'qw-prod-ai'
param logAnalyticsWorkspaceName = 'qw-prod-law'
param apiManagementName = 'qw-prod-apim'
param apiManagementPublisherName = 'REPLACE_PROD_PUBLISHER_NAME'
param apiManagementPublisherEmail = 'replace-prod@example.com'
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
