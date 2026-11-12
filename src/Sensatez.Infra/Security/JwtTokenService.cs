using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Sensatez.Application.Security;
using Sensatez.Domain.Entities;

namespace Sensatez.Infra.Security;

public class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    private string SecretKey
    {
        get
        {
            var key = configuration["Jwt:SecretKey"]
                ?? "Sensatez-MVP-SuperSecretKey-2026-Minimum32Bytes!";

            if (string.IsNullOrWhiteSpace(key) || Encoding.UTF8.GetByteCount(key) < 32)
            {
                throw new InvalidOperationException(
                    "A configuração 'Jwt:SecretKey' deve conter no mínimo 32 bytes (256 bits).");
            }

            return key;
        }
    }

    private string Issuer => configuration["Jwt:Issuer"] ?? "Sensatez.Api";
    private string Audience => configuration["Jwt:Audience"] ?? "Sensatez.Client";

    private int ExpirationHours =>
        int.TryParse(configuration["Jwt:ExpirationHours"], out var hours) ? hours : 12;

    public (string Token, DateTime ExpiresAt) GenerateToken(User user)
    {
        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.AddHours(ExpirationHours);

        var headerJson = JsonSerializer.Serialize(new { alg = "HS256", typ = "JWT" });
        var payloadJson = JsonSerializer.Serialize(new Dictionary<string, object>
        {
            ["sub"] = user.Id.ToString(),
            ["email"] = user.Email,
            ["name"] = user.FullName,
            ["iss"] = Issuer,
            ["aud"] = Audience,
            ["iat"] = now.ToUnixTimeSeconds(),
            ["exp"] = expiresAt.ToUnixTimeSeconds()
        });

        var encodedHeader = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
        var encodedPayload = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
        var unsignedToken = $"{encodedHeader}.{encodedPayload}";

        var signature = ComputeSignature(unsignedToken);
        return ($"{unsignedToken}.{signature}", expiresAt.UtcDateTime);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        var parts = token.Split('.');
        if (parts.Length != 3)
            return null;

        var unsignedToken = $"{parts[0]}.{parts[1]}";
        var expectedSignature = ComputeSignature(unsignedToken);

        var expectedBytes = Encoding.UTF8.GetBytes(expectedSignature);
        var actualBytes = Encoding.UTF8.GetBytes(parts[2]);

        if (!CryptographicOperations.FixedTimeEquals(expectedBytes, actualBytes))
            return null;

        try
        {
            // 1. Valida se o cabeçalho especifica o algoritmo correto (HS256)
            var headerBytes = Base64UrlDecode(parts[0]);
            using var headerDoc = JsonDocument.Parse(headerBytes);
            if (!headerDoc.RootElement.TryGetProperty("alg", out var algElement) ||
                algElement.GetString() != "HS256")
            {
                return null;
            }

            // 2. Valida payload: expiração, emissor (iss) e audiência (aud)
            var payloadBytes = Base64UrlDecode(parts[1]);
            using var doc = JsonDocument.Parse(payloadBytes);
            var root = doc.RootElement;

            if (!root.TryGetProperty("exp", out var expElement) ||
                expElement.GetInt64() < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            {
                return null;
            }

            if (!root.TryGetProperty("iss", out var issElement) || issElement.GetString() != Issuer)
            {
                return null;
            }

            if (!root.TryGetProperty("aud", out var audElement) || audElement.GetString() != Audience)
            {
                return null;
            }

            var claims = new List<Claim>();
            if (root.TryGetProperty("sub", out var sub))
                claims.Add(new Claim(ClaimTypes.NameIdentifier, sub.GetString() ?? string.Empty));
            if (root.TryGetProperty("email", out var email))
                claims.Add(new Claim(ClaimTypes.Email, email.GetString() ?? string.Empty));
            if (root.TryGetProperty("name", out var name))
                claims.Add(new Claim(ClaimTypes.Name, name.GetString() ?? string.Empty));

            var identity = new ClaimsIdentity(claims, "Bearer");
            return new ClaimsPrincipal(identity);
        }
        catch
        {
            return null;
        }
    }

    private string ComputeSignature(string unsignedToken)
    {
        var keyBytes = Encoding.UTF8.GetBytes(SecretKey);
        var dataBytes = Encoding.UTF8.GetBytes(unsignedToken);
        var hash = HMACSHA256.HashData(keyBytes, dataBytes);
        return Base64UrlEncode(hash);
    }

    private static string Base64UrlEncode(byte[] bytes) =>
        Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

    private static byte[] Base64UrlDecode(string input)
    {
        var padded = input.Replace('-', '+').Replace('_', '/');
        switch (padded.Length % 4)
        {
            case 2: padded += "=="; break;
            case 3: padded += "="; break;
        }
        return Convert.FromBase64String(padded);
    }
}

