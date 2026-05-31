using QuietWealth.Bakend.Domains.DocumentIntake.Models;

namespace QuietWealth.Bakend.Domains.DocumentIntake.Services;

public interface IDocumentIntakeService
{
    Task<FilesReadResponse> ReadAsync(CancellationToken cancellationToken = default);

    Task<UploadFilesResponse> UploadAsync(UploadFilesRequest request, CancellationToken cancellationToken = default);

    Task<DeleteFileResponse> DeleteAsync(Guid sourceDocumentId, CancellationToken cancellationToken = default);
}
