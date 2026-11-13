using System.Data.Common;
using System.Threading.RateLimiting;
using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Scalar.AspNetCore;
using Sensatez.Api.Middlewares;
using Sensatez.Api.Security;
using Sensatez.Application.Exceptions;
using Sensatez.Application.Repository;
using Sensatez.Application.Security;
using Sensatez.Application.Services;
using Sensatez.Domain.Entities;
using Sensatez.Infra.Data;
using Sensatez.Infra.Repository;
using Sensatez.Infra.Security;
using TursoSqliteConnection = Turso.Data.Sqlite.SqliteConnection;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// Add services to the container.
var tursoUrl = builder.Configuration["TURSO_DATABASE_URL"]
    ?? builder.Configuration["Turso:DatabaseUrl"];
var tursoToken = builder.Configuration["TURSO_AUTH_TOKEN"]
    ?? builder.Configuration["Turso:AuthToken"];

var connectionString = !string.IsNullOrWhiteSpace(tursoUrl)
    ? $"Data Source={tursoUrl};{(string.IsNullOrWhiteSpace(tursoToken) ? string.Empty : $"Auth Token={tursoToken};")}"
    : builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=sensatez.db";

builder.Services.AddScoped<DbConnection>(_ => new TursoSqliteConnection(connectionString));
builder.Services.AddDbContext<SensatezDbContext>((sp, options) =>
    options.UseSqlite(
        sp.GetRequiredService<DbConnection>(),
        sqlite => sqlite.MigrationsAssembly("Sensatez.Infra"))
           .ReplaceService<IRelationalDatabaseCreator, TursoSqliteDatabaseCreator>());

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("SensatezCorsPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment() && allowedOrigins.Length == 0)
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

builder.Services.AddAuthentication("Bearer")
    .AddScheme<AuthenticationSchemeOptions, JwtBearerAuthenticationHandler>("Bearer", null);

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddControllers();

// Register Repositories and Services (Scoped) here:
builder.Services.AddScoped<IOwnerRepository, OwnerRepository>();
builder.Services.AddScoped<IOwnerService, OwnerService>();
builder.Services.AddScoped<ITenantRepository, TenantRepository>();
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.AddScoped<IPropertyService, PropertyService>();
builder.Services.AddScoped<ILeaseContractRepository, LeaseContractRepository>();
builder.Services.AddScoped<IRentChargeRepository, RentChargeRepository>();
builder.Services.AddScoped<ILeaseContractService, LeaseContractService>();
builder.Services.AddScoped<IRentChargeService, RentChargeService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddValidatorsFromAssemblyContaining<NotFoundException>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<SensatezDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    await DatabaseSeeder.SeedAsync(dbContext, passwordHasher, builder.Configuration, app.Environment.IsDevelopment());
}

if (args.Contains("--seed-only", StringComparer.OrdinalIgnoreCase))
{
    return;
}

// Configure the HTTP request pipeline.
app.UseForwardedHeaders();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
    app.MapScalarApiReference().AllowAnonymous();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseCors("SensatezCorsPolicy");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
