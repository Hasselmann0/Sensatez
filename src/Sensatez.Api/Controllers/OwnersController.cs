using Microsoft.AspNetCore.Mvc;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Services;

namespace Sensatez.Api.Controllers;

[ApiController]
[Route("api/owners")]
public class OwnersController(IOwnerService ownerService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OwnerResponse>> Create([FromBody] CreateOwnerRequest request)
    {
        var response = await ownerService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OwnerResponse>>> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] bool onlyActive = true)
    {
        var owners = await ownerService.GetAllAsync(search, onlyActive);
        return Ok(owners);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OwnerResponse>> GetById(Guid id)
    {
        var owner = await ownerService.GetByIdAsync(id);
        return Ok(owner);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<OwnerResponse>> Update(Guid id, [FromBody] UpdateOwnerRequest request)
    {
        var owner = await ownerService.UpdateAsync(id, request);
        return Ok(owner);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        await ownerService.DeactivateAsync(id);
        return NoContent();
    }
}

