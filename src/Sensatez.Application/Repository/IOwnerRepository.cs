using Sensatez.Domain.Entities;

namespace Sensatez.Application.Repository;

public interface IOwnerRepository
{
    Task AddAsync(Owner owner);
    Task<IReadOnlyList<Owner>> GetAllAsync(string? search = null, bool onlyActive = true);
    Task<Owner?> GetByIdAsync(Guid id);
    Task<Owner?> GetByIdForUpdateAsync(Guid id);
    Task<bool> ExistsByDocumentAsync(string document);
    Task<bool> HasActivePropertiesOrContractsAsync(Guid ownerId);
    Task SaveChangesAsync();
}

