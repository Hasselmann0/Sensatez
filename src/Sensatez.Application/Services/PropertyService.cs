using FluentValidation;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Exceptions;
using Sensatez.Application.Mappers;
using Sensatez.Application.Repository;
using Sensatez.Domain.Enums;

namespace Sensatez.Application.Services;

public class PropertyService(
    IPropertyRepository propertyRepository,
    IOwnerRepository ownerRepository,
    IValidator<CreatePropertyRequest> createValidator,
    IValidator<UpdatePropertyRequest> updateValidator) : IPropertyService
{
    public async Task<PropertyResponse> CreateAsync(CreatePropertyRequest request)
    {
        await createValidator.ValidateAndThrowAsync(request);

        var owner = await ownerRepository.GetByIdAsync(request.OwnerId)
            ?? throw new NotFoundException("Proprietário não encontrado.");

        if (!owner.IsActive)
            throw new BusinessRuleException("O proprietário informado está inativo.");

        var property = request.ToEntity();
        await propertyRepository.AddAsync(property);

        property.Owner = owner;
        return property.ToResponse();
    }

    public async Task<IReadOnlyList<PropertyResponse>> GetAllAsync(
        PropertyStatus? status = null,
        Guid? ownerId = null,
        string? search = null)
    {
        var properties = await propertyRepository.GetAllAsync(status, ownerId, search);
        return properties.Select(p => p.ToResponse()).ToList();
    }

    public async Task<PropertyResponse> GetByIdAsync(Guid id)
    {
        var property = await propertyRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Imóvel não encontrado.");

        return property.ToResponse();
    }

    public async Task<PropertyResponse> UpdateAsync(Guid id, UpdatePropertyRequest request)
    {
        await updateValidator.ValidateAndThrowAsync(request);

        var property = await propertyRepository.GetByIdForUpdateAsync(id)
            ?? throw new NotFoundException("Imóvel não encontrado.");

        property.Code = request.Code?.Trim();
        property.Street = request.Street.Trim();
        property.Number = request.Number.Trim();
        property.Complement = request.Complement?.Trim();
        property.Neighborhood = request.Neighborhood.Trim();
        property.City = request.City.Trim();
        property.State = request.State.Trim().ToUpperInvariant();
        property.ZipCode = request.ZipCode.Trim();
        property.Type = request.Type;
        property.SuggestedRentAmount = request.SuggestedRentAmount;
        property.DefaultCommissionPercentage = request.DefaultCommissionPercentage;
        property.Notes = request.Notes?.Trim();

        await propertyRepository.SaveChangesAsync();

        return property.ToResponse();
    }

    public async Task<PropertyResponse> UpdateStatusAsync(Guid id, UpdatePropertyStatusRequest request)
    {
        var property = await propertyRepository.GetByIdForUpdateAsync(id)
            ?? throw new NotFoundException("Imóvel não encontrado.");

        if (request.Status == PropertyStatus.Rented)
            throw new BusinessRuleException("O status 'Rented' (Locado) é gerenciado automaticamente pela ativação de um contrato de locação.");

        if (property.Status == PropertyStatus.Rented)
            throw new BusinessRuleException("Não é possível alterar manualmente o status de um imóvel que possui contrato de locação ativo.");

        property.Status = request.Status;
        await propertyRepository.SaveChangesAsync();

        return property.ToResponse();
    }
}

