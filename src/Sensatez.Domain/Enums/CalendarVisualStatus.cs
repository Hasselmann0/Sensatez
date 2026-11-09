namespace Sensatez.Domain.Enums;

public enum CalendarVisualStatus
{
    Paid = 1,       // Verde: aluguel pago
    DueSoon = 2,    // Amarelo: vence hoje ou nos próximos 5 dias
    Overdue = 3,    // Vermelho: vencido e não pago
    Upcoming = 4    // Cinza: vence em mais de 5 dias
}

