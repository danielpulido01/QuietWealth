namespace QuietWealth.Bakend.Shared.Configuration;

public sealed class NotificationHubOptions
{
    public const string SectionName = "NotificationHub";

    public string ConnectionString { get; set; } = string.Empty;

    public string HubName { get; set; } = string.Empty;
}
