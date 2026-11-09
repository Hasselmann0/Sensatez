using Sensatez.Domain.Entities;

namespace Sensatez.Application.Repository;

public interface ITenantRepository
{
    Task AddAsync(Tenant tenant);
    Task<IReadOnlyList<Tenant>> GetAllAsync(string? search = null, bool onlyActive = true);
    Task<Tenant?> GetByIdAsync(Guid id);
    Task<Tenant?> GetByIdForUpdateAsync(Guid id);
    Task<bool> ExistsByDocumentAsync(string document);
    Task<bool> HasActiveContractAsync(Guid tenantId);
    Task SaveChangesAsync();
}

