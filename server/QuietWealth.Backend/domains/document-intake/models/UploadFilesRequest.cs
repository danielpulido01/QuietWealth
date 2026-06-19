using System.ComponentModel.DataAnnotations;
using QuietWealth.Bakend.Shared.Validation;

namespace QuietWealth.Bakend.Domains.DocumentIntake.Models;

public sealed record UploadFilesRequest(
    [NotEmptyGuid] Guid GenerationSessionId,
    [NotEmptyGuid] Guid OwnerUserId,
    [Required]
    [MinLength(1)] IReadOnlyCollection<string> FileNames);
