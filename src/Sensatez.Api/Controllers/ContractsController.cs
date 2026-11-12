using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Services;
using Sensatez.Domain.Enums;

namespace Sensatez.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/contracts")]
public class ContractsController(ILeaseContractService contractService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<LeaseContractResponse>> Create([FromBody] CreateLeaseContractRequest request)
    {
        var response = await contractService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LeaseContractResponse>>> GetAll(
        [FromQuery] ContractStatus? status = null,
        [FromQuery] Guid? propertyId = null,
        [FromQuery] Guid? tenantId = null,
        [FromQuery] int? expiringWithinDays = null)
    {
        var contracts = await contractService.GetAllAsync(status, propertyId, tenantId, expiringWithinDays);
        return Ok(contracts);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LeaseContractResponse>> GetById(Guid id)
    {
        var contract = await contractService.GetByIdAsync(id);
        return Ok(contract);
    }

    [HttpPost("{id:guid}/terminate")]
    public async Task<ActionResult<LeaseContractResponse>> Terminate(
        Guid id,
        [FromBody] TerminateContractRequest? request = null)
    {
        var contract = await contractService.TerminateAsync(id, request ?? new TerminateContractRequest());
        return Ok(contract);
    }

    [HttpPost("{id:guid}/readjust")]
    public async Task<ActionResult<LeaseContractResponse>> Readjust(
        Guid id,
        [FromBody] ReadjustContractRequest request)
    {
        var contract = await contractService.ReadjustAsync(id, request);
        return Ok(contract);
    }
}

