using Sensatez.Domain.Enums;

namespace Sensatez.Application.DTOs.Requests;

public record CreatePropertyRequest(
    Guid OwnerId,
    string? Code,
    string Street,
    string Number,
    string? Complement,
    string Neighborhood,
    string City,
    string State,
    string ZipCode,
    PropertyType Type,
    decimal SuggestedRentAmount,
    decimal DefaultCommissionPercentage = 10.00m,
    string? Notes = null);

