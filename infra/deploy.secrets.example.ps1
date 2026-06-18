# Copy this file to deploy.secrets.ps1 locally and replace every placeholder
# value before running infra/deploy.ps1.

$env:AZURE_SQL_ADMIN_PASSWORD = '<replace-with-sql-admin-password>'
$env:AZURE_SQL_CONNECTION_STRING = 'Server=tcp:<sql-server-name>.database.windows.net,1433;Initial Catalog=<sql-database-name>;Persist Security Info=False;User ID=<sql-admin-user>;Password=<sql-admin-password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
$env:AZURE_BLOB_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=<storage-account-name>;AccountKey=<storage-account-key>;EndpointSuffix=core.windows.net'
$env:AZURE_NOTIFICATION_HUB_CONNECTION_STRING = 'Endpoint=sb://<notification-hub-namespace>.servicebus.windows.net/;SharedAccessKeyName=<policy-name>;SharedAccessKey=<policy-key>'

# Optional app-specific placeholders retained for the current API implementation.
$env:SUPABASE_URL = 'https://<supabase-project>.supabase.co'
$env:SUPABASE_SERVICE_KEY = '<replace-with-supabase-service-key>'
