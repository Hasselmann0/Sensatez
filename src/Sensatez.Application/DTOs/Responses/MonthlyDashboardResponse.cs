namespace Sensatez.Application.DTOs.Responses;

public record MonthlyDashboardResponse(
    int Year,
    int Month,
    decimal TotalExpectedRent,
    decimal TotalReceivedRent,
    decimal TotalPendingRent,
    decimal TotalOverdueRentInMonth,
    decimal TotalAccumulatedOverdueRent,
    decimal ExpectedCommission,
    decimal RealizedCommission,
    decimal NetOwnerPendingTransfer,
    decimal NetOwnerTransferred,
    int TotalProperties,
    int RentedProperties,
    int AvailableProperties,
    int MaintenanceProperties);

