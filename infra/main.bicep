targetScope = 'subscription'

@description('Target environment.')
@allowed([
  'dev'
  'qa'
  'prod'
])
param environment string

@description('Azure region for the resource group metadata.')
param resourceGroupLocation string

@description('Azure region where platform resources are deployed.')
param servicesLocation string

@description('Resource group name.')
param resourceGroupName string

@description('Shared name prefix for environment resources.')
param namePrefix string

@description('Azure Web App name for the frontend.')
param frontendAppName string

@description('Deployment slot name for the frontend when slots are enabled.')
param frontendSlotName string = 'staging'

@description('Azure Web App name for the API.')
param apiAppName string

@description('Deployment slot name for the API when slots are enabled.')
param apiSlotName string = 'staging'

@description('Enable deployment slots for production releases.')
param enableDeploymentSlots bool = false

@description('Linux App Service Plan SKU.')
@allowed([
  'F1'
  'B1'
  'B2'
  'S1'
  'P1v3'
])
param appServicePlanSku string

@description('Node runtime used by the frontend Web App.')
param frontendRuntimeStack string = 'NODE|24-lts'

@description('Node version app setting exposed to Kudu/Oryx.')
param frontendNodeVersion string = '~24'

@description('Startup command used by the frontend Web App.')
param frontendStartupCommand string = 'npx --yes serve -s . -l $PORT'

@description('Runtime stack used by the API Web App.')
param apiRuntimeStack string = 'DOTNETCORE|10.0'

@description('Startup command used by the API Web App.')
param apiStartupCommand string = 'dotnet QuietWealth.Api.dll'

@description('Logical API port placeholder for downstream configuration.')
param apiPort string = '8080'

@description('Azure SQL logical server name.')
param sqlServerName string

@description('Azure SQL database name.')
param sqlDatabaseName string

@description('Azure SQL administrator login.')
param sqlAdministratorLogin string

@secure()
@description('Azure SQL administrator password.')
param sqlAdministratorPassword string

@description('Storage account name for blobs and queues.')
param storageAccountName string

@description('Primary blob container name.')
param blobContainerName string = 'app-data'

@description('Queue name for background processing.')
param queueName string = 'jobs'

@description('Days before lifecycle management archives old blobs.')
param blobLifecycleArchiveAfterDays int = 30

@description('Azure Cache for Redis instance name.')
param redisName string

@description('Event Grid custom topic name.')
param eventGridTopicName string

@description('Azure Functions app name.')
param functionAppName string

@description('Functions worker runtime.')
param functionWorkerRuntime string = 'dotnet-isolated'

@description('Functions runtime stack.')
param functionRuntimeStack string = 'DOTNET-ISOLATED|8.0'

@description('Azure Data Factory name.')
param dataFactoryName string

@description('Notification Hubs namespace name.')
param notificationHubNamespaceName string

@description('Notification Hub name.')
param notificationHubName string

@description('Application Insights component name.')
param appInsightsName string

@description('Log Analytics workspace name.')
param logAnalyticsWorkspaceName string

@description('API Management service name.')
param apiManagementName string

@description('API Management publisher display name placeholder.')
param apiManagementPublisherName string

@description('API Management publisher email placeholder.')
param apiManagementPublisherEmail string

@description('API Management SKU.')
param apiManagementSkuName string = 'Developer'

@description('API Management SKU capacity.')
param apiManagementSkuCapacity int = 1

@description('Redis SKU name.')
param redisSkuName string = 'Basic'

@description('Redis SKU family.')
param redisSkuFamily string = 'C'

@description('Redis SKU capacity.')
param redisSkuCapacity int = 0

@secure()
@description('Application connection string for Azure SQL used by the API.')
param sqlConnectionString string

@secure()
@description('Application connection string for Azure Blob Storage used by the API.')
param blobStorageConnectionString string

@secure()
@description('Application connection string for Azure Notification Hubs used by the API.')
param notificationHubConnectionString string

@secure()
@description('Optional app-specific URL placeholder.')
param supabaseUrl string = ''

@secure()
@description('Optional app-specific service key placeholder.')
param supabaseServiceKey string = ''

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: resourceGroupLocation
  tags: {
    environment: environment
    project: 'QuietWealth'
  }
}

module services 'modules/services.bicep' = {
  name: 'quietwealth-platform-${environment}'
  scope: rg
  params: {
    environment: environment
    location: servicesLocation
    namePrefix: namePrefix
    frontendAppName: frontendAppName
    frontendSlotName: frontendSlotName
    apiAppName: apiAppName
    apiSlotName: apiSlotName
    enableDeploymentSlots: enableDeploymentSlots
    appServicePlanSku: appServicePlanSku
    frontendRuntimeStack: frontendRuntimeStack
    frontendNodeVersion: frontendNodeVersion
    frontendStartupCommand: frontendStartupCommand
    apiRuntimeStack: apiRuntimeStack
    apiStartupCommand: apiStartupCommand
    apiPort: apiPort
    sqlServerName: sqlServerName
    sqlDatabaseName: sqlDatabaseName
    sqlAdministratorLogin: sqlAdministratorLogin
    sqlAdministratorPassword: sqlAdministratorPassword
    storageAccountName: storageAccountName
    blobContainerName: blobContainerName
    queueName: queueName
    blobLifecycleArchiveAfterDays: blobLifecycleArchiveAfterDays
    redisName: redisName
    eventGridTopicName: eventGridTopicName
    functionAppName: functionAppName
    functionWorkerRuntime: functionWorkerRuntime
    functionRuntimeStack: functionRuntimeStack
    dataFactoryName: dataFactoryName
    notificationHubNamespaceName: notificationHubNamespaceName
    notificationHubName: notificationHubName
    appInsightsName: appInsightsName
    logAnalyticsWorkspaceName: logAnalyticsWorkspaceName
    apiManagementName: apiManagementName
    apiManagementPublisherName: apiManagementPublisherName
    apiManagementPublisherEmail: apiManagementPublisherEmail
    apiManagementSkuName: apiManagementSkuName
    apiManagementSkuCapacity: apiManagementSkuCapacity
    redisSkuName: redisSkuName
    redisSkuFamily: redisSkuFamily
    redisSkuCapacity: redisSkuCapacity
    sqlConnectionString: sqlConnectionString
    blobStorageConnectionString: blobStorageConnectionString
    notificationHubConnectionString: notificationHubConnectionString
    supabaseUrl: supabaseUrl
    supabaseServiceKey: supabaseServiceKey
  }
}

output frontendUrl string = services.outputs.frontendUrl
output frontendSlotUrl string = services.outputs.frontendSlotUrl
output apiUrl string = services.outputs.apiUrl
output apiSlotUrl string = services.outputs.apiSlotUrl
output sqlServerFqdn string = services.outputs.sqlServerFqdn
