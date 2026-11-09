using FluentValidation;
using Sensatez.Application.DTOs.Requests;

namespace Sensatez.Application.Validators;

public class PayChargeRequestValidator : AbstractValidator<PayChargeRequest>
{
    public PayChargeRequestValidator()
    {
        RuleFor(x => x.PenaltyAmount)
            .GreaterThanOrEqualTo(0).When(x => x.PenaltyAmount.HasValue)
            .WithMessage("O valor da multa não pode ser negativo.");

        RuleFor(x => x.InterestAmount)
            .GreaterThanOrEqualTo(0).When(x => x.InterestAmount.HasValue)
            .WithMessage("O valor dos juros não pode ser negativo.");

        RuleFor(x => x.DiscountAmount)
            .GreaterThanOrEqualTo(0).WithMessage("O valor do desconto não pode ser negativo.");

        RuleFor(x => x.PaymentMethod)
            .NotEmpty().WithMessage("O método de pagamento é obrigatório.")
            .MaximumLength(30).WithMessage("O método de pagamento deve ter no máximo 30 caracteres.");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("As observações devem ter no máximo 1000 caracteres.");
    }
}

