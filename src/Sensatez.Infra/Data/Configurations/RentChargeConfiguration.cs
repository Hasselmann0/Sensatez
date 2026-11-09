using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sensatez.Domain.Entities;

namespace Sensatez.Infra.Data.Configurations;

public class RentChargeConfiguration : IEntityTypeConfiguration<RentCharge>
{
    public void Configure(EntityTypeBuilder<RentCharge> builder)
    {
        builder.ToTable("RentCharges");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ReferenceYear)
            .IsRequired();

        builder.Property(x => x.ReferenceMonth)
            .IsRequired();

        builder.Property(x => x.DueDate)
            .IsRequired();

        builder.Property(x => x.OriginalAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.PenaltyAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.InterestAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.DiscountAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.CommissionPercentage)
            .IsRequired()
            .HasPrecision(5, 2);

        builder.Property(x => x.CommissionAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.NetOwnerAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.PaidAmount)
            .HasPrecision(18, 2);

        builder.Property(x => x.PaymentMethod)
            .HasMaxLength(30);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.Property(x => x.ExternalChargeId)
            .HasMaxLength(100);

        builder.Property(x => x.Barcode)
            .HasMaxLength(100);

        builder.Property(x => x.PixCopyPaste)
            .HasMaxLength(500);

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasIndex(x => new { x.ReferenceYear, x.ReferenceMonth, x.Status });

        builder.HasOne(x => x.LeaseContract)
            .WithMany(c => c.Charges)
            .HasForeignKey(x => x.LeaseContractId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

