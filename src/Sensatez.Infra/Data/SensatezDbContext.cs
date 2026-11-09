using Microsoft.EntityFrameworkCore;
using Sensatez.Domain.Entities;

namespace Sensatez.Infra.Data;

public class SensatezDbContext : DbContext
{
    public SensatezDbContext(DbContextOptions<SensatezDbContext> options) : base(options)
    {
    }

    public DbSet<Owner> Owners => Set<Owner>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<LeaseContract> LeaseContracts => Set<LeaseContract>();
    public DbSet<RentCharge> RentCharges => Set<RentCharge>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SensatezDbContext).Assembly);
    }
}
