using FluentValidation;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Exceptions;
using Sensatez.Application.Mappers;
using Sensatez.Application.Repository;

namespace Sensatez.Application.Services;

public class OwnerService(
    IOwnerRepository ownerRepository,
    IValidator<CreateOwnerRequest> createValidator,
    IValidator<UpdateOwnerRequest> updateValidator) : IOwnerService
{
    public async Task<OwnerResponse> CreateAsync(CreateOwnerRequest request)
    {
        await createValidator.ValidateAndThrowAsync(request);

        var cleanDocument = request.Document.Trim();
        if (await ownerRepository.ExistsByDocumentAsync(cleanDocument))
            throw new BusinessRuleException("Já existe um proprietário cadastrado com este CPF/CNPJ.");

        var owner = request.ToEntity();
        await ownerRepository.AddAsync(owner);

        return owner.ToResponse();
    }

    public async Task<IReadOnlyList<OwnerResponse>> GetAllAsync(string? search = null, bool onlyActive = true)
    {
        var owners = await ownerRepository.GetAllAsync(search, onlyActive);
        return owners.Select(o => o.ToResponse()).ToList();
    }

    public async Task<OwnerResponse> GetByIdAsync(Guid id)
    {
        var owner = await ownerRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Proprietário não encontrado.");

        return owner.ToResponse();
    }

    public async Task<OwnerResponse> UpdateAsync(Guid id, UpdateOwnerRequest request)
    {
        await updateValidator.ValidateAndThrowAsync(request);

        var owner = await ownerRepository.GetByIdForUpdateAsync(id)
            ?? throw new NotFoundException("Proprietário não encontrado.");

        owner.FullName = request.FullName.Trim();
        owner.Email = request.Email.Trim();
        owner.Phone = request.Phone.Trim();
        owner.PixKey = request.PixKey?.Trim();
        owner.BankName = request.BankName?.Trim();
        owner.BankAgency = request.BankAgency?.Trim();
        owner.BankAccount = request.BankAccount?.Trim();
        owner.Notes = request.Notes?.Trim();

        await ownerRepository.SaveChangesAsync();

        var updated = await ownerRepository.GetByIdAsync(id);
        return (updated ?? owner).ToResponse();
    }

    public async Task DeactivateAsync(Guid id)
    {
        var owner = await ownerRepository.GetByIdForUpdateAsync(id)
            ?? throw new NotFoundException("Proprietário não encontrado.");

        if (await ownerRepository.HasActivePropertiesOrContractsAsync(id))
            throw new BusinessRuleException("Não é possível inativar um proprietário que possui imóveis ativos vinculados.");

        owner.IsActive = false;
        await ownerRepository.SaveChangesAsync();
    }
}

