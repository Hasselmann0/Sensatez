using FluentValidation;
using Sensatez.Application.DTOs.Requests;

namespace Sensatez.Application.Validators;

public class UpdateTenantRequestValidator : AbstractValidator<UpdateTenantRequest>
{
    public UpdateTenantRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("O nome completo do inquilino é obrigatório.")
            .Length(3, 150).WithMessage("O nome deve ter entre 3 e 150 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("O e-mail é obrigatório.")
            .EmailAddress().WithMessage("Informe um endereço de e-mail válido.")
            .MaximumLength(150).WithMessage("O e-mail deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("O telefone é obrigatório.")
            .Length(10, 20).WithMessage("O telefone deve ter entre 10 e 20 caracteres.");

        RuleFor(x => x.AdditionalInfo)
            .MaximumLength(1000).WithMessage("As informações complementares devem ter no máximo 1000 caracteres.");
    }
}

