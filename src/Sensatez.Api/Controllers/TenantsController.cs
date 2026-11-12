using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Services;

namespace Sensatez.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/tenants")]
public class TenantsController(ITenantService tenantService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<TenantResponse>> Create([FromBody] CreateTenantRequest request)
    {
        var response = await tenantService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TenantResponse>>> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] bool onlyActive = true)
    {
        var tenants = await tenantService.GetAllAsync(search, onlyActive);
        return Ok(tenants);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TenantResponse>> GetById(Guid id)
    {
        var tenant = await tenantService.GetByIdAsync(id);
        return Ok(tenant);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TenantResponse>> Update(Guid id, [FromBody] UpdateTenantRequest request)
    {
        var tenant = await tenantService.UpdateAsync(id, request);
        return Ok(tenant);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        await tenantService.DeactivateAsync(id);
        return NoContent();
    }
}

