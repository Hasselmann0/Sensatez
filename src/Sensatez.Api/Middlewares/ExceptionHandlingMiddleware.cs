using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
                UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Não autorizado"),
                NotFoundException => (StatusCodes.Status404NotFound, "Recurso não encontrado"),
                BusinessRuleException => (StatusCodes.Status409Conflict, "Regra de negócio violada"),
                DbUpdateException => (StatusCodes.Status409Conflict, "Conflito de integridade de dados no banco"),
                _ => (StatusCodes.Status500InternalServerError, "Erro interno")
            };

            if (ex is DbUpdateException)
            {
                logger.LogWarning(ex, "Conflito de integridade de dados no banco (DbUpdateException)");
            }
            else if (status == StatusCodes.Status500InternalServerError)
            {
                logger.LogError(ex, "Erro não tratado");
            }

            string? detail = ex switch
            {
                DbUpdateException => "Ocorreu um conflito ao persistir os dados. Verifique se o registro já não existe ou se há dependências vinculadas.",
                ValidationException => "Um ou mais campos contêm erros de validação.",
                Exception when status == StatusCodes.Status500InternalServerError => null,
                _ => ex.Message
            };

            var problem = new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = detail,
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
