namespace Sensatez.Application.DTOs.Requests;

public record PayChargeRequest(
    DateTime? PaidAt = null,
    decimal? PenaltyAmount = null,
    decimal? InterestAmount = null,
    decimal DiscountAmount = 0m,
    string PaymentMethod = "Manual",
    string? Notes = null);

