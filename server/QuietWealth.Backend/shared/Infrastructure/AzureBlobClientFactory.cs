using QuietWealth.Bakend.Shared.Configuration;
using Microsoft.Extensions.Options;

namespace QuietWealth.Bakend.Shared.Infrastructure;

public interface IAzureBlobClientFactory
{
    string GetConfiguredConnectionString();
}

public sealed class AzureBlobClientFactory(IOptions<BlobStorageOptions> options) : IAzureBlobClientFactory
{
    public string GetConfiguredConnectionString() => options.Value.ConnectionString;
}
