using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;

namespace Sensatez.Application.Services;

public interface IOwnerService
{
    Task<OwnerResponse> CreateAsync(CreateOwnerRequest request);
    Task<IReadOnlyList<OwnerResponse>> GetAllAsync(string? search = null, bool onlyActive = true);
    Task<OwnerResponse> GetByIdAsync(Guid id);
    Task<OwnerResponse> UpdateAsync(Guid id, UpdateOwnerRequest request);
    Task DeactivateAsync(Guid id);
}

