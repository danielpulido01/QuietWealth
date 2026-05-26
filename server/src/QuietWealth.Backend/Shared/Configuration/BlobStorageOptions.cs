namespace QuietWealth.Bakend.Shared.Configuration;

public sealed class BlobStorageOptions
{
    public const string SectionName = "BlobStorage";

    public string ConnectionString { get; set; } = string.Empty;

    public string DocumentsContainer { get; set; } = string.Empty;

    public string TemplatesContainer { get; set; } = string.Empty;

    public string ArtifactsContainer { get; set; } = string.Empty;
}
