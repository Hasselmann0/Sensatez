namespace Sensatez.Application.DTOs.Responses;

public record OverdueChargeItemResponse(
    Guid ChargeId,
    Guid LeaseContractId,
    Guid PropertyId,
    string PropertyAddress,
    Guid TenantId,
    string TenantName,
    string TenantPhone,
    string OwnerName,
    int ReferenceYear,
    int ReferenceMonth,
    DateOnly DueDate,
    int DaysOverdue,
    decimal OriginalAmount,
    decimal PenaltyAmount,
    decimal InterestAmount,
    decimal UpdatedTotalAmount,
    string? Notes);

public record OverdueSummaryResponse(
    decimal TotalOriginalOverdueAmount,
    decimal TotalUpdatedOverdueAmount,
    int OverdueChargesCount,
    int OverdueContractsCount,
    IReadOnlyList<OverdueChargeItemResponse> Items);

