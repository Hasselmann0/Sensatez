namespace Sensatez.Application.DTOs.Responses;

public record TenantResponse(
    Guid Id,
    string FullName,
    string Document,
    string Email,
    string Phone,
    string? AdditionalInfo,
    bool IsActive,
    DateTime CreatedAt);

