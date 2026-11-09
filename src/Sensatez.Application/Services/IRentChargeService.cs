using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;

namespace Sensatez.Application.Services;

public interface IRentChargeService
{
    Task<CalendarMonthResponse> GetCalendarMonthAsync(int year, int month);
    Task<RentChargeDetailResponse> GetByIdAsync(Guid id);
    Task<RentChargeDetailResponse> PayChargeAsync(Guid chargeId, PayChargeRequest request);
    Task<RentChargeDetailResponse> MarkAsTransferredToOwnerAsync(Guid chargeId, TransferToOwnerRequest request);
    Task<OverdueSummaryResponse> GetOverdueChargesAsync();
    Task<RentChargeDetailResponse> UpdateNotesAsync(Guid chargeId, UpdateChargeNotesRequest request);
}

