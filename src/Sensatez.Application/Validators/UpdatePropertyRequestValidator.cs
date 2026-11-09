using FluentValidation;
using Sensatez.Application.DTOs.Requests;

namespace Sensatez.Application.Validators;

public class UpdatePropertyRequestValidator : AbstractValidator<UpdatePropertyRequest>
{
    public UpdatePropertyRequestValidator()
    {
        RuleFor(x => x.Code)
            .MaximumLength(30).WithMessage("O código interno deve ter no máximo 30 caracteres.");

        RuleFor(x => x.Street)
            .NotEmpty().WithMessage("O logradouro é obrigatório.")
            .MaximumLength(200).WithMessage("O logradouro deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Number)
            .NotEmpty().WithMessage("O número é obrigatório.")
            .MaximumLength(20).WithMessage("O número deve ter no máximo 20 caracteres.");

        RuleFor(x => x.Complement)
            .MaximumLength(100).WithMessage("O complemento deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Neighborhood)
            .NotEmpty().WithMessage("O bairro é obrigatório.")
            .MaximumLength(100).WithMessage("O bairro deve ter no máximo 100 caracteres.");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("A cidade é obrigatória.")
            .MaximumLength(100).WithMessage("A cidade deve ter no máximo 100 caracteres.");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("A UF é obrigatória.")
            .Matches(@"^[A-Za-z]{2}$").WithMessage("A UF deve conter exatamente 2 letras (ex: SP, RJ).");

        RuleFor(x => x.ZipCode)
            .NotEmpty().WithMessage("O CEP é obrigatório.")
            .Matches(@"^\d{8}$").WithMessage("O CEP deve conter exatamente 8 dígitos numéricos.");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("O tipo do imóvel informado é inválido.");

        RuleFor(x => x.SuggestedRentAmount)
            .GreaterThan(0).WithMessage("O valor sugerido de aluguel deve ser maior que zero.");

        RuleFor(x => x.DefaultCommissionPercentage)
            .InclusiveBetween(0, 100).WithMessage("A comissão padrão deve estar entre 0% e 100%.");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("As observações devem ter no máximo 1000 caracteres.");
    }
}

