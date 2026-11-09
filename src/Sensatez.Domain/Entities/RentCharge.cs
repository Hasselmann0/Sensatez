using Sensatez.Domain.Enums;

namespace Sensatez.Domain.Entities;

public class RentCharge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LeaseContractId { get; set; }
    public int ReferenceYear { get; set; }
    public int ReferenceMonth { get; set; }
    public DateOnly DueDate { get; set; }
    public decimal OriginalAmount { get; set; }
    public decimal PenaltyAmount { get; set; }
    public decimal InterestAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal CommissionPercentage { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetOwnerAmount { get; set; }
    public ChargeStatus Status { get; set; } = ChargeStatus.Pending;
    public DateTime? PaidAt { get; set; }
    public decimal? PaidAmount { get; set; }
    public string? PaymentMethod { get; set; }
    public bool IsTransferredToOwner { get; set; }
    public DateTime? TransferredToOwnerAt { get; set; }
    public string? Notes { get; set; }
    public string? ExternalChargeId { get; set; }
    public string? Barcode { get; set; }
    public string? PixCopyPaste { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public LeaseContract LeaseContract { get; set; } = null!;
}

