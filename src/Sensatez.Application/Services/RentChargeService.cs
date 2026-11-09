using FluentValidation;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Exceptions;
using Sensatez.Application.Mappers;
using Sensatez.Application.Repository;
using Sensatez.Domain.Enums;

namespace Sensatez.Application.Services;

public class RentChargeService(
    IRentChargeRepository chargeRepository,
    IValidator<PayChargeRequest> payValidator) : IRentChargeService
{
    public async Task<CalendarMonthResponse> GetCalendarMonthAsync(int year, int month)
    {
        if (month is < 1 or > 12)
            throw new BusinessRuleException("O mês informado deve estar entre 1 e 12.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var charges = await chargeRepository.GetByMonthAsync(year, month);
        var items = charges.Select(ch => ch.ToCalendarItem(today)).ToList();

        var totalExpected = items.Sum(i => i.UpdatedTotalAmount);
        var totalPaid = items.Where(i => i.Status == ChargeStatus.Paid).Sum(i => i.UpdatedTotalAmount);
        var totalOverdue = items.Where(i => i.VisualStatus == CalendarVisualStatus.Overdue).Sum(i => i.UpdatedTotalAmount);
        var totalCommissionExpected = items.Sum(i => i.CommissionAmount);
        var totalNetOwnerExpected = items.Sum(i => i.NetOwnerAmount);

        return new CalendarMonthResponse(
            year,
            month,
            totalExpected,
            totalPaid,
            totalOverdue,
            totalCommissionExpected,
            totalNetOwnerExpected,
            items.Count,
            items);
    }

    public async Task<RentChargeDetailResponse> GetByIdAsync(Guid id)
    {
        var charge = await chargeRepository.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException("Cobrança de aluguel não encontrada.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return charge.ToDetailResponse(today);
    }

    public async Task<RentChargeDetailResponse> PayChargeAsync(Guid chargeId, PayChargeRequest request)
    {
        await payValidator.ValidateAndThrowAsync(request);

        var charge = await chargeRepository.GetByIdForUpdateAsync(chargeId)
            ?? throw new NotFoundException("Cobrança de aluguel não encontrada.");

        if (charge.Status == ChargeStatus.Paid)
            throw new BusinessRuleException("Este aluguel já consta como pago.");

        if (charge.Status == ChargeStatus.Cancelled)
            throw new BusinessRuleException("Não é possível pagar uma cobrança cancelada.");

        var paidDateTime = request.PaidAt ?? DateTime.UtcNow;
        var referenceDate = DateOnly.FromDateTime(paidDateTime);

        var penalty = request.PenaltyAmount ?? 0m;
        var interest = request.InterestAmount ?? 0m;

        // Se estiver em atraso na data do pagamento e o operador não especificou multa/juros manualmente, usa o calculado
        if (!request.PenaltyAmount.HasValue && !request.InterestAmount.HasValue && referenceDate > charge.DueDate)
        {
            var penaltyPct = charge.LeaseContract?.PenaltyPercentage ?? 2.00m;
            var interestPct = charge.LeaseContract?.MonthlyInterestPercentage ?? 1.00m;
            var (_, calcPenalty, calcInterest, _) = RentCalculator.CalculateOverdueCharges(
                charge.OriginalAmount,
                charge.DueDate,
                referenceDate,
                penaltyPct,
                interestPct,
                request.DiscountAmount);

            penalty = calcPenalty;
            interest = calcInterest;
        }

        var (totalAmount, commissionAmount, netOwnerAmount) = RentCalculator.CalculateSplit(
            charge.OriginalAmount,
            penalty,
            interest,
            request.DiscountAmount,
            charge.CommissionPercentage);

        if (totalAmount < 0)
            throw new BusinessRuleException("O valor total pago após descontos não pode ser negativo.");

        charge.PenaltyAmount = penalty;
        charge.InterestAmount = interest;
        charge.DiscountAmount = request.DiscountAmount;
        charge.TotalAmount = totalAmount;
        charge.CommissionAmount = commissionAmount;
        charge.NetOwnerAmount = netOwnerAmount;
        charge.Status = ChargeStatus.Paid;
        charge.PaidAt = paidDateTime;
        charge.PaidAmount = totalAmount;
        charge.PaymentMethod = request.PaymentMethod.Trim();

        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            charge.Notes = string.IsNullOrWhiteSpace(charge.Notes)
                ? request.Notes.Trim()
                : $"{charge.Notes} | {request.Notes.Trim()}";
        }

        await chargeRepository.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return charge.ToDetailResponse(today);
    }

    public async Task<RentChargeDetailResponse> MarkAsTransferredToOwnerAsync(Guid chargeId, TransferToOwnerRequest request)
    {
        var charge = await chargeRepository.GetByIdForUpdateAsync(chargeId)
            ?? throw new NotFoundException("Cobrança de aluguel não encontrada.");

        if (charge.Status != ChargeStatus.Paid)
            throw new BusinessRuleException("Não é possível registrar o repasse ao proprietário de um aluguel que ainda não foi pago pelo inquilino.");

        if (charge.IsTransferredToOwner)
            throw new BusinessRuleException("O repasse ao proprietário para esta cobrança já foi registrado anteriormente.");

        charge.IsTransferredToOwner = true;
        charge.TransferredToOwnerAt = request.TransferredAt ?? DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            charge.Notes = string.IsNullOrWhiteSpace(charge.Notes)
                ? $"[Repasse]: {request.Notes.Trim()}"
                : $"{charge.Notes} | [Repasse]: {request.Notes.Trim()}";
        }

        await chargeRepository.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return charge.ToDetailResponse(today);
    }

    public async Task<OverdueSummaryResponse> GetOverdueChargesAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var overdueCharges = await chargeRepository.GetOverdueAsync(today);

        var items = overdueCharges.Select(ch =>
        {
            var contract = ch.LeaseContract;
            var property = contract?.Property;
            var address = property != null
                ? $"{property.Street}, {property.Number} - {property.Neighborhood}, {property.City}/{property.State}"
                : string.Empty;

            var penaltyPct = contract?.PenaltyPercentage ?? 2.00m;
            var interestPct = contract?.MonthlyInterestPercentage ?? 1.00m;

            var (daysOverdue, penalty, interest, updatedTotal) = RentCalculator.CalculateOverdueCharges(
                ch.OriginalAmount,
                ch.DueDate,
                today,
                penaltyPct,
                interestPct,
                ch.DiscountAmount);

            return new OverdueChargeItemResponse(
                ch.Id,
                ch.LeaseContractId,
                property?.Id ?? Guid.Empty,
                address,
                contract?.TenantId ?? Guid.Empty,
                contract?.Tenant?.FullName ?? string.Empty,
                contract?.Tenant?.Phone ?? string.Empty,
                property?.Owner?.FullName ?? string.Empty,
                ch.ReferenceYear,
                ch.ReferenceMonth,
                ch.DueDate,
                daysOverdue,
                ch.OriginalAmount,
                penalty,
                interest,
                updatedTotal,
                ch.Notes);
        })
        .OrderByDescending(i => i.DaysOverdue)
        .ToList();

        return new OverdueSummaryResponse(
            items.Sum(i => i.OriginalAmount),
            items.Sum(i => i.UpdatedTotalAmount),
            items.Count,
            items.Select(i => i.LeaseContractId).Distinct().Count(),
            items);
    }

    public async Task<RentChargeDetailResponse> UpdateNotesAsync(Guid chargeId, UpdateChargeNotesRequest request)
    {
        var charge = await chargeRepository.GetByIdForUpdateAsync(chargeId)
            ?? throw new NotFoundException("Cobrança de aluguel não encontrada.");

        charge.Notes = request.Notes?.Trim();
        await chargeRepository.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return charge.ToDetailResponse(today);
    }
}

