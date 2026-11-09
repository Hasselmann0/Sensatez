using Microsoft.EntityFrameworkCore;
using Sensatez.Application.Repository;
using Sensatez.Domain.Entities;
using Sensatez.Infra.Data;

namespace Sensatez.Infra.Repository;

public class UserRepository(SensatezDbContext context) : IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email)
    {
        var normalized = email.Trim().ToLower();
        return await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalized);
    }

    public async Task<bool> AnyAsync() =>
        await context.Users.AsNoTracking().AnyAsync();

    public async Task AddAsync(User user)
    {
        await context.Users.AddAsync(user);
        await context.SaveChangesAsync();
    }
}

