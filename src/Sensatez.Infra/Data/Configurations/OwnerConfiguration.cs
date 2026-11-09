using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sensatez.Domain.Entities;

namespace Sensatez.Infra.Data.Configurations;

public class OwnerConfiguration : IEntityTypeConfiguration<Owner>
{
    public void Configure(EntityTypeBuilder<Owner> builder)
    {
        builder.ToTable("Owners");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FullName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.Document)
            .IsRequired()
            .HasMaxLength(14);

        builder.HasIndex(x => x.Document)
            .IsUnique();

        builder.Property(x => x.Email)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.Phone)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.PixKey)
            .HasMaxLength(150);

        builder.Property(x => x.BankName)
            .HasMaxLength(100);

        builder.Property(x => x.BankAgency)
            .HasMaxLength(20);

        builder.Property(x => x.BankAccount)
            .HasMaxLength(30);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();
    }
}

