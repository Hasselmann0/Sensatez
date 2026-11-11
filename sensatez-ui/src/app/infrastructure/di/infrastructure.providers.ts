import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  AuthPort,
  ChargePort,
  ContractPort,
  DashboardPort,
  NotificationPort,
  OwnerPort,
  PropertyPort,
  SessionStoragePort,
  TenantPort
} from '../../domain/ports/ports.tokens';
import {
  HttpAuthAdapter,
  HttpChargeAdapter,
  HttpContractAdapter,
  HttpDashboardAdapter,
  HttpOwnerAdapter,
  HttpPropertyAdapter,
  HttpTenantAdapter
} from '../adapters/http/http-adapters';
import { ToastNotificationAdapter } from '../adapters/notification/toast-notification.adapter';
import { LocalStorageSessionAdapter } from '../adapters/storage/local-storage-session.adapter';

export function provideInfrastructureAdapters(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // HTTP Driven Adapters (API REST)
    { provide: AuthPort, useExisting: HttpAuthAdapter },
    { provide: OwnerPort, useExisting: HttpOwnerAdapter },
    { provide: TenantPort, useExisting: HttpTenantAdapter },
    { provide: PropertyPort, useExisting: HttpPropertyAdapter },
    { provide: ContractPort, useExisting: HttpContractAdapter },
    { provide: ChargePort, useExisting: HttpChargeAdapter },
    { provide: DashboardPort, useExisting: HttpDashboardAdapter },

    // Browser & UI Driven Adapters (Storage & Notifications)
    { provide: SessionStoragePort, useExisting: LocalStorageSessionAdapter },
    { provide: NotificationPort, useExisting: ToastNotificationAdapter }
  ]);
}
