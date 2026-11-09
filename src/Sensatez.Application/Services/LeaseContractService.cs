using FluentValidation;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Exceptions;
using Sensatez.Application.Mappers;
using Sensatez.Application.Repository;
using Sensatez.Domain.Entities;
using Sensatez.Domain.Enums;

namespace Sensatez.Application.Services;

public class LeaseContractService(
    ILeaseContractRepository contractRepository,
    IPropertyRepository propertyRepository,
    ITenantRepository tenantRepository,
    IValidator<CreateLeaseContractRequest> createValidator,
    IValidator<ReadjustContractRequest> readjustValidator) : ILeaseContractService
{
    public async Task<LeaseContractResponse> CreateAsync(CreateLeaseContractRequest request)
    {
        await createValidator.ValidateAndThrowAsync(request);

        var property = await propertyRepository.GetByIdForUpdateAsync(request.PropertyId)
            ?? throw new NotFoundException("Imóvel não encontrado.");

        if (!property.IsActive)
            throw new BusinessRuleException("O imóvel informado está inativo.");

        if (property.Status == PropertyStatus.Maintenance)
            throw new BusinessRuleException("Não é possível criar um contrato para um imóvel em manutenção.");

        if (await contractRepository.HasActiveContractForPropertyAsync(request.PropertyId))
            throw new BusinessRuleException("Este imóvel já possui um contrato de locação ativo.");

        var tenant = await tenantRepository.GetByIdAsync(request.TenantId)
            ?? throw new NotFoundException("Inquilino não encontrado.");

        if (!tenant.IsActive)
            throw new BusinessRuleException("O inquilino informado está inativo.");

        var contract = request.ToEntity();

        // Gerar parcelas mensais (RentCharge) do StartDate ao EndDate
        var currentMonth = new DateOnly(request.StartDate.Year, request.StartDate.Month, 1);
        var endMonth = new DateOnly(request.EndDate.Year, request.EndDate.Month, 1);

        while (currentMonth <= endMonth)
        {
            var dueDate = RentCalculator.CalculateDueDate(currentMonth.Year, currentMonth.Month, request.DueDay);
            var (totalAmount, commissionAmount, netOwnerAmount) = RentCalculator.CalculateSplit(
                request.RentAmount,
                0m,
                0m,
                0m,
                request.CommissionPercentage);

            contract.Charges.Add(new RentCharge
            {
                LeaseContractId = contract.Id,
                ReferenceYear = currentMonth.Year,
                ReferenceMonth = currentMonth.Month,
                DueDate = dueDate,
                OriginalAmount = request.RentAmount,
                PenaltyAmount = 0m,
                InterestAmount = 0m,
                DiscountAmount = 0m,
                TotalAmount = totalAmount,
                CommissionPercentage = request.CommissionPercentage,
                CommissionAmount = commissionAmount,
                NetOwnerAmount = netOwnerAmount,
                Status = ChargeStatus.Pending
            });

            currentMonth = currentMonth.AddMonths(1);
        }

        property.Status = PropertyStatus.Rented;
        await contractRepository.AddAsync(contract);

        var saved = await contractRepository.GetByIdWithDetailsAsync(contract.Id);
        return (saved ?? contract).ToResponse();
    }

    public async Task<IReadOnlyList<LeaseContractResponse>> GetAllAsync(
        ContractStatus? status = null,
        Guid? propertyId = null,
        Guid? tenantId = null,
        int? expiringWithinDays = null)
    {
        var contracts = await contractRepository.GetAllAsync(status, propertyId, tenantId, expiringWithinDays);
        return contracts.Select(c => c.ToResponse()).ToList();
    }

    public async Task<LeaseContractResponse> GetByIdAsync(Guid id)
    {
        var contract = await contractRepository.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException("Contrato de locação não encontrado.");

        return contract.ToResponse();
    }

    public async Task<LeaseContractResponse> TerminateAsync(Guid id, TerminateContractRequest request)
    {
        var contract = await contractRepository.GetByIdForUpdateAsync(id)
            ?? throw new NotFoundException("Contrato de locação não encontrado.");

        if (contract.Status != ContractStatus.Active)
            throw new BusinessRuleException("Apenas contratos ativos podem ser rescindidos/encerrados.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        contract.Status = ContractStatus.Terminated;
        contract.TerminatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Reason))
        {
            contract.Notes = string.IsNullOrWhiteSpace(contract.Notes)
                ? $"[Rescisão]: {request.Reason.Trim()}"
                : $"{contract.Notes} | [Rescisão]: {request.Reason.Trim()}";
        }

        if (contract.Property != null)
            contract.Property.Status = PropertyStatus.Available;

        foreach (var charge in contract.Charges.Where(c => c.Status == ChargeStatus.Pending && c.DueDate > today))
        {
            charge.Status = ChargeStatus.Cancelled;
        }

        await contractRepository.SaveChangesAsync();

        return contract.ToResponse();
    }

    public async Task<LeaseContractResponse> ReadjustAsync(Guid id, ReadjustContractRequest request)
    {
        await readjustValidator.ValidateAndThrowAsync(request);

        var contract = await contractRepository.GetByIdForUpdateAsync(id)
            ?? throw new NotFoundException("Contrato de locação não encontrado.");

        if (contract.Status != ContractStatus.Active)
            throw new BusinessRuleException("Apenas contratos ativos podem sofrer reajuste.");

        var effectiveDate = request.EffectiveFromDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var multiplier = 1m + (request.ReadjustmentPercentage / 100m);
        var newRentAmount = Math.Round(contract.RentAmount * multiplier, 2, MidpointRounding.AwayFromZero);

        if (newRentAmount <= 0)
            throw new BusinessRuleException("O novo valor do aluguel após o reajuste deve ser maior que zero.");

        contract.RentAmount = newRentAmount;

        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            contract.Notes = string.IsNullOrWhiteSpace(contract.Notes)
                ? $"[Reajuste {request.ReadjustmentPercentage:N2}%]: {request.Notes.Trim()}"
                : $"{contract.Notes} | [Reajuste {request.ReadjustmentPercentage:N2}%]: {request.Notes.Trim()}";
        }

        foreach (var charge in contract.Charges.Where(c => c.Status == ChargeStatus.Pending && c.DueDate >= effectiveDate))
        {
            charge.OriginalAmount = newRentAmount;
            var (total, commission, netOwner) = RentCalculator.CalculateSplit(
                charge.OriginalAmount,
                charge.PenaltyAmount,
                charge.InterestAmount,
                charge.DiscountAmount,
                charge.CommissionPercentage);

            charge.TotalAmount = total;
            charge.CommissionAmount = commission;
            charge.NetOwnerAmount = netOwner;
        }

        await contractRepository.SaveChangesAsync();

        return contract.ToResponse();
    }
}

