using FluentValidation;
using Sensatez.Application.DTOs.Requests;
using Sensatez.Application.DTOs.Responses;
using Sensatez.Application.Repository;
using Sensatez.Application.Security;

namespace Sensatez.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    IValidator<LoginRequest> loginValidator) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        await loginValidator.ValidateAndThrowAsync(request);

        var user = await userRepository.GetByEmailAsync(request.Email);
        if (user == null || !user.IsActive || !passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("E-mail ou senha inválidos.");

        var (token, expiresAt) = jwtTokenService.GenerateToken(user);

        return new LoginResponse(
            token,
            expiresAt,
            user.FullName,
            user.Email);
    }
}

