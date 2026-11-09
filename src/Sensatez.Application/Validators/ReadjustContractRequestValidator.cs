using FluentValidation;
using Sensatez.Application.DTOs.Requests;

namespace Sensatez.Application.Validators;

public class ReadjustContractRequestValidator : AbstractValidator<ReadjustContractRequest>
{
    public ReadjustContractRequestValidator()
    {
        RuleFor(x => x.ReadjustmentPercentage)
            .GreaterThan(-100).WithMessage("O percentual de reajuste deve ser maior que -100%.")
            .LessThanOrEqualTo(200).WithMessage("O percentual de reajuste não pode exceder 200%.");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("As observações devem ter no máximo 1000 caracteres.");
    }
}

