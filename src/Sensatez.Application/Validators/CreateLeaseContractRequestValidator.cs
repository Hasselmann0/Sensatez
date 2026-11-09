using FluentValidation;
using Sensatez.Application.DTOs.Requests;

namespace Sensatez.Application.Validators;

public class CreateLeaseContractRequestValidator : AbstractValidator<CreateLeaseContractRequest>
{
    public CreateLeaseContractRequestValidator()
    {
        RuleFor(x => x.PropertyId)
            .NotEmpty().WithMessage("O imóvel é obrigatório.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("O inquilino é obrigatório.");

        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate).WithMessage("A data de término deve ser posterior à data de início do contrato.")
            .Must((req, endDate) =>
            {
                var months = ((endDate.Year - req.StartDate.Year) * 12) + endDate.Month - req.StartDate.Month + 1;
                return months is >= 1 and <= 120;
            })
            .WithMessage("A duração do contrato deve ser entre 1 e 120 meses.");

        RuleFor(x => x.DueDay)
            .InclusiveBetween(1, 31).WithMessage("O dia de vencimento deve estar entre 1 e 31.");

        RuleFor(x => x.RentAmount)
            .GreaterThan(0).WithMessage("O valor do aluguel deve ser maior que zero.");

        RuleFor(x => x.CommissionPercentage)
            .InclusiveBetween(0, 100).WithMessage("O percentual de comissão deve estar entre 0% e 100%.");

        RuleFor(x => x.SecurityDepositAmount)
            .GreaterThanOrEqualTo(0).WithMessage("O valor da caução não pode ser negativo.");

        RuleFor(x => x.PenaltyPercentage)
            .InclusiveBetween(0, 100).WithMessage("O percentual de multa deve estar entre 0% e 100%.");

        RuleFor(x => x.MonthlyInterestPercentage)
            .InclusiveBetween(0, 100).WithMessage("O percentual de juros mensais deve estar entre 0% e 100%.");

        RuleFor(x => x.ReadjustmentIndex)
            .IsInEnum().WithMessage("O índice de reajuste informado é inválido.");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("As observações devem ter no máximo 1000 caracteres.");
    }
}

