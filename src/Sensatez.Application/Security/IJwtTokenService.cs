using System.Security.Claims;
using Sensatez.Domain.Entities;

namespace Sensatez.Application.Security;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
    ClaimsPrincipal? ValidateToken(string token);
}

