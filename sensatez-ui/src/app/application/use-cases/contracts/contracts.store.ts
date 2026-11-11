import { Injectable, inject, signal } from '@angular/core';
import { ContractStatus } from '../../../domain/enums/domain-enums';
import {
  CreateLeaseContractRequest,
  LeaseContractResponse,
  ReadjustContractRequest,
  TerminateContractRequest
} from '../../../domain/models/lease-contract.model';
import { ContractPort, NotificationPort } from '../../../domain/ports/ports.tokens';

@Injectable({ providedIn: 'root' })
export class ContractsStore {
  private readonly contractPort = inject(ContractPort);
  private readonly notification = inject(NotificationPort);

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
    this.contractPort.getAll(filters).subscribe({
      next: list => {
        this.contracts.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadContractDetail(id: string): void {
    this.detailLoading.set(true);
    this.contractPort.getById(id).subscribe({
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
    this.contractPort.create(payload).subscribe({
      next: created => {
        const count = created.charges?.length ?? 0;
        this.notification.success(
          `Contrato ativado! ${count ? count + ' parcelas mensais foram geradas' : 'Parcelas geradas'} no Calendário Financeiro.`,
          'Locação confirmada'
        );
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
    this.contractPort.readjust(id, payload).subscribe({
      next: updated => {
        this.notification.success(
          'Reajuste anual aplicado! Todas as parcelas futuras em aberto foram recalculadas.',
          'Aluguel reajustado'
        );
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
    this.contractPort.terminate(id, payload).subscribe({
      next: updated => {
        this.notification.success(
          'Contrato rescindido! O imóvel voltou para Disponível e as parcelas futuras foram canceladas.',
          'Contrato encerrado'
        );
        this.selectedContract.set(updated);
        this.detailLoading.set(false);
        this.loadContracts();
        onSuccess?.(updated);
      },
      error: () => this.detailLoading.set(false)
    });
  }
}
