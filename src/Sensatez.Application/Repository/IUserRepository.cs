using Sensatez.Domain.Entities;

namespace Sensatez.Application.Repository;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> AnyAsync();
    Task AddAsync(User user);
}

