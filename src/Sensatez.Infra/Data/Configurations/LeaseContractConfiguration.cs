using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sensatez.Domain.Entities;

namespace Sensatez.Infra.Data.Configurations;

public class LeaseContractConfiguration : IEntityTypeConfiguration<LeaseContract>
{
    public void Configure(EntityTypeBuilder<LeaseContract> builder)
    {
        builder.ToTable("LeaseContracts");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.StartDate)
            .IsRequired();

        builder.Property(x => x.EndDate)
            .IsRequired();

        builder.Property(x => x.DueDay)
            .IsRequired();

        builder.Property(x => x.RentAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.CommissionPercentage)
            .IsRequired()
            .HasPrecision(5, 2);

        builder.Property(x => x.SecurityDepositAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.PenaltyPercentage)
            .IsRequired()
            .HasPrecision(5, 2);

        builder.Property(x => x.MonthlyInterestPercentage)
            .IsRequired()
            .HasPrecision(5, 2);

        builder.Property(x => x.ReadjustmentIndex)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasIndex(x => x.PropertyId)
            .IsUnique()
            .HasFilter("\"Status\" = 'Active' AND \"IsActive\" = true")
            .HasDatabaseName("IX_LeaseContracts_PropertyId_Active");

        builder.HasOne(x => x.Property)
            .WithMany(p => p.Contracts)
            .HasForeignKey(x => x.PropertyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Tenant)
            .WithMany(t => t.Contracts)
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

