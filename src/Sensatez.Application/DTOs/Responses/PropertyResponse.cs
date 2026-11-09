using Sensatez.Domain.Enums;

namespace Sensatez.Application.DTOs.Responses;

public record PropertyResponse(
    Guid Id,
    Guid OwnerId,
    string OwnerName,
    string? Code,
    string Street,
    string Number,
    string? Complement,
    string Neighborhood,
    string City,
    string State,
    string ZipCode,
    string FullAddress,
    PropertyType Type,
    PropertyStatus Status,
    decimal SuggestedRentAmount,
    decimal DefaultCommissionPercentage,
    string? Notes,
    bool IsActive,
    DateTime CreatedAt);

