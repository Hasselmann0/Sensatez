using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Domain.Entities;

namespace Sensatez.Application.Mappers;

public static class PropertyMapper
{
    public static Property ToEntity(this CreatePropertyRequest request) => new()
    {
        OwnerId = request.OwnerId,
        Code = request.Code?.Trim(),
        Street = request.Street.Trim(),
        Number = request.Number.Trim(),
        Complement = request.Complement?.Trim(),
        Neighborhood = request.Neighborhood.Trim(),
        City = request.City.Trim(),
        State = request.State.Trim().ToUpperInvariant(),
        ZipCode = request.ZipCode.Trim(),
        Type = request.Type,
        SuggestedRentAmount = request.SuggestedRentAmount,
        DefaultCommissionPercentage = request.DefaultCommissionPercentage,
        Notes = request.Notes?.Trim()
    };

    public static PropertyResponse ToResponse(this Property property) => new(
        property.Id,
        property.OwnerId,
        property.Owner?.FullName ?? string.Empty,
        property.Code,
        property.Street,
        property.Number,
        property.Complement,
        property.Neighborhood,
        property.City,
        property.State,
        property.ZipCode,
        $"{property.Street}, {property.Number} - {property.Neighborhood}, {property.City}/{property.State}",
        property.Type,
        property.Status,
        property.SuggestedRentAmount,
        property.DefaultCommissionPercentage,
        property.Notes,
        property.IsActive,
        property.CreatedAt);
}

