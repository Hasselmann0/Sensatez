import { Injectable, inject, signal } from '@angular/core';
import { OwnerStatementResponse } from '../../../domain/models/dashboard.model';
import {
  CreateOwnerRequest,
  OwnerResponse,
  UpdateOwnerRequest
} from '../../../domain/models/owner.model';
import { CommandBus, QueryBus } from '../../cqrs/cqrs-bus';
import {
  CreateOwnerCommand,
  DeactivateOwnerCommand,
  GetOwnerStatementQuery,
  GetOwnersQuery,
  UpdateOwnerCommand
} from './owners.cqrs';

@Injectable({ providedIn: 'root' })
export class OwnersStore {
  private readonly queryBus = inject(QueryBus);
  private readonly commandBus = inject(CommandBus);

  readonly owners = signal<OwnerResponse[]>([]);
  readonly loading = signal<boolean>(false);
  readonly currentStatement = signal<OwnerStatementResponse | null>(null);
  readonly statementLoading = signal<boolean>(false);

  loadOwners(filters?: { search?: string; onlyActive?: boolean }): void {
    this.loading.set(true);
    this.queryBus.dispatch(new GetOwnersQuery(filters)).subscribe({
      next: list => {
        this.owners.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadStatement(ownerId: string, year: number, month: number): void {
    this.statementLoading.set(true);
    this.queryBus.dispatch(new GetOwnerStatementQuery(ownerId, year, month)).subscribe({
      next: statement => {
        this.currentStatement.set(statement);
        this.statementLoading.set(false);
      },
      error: () => this.statementLoading.set(false)
    });
  }

  createOwner(payload: CreateOwnerRequest, onSuccess?: () => void): void {
    this.loading.set(true);
    this.commandBus.dispatch(new CreateOwnerCommand(payload)).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadOwners();
        onSuccess?.();
      },
      error: () => this.loading.set(false)
    });
  }

  updateOwner(id: string, payload: UpdateOwnerRequest, onSuccess?: () => void): void {
    this.loading.set(true);
    this.commandBus.dispatch(new UpdateOwnerCommand(id, payload)).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadOwners();
        onSuccess?.();
      },
      error: () => this.loading.set(false)
    });
  }

  deactivateOwner(id: string, onSuccess?: () => void): void {
    this.commandBus.dispatch(new DeactivateOwnerCommand(id)).subscribe({
      next: () => {
        this.loadOwners();
        onSuccess?.();
      }
    });
  }
}

