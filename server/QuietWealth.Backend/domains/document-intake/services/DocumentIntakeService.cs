using QuietWealth.Bakend.Domains.DocumentIntake.Models;
using QuietWealth.Bakend.Domains.DocumentIntake.Repositories;

namespace QuietWealth.Bakend.Domains.DocumentIntake.Services;

public sealed class DocumentIntakeService(IDocumentBatchRepository documentBatchRepository) : IDocumentIntakeService
{
    public Task<DeleteFileResponse> DeleteAsync(Guid sourceDocumentId, CancellationToken cancellationToken = default)
        => Task.FromResult(new DeleteFileResponse(sourceDocumentId, "Deleted"));

    public async Task<FilesReadResponse> ReadAsync(CancellationToken cancellationToken = default)
    {
        var batches = await documentBatchRepository.ListAsync(cancellationToken);
        return new FilesReadResponse(batches);
    }

    public Task<UploadFilesResponse> UploadAsync(UploadFilesRequest request, CancellationToken cancellationToken = default)
        => Task.FromResult(new UploadFilesResponse(Guid.NewGuid(), "Accepted"));
}
