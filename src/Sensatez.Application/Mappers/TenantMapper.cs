using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Domain.Entities;

namespace Sensatez.Application.Mappers;

public static class TenantMapper
{
    public static Tenant ToEntity(this CreateTenantRequest request) => new()
    {
        FullName = request.FullName.Trim(),
        Document = request.Document.Trim(),
        Email = request.Email.Trim(),
        Phone = request.Phone.Trim(),
        AdditionalInfo = request.AdditionalInfo?.Trim()
    };

    public static TenantResponse ToResponse(this Tenant tenant) => new(
        tenant.Id,
        tenant.FullName,
        tenant.Document,
        tenant.Email,
        tenant.Phone,
        tenant.AdditionalInfo,
        tenant.IsActive,
        tenant.CreatedAt);
}

