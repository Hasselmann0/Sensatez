using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Sensatez.Application.Security;
using Sensatez.Domain.Entities;
using Sensatez.Domain.Enums;

namespace Sensatez.Infra.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(
        SensatezDbContext dbContext,
        IPasswordHasher passwordHasher,
        IConfiguration configuration)
    {
        await dbContext.Database.MigrateAsync();

        // 1. Seed do Usuário Administrador
        if (!await dbContext.Users.AnyAsync())
        {
            var adminName = configuration["AdminSeed:FullName"] ?? "Administrador Sensatez";
            var adminEmail = configuration["AdminSeed:Email"] ?? "admin@sensatez.com.br";
            var adminPassword = configuration["AdminSeed:Password"] ?? "Admin@2026!";

            dbContext.Users.Add(new User
            {
                FullName = adminName,
                Email = adminEmail,
                PasswordHash = passwordHasher.Hash(adminPassword),
                IsActive = true
            });

            await dbContext.SaveChangesAsync();
        }

        // 2. Seed da Massa de Dados Operacional e Financeira (Idempotente)
        if (await dbContext.Owners.AnyAsync())
        {
            return;
        }

        var nowUtc = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(nowUtc);

        // ==================== PROPRIETÁRIOS (CPFs e CNPJs válidos no Módulo 11) ====================
        var ownerCarlos = new Owner
        {
            Id = Guid.NewGuid(),
            FullName = "Carlos Eduardo Albuquerque",
            Document = BuildValidCpf("529982247"),
            Email = "carlos.albuquerque@patrimonio.com.br",
            Phone = "11991234567",
            PixKey = BuildValidCpf("529982247"),
            BankName = "Itaú Personnalité",
            BankAgency = "0350",
            BankAccount = "45892-1",
            Notes = "Proprietário VIP. Prefere repasses via Pix até o 2º dia útil após o pagamento.",
            IsActive = true
        };

        var ownerHelenaHolding = new Owner
        {
            Id = Guid.NewGuid(),
            FullName = "Helena Vasconcelos Patrimonial Ltda",
            Document = "11222333000181",
            Email = "financeiro@hvpatrimonial.com.br",
            Phone = "11988776655",
            PixKey = "11222333000181",
            BankName = "BTG Pactual",
            BankAgency = "0001",
            BankAccount = "990123-4",
            Notes = "Holding familiar de imóveis comerciais e residenciais de alto padrão.",
            IsActive = true
        };

        var ownerRoberto = new Owner
        {
            Id = Guid.NewGuid(),
            FullName = "Roberto Mendes de Souza",
            Document = BuildValidCpf("111444777"),
            Email = "roberto.mendes@gmail.com",
            Phone = "11976543210",
            PixKey = "roberto.mendes@gmail.com",
            BankName = "Banco Inter",
            BankAgency = "0001",
            BankAccount = "184520-9",
            Notes = "Solicita envio do extrato mensal em PDF por WhatsApp.",
            IsActive = true
        };

        var ownerPatricia = new Owner
        {
            Id = Guid.NewGuid(),
            FullName = "Patrícia Nogueira Ferraz",
            Document = BuildValidCpf("390533447"),
            Email = "patricia.ferraz@uol.com.br",
            Phone = "21998877665",
            PixKey = "+5521998877665",
            BankName = "Nubank",
            BankAgency = "0001",
            BankAccount = "773412-0",
            Notes = "Investidora de studios e salas comerciais.",
            IsActive = true
        };

        var ownerInactive = new Owner
        {
            Id = Guid.NewGuid(),
            FullName = "Antônio Carlos Silveira (Histórico)",
            Document = BuildValidCpf("286255878"),
            Email = "antonio.silveira@outlook.com",
            Phone = "11965432109",
            PixKey = null,
            BankName = "Bradesco",
            BankAgency = "1420",
            BankAccount = "33210-5",
            Notes = "Proprietário inativado após venda do imóvel da carteira.",
            IsActive = false
        };

        dbContext.Owners.AddRange(ownerCarlos, ownerHelenaHolding, ownerRoberto, ownerPatricia, ownerInactive);

        // ==================== INQUILINOS (CPFs e CNPJs válidos no Módulo 11) ====================
        var tenantMariana = new Tenant
        {
            Id = Guid.NewGuid(),
            FullName = "Mariana Costa Ribeiro",
            Document = BuildValidCpf("123456789"),
            Email = "mariana.ribeiro@techcorp.com",
            Phone = "11994455667",
            AdditionalInfo = "Diretora de Produto. Pagadora pontual via Pix.",
            IsActive = true
        };

        var tenantFernando = new Tenant
        {
            Id = Guid.NewGuid(),
            FullName = "Fernando Henrique Gomes",
            Document = BuildValidCpf("457986218"),
            Email = "fernando@ateliergomes.arq.br",
            Phone = "11993322110",
            AdditionalInfo = "Arquiteto autônomo. Caução de 3 aluguéis depositada.",
            IsActive = true
        };

        var tenantTechSolutions = new Tenant
        {
            Id = Guid.NewGuid(),
            FullName = "TechSolutions Consultoria Digital Ltda",
            Document = "11444777000161",
            Email = "contasapagar@techsolutions.io",
            Phone = "11981122334",
            AdditionalInfo = "Locação corporativa de conjunto comercial no Itaim Bibi.",
            IsActive = true
        };

        var tenantLucas = new Tenant
        {
            Id = Guid.NewGuid(),
            FullName = "Lucas Gabriel Martins",
            Document = BuildValidCpf("841265930"),
            Email = "lucas.martins@email.com.br",
            Phone = "11992233445",
            AdditionalInfo = "Em acompanhamento pela equipe de cobrança ativa.",
            IsActive = true
        };

        var tenantCamila = new Tenant
        {
            Id = Guid.NewGuid(),
            FullName = "Camila Andrade Figueiredo",
            Document = BuildValidCpf("635412890"),
            Email = "camila.figueiredo@medicina.br",
            Phone = "11987766554",
            AdditionalInfo = "Médica cardiologista. Contrato completando aniversário de reajuste anual.",
            IsActive = true
        };

        var tenantRafael = new Tenant
        {
            Id = Guid.NewGuid(),
            FullName = "Rafael Oliveira Peixoto",
            Document = BuildValidCpf("748596123"),
            Email = "rafael.peixoto@advocacia.com.br",
            Phone = "11975544332",
            AdditionalInfo = "Advogado. Contrato próximo ao término de vigência (renovação em negociação).",
            IsActive = true
        };

        var tenantJulianaInactive = new Tenant
        {
            Id = Guid.NewGuid(),
            FullName = "Juliana Paiva Moreira",
            Document = BuildValidCpf("951753852"),
            Email = "juliana.moreira@gmail.com",
            Phone = "11964433221",
            AdditionalInfo = "Ex-inquilina. Entregou as chaves de forma amigável.",
            IsActive = false
        };

        dbContext.Tenants.AddRange(
            tenantMariana,
            tenantFernando,
            tenantTechSolutions,
            tenantLucas,
            tenantCamila,
            tenantRafael,
            tenantJulianaInactive);

        // ==================== CARTEIRA DE IMÓVEIS (9 unidades: 6 Locados, 2 Disponíveis, 1 Manutenção) ====================
        var prop1 = new Property
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerCarlos.Id,
            Code = "IMO-001",
            Street = "Rua Oscar Freire",
            Number = "1420",
            Complement = "Apto 121 - Torre Jardins",
            Neighborhood = "Jardins",
            City = "São Paulo",
            State = "SP",
            ZipCode = "01426001",
            Type = PropertyType.Apartment,
            Status = PropertyStatus.Rented,
            SuggestedRentAmount = 6500.00m,
            DefaultCommissionPercentage = 10.00m,
            Notes = "Apartamento reformado, 3 suítes, 2 vagas demarcadas.",
            IsActive = true
        };

        var prop2 = new Property
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerCarlos.Id,
            Code = "IMO-002",
            Street = "Alameda Lorena",
            Number = "850",
            Complement = "Apto 84",
            Neighborhood = "Jardim Paulista",
            City = "São Paulo",
            State = "SP",
            ZipCode = "01424001",
            Type = PropertyType.Apartment,
            Status = PropertyStatus.Rented,
            SuggestedRentAmount = 4800.00m,
            DefaultCommissionPercentage = 10.00m,
            Notes = "Varanda gourmet, próximo ao metrô Consolação.",
            IsActive = true
        };

        var prop3 = new Property
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerHelenaHolding.Id,
            Code = "IMO-003",
            Street = "Avenida Brigadeiro Faria Lima",
            Number = "3477",
            Complement = "Conjunto 902 - Ed. Corporate",
            Neighborhood = "Itaim Bibi",
            City = "São Paulo",
            State = "SP",
            ZipCode = "04538133",
            Type = PropertyType.CommercialRoom,
            Status = PropertyStatus.Rented,
            SuggestedRentAmount = 12000.00m,
            DefaultCommissionPercentage = 8.00m,
            Notes = "Laje corporativa com piso elevado, ar-condicionado central e 4 vagas.",
            IsActive = true
        };

        var prop4 = new Property
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerRoberto.Id,
            Code = "IMO-004",
            Street = "Rua dos Pinheiros",
            Number = "610",
            Complement = "Apto 52",
            Neighborhood = "Pinheiros",
            City = "São Paulo",
            State = "SP",
            ZipCode = "05422001",
            Type = PropertyType.Apartment,
            Status = PropertyStatus.Rented,
            SuggestedRentAmount = 3500.00m,
            DefaultCommissionPercentage = 10.00m,
            Notes = "2 dormitórios, cozinha americana planejada.",
            IsActive = true
        };

        var prop5 = new Property
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerPatricia.Id,
            Code = "IMO-005",
            Street = "Rua Normandia",
            Number = "95",
            Complement = "Casa 02 - Vila Inglesa",
            Neighborhood = "Moema",
            City = "São Paulo",
            State = "SP",
            ZipCode = "04517040",
            Type = PropertyType.House,
            Status = PropertyStatus.Rented,
            SuggestedRentAmount = 5200.00m,
            DefaultCommissionPercentage = 10.00m,
            Notes = "Casa de vila charmosa e silenciosa em Moema Pássaros.",
            IsActive = true
        };

        var prop6 = new Property
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerHelenaHolding.Id,
            Code = "IMO-006",
            Street = "Avenida Engenheiro Luís Carlos Berrini",
            Number = "1681",
            Complement = "Sala 408",
            Neighborhood = "Cidade Monções",
            City = "São Paulo",
            State = "SP",
            ZipCode = "04571011",
            Type = PropertyType.CommercialRoom,
            Status = PropertyStatus.Rented,
            SuggestedRentAmount = 4200.00m,
            DefaultCommissionPercentage = 10.00m,
            Notes = "Sala comercial pronta para escritório de advocacia ou clínica.",
            IsActive = true
        };

        var prop7Available = new Property
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerRoberto.Id,
            Code = "IMO-007",
            Street = "Rua Harmonia",
            Number = "320",
            Complement = "Loft 14",
            Neighborhood = "Vila Madalena",
            City = "São Paulo",
            State = "SP",
            ZipCode = "05435000",
            Type = PropertyType.Apartment,
            Status = PropertyStatus.Available,
            SuggestedRentAmount = 3900.00m,
            DefaultCommissionPercentage = 10.00m,
            Notes = "Loft pé-direito duplo, recém-desocupado e pronto para nova locação.",
            IsActive = true
        };

        var prop8Available = new Property
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerCarlos.Id,
            Code = "IMO-008",
            Street = "Avenida Imperatriz Leopoldina",
            Number = "1950",
            Complement = "Galpão Logístico B",
            Neighborhood = "Vila Leopoldina",
            City = "São Paulo",
            State = "SP",
            ZipCode = "05305007",
            Type = PropertyType.Warehouse,
            Status = PropertyStatus.Available,
            SuggestedRentAmount = 9500.00m,
            DefaultCommissionPercentage = 8.00m,
            Notes = "Galpão comercial com doca para caminhão e escritório no mezanino.",
            IsActive = true
        };

        var prop9Maintenance = new Property
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerPatricia.Id,
            Code = "IMO-009",
            Street = "Rua Joaquim Floriano",
            Number = "780",
            Complement = "Studio 305",
            Neighborhood = "Itaim Bibi",
            City = "São Paulo",
            State = "SP",
            ZipCode = "04534003",
            Type = PropertyType.Apartment,
            Status = PropertyStatus.Maintenance,
            SuggestedRentAmount = 3100.00m,
            DefaultCommissionPercentage = 10.00m,
            Notes = "Em pintura geral e instalação de novos armários até o fim da semana.",
            IsActive = true
        };

        dbContext.Properties.AddRange(
            prop1,
            prop2,
            prop3,
            prop4,
            prop5,
            prop6,
            prop7Available,
            prop8Available,
            prop9Maintenance);

        // ==================== CONTRATOS E PARCELAS MENSAIS ====================
        // Datas dinâmicas baseadas no mês atual para popular todos os indicadores do Dashboard:
        var currentMonthStart = new DateOnly(today.Year, today.Month, 1);
        var daysInCurrentMonth = DateTime.DaysInMonth(today.Year, today.Month);

        // 1. Contrato 1 (IMO-001 - Mariana): Parcela do mês atual PAGA e JÁ REPASSADA ao proprietário (Verde + Repassado)
        var dueDay1 = Math.Clamp(today.Day - 3, 1, 28);
        var contract1 = CreateContractWithSchedule(
            propertyId: prop1.Id,
            tenantId: tenantMariana.Id,
            startDate: currentMonthStart.AddMonths(-6),
            endDate: currentMonthStart.AddMonths(18).AddDays(-1),
            dueDay: dueDay1,
            rentAmount: 6500.00m,
            commissionPct: 10.00m,
            index: ReadjustmentIndex.IGPM,
            notes: "Contrato residencial padrão 24 meses. Seguro fiança aprovado.",
            today: today,
            currentMonthScenario: ChargeScenario.PaidAndTransferred);

        // 2. Contrato 2 (IMO-002 - Fernando): Parcela do mês atual PAGA, mas AGUARDANDO REPASSE PIX ao proprietário (Alerta Repasse Pix)
        var dueDay2 = Math.Clamp(today.Day - 1, 1, 28);
        var contract2 = CreateContractWithSchedule(
            propertyId: prop2.Id,
            tenantId: tenantFernando.Id,
            startDate: currentMonthStart.AddMonths(-4),
            endDate: currentMonthStart.AddMonths(20).AddDays(-1),
            dueDay: dueDay2,
            rentAmount: 4800.00m,
            commissionPct: 10.00m,
            index: ReadjustmentIndex.IPCA,
            notes: "Caução de R$ 14.400,00 depositada em conta vinculada.",
            today: today,
            currentMonthScenario: ChargeScenario.PaidPendingTransfer);

        // 3. Contrato 3 (IMO-003 - TechSolutions): Parcela do mês atual VENCENDO EM BREVE (até 5 dias - Semáforo Amarelo)
        var dueSoonDate = today.AddDays(3);
        var dueDay3 = dueSoonDate.Month == today.Month ? dueSoonDate.Day : today.Day;
        var contract3 = CreateContractWithSchedule(
            propertyId: prop3.Id,
            tenantId: tenantTechSolutions.Id,
            startDate: currentMonthStart.AddMonths(-8),
            endDate: currentMonthStart.AddMonths(22).AddDays(-1),
            dueDay: dueDay3,
            rentAmount: 12000.00m,
            commissionPct: 8.00m,
            index: ReadjustmentIndex.IGPM,
            notes: "Contrato comercial 30 meses. Boleto + Pix corporativo.",
            today: today,
            currentMonthScenario: ChargeScenario.PendingDueSoon);

        // 4. Contrato 4 (IMO-004 - Lucas): INADIMPLENTE (Mês passado em atraso + Mês atual em atraso - Semáforo Vermelho)
        var overdueDay = today.Day > 5 ? today.Day - 5 : 1;
        var contract4 = CreateContractWithSchedule(
            propertyId: prop4.Id,
            tenantId: tenantLucas.Id,
            startDate: currentMonthStart.AddMonths(-5),
            endDate: currentMonthStart.AddMonths(19).AddDays(-1),
            dueDay: overdueDay,
            rentAmount: 3500.00m,
            commissionPct: 10.00m,
            index: ReadjustmentIndex.IGPM,
            notes: "Atenção: inquilino solicitou renegociação das parcelas em aberto.",
            today: today,
            currentMonthScenario: ChargeScenario.OverdueTwoMonths);

        // 5. Contrato 5 (IMO-005 - Camila): ANIVERSÁRIO DE 12 MESES (Elegível a Reajuste Anual 📈) + Parcela A Vencer no mês
        var upcomingDay = Math.Min(daysInCurrentMonth, Math.Max(today.Day + 8, 22));
        var contract5 = CreateContractWithSchedule(
            propertyId: prop5.Id,
            tenantId: tenantCamila.Id,
            startDate: currentMonthStart.AddMonths(-12),
            endDate: currentMonthStart.AddMonths(18).AddDays(-1),
            dueDay: upcomingDay,
            rentAmount: 5200.00m,
            commissionPct: 10.00m,
            index: ReadjustmentIndex.IGPM,
            notes: "Aniversário de 12 meses atingido neste mês — elegível a reajuste pelo IGP-M.",
            today: today,
            currentMonthScenario: ChargeScenario.UpcomingInMonth);

        // 6. Contrato 6 (IMO-006 - Rafael): VENCENDO NOS PRÓXIMOS 45 DIAS (⏳ Alerta de Fim de Vigência)
        var expiringEndDate = today.AddDays(25);
        var contract6 = CreateContractWithSchedule(
            propertyId: prop6.Id,
            tenantId: tenantRafael.Id,
            startDate: currentMonthStart.AddMonths(-11),
            endDate: expiringEndDate,
            dueDay: Math.Min(daysInCurrentMonth, Math.Max(today.Day + 6, 20)),
            rentAmount: 4200.00m,
            commissionPct: 10.00m,
            index: ReadjustmentIndex.IPCA,
            notes: "Contrato próximo ao término de vigência. Propor aditivo de renovação.",
            today: today,
            currentMonthScenario: ChargeScenario.PaidAndTransferred);

        // 7. Contrato 7 (IMO-007 - Juliana): RESCINDIDO / ENCERRADO (Histórico para filtro de Rescindidos)
        var contract7Terminated = CreateContractWithSchedule(
            propertyId: prop7Available.Id,
            tenantId: tenantJulianaInactive.Id,
            startDate: currentMonthStart.AddMonths(-14),
            endDate: currentMonthStart.AddMonths(-2).AddDays(-1),
            dueDay: 10,
            rentAmount: 3700.00m,
            commissionPct: 10.00m,
            index: ReadjustmentIndex.INPC,
            notes: "Locação encerrada amigavelmente após vistoria final sem pendências. | [Rescisão]: Entrega amigável das chaves.",
            today: today,
            currentMonthScenario: ChargeScenario.TerminatedHistorical);
        contract7Terminated.Status = ContractStatus.Terminated;
        contract7Terminated.TerminatedAt = nowUtc.AddMonths(-2);

        dbContext.LeaseContracts.AddRange(
            contract1,
            contract2,
            contract3,
            contract4,
            contract5,
            contract6,
            contract7Terminated);

        await dbContext.SaveChangesAsync();
    }

    private enum ChargeScenario
    {
        PaidAndTransferred,
        PaidPendingTransfer,
        PendingDueSoon,
        OverdueTwoMonths,
        UpcomingInMonth,
        TerminatedHistorical
    }

    private static LeaseContract CreateContractWithSchedule(
        Guid propertyId,
        Guid tenantId,
        DateOnly startDate,
        DateOnly endDate,
        int dueDay,
        decimal rentAmount,
        decimal commissionPct,
        ReadjustmentIndex index,
        string notes,
        DateOnly today,
        ChargeScenario currentMonthScenario)
    {
        var contract = new LeaseContract
        {
            Id = Guid.NewGuid(),
            PropertyId = propertyId,
            TenantId = tenantId,
            StartDate = startDate,
            EndDate = endDate,
            DueDay = dueDay,
            RentAmount = rentAmount,
            CommissionPercentage = commissionPct,
            SecurityDepositAmount = rentAmount * 3m,
            PenaltyPercentage = 2.00m,
            MonthlyInterestPercentage = 1.00m,
            ReadjustmentIndex = index,
            Status = ContractStatus.Active,
            Notes = notes,
            IsActive = true
        };

        var cursor = new DateOnly(startDate.Year, startDate.Month, 1);
        var endMonth = new DateOnly(endDate.Year, endDate.Month, 1);
        var currentMonth = new DateOnly(today.Year, today.Month, 1);
        var previousMonth = currentMonth.AddMonths(-1);

        var commissionAmount = Math.Round(rentAmount * (commissionPct / 100m), 2, MidpointRounding.AwayFromZero);
        var netOwnerAmount = rentAmount - commissionAmount;

        while (cursor <= endMonth)
        {
            var daysInMonth = DateTime.DaysInMonth(cursor.Year, cursor.Month);
            var effectiveDay = Math.Min(dueDay, daysInMonth);
            var dueDate = new DateOnly(cursor.Year, cursor.Month, effectiveDay);

            var charge = new RentCharge
            {
                Id = Guid.NewGuid(),
                LeaseContractId = contract.Id,
                ReferenceYear = cursor.Year,
                ReferenceMonth = cursor.Month,
                DueDate = dueDate,
                OriginalAmount = rentAmount,
                PenaltyAmount = 0m,
                InterestAmount = 0m,
                DiscountAmount = 0m,
                TotalAmount = rentAmount,
                CommissionPercentage = commissionPct,
                CommissionAmount = commissionAmount,
                NetOwnerAmount = netOwnerAmount,
                Status = ChargeStatus.Pending,
                IsActive = true
            };

            if (cursor < currentMonth)
            {
                // Se for o cenário de inadimplência de 2 meses e for o mês imediatamente anterior, deixa em aberto (vencido)!
                if (currentMonthScenario == ChargeScenario.OverdueTwoMonths && cursor == previousMonth)
                {
                    charge.Status = ChargeStatus.Pending;
                    charge.Notes = "1º aviso enviado por WhatsApp. Inquilino prometeu quitar junto com a próxima parcela.";
                }
                else
                {
                    // Meses passados já quitados e repassados
                    var paidAtUtc = dueDate.ToDateTime(new TimeOnly(14, 30), DateTimeKind.Utc);
                    charge.Status = ChargeStatus.Paid;
                    charge.PaidAt = paidAtUtc;
                    charge.PaidAmount = rentAmount;
                    charge.PaymentMethod = "Pix";
                    charge.IsTransferredToOwner = true;
                    charge.TransferredToOwnerAt = paidAtUtc.AddDays(1);
                    charge.Notes = "Pagamento mensal liquidado dentro do vencimento.";
                }
            }
            else if (cursor == currentMonth)
            {
                switch (currentMonthScenario)
                {
                    case ChargeScenario.PaidAndTransferred:
                        {
                            var paidAtUtc = DateTime.UtcNow.AddDays(-2);
                            charge.Status = ChargeStatus.Paid;
                            charge.PaidAt = paidAtUtc;
                            charge.PaidAmount = rentAmount;
                            charge.PaymentMethod = "Pix";
                            charge.IsTransferredToOwner = true;
                            charge.TransferredToOwnerAt = paidAtUtc.AddHours(6);
                            charge.Notes = "Recebido via Pix e repassado ao proprietário no mesmo dia.";
                            break;
                        }
                    case ChargeScenario.PaidPendingTransfer:
                        {
                            var paidAtUtc = DateTime.UtcNow.AddHours(-18);
                            charge.Status = ChargeStatus.Paid;
                            charge.PaidAt = paidAtUtc;
                            charge.PaidAmount = rentAmount;
                            charge.PaymentMethod = "Pix";
                            charge.IsTransferredToOwner = false;
                            charge.TransferredToOwnerAt = null;
                            charge.Notes = "Comprovante Pix validado. Aguardando liberação do repasse ao proprietário.";
                            break;
                        }
                    case ChargeScenario.OverdueTwoMonths:
                        {
                            // Garante que a data de vencimento no mês atual já tenha passado
                            if (charge.DueDate >= today)
                            {
                                charge.DueDate = today.AddDays(-1);
                            }
                            charge.Status = ChargeStatus.Pending;
                            charge.Notes = "Parcela do mês atual vencida. Aguardando retorno sobre proposta de acordo.";
                            break;
                        }
                    case ChargeScenario.PendingDueSoon:
                    case ChargeScenario.UpcomingInMonth:
                    default:
                        {
                            charge.Status = ChargeStatus.Pending;
                            break;
                        }
                }
            }

            contract.Charges.Add(charge);
            cursor = cursor.AddMonths(1);
        }

        return contract;
    }

    private static string BuildValidCpf(string nineDigits)
    {
        if (nineDigits.Length != 9)
        {
            throw new ArgumentException("A base do CPF deve conter 9 dígitos.", nameof(nineDigits));
        }

        var sum1 = 0;
        for (var i = 0; i < 9; i++)
        {
            sum1 += (nineDigits[i] - '0') * (10 - i);
        }

        var rem1 = (sum1 * 10) % 11;
        if (rem1 == 10) rem1 = 0;

        var tenDigits = nineDigits + rem1;
        var sum2 = 0;
        for (var i = 0; i < 10; i++)
        {
            sum2 += (tenDigits[i] - '0') * (11 - i);
        }

        var rem2 = (sum2 * 10) % 11;
        if (rem2 == 10) rem2 = 0;

        return tenDigits + rem2;
    }
}

