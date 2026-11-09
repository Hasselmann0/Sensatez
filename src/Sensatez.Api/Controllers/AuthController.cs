using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Services;

namespace Sensatez.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var response = await authService.LoginAsync(request);
        return Ok(response);
    }
}

