import { Injectable, inject, signal } from '@angular/core';
import {
  CreateTenantRequest,
  TenantResponse,
  UpdateTenantRequest
} from '../../../domain/models/tenant.model';
import { NotificationPort, TenantPort } from '../../../domain/ports/ports.tokens';

@Injectable({ providedIn: 'root' })
export class TenantsStore {
  private readonly tenantPort = inject(TenantPort);
  private readonly notification = inject(NotificationPort);

  readonly tenants = signal<TenantResponse[]>([]);
  readonly loading = signal<boolean>(false);

  loadTenants(filters?: { search?: string; onlyActive?: boolean }): void {
    this.loading.set(true);
    this.tenantPort.getAll(filters).subscribe({
      next: list => {
        this.tenants.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createTenant(payload: CreateTenantRequest, onSuccess?: () => void): void {
    this.loading.set(true);
    this.tenantPort.create(payload).subscribe({
      next: tenant => {
        this.notification.success(`Inquilino(a) ${tenant.fullName} cadastrado(a) com sucesso!`);
        this.loading.set(false);
        this.loadTenants();
        onSuccess?.();
      },
      error: () => this.loading.set(false)
    });
  }

  updateTenant(id: string, payload: UpdateTenantRequest, onSuccess?: () => void): void {
    this.loading.set(true);
    this.tenantPort.update(id, payload).subscribe({
      next: tenant => {
        this.notification.success(`Cadastro de ${tenant.fullName} atualizado!`);
        this.loading.set(false);
        this.loadTenants();
        onSuccess?.();
      },
      error: () => this.loading.set(false)
    });
  }

  deactivateTenant(id: string, onSuccess?: () => void): void {
    this.tenantPort.deactivate(id).subscribe({
      next: () => {
        this.notification.info('Inquilino inativado com sucesso.');
        this.loadTenants();
        onSuccess?.();
      }
    });
  }
}
