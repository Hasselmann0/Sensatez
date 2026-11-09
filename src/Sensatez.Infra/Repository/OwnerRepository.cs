using Microsoft.EntityFrameworkCore;
using Sensatez.Application.Repository;
using Sensatez.Domain.Entities;
using Sensatez.Domain.Enums;
using Sensatez.Infra.Data;

namespace Sensatez.Infra.Repository;

public class OwnerRepository(SensatezDbContext context) : IOwnerRepository
{
    public async Task AddAsync(Owner owner)
    {
        await context.Owners.AddAsync(owner);
        await context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<Owner>> GetAllAsync(string? search = null, bool onlyActive = true)
    {
        var query = context.Owners
            .AsNoTracking()
            .Include(o => o.Properties)
            .AsQueryable();

        if (onlyActive)
            query = query.Where(o => o.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(o =>
                o.FullName.ToLower().Contains(term) ||
                o.Document.Contains(term) ||
                o.Email.ToLower().Contains(term));
        }

        return await query
            .OrderBy(o => o.FullName)
            .ToListAsync();
    }

    public async Task<Owner?> GetByIdAsync(Guid id) =>
        await context.Owners
            .AsNoTracking()
            .Include(o => o.Properties)
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<Owner?> GetByIdForUpdateAsync(Guid id) =>
        await context.Owners
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<bool> ExistsByDocumentAsync(string document) =>
        await context.Owners
            .AsNoTracking()
            .AnyAsync(o => o.Document == document);

    public async Task<bool> HasActivePropertiesOrContractsAsync(Guid ownerId) =>
        await context.Properties
            .AsNoTracking()
            .AnyAsync(p => p.OwnerId == ownerId &&
                           (p.IsActive || p.Contracts.Any(c => c.Status == ContractStatus.Active)));

    public async Task SaveChangesAsync() =>
        await context.SaveChangesAsync();
}

