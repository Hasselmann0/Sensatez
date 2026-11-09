using Microsoft.EntityFrameworkCore;
using Sensatez.Application.Repository;
using Sensatez.Domain.Entities;
using Sensatez.Domain.Enums;
using Sensatez.Infra.Data;

namespace Sensatez.Infra.Repository;

public class PropertyRepository(SensatezDbContext context) : IPropertyRepository
{
    public async Task AddAsync(Property property)
    {
        await context.Properties.AddAsync(property);
        await context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<Property>> GetAllAsync(
        PropertyStatus? status = null,
        Guid? ownerId = null,
        string? search = null)
    {
        var query = context.Properties
            .AsNoTracking()
            .Include(p => p.Owner)
            .Where(p => p.IsActive);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (ownerId.HasValue)
            query = query.Where(p => p.OwnerId == ownerId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p =>
                p.Street.ToLower().Contains(term) ||
                p.Neighborhood.ToLower().Contains(term) ||
                p.City.ToLower().Contains(term) ||
                (p.Code != null && p.Code.ToLower().Contains(term)));
        }

        return await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Property?> GetByIdAsync(Guid id) =>
        await context.Properties
            .AsNoTracking()
            .Include(p => p.Owner)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Property?> GetByIdForUpdateAsync(Guid id) =>
        await context.Properties
            .Include(p => p.Owner)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task SaveChangesAsync() =>
        await context.SaveChangesAsync();
}

