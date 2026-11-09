using Sensatez.Domain.Enums;

namespace Sensatez.Application.DTOs.Requests;

public record CreateLeaseContractRequest(
    Guid PropertyId,
    Guid TenantId,
    DateOnly StartDate,
    DateOnly EndDate,
    int DueDay,
    decimal RentAmount,
    decimal CommissionPercentage = 10.00m,
    decimal SecurityDepositAmount = 0m,
    decimal PenaltyPercentage = 2.00m,
    decimal MonthlyInterestPercentage = 1.00m,
    ReadjustmentIndex ReadjustmentIndex = ReadjustmentIndex.IGPM,
    string? Notes = null);

