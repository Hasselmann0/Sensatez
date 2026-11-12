using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Services;

namespace Sensatez.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/charges")]
public class ChargesController(IRentChargeService chargeService) : ControllerBase
{
    [HttpGet("calendar")]
    public async Task<ActionResult<CalendarMonthResponse>> GetCalendar(
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var now = DateTime.UtcNow;
        var targetYear = year ?? now.Year;
        var targetMonth = month ?? now.Month;

        var response = await chargeService.GetCalendarMonthAsync(targetYear, targetMonth);
        return Ok(response);
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<OverdueSummaryResponse>> GetOverdue()
    {
        var response = await chargeService.GetOverdueChargesAsync();
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RentChargeDetailResponse>> GetById(Guid id)
    {
        var response = await chargeService.GetByIdAsync(id);
        return Ok(response);
    }

    [HttpPost("{id:guid}/pay")]
    public async Task<ActionResult<RentChargeDetailResponse>> Pay(
        Guid id,
        [FromBody] PayChargeRequest? request = null)
    {
        var response = await chargeService.PayChargeAsync(id, request ?? new PayChargeRequest());
        return Ok(response);
    }

    [HttpPost("{id:guid}/transfer-to-owner")]
    public async Task<ActionResult<RentChargeDetailResponse>> TransferToOwner(
        Guid id,
        [FromBody] TransferToOwnerRequest? request = null)
    {
        var response = await chargeService.MarkAsTransferredToOwnerAsync(id, request ?? new TransferToOwnerRequest());
        return Ok(response);
    }

    [HttpPatch("{id:guid}/notes")]
    public async Task<ActionResult<RentChargeDetailResponse>> UpdateNotes(
        Guid id,
        [FromBody] UpdateChargeNotesRequest request)
    {
        var response = await chargeService.UpdateNotesAsync(id, request);
        return Ok(response);
    }
}

