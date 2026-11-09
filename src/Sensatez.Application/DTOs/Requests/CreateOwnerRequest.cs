namespace Sensatez.Application.DTOs.Requests;

public record CreateOwnerRequest(
    string FullName,
    string Document,
    string Email,
    string Phone,
    string? PixKey = null,
    string? BankName = null,
    string? BankAgency = null,
    string? BankAccount = null,
    string? Notes = null);

