import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  AuthRepository,
  ChargeRepository,
  ContractRepository,
  DashboardRepository,
  OwnerRepository,
  PropertyRepository,
  TenantRepository
} from '../../domain/repositories/repositories.tokens';
import {
  HttpAuthRepository,
  HttpChargeRepository,
  HttpContractRepository,
  HttpDashboardRepository,
  HttpOwnerRepository,
  HttpPropertyRepository,
  HttpTenantRepository
} from '../repositories/http-repositories';

export function provideInfrastructureRepositories(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AuthRepository, useExisting: HttpAuthRepository },
    { provide: OwnerRepository, useExisting: HttpOwnerRepository },
    { provide: TenantRepository, useExisting: HttpTenantRepository },
    { provide: PropertyRepository, useExisting: HttpPropertyRepository },
    { provide: ContractRepository, useExisting: HttpContractRepository },
    { provide: ChargeRepository, useExisting: HttpChargeRepository },
    { provide: DashboardRepository, useExisting: HttpDashboardRepository }
  ]);
}

