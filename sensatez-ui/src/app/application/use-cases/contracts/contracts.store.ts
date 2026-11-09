import { Injectable, inject, signal } from '@angular/core';
import { ContractStatus } from '../../../domain/enums/domain-enums';
import {
  CreateLeaseContractRequest,
  LeaseContractResponse,
  ReadjustContractRequest,
  TerminateContractRequest
} from '../../../domain/models/lease-contract.model';
import { CommandBus, QueryBus } from '../../cqrs/cqrs-bus';
import {
  CreateContractCommand,
  GetContractByIdQuery,
  GetContractsQuery,
  ReadjustContractCommand,
  TerminateContractCommand
} from './contracts.cqrs';

@Injectable({ providedIn: 'root' })
export class ContractsStore {
  private readonly queryBus = inject(QueryBus);
  private readonly commandBus = inject(CommandBus);

  readonly contracts = signal<LeaseContractResponse[]>([]);
  readonly selectedContract = signal<LeaseContractResponse | null>(null);
  readonly loading = signal<boolean>(false);
  readonly detailLoading = signal<boolean>(false);

  loadContracts(filters?: {
    status?: ContractStatus;
    propertyId?: string;
    tenantId?: string;
    expiringWithinDays?: number;
  }): void {
    this.loading.set(true);
    this.queryBus.dispatch(new GetContractsQuery(filters)).subscribe({
      next: list => {
        this.contracts.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadContractDetail(id: string): void {
    this.detailLoading.set(true);
    this.queryBus.dispatch(new GetContractByIdQuery(id)).subscribe({
      next: detail => {
        this.selectedContract.set(detail);
        this.detailLoading.set(false);
      },
      error: () => this.detailLoading.set(false)
    });
  }

  createContract(
    payload: CreateLeaseContractRequest,
    onSuccess?: (contract: LeaseContractResponse) => void
  ): void {
    this.loading.set(true);
    this.commandBus.dispatch(new CreateContractCommand(payload)).subscribe({
      next: created => {
        this.loading.set(false);
        this.loadContracts();
        onSuccess?.(created);
      },
      error: () => this.loading.set(false)
    });
  }

  readjustContract(
    id: string,
    payload: ReadjustContractRequest,
    onSuccess?: (updated: LeaseContractResponse) => void
  ): void {
    this.detailLoading.set(true);
    this.commandBus.dispatch(new ReadjustContractCommand(id, payload)).subscribe({
      next: updated => {
        this.selectedContract.set(updated);
        this.detailLoading.set(false);
        this.loadContracts();
        onSuccess?.(updated);
      },
      error: () => this.detailLoading.set(false)
    });
  }

  terminateContract(
    id: string,
    payload: TerminateContractRequest,
    onSuccess?: (updated: LeaseContractResponse) => void
  ): void {
    this.detailLoading.set(true);
    this.commandBus.dispatch(new TerminateContractCommand(id, payload)).subscribe({
      next: updated => {
        this.selectedContract.set(updated);
        this.detailLoading.set(false);
        this.loadContracts();
        onSuccess?.(updated);
      },
      error: () => this.detailLoading.set(false)
    });
  }
}

