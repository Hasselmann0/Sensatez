using Sensatez.Domain.Enums;

namespace Sensatez.Application.DTOs.Responses;

public record RentChargeDetailResponse(
    Guid Id,
    Guid LeaseContractId,
    Guid PropertyId,
    string PropertyAddress,
    Guid OwnerId,
    string OwnerName,
    string? OwnerPixKey,
    Guid TenantId,
    string TenantName,
    string TenantPhone,
    int ReferenceYear,
    int ReferenceMonth,
    DateOnly DueDate,
    decimal OriginalAmount,
    decimal PenaltyAmount,
    decimal InterestAmount,
    decimal DiscountAmount,
    decimal TotalAmount,
    decimal SuggestedUpdatedTotalAmount,
    decimal CommissionPercentage,
    decimal CommissionAmount,
    decimal NetOwnerAmount,
    ChargeStatus Status,
    CalendarVisualStatus VisualStatus,
    int DaysOverdue,
    DateTime? PaidAt,
    decimal? PaidAmount,
    string? PaymentMethod,
    bool IsTransferredToOwner,
    DateTime? TransferredToOwnerAt,
    string? Notes,
    DateTime CreatedAt);

