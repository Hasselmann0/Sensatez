using Sensatez.Domain.Entities;
using Sensatez.Domain.Enums;

namespace Sensatez.Application.Repository;

public interface ILeaseContractRepository
{
    Task AddAsync(LeaseContract contract);
    Task<bool> HasActiveContractForPropertyAsync(Guid propertyId);
    Task<LeaseContract?> GetByIdWithDetailsAsync(Guid id);
    Task<LeaseContract?> GetByIdForUpdateAsync(Guid id);
    Task<IReadOnlyList<LeaseContract>> GetAllAsync(
        ContractStatus? status = null,
        Guid? propertyId = null,
        Guid? tenantId = null,
        int? expiringWithinDays = null);
    Task SaveChangesAsync();
}

