using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
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

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<SensatezDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("SensatezCorsPolicy", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.AddAuthentication("Bearer")
    .AddScheme<AuthenticationSchemeOptions, JwtBearerAuthenticationHandler>("Bearer", null);

builder.Services.AddAuthorization();

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
    await DatabaseSeeder.SeedAsync(dbContext, passwordHasher, builder.Configuration);
}

if (args.Contains("--seed-only", StringComparer.OrdinalIgnoreCase))
{
    return;
}

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseCors("SensatezCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
