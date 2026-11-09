namespace Sensatez.Application.DTOs.Requests;

public record UpdateOwnerRequest(
    string FullName,
    string Email,
    string Phone,
    string? PixKey = null,
    string? BankName = null,
    string? BankAgency = null,
    string? BankAccount = null,
    string? Notes = null);

