using Microsoft.EntityFrameworkCore;

namespace Sensatez.Infra.Data;

public class SensatezDbContext : DbContext
{
    public SensatezDbContext(DbContextOptions<SensatezDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SensatezDbContext).Assembly);
    }
}
