import { Injectable, inject, signal } from '@angular/core';
import { OwnerStatementResponse } from '../../../domain/models/dashboard.model';
import {
  CreateOwnerRequest,
  OwnerResponse,
  UpdateOwnerRequest
} from '../../../domain/models/owner.model';
import {
  DashboardPort,
  NotificationPort,
  OwnerPort
} from '../../../domain/ports/ports.tokens';

@Injectable({ providedIn: 'root' })
export class OwnersStore {
  private readonly ownerPort = inject(OwnerPort);
  private readonly dashboardPort = inject(DashboardPort);
  private readonly notification = inject(NotificationPort);

  readonly owners = signal<OwnerResponse[]>([]);
  readonly loading = signal<boolean>(false);
  readonly currentStatement = signal<OwnerStatementResponse | null>(null);
  readonly statementLoading = signal<boolean>(false);

  loadOwners(filters?: { search?: string; onlyActive?: boolean }): void {
    this.loading.set(true);
    this.ownerPort.getAll(filters).subscribe({
      next: list => {
        this.owners.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadStatement(ownerId: string, year: number, month: number): void {
    this.statementLoading.set(true);
    this.dashboardPort.getOwnerStatement(ownerId, year, month).subscribe({
      next: statement => {
        this.currentStatement.set(statement);
        this.statementLoading.set(false);
      },
      error: () => this.statementLoading.set(false)
    });
  }

  createOwner(payload: CreateOwnerRequest, onSuccess?: () => void): void {
    this.loading.set(true);
    this.ownerPort.create(payload).subscribe({
      next: owner => {
        this.notification.success(`Proprietário ${owner.fullName} cadastrado com sucesso!`);
        this.loading.set(false);
        this.loadOwners();
        onSuccess?.();
      },
      error: () => this.loading.set(false)
    });
  }

  updateOwner(id: string, payload: UpdateOwnerRequest, onSuccess?: () => void): void {
    this.loading.set(true);
    this.ownerPort.update(id, payload).subscribe({
      next: owner => {
        this.notification.success(`Dados de ${owner.fullName} atualizados!`);
        this.loading.set(false);
        this.loadOwners();
        onSuccess?.();
      },
      error: () => this.loading.set(false)
    });
  }

  deactivateOwner(id: string, onSuccess?: () => void): void {
    this.ownerPort.deactivate(id).subscribe({
      next: () => {
        this.notification.info('Proprietário inativado com sucesso.');
        this.loadOwners();
        onSuccess?.();
      }
    });
  }
}
