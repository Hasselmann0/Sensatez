using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Services;
using Sensatez.Domain.Enums;

namespace Sensatez.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/properties")]
public class PropertiesController(IPropertyService propertyService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<PropertyResponse>> Create([FromBody] CreatePropertyRequest request)
    {
        var response = await propertyService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PropertyResponse>>> GetAll(
        [FromQuery] PropertyStatus? status = null,
        [FromQuery] Guid? ownerId = null,
        [FromQuery] string? search = null)
    {
        var properties = await propertyService.GetAllAsync(status, ownerId, search);
        return Ok(properties);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PropertyResponse>> GetById(Guid id)
    {
        var property = await propertyService.GetByIdAsync(id);
        return Ok(property);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PropertyResponse>> Update(Guid id, [FromBody] UpdatePropertyRequest request)
    {
        var property = await propertyService.UpdateAsync(id, request);
        return Ok(property);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<PropertyResponse>> UpdateStatus(Guid id, [FromBody] UpdatePropertyStatusRequest request)
    {
        var property = await propertyService.UpdateStatusAsync(id, request);
        return Ok(property);
    }
}

