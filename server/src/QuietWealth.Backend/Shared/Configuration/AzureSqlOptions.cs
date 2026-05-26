namespace QuietWealth.Bakend.Shared.Configuration;

public sealed class AzureSqlOptions
{
    public const string SectionName = "AzureSql";

    public string ConnectionString { get; set; } = string.Empty;
}
