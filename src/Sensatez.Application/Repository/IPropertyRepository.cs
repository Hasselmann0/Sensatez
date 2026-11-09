using Sensatez.Domain.Entities;
using Sensatez.Domain.Enums;

namespace Sensatez.Application.Repository;

public interface IPropertyRepository
{
    Task AddAsync(Property property);
    Task<IReadOnlyList<Property>> GetAllAsync(PropertyStatus? status = null, Guid? ownerId = null, string? search = null);
    Task<Property?> GetByIdAsync(Guid id);
    Task<Property?> GetByIdForUpdateAsync(Guid id);
    Task SaveChangesAsync();
}

