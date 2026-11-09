using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Services;
using Sensatez.Domain.Entities;
using Sensatez.Domain.Enums;

namespace Sensatez.Application.Mappers;

public static class RentChargeMapper
{
    public static CalendarChargeItemResponse ToCalendarItem(this RentCharge charge, DateOnly today)
    {
        var contract = charge.LeaseContract;
        var property = contract?.Property;
        var address = property != null
            ? $"{property.Street}, {property.Number} - {property.Neighborhood}, {property.City}/{property.State}"
            : string.Empty;

        var visualStatus = RentCalculator.GetCalendarVisualStatus(charge.Status, charge.DueDate, today);

        var daysOverdue = 0;
        var updatedTotal = charge.TotalAmount;
        var netOwnerAmount = charge.NetOwnerAmount;

        if (charge.Status == ChargeStatus.Pending && charge.DueDate < today)
        {
            var penaltyPct = contract?.PenaltyPercentage ?? 2.00m;
            var interestPct = contract?.MonthlyInterestPercentage ?? 1.00m;
            var (overdueDays, penalty, interest, _) = RentCalculator.CalculateOverdueCharges(
                charge.OriginalAmount,
                charge.DueDate,
                today,
                penaltyPct,
                interestPct,
                charge.DiscountAmount);

            daysOverdue = overdueDays;
            var (splitTotal, _, splitNetOwner) = RentCalculator.CalculateSplit(
                charge.OriginalAmount,
                penalty,
                interest,
                charge.DiscountAmount,
                charge.CommissionPercentage);

            updatedTotal = splitTotal;
            netOwnerAmount = splitNetOwner;
        }

        return new CalendarChargeItemResponse(
            charge.Id,
            charge.LeaseContractId,
            property?.Id ?? Guid.Empty,
            address,
            contract?.Tenant?.FullName ?? string.Empty,
            property?.Owner?.FullName ?? string.Empty,
            charge.DueDate,
            charge.OriginalAmount,
            updatedTotal,
            charge.CommissionPercentage,
            charge.CommissionAmount,
            netOwnerAmount,
            charge.Status,
            visualStatus,
            daysOverdue,
            charge.IsTransferredToOwner);
    }

    public static RentChargeDetailResponse ToDetailResponse(this RentCharge charge, DateOnly today)
    {
        var contract = charge.LeaseContract;
        var property = contract?.Property;
        var owner = property?.Owner;
        var tenant = contract?.Tenant;

        var address = property != null
            ? $"{property.Street}, {property.Number} - {property.Neighborhood}, {property.City}/{property.State}"
            : string.Empty;

        var visualStatus = RentCalculator.GetCalendarVisualStatus(charge.Status, charge.DueDate, today);

        var daysOverdue = 0;
        var penalty = charge.PenaltyAmount;
        var interest = charge.InterestAmount;
        var suggestedTotal = charge.TotalAmount;

        if (charge.Status == ChargeStatus.Pending && charge.DueDate < today)
        {
            var penaltyPct = contract?.PenaltyPercentage ?? 2.00m;
            var interestPct = contract?.MonthlyInterestPercentage ?? 1.00m;
            (daysOverdue, penalty, interest, suggestedTotal) = RentCalculator.CalculateOverdueCharges(
                charge.OriginalAmount,
                charge.DueDate,
                today,
                penaltyPct,
                interestPct,
                charge.DiscountAmount);
        }

        return new RentChargeDetailResponse(
            charge.Id,
            charge.LeaseContractId,
            property?.Id ?? Guid.Empty,
            address,
            owner?.Id ?? Guid.Empty,
            owner?.FullName ?? string.Empty,
            owner?.PixKey,
            tenant?.Id ?? Guid.Empty,
            tenant?.FullName ?? string.Empty,
            tenant?.Phone ?? string.Empty,
            charge.ReferenceYear,
            charge.ReferenceMonth,
            charge.DueDate,
            charge.OriginalAmount,
            penalty,
            interest,
            charge.DiscountAmount,
            charge.TotalAmount,
            suggestedTotal,
            charge.CommissionPercentage,
            charge.CommissionAmount,
            charge.NetOwnerAmount,
            charge.Status,
            visualStatus,
            daysOverdue,
            charge.PaidAt,
            charge.PaidAmount,
            charge.PaymentMethod,
            charge.IsTransferredToOwner,
            charge.TransferredToOwnerAt,
            charge.Notes,
            charge.CreatedAt);
    }
}

