using Microsoft.EntityFrameworkCore;
using Sensatez.Application.Repository;
using Sensatez.Domain.Entities;
using Sensatez.Domain.Enums;
using Sensatez.Infra.Data;

namespace Sensatez.Infra.Repository;

public class TenantRepository(SensatezDbContext context) : ITenantRepository
{
    public async Task AddAsync(Tenant tenant)
    {
        await context.Tenants.AddAsync(tenant);
        await context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<Tenant>> GetAllAsync(string? search = null, bool onlyActive = true)
    {
        var query = context.Tenants
            .AsNoTracking()
            .AsQueryable();

        if (onlyActive)
            query = query.Where(t => t.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(t =>
                t.FullName.ToLower().Contains(term) ||
                t.Document.Contains(term) ||
                t.Email.ToLower().Contains(term));
        }

        return await query
            .OrderBy(t => t.FullName)
            .ToListAsync();
    }

    public async Task<Tenant?> GetByIdAsync(Guid id) =>
        await context.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<Tenant?> GetByIdForUpdateAsync(Guid id) =>
        await context.Tenants
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<bool> ExistsByDocumentAsync(string document) =>
        await context.Tenants
            .AsNoTracking()
            .AnyAsync(t => t.Document == document);

    public async Task<bool> HasActiveContractAsync(Guid tenantId) =>
        await context.LeaseContracts
            .AsNoTracking()
            .AnyAsync(c => c.TenantId == tenantId && c.Status == ContractStatus.Active);

    public async Task SaveChangesAsync() =>
        await context.SaveChangesAsync();
}

