using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Sensatez.Application.Exceptions;

namespace Sensatez.Api.Middlewares;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            var (status, title) = ex switch
            {
                ValidationException => (StatusCodes.Status400BadRequest, "Dados inválidos"),
                NotFoundException => (StatusCodes.Status404NotFound, "Recurso não encontrado"),
                BusinessRuleException => (StatusCodes.Status409Conflict, "Regra de negócio violada"),
                _ => (StatusCodes.Status500InternalServerError, "Erro interno")
            };

            if (status == StatusCodes.Status500InternalServerError)
                logger.LogError(ex, "Erro não tratado");

            var problem = new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = status == StatusCodes.Status500InternalServerError ? null : ex.Message,
                Instance = context.Request.Path
            };

            if (ex is ValidationException validationException)
            {
                problem.Extensions["errors"] = validationException.Errors
                    .Select(e => new { campo = e.PropertyName, mensagem = e.ErrorMessage });
            }

            context.Response.StatusCode = status;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsJsonAsync(problem);
        }
    }
}
