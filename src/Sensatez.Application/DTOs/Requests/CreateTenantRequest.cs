namespace Sensatez.Application.DTOs.Requests;

public record CreateTenantRequest(
    string FullName,
    string Document,
    string Email,
    string Phone,
    string? AdditionalInfo = null);

