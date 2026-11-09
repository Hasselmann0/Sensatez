using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Domain.Entities;

namespace Sensatez.Application.Mappers;

public static class LeaseContractMapper
{
    public static LeaseContract ToEntity(this CreateLeaseContractRequest request) => new()
    {
        PropertyId = request.PropertyId,
        TenantId = request.TenantId,
        StartDate = request.StartDate,
        EndDate = request.EndDate,
        DueDay = request.DueDay,
        RentAmount = request.RentAmount,
        CommissionPercentage = request.CommissionPercentage,
        SecurityDepositAmount = request.SecurityDepositAmount,
        PenaltyPercentage = request.PenaltyPercentage,
        MonthlyInterestPercentage = request.MonthlyInterestPercentage,
        ReadjustmentIndex = request.ReadjustmentIndex,
        Notes = request.Notes?.Trim()
    };

    public static LeaseContractResponse ToResponse(this LeaseContract contract)
    {
        var propertyAddress = contract.Property != null
            ? $"{contract.Property.Street}, {contract.Property.Number} - {contract.Property.Neighborhood}, {contract.Property.City}/{contract.Property.State}"
            : string.Empty;

        var charges = contract.Charges?
            .OrderBy(c => c.DueDate)
            .Select(c => new ContractChargeSummaryResponse(
                c.Id,
                c.ReferenceYear,
                c.ReferenceMonth,
                c.DueDate,
                c.OriginalAmount,
                c.TotalAmount,
                c.CommissionAmount,
                c.NetOwnerAmount,
                c.Status,
                c.PaidAt,
                c.IsTransferredToOwner))
            .ToList() ?? [];

        return new LeaseContractResponse(
            contract.Id,
            contract.PropertyId,
            propertyAddress,
            contract.Property?.OwnerId ?? Guid.Empty,
            contract.Property?.Owner?.FullName ?? string.Empty,
            contract.TenantId,
            contract.Tenant?.FullName ?? string.Empty,
            contract.StartDate,
            contract.EndDate,
            contract.DueDay,
            contract.RentAmount,
            contract.CommissionPercentage,
            contract.SecurityDepositAmount,
            contract.PenaltyPercentage,
            contract.MonthlyInterestPercentage,
            contract.ReadjustmentIndex,
            contract.Status,
            contract.TerminatedAt,
            contract.Notes,
            charges.Count,
            charges,
            contract.CreatedAt);
    }
}

