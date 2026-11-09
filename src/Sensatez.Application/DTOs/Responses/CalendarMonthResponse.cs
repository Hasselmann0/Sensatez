namespace Sensatez.Application.DTOs.Responses;

public record CalendarMonthResponse(
    int Year,
    int Month,
    decimal TotalExpected,
    decimal TotalPaid,
    decimal TotalOverdue,
    decimal TotalCommissionExpected,
    decimal TotalNetOwnerExpected,
    int TotalChargesCount,
    IReadOnlyList<CalendarChargeItemResponse> Items);

