using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Exceptions;
using Sensatez.Application.Mappers;
using Sensatez.Application.Repository;
using Sensatez.Domain.Enums;

namespace Sensatez.Application.Services;

public class DashboardService(
    IRentChargeRepository chargeRepository,
    IPropertyRepository propertyRepository,
    IOwnerRepository ownerRepository,
    ILeaseContractRepository contractRepository) : IDashboardService
{
    public async Task<MonthlyDashboardResponse> GetMonthlySummaryAsync(int year, int month)
    {
        if (month is < 1 or > 12)
            throw new BusinessRuleException("O mês informado deve estar entre 1 e 12.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthCharges = await chargeRepository.GetByMonthAsync(year, month);
        var items = monthCharges.Select(ch => ch.ToCalendarItem(today)).ToList();

        var allOverdueCharges = await chargeRepository.GetOverdueAsync(today);
        var totalAccumulatedOverdue = allOverdueCharges.Sum(ch =>
        {
            var penaltyPct = ch.LeaseContract?.PenaltyPercentage ?? 2.00m;
            var interestPct = ch.LeaseContract?.MonthlyInterestPercentage ?? 1.00m;
            var (_, _, _, updatedTotal) = RentCalculator.CalculateOverdueCharges(
                ch.OriginalAmount,
                ch.DueDate,
                today,
                penaltyPct,
                interestPct,
                ch.DiscountAmount);
            return updatedTotal;
        });

        var allProperties = await propertyRepository.GetAllAsync();

        var totalExpectedRent = items.Sum(i => i.UpdatedTotalAmount);
        var totalReceivedRent = items.Where(i => i.Status == ChargeStatus.Paid).Sum(i => i.UpdatedTotalAmount);
        var totalPendingRent = items.Where(i => i.Status == ChargeStatus.Pending).Sum(i => i.UpdatedTotalAmount);
        var totalOverdueInMonth = items.Where(i => i.VisualStatus == CalendarVisualStatus.Overdue).Sum(i => i.UpdatedTotalAmount);

        var expectedCommission = items.Sum(i => i.CommissionAmount);
        var realizedCommission = items.Where(i => i.Status == ChargeStatus.Paid).Sum(i => i.CommissionAmount);

        var netOwnerPendingTransfer = items
            .Where(i => i.Status == ChargeStatus.Paid && !i.IsTransferredToOwner)
            .Sum(i => i.NetOwnerAmount);
        var netOwnerTransferred = items
            .Where(i => i.Status == ChargeStatus.Paid && i.IsTransferredToOwner)
            .Sum(i => i.NetOwnerAmount);

        return new MonthlyDashboardResponse(
            year,
            month,
            totalExpectedRent,
            totalReceivedRent,
            totalPendingRent,
            totalOverdueInMonth,
            totalAccumulatedOverdue,
            expectedCommission,
            realizedCommission,
            netOwnerPendingTransfer,
            netOwnerTransferred,
            allProperties.Count,
            allProperties.Count(p => p.Status == PropertyStatus.Rented),
            allProperties.Count(p => p.Status == PropertyStatus.Available),
            allProperties.Count(p => p.Status == PropertyStatus.Maintenance));
    }

    public async Task<OwnerStatementResponse> GetOwnerStatementAsync(Guid ownerId, int year, int month)
    {
        if (month is < 1 or > 12)
            throw new BusinessRuleException("O mês informado deve estar entre 1 e 12.");

        var owner = await ownerRepository.GetByIdAsync(ownerId)
            ?? throw new NotFoundException("Proprietário não encontrado.");

        var charges = await chargeRepository.GetByOwnerAndMonthAsync(ownerId, year, month);

        var items = charges.Select(ch =>
        {
            var property = ch.LeaseContract?.Property;
            var address = property != null
                ? $"{property.Street}, {property.Number} - {property.Neighborhood}, {property.City}/{property.State}"
                : string.Empty;

            return new OwnerStatementItemResponse(
                ch.Id,
                property?.Id ?? Guid.Empty,
                address,
                ch.LeaseContract?.Tenant?.FullName ?? string.Empty,
                ch.DueDate,
                ch.TotalAmount,
                ch.CommissionPercentage,
                ch.CommissionAmount,
                ch.NetOwnerAmount,
                ch.Status,
                ch.PaidAt,
                ch.IsTransferredToOwner,
                ch.TransferredToOwnerAt);
        }).ToList();

        var totalGrossExpected = items.Sum(i => i.GrossRentAmount);
        var totalGrossReceived = items.Where(i => i.Status == ChargeStatus.Paid).Sum(i => i.GrossRentAmount);
        var totalCommissionRetained = items.Where(i => i.Status == ChargeStatus.Paid).Sum(i => i.CommissionAmount);
        var totalNetPendingTransfer = items.Where(i => i.Status == ChargeStatus.Paid && !i.IsTransferredToOwner).Sum(i => i.NetOwnerAmount);
        var totalNetTransferred = items.Where(i => i.Status == ChargeStatus.Paid && i.IsTransferredToOwner).Sum(i => i.NetOwnerAmount);

        return new OwnerStatementResponse(
            owner.Id,
            owner.FullName,
            owner.Document,
            owner.PixKey,
            owner.BankName,
            owner.BankAgency,
            owner.BankAccount,
            year,
            month,
            totalGrossExpected,
            totalGrossReceived,
            totalCommissionRetained,
            totalNetPendingTransfer,
            totalNetTransferred,
            items);
    }

    public async Task<AlertsResponse> GetAlertsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dueSoonLimit = today.AddDays(5);

        var dueSoonCharges = await chargeRepository.GetDueSoonAsync(today, dueSoonLimit);
        var overdueCharges = await chargeRepository.GetOverdueAsync(today);
        var pendingTransfers = await chargeRepository.GetPendingOwnerTransfersAsync();
        var activeContracts = await contractRepository.GetAllAsync(status: ContractStatus.Active);

        var dueSoonItems = dueSoonCharges.Select(ch =>
        {
            var property = ch.LeaseContract?.Property;
            var address = property != null
                ? $"{property.Street}, {property.Number} - {property.Neighborhood}, {property.City}/{property.State}"
                : string.Empty;

            return new ChargeAlertItemResponse(
                ch.Id,
                ch.LeaseContractId,
                address,
                ch.LeaseContract?.Tenant?.FullName ?? string.Empty,
                property?.Owner?.FullName ?? string.Empty,
                ch.DueDate,
                ch.TotalAmount,
                ch.DueDate.DayNumber - today.DayNumber);
        }).ToList();

        var overdueItems = overdueCharges.Select(ch =>
        {
            var contract = ch.LeaseContract;
            var property = contract?.Property;
            var address = property != null
                ? $"{property.Street}, {property.Number} - {property.Neighborhood}, {property.City}/{property.State}"
                : string.Empty;

            var (daysOverdue, _, _, updatedTotal) = RentCalculator.CalculateOverdueCharges(
                ch.OriginalAmount,
                ch.DueDate,
                today,
                contract?.PenaltyPercentage ?? 2.00m,
                contract?.MonthlyInterestPercentage ?? 1.00m,
                ch.DiscountAmount);

            return new ChargeAlertItemResponse(
                ch.Id,
                ch.LeaseContractId,
                address,
                contract?.Tenant?.FullName ?? string.Empty,
                property?.Owner?.FullName ?? string.Empty,
                ch.DueDate,
                updatedTotal,
                daysOverdue);
        }).ToList();

        var pendingTransferItems = pendingTransfers.Select(ch =>
        {
            var property = ch.LeaseContract?.Property;
            var address = property != null
                ? $"{property.Street}, {property.Number} - {property.Neighborhood}, {property.City}/{property.State}"
                : string.Empty;

            var paidDate = ch.PaidAt.HasValue ? DateOnly.FromDateTime(ch.PaidAt.Value) : today;

            return new ChargeAlertItemResponse(
                ch.Id,
                ch.LeaseContractId,
                address,
                ch.LeaseContract?.Tenant?.FullName ?? string.Empty,
                property?.Owner?.FullName ?? string.Empty,
                ch.DueDate,
                ch.NetOwnerAmount,
                today.DayNumber - paidDate.DayNumber);
        }).ToList();

        var expiringLimit = today.AddDays(45);
        var expiringContracts = activeContracts
            .Where(c => c.EndDate >= today && c.EndDate <= expiringLimit)
            .Select(c =>
            {
                var property = c.Property;
                var address = property != null
                    ? $"{property.Street}, {property.Number} - {property.Neighborhood}, {property.City}/{property.State}"
                    : string.Empty;

                var monthsActive = ((today.Year - c.StartDate.Year) * 12) + today.Month - c.StartDate.Month;

                return new ContractAlertItemResponse(
                    c.Id,
                    c.PropertyId,
                    address,
                    c.Tenant?.FullName ?? string.Empty,
                    property?.Owner?.FullName ?? string.Empty,
                    c.StartDate,
                    c.EndDate,
                    c.RentAmount,
                    c.EndDate.DayNumber - today.DayNumber,
                    monthsActive);
            })
            .OrderBy(c => c.DaysUntilEnd)
            .ToList();

        var readjustmentEligible = activeContracts
            .Select(c =>
            {
                var property = c.Property;
                var address = property != null
                    ? $"{property.Street}, {property.Number} - {property.Neighborhood}, {property.City}/{property.State}"
                    : string.Empty;

                var monthsActive = ((today.Year - c.StartDate.Year) * 12) + today.Month - c.StartDate.Month;

                return new ContractAlertItemResponse(
                    c.Id,
                    c.PropertyId,
                    address,
                    c.Tenant?.FullName ?? string.Empty,
                    property?.Owner?.FullName ?? string.Empty,
                    c.StartDate,
                    c.EndDate,
                    c.RentAmount,
                    c.EndDate.DayNumber - today.DayNumber,
                    monthsActive);
            })
            .Where(c => c.MonthsActive >= 12 && c.MonthsActive % 12 == 0)
            .ToList();

        return new AlertsResponse(
            dueSoonItems,
            overdueItems,
            pendingTransferItems,
            expiringContracts,
            readjustmentEligible);
    }
}

