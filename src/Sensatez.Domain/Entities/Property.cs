using Sensatez.Domain.Enums;

namespace Sensatez.Domain.Entities;

public class Property
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerId { get; set; }
    public string? Code { get; set; }
    public required string Street { get; set; }
    public required string Number { get; set; }
    public string? Complement { get; set; }
    public required string Neighborhood { get; set; }
    public required string City { get; set; }
    public required string State { get; set; } // UF (2 caracteres, ex: SP, RJ)
    public required string ZipCode { get; set; } // CEP (8 dígitos)
    public PropertyType Type { get; set; }
    public PropertyStatus Status { get; set; } = PropertyStatus.Available;
    public decimal SuggestedRentAmount { get; set; }
    public decimal DefaultCommissionPercentage { get; set; } = 10.00m;
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Owner Owner { get; set; } = null!;
    public ICollection<LeaseContract> Contracts { get; set; } = [];
}

