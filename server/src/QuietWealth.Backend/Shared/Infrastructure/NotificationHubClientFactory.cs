using QuietWealth.Bakend.Shared.Configuration;
using Microsoft.Extensions.Options;

namespace QuietWealth.Bakend.Shared.Infrastructure;

public interface INotificationHubClientFactory
{
    string GetHubName();
}

public sealed class NotificationHubClientFactory(IOptions<NotificationHubOptions> options) : INotificationHubClientFactory
{
    public string GetHubName() => options.Value.HubName;
}
