using Microsoft.AspNetCore.Mvc;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Services;

namespace Sensatez.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<MonthlyDashboardResponse>> GetSummary(
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var now = DateTime.UtcNow;
        var targetYear = year ?? now.Year;
        var targetMonth = month ?? now.Month;

        var response = await dashboardService.GetMonthlySummaryAsync(targetYear, targetMonth);
        return Ok(response);
    }

    [HttpGet("owner-statement/{ownerId:guid}")]
    public async Task<ActionResult<OwnerStatementResponse>> GetOwnerStatement(
        Guid ownerId,
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var now = DateTime.UtcNow;
        var targetYear = year ?? now.Year;
        var targetMonth = month ?? now.Month;

        var response = await dashboardService.GetOwnerStatementAsync(ownerId, targetYear, targetMonth);
        return Ok(response);
    }

    [HttpGet("alerts")]
    public async Task<ActionResult<AlertsResponse>> GetAlerts()
    {
        var response = await dashboardService.GetAlertsAsync();
        return Ok(response);
    }
}

