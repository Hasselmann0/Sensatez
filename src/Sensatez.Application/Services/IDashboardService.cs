using Sensatez.Application.DTOs.Responses;

namespace Sensatez.Application.Services;

public interface IDashboardService
{
    Task<MonthlyDashboardResponse> GetMonthlySummaryAsync(int year, int month);
    Task<OwnerStatementResponse> GetOwnerStatementAsync(Guid ownerId, int year, int month);
    Task<AlertsResponse> GetAlertsAsync();
}

