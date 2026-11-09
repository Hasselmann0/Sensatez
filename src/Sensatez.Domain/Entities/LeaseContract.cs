using Sensatez.Domain.Enums;

namespace Sensatez.Domain.Entities;

public class LeaseContract
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PropertyId { get; set; }
    public Guid TenantId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int DueDay { get; set; } // 1 a 31
    public decimal RentAmount { get; set; }
    public decimal CommissionPercentage { get; set; }
    public decimal SecurityDepositAmount { get; set; }
    public decimal PenaltyPercentage { get; set; } = 2.00m; // Multa padrão 2%
    public decimal MonthlyInterestPercentage { get; set; } = 1.00m; // Juros padrão 1% a.m.
    public ReadjustmentIndex ReadjustmentIndex { get; set; } = ReadjustmentIndex.IGPM;
    public ContractStatus Status { get; set; } = ContractStatus.Active;
    public DateTime? TerminatedAt { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Property Property { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
    public ICollection<RentCharge> Charges { get; set; } = [];
}

