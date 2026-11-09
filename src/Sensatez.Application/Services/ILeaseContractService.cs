using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Domain.Enums;

namespace Sensatez.Application.Services;

public interface ILeaseContractService
{
    Task<LeaseContractResponse> CreateAsync(CreateLeaseContractRequest request);
    Task<IReadOnlyList<LeaseContractResponse>> GetAllAsync(
        ContractStatus? status = null,
        Guid? propertyId = null,
        Guid? tenantId = null,
        int? expiringWithinDays = null);
    Task<LeaseContractResponse> GetByIdAsync(Guid id);
    Task<LeaseContractResponse> TerminateAsync(Guid id, TerminateContractRequest request);
    Task<LeaseContractResponse> ReadjustAsync(Guid id, ReadjustContractRequest request);
}

