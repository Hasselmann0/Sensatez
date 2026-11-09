using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Domain.Entities;

namespace Sensatez.Application.Mappers;

public static class OwnerMapper
{
    public static Owner ToEntity(this CreateOwnerRequest request) => new()
    {
        FullName = request.FullName.Trim(),
        Document = request.Document.Trim(),
        Email = request.Email.Trim(),
        Phone = request.Phone.Trim(),
        PixKey = request.PixKey?.Trim(),
        BankName = request.BankName?.Trim(),
        BankAgency = request.BankAgency?.Trim(),
        BankAccount = request.BankAccount?.Trim(),
        Notes = request.Notes?.Trim()
    };

    public static OwnerResponse ToResponse(this Owner owner) => new(
        owner.Id,
        owner.FullName,
        owner.Document,
        owner.Email,
        owner.Phone,
        owner.PixKey,
        owner.BankName,
        owner.BankAgency,
        owner.BankAccount,
        owner.Notes,
        owner.Properties?.Count(p => p.IsActive) ?? 0,
        owner.IsActive,
        owner.CreatedAt);
}

