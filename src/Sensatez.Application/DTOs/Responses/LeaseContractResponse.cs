using Sensatez.Domain.Enums;

namespace Sensatez.Application.DTOs.Responses;

public record ContractChargeSummaryResponse(
    Guid Id,
    int ReferenceYear,
    int ReferenceMonth,
    DateOnly DueDate,
    decimal OriginalAmount,
    decimal TotalAmount,
    decimal CommissionAmount,
    decimal NetOwnerAmount,
    ChargeStatus Status,
    DateTime? PaidAt,
    bool IsTransferredToOwner);

public record LeaseContractResponse(
    Guid Id,
    Guid PropertyId,
    string PropertyAddress,
    Guid OwnerId,
    string OwnerName,
    Guid TenantId,
    string TenantName,
    DateOnly StartDate,
    DateOnly EndDate,
    int DueDay,
    decimal RentAmount,
    decimal CommissionPercentage,
    decimal SecurityDepositAmount,
    decimal PenaltyPercentage,
    decimal MonthlyInterestPercentage,
    ReadjustmentIndex ReadjustmentIndex,
    ContractStatus Status,
    DateTime? TerminatedAt,
    string? Notes,
    int TotalChargesCount,
    IReadOnlyList<ContractChargeSummaryResponse> Charges,
    DateTime CreatedAt);

