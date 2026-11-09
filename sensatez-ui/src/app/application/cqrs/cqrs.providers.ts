import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import {
  CreateContractCommand,
  CreateContractCommandHandler,
  GetContractByIdQuery,
  GetContractByIdQueryHandler,
  GetContractsQuery,
  GetContractsQueryHandler,
  ReadjustContractCommand,
  ReadjustContractCommandHandler,
  TerminateContractCommand,
  TerminateContractCommandHandler
} from '../use-cases/contracts/contracts.cqrs';
import {
  LoginCommand,
  LoginCommandHandler,
  LogoutCommand,
  LogoutCommandHandler
} from '../use-cases/auth/auth.cqrs';
import {
  GetCalendarMonthQuery,
  GetCalendarMonthQueryHandler,
  GetChargeDetailQuery,
  GetChargeDetailQueryHandler,
  GetMonthlySummaryQuery,
  GetMonthlySummaryQueryHandler,
  GetOperationalAlertsQuery,
  GetOperationalAlertsQueryHandler,
  GetOverdueChargesQuery,
  GetOverdueChargesQueryHandler,
  PayChargeCommand,
  PayChargeCommandHandler,
  TransferToOwnerCommand,
  TransferToOwnerCommandHandler,
  UpdateChargeNotesCommand,
  UpdateChargeNotesCommandHandler
} from '../use-cases/dashboard-hub/financial-hub.cqrs';
import {
  CreateOwnerCommand,
  CreateOwnerCommandHandler,
  DeactivateOwnerCommand,
  DeactivateOwnerCommandHandler,
  GetOwnerStatementQuery,
  GetOwnerStatementQueryHandler,
  GetOwnersQuery,
  GetOwnersQueryHandler,
  UpdateOwnerCommand,
  UpdateOwnerCommandHandler
} from '../use-cases/owners/owners.cqrs';
import {
  CreatePropertyCommand,
  CreatePropertyCommandHandler,
  GetPropertiesQuery,
  GetPropertiesQueryHandler,
  GetPropertyByIdQuery,
  GetPropertyByIdQueryHandler,
  UpdatePropertyCommand,
  UpdatePropertyCommandHandler,
  UpdatePropertyStatusCommand,
  UpdatePropertyStatusCommandHandler
} from '../use-cases/properties/properties.cqrs';
import {
  CreateTenantCommand,
  CreateTenantCommandHandler,
  DeactivateTenantCommand,
  DeactivateTenantCommandHandler,
  GetTenantsQuery,
  GetTenantsQueryHandler,
  UpdateTenantCommand,
  UpdateTenantCommandHandler
} from '../use-cases/tenants/tenants.cqrs';
import { CommandBus, QueryBus } from './cqrs-bus';

export function provideApplicationCqrs(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const commandBus = inject(CommandBus);
        const queryBus = inject(QueryBus);

        // Auth Commands
        commandBus.register(LoginCommand, LoginCommandHandler);
        commandBus.register(LogoutCommand, LogoutCommandHandler);

        // Financial Hub Queries & Commands
        queryBus.register(GetCalendarMonthQuery, GetCalendarMonthQueryHandler);
        queryBus.register(GetMonthlySummaryQuery, GetMonthlySummaryQueryHandler);
        queryBus.register(GetOperationalAlertsQuery, GetOperationalAlertsQueryHandler);
        queryBus.register(GetOverdueChargesQuery, GetOverdueChargesQueryHandler);
        queryBus.register(GetChargeDetailQuery, GetChargeDetailQueryHandler);
        commandBus.register(PayChargeCommand, PayChargeCommandHandler);
        commandBus.register(TransferToOwnerCommand, TransferToOwnerCommandHandler);
        commandBus.register(UpdateChargeNotesCommand, UpdateChargeNotesCommandHandler);

        // Properties Queries & Commands
        queryBus.register(GetPropertiesQuery, GetPropertiesQueryHandler);
        queryBus.register(GetPropertyByIdQuery, GetPropertyByIdQueryHandler);
        commandBus.register(CreatePropertyCommand, CreatePropertyCommandHandler);
        commandBus.register(UpdatePropertyCommand, UpdatePropertyCommandHandler);
        commandBus.register(UpdatePropertyStatusCommand, UpdatePropertyStatusCommandHandler);

        // Contracts Queries & Commands
        queryBus.register(GetContractsQuery, GetContractsQueryHandler);
        queryBus.register(GetContractByIdQuery, GetContractByIdQueryHandler);
        commandBus.register(CreateContractCommand, CreateContractCommandHandler);
        commandBus.register(ReadjustContractCommand, ReadjustContractCommandHandler);
        commandBus.register(TerminateContractCommand, TerminateContractCommandHandler);

        // Owners Queries & Commands
        queryBus.register(GetOwnersQuery, GetOwnersQueryHandler);
        queryBus.register(GetOwnerStatementQuery, GetOwnerStatementQueryHandler);
        commandBus.register(CreateOwnerCommand, CreateOwnerCommandHandler);
        commandBus.register(UpdateOwnerCommand, UpdateOwnerCommandHandler);
        commandBus.register(DeactivateOwnerCommand, DeactivateOwnerCommandHandler);

        // Tenants Queries & Commands
        queryBus.register(GetTenantsQuery, GetTenantsQueryHandler);
        commandBus.register(CreateTenantCommand, CreateTenantCommandHandler);
        commandBus.register(UpdateTenantCommand, UpdateTenantCommandHandler);
        commandBus.register(DeactivateTenantCommand, DeactivateTenantCommandHandler);
      }
    }
  ]);
}

