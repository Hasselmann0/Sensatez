using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Domain.Enums;

namespace Sensatez.Application.Services;

public interface IPropertyService
{
    Task<PropertyResponse> CreateAsync(CreatePropertyRequest request);
    Task<IReadOnlyList<PropertyResponse>> GetAllAsync(PropertyStatus? status = null, Guid? ownerId = null, string? search = null);
    Task<PropertyResponse> GetByIdAsync(Guid id);
    Task<PropertyResponse> UpdateAsync(Guid id, UpdatePropertyRequest request);
    Task<PropertyResponse> UpdateStatusAsync(Guid id, UpdatePropertyStatusRequest request);
}

