namespace Sensatez.Application.DTOs.Requests;

public record ReadjustContractRequest(
    decimal ReadjustmentPercentage,
    DateOnly? EffectiveFromDate = null,
    string? Notes = null);

