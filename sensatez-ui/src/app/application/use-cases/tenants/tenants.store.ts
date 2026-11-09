import { Injectable, inject, signal } from '@angular/core';
import {
  CreateTenantRequest,
  TenantResponse,
  UpdateTenantRequest
} from '../../../domain/models/tenant.model';
import { CommandBus, QueryBus } from '../../cqrs/cqrs-bus';
import {
  CreateTenantCommand,
  DeactivateTenantCommand,
  GetTenantsQuery,
  UpdateTenantCommand
} from './tenants.cqrs';

@Injectable({ providedIn: 'root' })
export class TenantsStore {
  private readonly queryBus = inject(QueryBus);
  private readonly commandBus = inject(CommandBus);

  readonly tenants = signal<TenantResponse[]>([]);
  readonly loading = signal<boolean>(false);

  loadTenants(filters?: { search?: string; onlyActive?: boolean }): void {
    this.loading.set(true);
    this.queryBus.dispatch(new GetTenantsQuery(filters)).subscribe({
      next: list => {
        this.tenants.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createTenant(payload: CreateTenantRequest, onSuccess?: () => void): void {
    this.loading.set(true);
    this.commandBus.dispatch(new CreateTenantCommand(payload)).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadTenants();
        onSuccess?.();
      },
      error: () => this.loading.set(false)
    });
  }

  updateTenant(id: string, payload: UpdateTenantRequest, onSuccess?: () => void): void {
    this.loading.set(true);
    this.commandBus.dispatch(new UpdateTenantCommand(id, payload)).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadTenants();
        onSuccess?.();
      },
      error: () => this.loading.set(false)
    });
  }

  deactivateTenant(id: string, onSuccess?: () => void): void {
    this.commandBus.dispatch(new DeactivateTenantCommand(id)).subscribe({
      next: () => {
        this.loadTenants();
        onSuccess?.();
      }
    });
  }
}

