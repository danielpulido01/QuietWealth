using QuietWealth.Bakend.Domains.DocumentIntake.Models;
using QuietWealth.Bakend.Domains.DocumentIntake.Repositories;

namespace QuietWealth.Bakend.Domains.DocumentIntake.Services;

public sealed class DocumentIntakeService(IDocumentBatchRepository documentBatchRepository) : IDocumentIntakeService
{
    public Task<DeleteFileResponse> DeleteAsync(Guid sourceDocumentId, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public async Task<FilesReadResponse> ReadAsync(CancellationToken cancellationToken = default)
    {
        var batches = await documentBatchRepository.ListAsync(cancellationToken);
        return new FilesReadResponse(batches);
    }

    public Task<UploadFilesResponse> UploadAsync(UploadFilesRequest request, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
