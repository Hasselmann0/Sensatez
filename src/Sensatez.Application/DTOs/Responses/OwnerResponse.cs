namespace Sensatez.Application.DTOs.Responses;

public record OwnerResponse(
    Guid Id,
    string FullName,
    string Document,
    string Email,
    string Phone,
    string? PixKey,
    string? BankName,
    string? BankAgency,
    string? BankAccount,
    string? Notes,
    int PropertiesCount,
    bool IsActive,
    DateTime CreatedAt);

