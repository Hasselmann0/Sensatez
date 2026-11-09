namespace Sensatez.Application.DTOs.Responses;

public record LoginResponse(
    string Token,
    DateTime ExpiresAt,
    string FullName,
    string Email);

