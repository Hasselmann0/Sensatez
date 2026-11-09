using Sensatez.Domain.Enums;

namespace Sensatez.Application.DTOs.Responses;

public record OwnerStatementItemResponse(
    Guid ChargeId,
    Guid PropertyId,
    string PropertyAddress,
    string TenantName,
    DateOnly DueDate,
    decimal GrossRentAmount,
    decimal CommissionPercentage,
    decimal CommissionAmount,
    decimal NetOwnerAmount,
    ChargeStatus Status,
    DateTime? PaidAt,
    bool IsTransferredToOwner,
    DateTime? TransferredToOwnerAt);

public record OwnerStatementResponse(
    Guid OwnerId,
    string OwnerName,
    string OwnerDocument,
    string? OwnerPixKey,
    string? OwnerBankName,
    string? OwnerBankAgency,
    string? OwnerBankAccount,
    int Year,
    int Month,
    decimal TotalGrossExpected,
    decimal TotalGrossReceived,
    decimal TotalCommissionRetained,
    decimal TotalNetPendingTransfer,
    decimal TotalNetTransferred,
    IReadOnlyList<OwnerStatementItemResponse> Items);

