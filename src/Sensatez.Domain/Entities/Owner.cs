namespace Sensatez.Domain.Entities;

public class Owner
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string FullName { get; set; }
    public required string Document { get; set; } // CPF (11) ou CNPJ (14) apenas dígitos
    public required string Email { get; set; }
    public required string Phone { get; set; }
    public string? PixKey { get; set; }
    public string? BankName { get; set; }
    public string? BankAgency { get; set; }
    public string? BankAccount { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Property> Properties { get; set; } = [];
}

