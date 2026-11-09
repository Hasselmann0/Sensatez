using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;

namespace Sensatez.Application.Services;

public interface ITenantService
{
    Task<TenantResponse> CreateAsync(CreateTenantRequest request);
    Task<IReadOnlyList<TenantResponse>> GetAllAsync(string? search = null, bool onlyActive = true);
    Task<TenantResponse> GetByIdAsync(Guid id);
    Task<TenantResponse> UpdateAsync(Guid id, UpdateTenantRequest request);
    Task DeactivateAsync(Guid id);
}

