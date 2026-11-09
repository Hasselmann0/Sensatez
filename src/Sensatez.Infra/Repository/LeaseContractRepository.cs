using Microsoft.EntityFrameworkCore;
using Sensatez.Application.Repository;
using Sensatez.Domain.Entities;
using Sensatez.Domain.Enums;
using Sensatez.Infra.Data;

namespace Sensatez.Infra.Repository;

public class LeaseContractRepository(SensatezDbContext context) : ILeaseContractRepository
{
    public async Task AddAsync(LeaseContract contract)
    {
        await context.LeaseContracts.AddAsync(contract);
        await context.SaveChangesAsync();
    }

    public async Task<bool> HasActiveContractForPropertyAsync(Guid propertyId) =>
        await context.LeaseContracts
            .AsNoTracking()
            .AnyAsync(c => c.PropertyId == propertyId && c.Status == ContractStatus.Active);

    public async Task<LeaseContract?> GetByIdWithDetailsAsync(Guid id) =>
        await context.LeaseContracts
            .AsNoTracking()
            .Include(c => c.Property)
                .ThenInclude(p => p.Owner)
            .Include(c => c.Tenant)
            .Include(c => c.Charges.OrderBy(ch => ch.DueDate))
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<LeaseContract?> GetByIdForUpdateAsync(Guid id) =>
        await context.LeaseContracts
            .Include(c => c.Property)
                .ThenInclude(p => p.Owner)
            .Include(c => c.Tenant)
            .Include(c => c.Charges)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IReadOnlyList<LeaseContract>> GetAllAsync(
        ContractStatus? status = null,
        Guid? propertyId = null,
        Guid? tenantId = null,
        int? expiringWithinDays = null)
    {
        var query = context.LeaseContracts
            .AsNoTracking()
            .Include(c => c.Property)
                .ThenInclude(p => p.Owner)
            .Include(c => c.Tenant)
            .Include(c => c.Charges)
            .Where(c => c.IsActive);

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        if (propertyId.HasValue)
            query = query.Where(c => c.PropertyId == propertyId.Value);

        if (tenantId.HasValue)
            query = query.Where(c => c.TenantId == tenantId.Value);

        if (expiringWithinDays.HasValue)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var limitDate = today.AddDays(expiringWithinDays.Value);
            query = query.Where(c =>
                c.Status == ContractStatus.Active &&
                c.EndDate >= today &&
                c.EndDate <= limitDate);
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task SaveChangesAsync() =>
        await context.SaveChangesAsync();
}

