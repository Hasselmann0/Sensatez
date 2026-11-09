namespace Sensatez.Application.DTOs.Requests;

public record UpdateTenantRequest(
    string FullName,
    string Email,
    string Phone,
    string? AdditionalInfo = null);

