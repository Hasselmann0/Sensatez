namespace Sensatez.Application.DTOs.Requests;

public record TransferToOwnerRequest(
    DateTime? TransferredAt = null,
    string? Notes = null);

