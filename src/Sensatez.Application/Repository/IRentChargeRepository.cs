using Sensatez.Domain.Entities;

namespace Sensatez.Application.Repository;

public interface IRentChargeRepository
{
    Task AddRangeAsync(IEnumerable<RentCharge> charges);
    Task<IReadOnlyList<RentCharge>> GetByMonthAsync(int year, int month);
    Task<IReadOnlyList<RentCharge>> GetByOwnerAndMonthAsync(Guid ownerId, int year, int month);
    Task<IReadOnlyList<RentCharge>> GetOverdueAsync(DateOnly today);
    Task<IReadOnlyList<RentCharge>> GetDueSoonAsync(DateOnly today, DateOnly limitDate);
    Task<IReadOnlyList<RentCharge>> GetPendingOwnerTransfersAsync();
    Task<RentCharge?> GetByIdWithDetailsAsync(Guid id);
    Task<RentCharge?> GetByIdForUpdateAsync(Guid id);
    Task SaveChangesAsync();
}

