using FluentValidation;
using Sensatez.Application.DTOs.Requests;

namespace Sensatez.Application.Validators;

public class CreateOwnerRequestValidator : AbstractValidator<CreateOwnerRequest>
{
    public CreateOwnerRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("O nome completo do proprietário é obrigatório.")
            .Length(3, 150).WithMessage("O nome deve ter entre 3 e 150 caracteres.");

        RuleFor(x => x.Document)
            .NotEmpty().WithMessage("O CPF ou CNPJ é obrigatório.")
            .Must(DocumentValidator.IsValidCpfOrCnpj).WithMessage("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido contendo apenas números.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("O e-mail é obrigatório.")
            .EmailAddress().WithMessage("Informe um endereço de e-mail válido.")
            .MaximumLength(150).WithMessage("O e-mail deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("O telefone é obrigatório.")
            .Length(10, 20).WithMessage("O telefone deve ter entre 10 e 20 caracteres.");

        RuleFor(x => x.PixKey)
            .MaximumLength(150).WithMessage("A chave Pix deve ter no máximo 150 caracteres.");

        RuleFor(x => x.BankName)
            .MaximumLength(100).WithMessage("O nome do banco deve ter no máximo 100 caracteres.");

        RuleFor(x => x.BankAgency)
            .MaximumLength(20).WithMessage("A agência bancária deve ter no máximo 20 caracteres.");

        RuleFor(x => x.BankAccount)
            .MaximumLength(30).WithMessage("A conta bancária deve ter no máximo 30 caracteres.");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("As observações devem ter no máximo 1000 caracteres.");
    }
}

