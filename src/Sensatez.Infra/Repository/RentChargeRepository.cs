using Microsoft.EntityFrameworkCore;
using Sensatez.Application.Repository;
using Sensatez.Domain.Entities;
using Sensatez.Domain.Enums;
using Sensatez.Infra.Data;

namespace Sensatez.Infra.Repository;

public class RentChargeRepository(SensatezDbContext context) : IRentChargeRepository
{
    public async Task AddRangeAsync(IEnumerable<RentCharge> charges)
    {
        await context.RentCharges.AddRangeAsync(charges);
        await context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<RentCharge>> GetByMonthAsync(int year, int month) =>
        await context.RentCharges
            .AsNoTracking()
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Property)
                    .ThenInclude(p => p.Owner)
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Tenant)
            .Where(ch =>
                ch.IsActive &&
                ch.ReferenceYear == year &&
                ch.ReferenceMonth == month &&
                ch.Status != ChargeStatus.Cancelled)
            .OrderBy(ch => ch.DueDate)
            .ToListAsync();

    public async Task<IReadOnlyList<RentCharge>> GetByOwnerAndMonthAsync(Guid ownerId, int year, int month) =>
        await context.RentCharges
            .AsNoTracking()
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Property)
                    .ThenInclude(p => p.Owner)
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Tenant)
            .Where(ch =>
                ch.IsActive &&
                ch.ReferenceYear == year &&
                ch.ReferenceMonth == month &&
                ch.Status != ChargeStatus.Cancelled &&
                ch.LeaseContract.Property.OwnerId == ownerId)
            .OrderBy(ch => ch.DueDate)
            .ToListAsync();

    public async Task<IReadOnlyList<RentCharge>> GetOverdueAsync(DateOnly today) =>
        await context.RentCharges
            .AsNoTracking()
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Property)
                    .ThenInclude(p => p.Owner)
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Tenant)
            .Where(ch =>
                ch.IsActive &&
                ch.Status == ChargeStatus.Pending &&
                ch.DueDate < today)
            .OrderBy(ch => ch.DueDate)
            .ToListAsync();

    public async Task<IReadOnlyList<RentCharge>> GetDueSoonAsync(DateOnly today, DateOnly limitDate) =>
        await context.RentCharges
            .AsNoTracking()
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Property)
                    .ThenInclude(p => p.Owner)
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Tenant)
            .Where(ch =>
                ch.IsActive &&
                ch.Status == ChargeStatus.Pending &&
                ch.DueDate >= today &&
                ch.DueDate <= limitDate)
            .OrderBy(ch => ch.DueDate)
            .ToListAsync();

    public async Task<IReadOnlyList<RentCharge>> GetPendingOwnerTransfersAsync() =>
        await context.RentCharges
            .AsNoTracking()
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Property)
                    .ThenInclude(p => p.Owner)
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Tenant)
            .Where(ch =>
                ch.IsActive &&
                ch.Status == ChargeStatus.Paid &&
                !ch.IsTransferredToOwner)
            .OrderBy(ch => ch.PaidAt)
            .ToListAsync();

    public async Task<RentCharge?> GetByIdWithDetailsAsync(Guid id) =>
        await context.RentCharges
            .AsNoTracking()
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Property)
                    .ThenInclude(p => p.Owner)
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Tenant)
            .FirstOrDefaultAsync(ch => ch.Id == id);

    public async Task<RentCharge?> GetByIdForUpdateAsync(Guid id) =>
        await context.RentCharges
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Property)
                    .ThenInclude(p => p.Owner)
            .Include(ch => ch.LeaseContract)
                .ThenInclude(c => c.Tenant)
            .FirstOrDefaultAsync(ch => ch.Id == id);

    public async Task SaveChangesAsync() =>
        await context.SaveChangesAsync();
}

