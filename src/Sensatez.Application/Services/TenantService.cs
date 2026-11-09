using FluentValidation;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Exceptions;
using Sensatez.Application.Mappers;
using Sensatez.Application.Repository;

namespace Sensatez.Application.Services;

public class TenantService(
    ITenantRepository tenantRepository,
    IValidator<CreateTenantRequest> createValidator,
    IValidator<UpdateTenantRequest> updateValidator) : ITenantService
{
    public async Task<TenantResponse> CreateAsync(CreateTenantRequest request)
    {
        await createValidator.ValidateAndThrowAsync(request);

        var cleanDocument = request.Document.Trim();
        if (await tenantRepository.ExistsByDocumentAsync(cleanDocument))
            throw new BusinessRuleException("Já existe um inquilino cadastrado com este CPF/CNPJ.");

        var tenant = request.ToEntity();
        await tenantRepository.AddAsync(tenant);

        return tenant.ToResponse();
    }

    public async Task<IReadOnlyList<TenantResponse>> GetAllAsync(string? search = null, bool onlyActive = true)
    {
        var tenants = await tenantRepository.GetAllAsync(search, onlyActive);
        return tenants.Select(t => t.ToResponse()).ToList();
    }

    public async Task<TenantResponse> GetByIdAsync(Guid id)
    {
        var tenant = await tenantRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Inquilino não encontrado.");

        return tenant.ToResponse();
    }

    public async Task<TenantResponse> UpdateAsync(Guid id, UpdateTenantRequest request)
    {
        await updateValidator.ValidateAndThrowAsync(request);

        var tenant = await tenantRepository.GetByIdForUpdateAsync(id)
            ?? throw new NotFoundException("Inquilino não encontrado.");

        tenant.FullName = request.FullName.Trim();
        tenant.Email = request.Email.Trim();
        tenant.Phone = request.Phone.Trim();
        tenant.AdditionalInfo = request.AdditionalInfo?.Trim();

        await tenantRepository.SaveChangesAsync();

        return tenant.ToResponse();
    }

    public async Task DeactivateAsync(Guid id)
    {
        var tenant = await tenantRepository.GetByIdForUpdateAsync(id)
            ?? throw new NotFoundException("Inquilino não encontrado.");

        if (await tenantRepository.HasActiveContractAsync(id))
            throw new BusinessRuleException("Não é possível inativar um inquilino que possui contrato de locação ativo.");

        tenant.IsActive = false;
        await tenantRepository.SaveChangesAsync();
    }
}

