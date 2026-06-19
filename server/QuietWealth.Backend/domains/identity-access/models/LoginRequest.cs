using System.ComponentModel.DataAnnotations;

namespace QuietWealth.Bakend.Domains.IdentityAccess.Models;

public sealed record LoginRequest(
    [Required(AllowEmptyStrings = false)] string Username,
    [Required(AllowEmptyStrings = false)] string Password,
    [Required(AllowEmptyStrings = false)]
    [StringLength(6, MinimumLength = 6)] string Otp);
