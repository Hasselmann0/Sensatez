namespace Sensatez.Application.DTOs.Responses;

public record ChargeAlertItemResponse(
    Guid ChargeId,
    Guid LeaseContractId,
    string PropertyAddress,
    string TenantName,
    string OwnerName,
    DateOnly DueDate,
    decimal Amount,
    int DaysDifference);

public record ContractAlertItemResponse(
    Guid LeaseContractId,
    Guid PropertyId,
    string PropertyAddress,
    string TenantName,
    string OwnerName,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal CurrentRentAmount,
    int DaysUntilEnd,
    int MonthsActive);

public record AlertsResponse(
    IReadOnlyList<ChargeAlertItemResponse> DueSoonCharges,
    IReadOnlyList<ChargeAlertItemResponse> OverdueCharges,
    IReadOnlyList<ChargeAlertItemResponse> PendingOwnerTransfers,
    IReadOnlyList<ContractAlertItemResponse> ExpiringContracts,
    IReadOnlyList<ContractAlertItemResponse> ReadjustmentEligibleContracts);

