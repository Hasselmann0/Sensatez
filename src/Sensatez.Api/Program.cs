using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Sensatez.Api.Middlewares;
using Sensatez.Application.Exceptions;
using Sensatez.Infra.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<SensatezDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();

// Register Repositories and Services (Scoped) here:
// builder.Services.AddScoped<IExampleRepository, ExampleRepository>();
// builder.Services.AddScoped<IExampleService, ExampleService>();

builder.Services.AddValidatorsFromAssemblyContaining<NotFoundException>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<SensatezDbContext>();
    dbContext.Database.Migrate();
}

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
