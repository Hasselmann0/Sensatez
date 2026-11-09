using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sensatez.Domain.Entities;

namespace Sensatez.Infra.Data.Configurations;

public class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.ToTable("Properties");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .HasMaxLength(30);

        builder.Property(x => x.Street)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Number)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Complement)
            .HasMaxLength(100);

        builder.Property(x => x.Neighborhood)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.State)
            .IsRequired()
            .HasMaxLength(2);

        builder.Property(x => x.ZipCode)
            .IsRequired()
            .HasMaxLength(8);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.SuggestedRentAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.DefaultCommissionPercentage)
            .IsRequired()
            .HasPrecision(5, 2);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.Owner)
            .WithMany(o => o.Properties)
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

