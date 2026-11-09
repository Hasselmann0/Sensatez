using Sensatez.Domain.Enums;

namespace Sensatez.Application.Services;

public static class RentCalculator
{
    // RN01: Calcula comissão da imobiliária sobre o valor base
    public static decimal CalculateCommission(decimal baseAmount, decimal commissionPercentage) =>
        Math.Round(baseAmount * (commissionPercentage / 100m), 2, MidpointRounding.AwayFromZero);

    // RN01: Calcula valor total da cobrança e líquido do proprietário
    public static (decimal TotalAmount, decimal CommissionAmount, decimal NetOwnerAmount) CalculateSplit(
        decimal originalAmount,
        decimal penaltyAmount,
        decimal interestAmount,
        decimal discountAmount,
        decimal commissionPercentage)
    {
        var totalAmount = originalAmount + penaltyAmount + interestAmount - discountAmount;
        var commissionAmount = CalculateCommission(originalAmount, commissionPercentage);
        var netOwnerAmount = totalAmount - commissionAmount;
        return (totalAmount, commissionAmount, netOwnerAmount);
    }

    // RN04.3: Ajusta o dia de vencimento para meses mais curtos (ex: dia 31 em fevereiro vira 28 ou 29)
    public static DateOnly CalculateDueDate(int year, int month, int preferredDueDay)
    {
        var maxDaysInMonth = DateTime.DaysInMonth(year, month);
        var actualDay = Math.Min(preferredDueDay, maxDaysInMonth);
        return new DateOnly(year, month, actualDay);
    }

    // RN03: Calcula dias em atraso, multa e juros pro rata die na data de referência
    public static (int DaysOverdue, decimal PenaltyAmount, decimal InterestAmount, decimal UpdatedTotalAmount) CalculateOverdueCharges(
        decimal originalAmount,
        DateOnly dueDate,
        DateOnly referenceDate,
        decimal penaltyPercentage,
        decimal monthlyInterestPercentage,
        decimal discountAmount = 0m)
    {
        if (referenceDate <= dueDate)
            return (0, 0m, 0m, originalAmount - discountAmount);

        var daysOverdue = referenceDate.DayNumber - dueDate.DayNumber;
        var penalty = Math.Round(originalAmount * (penaltyPercentage / 100m), 2, MidpointRounding.AwayFromZero);
        var dailyInterestRate = (monthlyInterestPercentage / 30m) / 100m;
        var interest = Math.Round(originalAmount * dailyInterestRate * daysOverdue, 2, MidpointRounding.AwayFromZero);
        var updatedTotal = originalAmount + penalty + interest - discountAmount;

        return (daysOverdue, penalty, interest, updatedTotal);
    }

    // RN02: Semáforo de cores do Calendário Financeiro
    public static CalendarVisualStatus GetCalendarVisualStatus(ChargeStatus status, DateOnly dueDate, DateOnly today)
    {
        if (status == ChargeStatus.Paid)
            return CalendarVisualStatus.Paid; // Verde

        if (dueDate < today)
            return CalendarVisualStatus.Overdue; // Vermelho

        if (dueDate <= today.AddDays(5))
            return CalendarVisualStatus.DueSoon; // Amarelo

        return CalendarVisualStatus.Upcoming; // Cinza
    }
}

