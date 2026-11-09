using Sensatez.Domain.Enums;

namespace Sensatez.Application.DTOs.Responses;

public record CalendarChargeItemResponse(
    Guid ChargeId,
    Guid LeaseContractId,
    Guid PropertyId,
    string PropertyAddress,
    string TenantName,
    string OwnerName,
    DateOnly DueDate,
    decimal OriginalAmount,
    decimal UpdatedTotalAmount,
    decimal CommissionPercentage,
    decimal CommissionAmount,
    decimal NetOwnerAmount,
    ChargeStatus Status,
    CalendarVisualStatus VisualStatus,
    int DaysOverdue,
    bool IsTransferredToOwner);

