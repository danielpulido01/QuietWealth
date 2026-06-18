param environment string
param location string
param namePrefix string
param frontendAppName string
param frontendSlotName string
param apiAppName string
param apiSlotName string
param enableDeploymentSlots bool
param appServicePlanSku string
param frontendRuntimeStack string
param frontendNodeVersion string
param frontendStartupCommand string
param apiRuntimeStack string
param apiStartupCommand string
param apiPort string
param sqlServerName string
param sqlDatabaseName string
param sqlAdministratorLogin string

@secure()
param sqlAdministratorPassword string

param storageAccountName string
param blobContainerName string
param queueName string
param blobLifecycleArchiveAfterDays int
param redisName string
param eventGridTopicName string
param functionAppName string
param functionWorkerRuntime string
param functionRuntimeStack string
param dataFactoryName string
param notificationHubNamespaceName string
param notificationHubName string
param appInsightsName string
param logAnalyticsWorkspaceName string
param apiManagementName string
param apiManagementPublisherName string
param apiManagementPublisherEmail string
param apiManagementSkuName string
param apiManagementSkuCapacity int
param redisSkuName string
param redisSkuFamily string
param redisSkuCapacity int

@secure()
param sqlConnectionString string

@secure()
param blobStorageConnectionString string

@secure()
param notificationHubConnectionString string

@secure()
param supabaseUrl string

@secure()
param supabaseServiceKey string

var planName = 'asp-${namePrefix}'
var aspnetEnv = environment == 'prod' ? 'Production' : 'Development'
var frontendOrigin = 'https://${frontendAppName}.azurewebsites.net'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'observability'
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'observability'
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'storage'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storage
  name: 'default'
}

resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: blobContainerName
  properties: {
    publicAccess: 'None'
  }
}

resource queueService 'Microsoft.Storage/storageAccounts/queueServices@2023-05-01' = {
  parent: storage
  name: 'default'
}

resource jobQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2023-05-01' = {
  parent: queueService
  name: queueName
}

resource storageLifecycle 'Microsoft.Storage/storageAccounts/managementPolicies@2023-05-01' = {
  parent: storage
  name: 'default'
  properties: {
    policy: {
      rules: [
        {
          name: 'archive-old-blobs'
          enabled: true
          type: 'Lifecycle'
          definition: {
            filters: {
              blobTypes: [
                'blockBlob'
              ]
              prefixMatch: [
                '${blobContainerName}/'
              ]
            }
            actions: {
              baseBlob: {
                tierToCool: {
                  daysAfterModificationGreaterThan: 7
                }
                tierToArchive: {
                  daysAfterModificationGreaterThan: blobLifecycleArchiveAfterDays
                }
              }
            }
          }
        }
      ]
    }
  }
}

resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdministratorLogin
    administratorLoginPassword: sqlAdministratorPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'database'
  }
}

resource sqlAllowAzureServices 'Microsoft.Sql/servers/firewallRules@2022-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648
    zoneRedundant: false
    requestedBackupStorageRedundancy: 'Local'
  }
}

resource redis 'Microsoft.Cache/Redis@2023-08-01' = {
  name: redisName
  location: location
  properties: {
    sku: {
      name: redisSkuName
      family: redisSkuFamily
      capacity: redisSkuCapacity
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    redisVersion: '6'
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'cache'
  }
}

resource eventGridTopic 'Microsoft.EventGrid/topics@2022-06-15' = {
  name: eventGridTopicName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'integration'
  }
}

resource dataFactory 'Microsoft.DataFactory/factories@2018-06-01' = {
  name: dataFactoryName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'integration'
  }
}

resource notificationHubNamespace 'Microsoft.NotificationHubs/namespaces@2023-09-01' = {
  name: notificationHubNamespaceName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'notification'
  }
}

resource notificationHub 'Microsoft.NotificationHubs/namespaces/notificationHubs@2023-09-01' = {
  parent: notificationHubNamespace
  name: notificationHubName
  location: location
}

resource apiManagement 'Microsoft.ApiManagement/service@2022-08-01' = {
  name: apiManagementName
  location: location
  sku: {
    name: apiManagementSkuName
    capacity: apiManagementSkuCapacity
  }
  properties: {
    publisherEmail: apiManagementPublisherEmail
    publisherName: apiManagementPublisherName
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'gateway'
  }
}

resource plan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: planName
  location: location
  kind: 'linux'
  sku: {
    name: appServicePlanSku
  }
  properties: {
    reserved: true
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'hosting'
  }
}

resource frontendApp 'Microsoft.Web/sites@2023-01-01' = {
  name: frontendAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: frontendRuntimeStack
      appCommandLine: frontendStartupCommand
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: frontendNodeVersion
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'frontend'
  }
}

resource frontendSlot 'Microsoft.Web/sites/slots@2023-01-01' = if (enableDeploymentSlots) {
  parent: frontendApp
  name: frontendSlotName
  location: location
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: frontendRuntimeStack
      appCommandLine: frontendStartupCommand
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: frontendNodeVersion
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
}

resource apiApp 'Microsoft.Web/sites@2023-01-01' = {
  name: apiAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: apiRuntimeStack
      appCommandLine: apiStartupCommand
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: aspnetEnv
        }
        {
          name: 'App__Port'
          value: apiPort
        }
        {
          name: 'ConnectionStrings__QuietWealthSql'
          value: sqlConnectionString
        }
        {
          name: 'BlobStorage__ConnectionString'
          value: blobStorageConnectionString
        }
        {
          name: 'NotificationHub__ConnectionString'
          value: notificationHubConnectionString
        }
        {
          name: 'Supabase__Url'
          value: supabaseUrl
        }
        {
          name: 'Supabase__ServiceKey'
          value: supabaseServiceKey
        }
        {
          name: 'Redis__Host'
          value: redis.properties.hostName
        }
        {
          name: 'EventGrid__TopicEndpoint'
          value: eventGridTopic.properties.endpoint
        }
        {
          name: 'NotificationHub__Namespace'
          value: notificationHubNamespaceName
        }
        {
          name: 'NotificationHub__HubName'
          value: notificationHubName
        }
        {
          name: 'AllowedOrigins__0'
          value: frontendOrigin
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
    }
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'api'
  }
}

resource apiSlot 'Microsoft.Web/sites/slots@2023-01-01' = if (enableDeploymentSlots) {
  parent: apiApp
  name: apiSlotName
  location: location
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: apiRuntimeStack
      appCommandLine: apiStartupCommand
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: aspnetEnv
        }
        {
          name: 'App__Port'
          value: apiPort
        }
        {
          name: 'ConnectionStrings__QuietWealthSql'
          value: sqlConnectionString
        }
        {
          name: 'BlobStorage__ConnectionString'
          value: blobStorageConnectionString
        }
        {
          name: 'NotificationHub__ConnectionString'
          value: notificationHubConnectionString
        }
        {
          name: 'Supabase__Url'
          value: supabaseUrl
        }
        {
          name: 'Supabase__ServiceKey'
          value: supabaseServiceKey
        }
        {
          name: 'AllowedOrigins__0'
          value: frontendOrigin
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
    }
  }
}

var functionStorageKey = storage.listKeys().keys[0].value
var functionStorageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${functionStorageKey};EndpointSuffix=core.windows.net'

resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: functionRuntimeStack
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: functionStorageConnectionString
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: functionWorkerRuntime
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
  tags: {
    environment: environment
    project: 'QuietWealth'
    role: 'functions'
  }
}

output frontendUrl string = 'https://${frontendApp.properties.defaultHostName}'
output frontendSlotUrl string = enableDeploymentSlots ? 'https://${frontendAppName}-${frontendSlotName}.azurewebsites.net' : ''
output apiUrl string = 'https://${apiApp.properties.defaultHostName}'
output apiSlotUrl string = enableDeploymentSlots ? 'https://${apiAppName}-${apiSlotName}.azurewebsites.net' : ''
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
