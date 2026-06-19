using QuietWealth.Bakend.Domains.DocumentIntake.Models;
using QuietWealth.Bakend.Domains.DocumentIntake.Repositories;
using QuietWealth.Bakend.Shared.Errors;

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
    {
        var duplicateFileNames = request.FileNames
            .GroupBy(fileName => fileName, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault(group => group.Count() > 1);

        if (duplicateFileNames is not null)
        {
            throw new DomainRuleViolationException(
                "Duplicate file names are not allowed within the same upload batch.",
                "document.duplicate_file_name");
        }

        return Task.FromResult(new UploadFilesResponse(Guid.NewGuid(), "Accepted"));
    }
}
