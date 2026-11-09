using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;

namespace Sensatez.Application.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
}

