import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ContractStatus } from '../../../domain/enums/domain-enums';
import {
  CreateLeaseContractRequest,
  LeaseContractResponse,
  ReadjustContractRequest,
  TerminateContractRequest
} from '../../../domain/models/lease-contract.model';
import { ContractRepository } from '../../../domain/repositories/repositories.tokens';
import { ToastService } from '../../../presentation/shared/services/toast.service';
import { ICommand, ICommandHandler, IQuery, IQueryHandler } from '../../cqrs/cqrs-bus';

export { ContractsStore } from './contracts.store';

export class GetContractsQuery implements IQuery<LeaseContractResponse[]> {
  readonly __queryResultType?: LeaseContractResponse[];
  constructor(
    public readonly filters?: {
      status?: ContractStatus;
      propertyId?: string;
      tenantId?: string;
      expiringWithinDays?: number;
    }
  ) {}
}

export class GetContractByIdQuery implements IQuery<LeaseContractResponse> {
  readonly __queryResultType?: LeaseContractResponse;
  constructor(public readonly id: string) {}
}

export class CreateContractCommand implements ICommand<LeaseContractResponse> {
  readonly __commandResultType?: LeaseContractResponse;
  constructor(public readonly payload: CreateLeaseContractRequest) {}
}

export class ReadjustContractCommand implements ICommand<LeaseContractResponse> {
  readonly __commandResultType?: LeaseContractResponse;
  constructor(
    public readonly id: string,
    public readonly payload: ReadjustContractRequest
  ) {}
}

export class TerminateContractCommand implements ICommand<LeaseContractResponse> {
  readonly __commandResultType?: LeaseContractResponse;
  constructor(
    public readonly id: string,
    public readonly payload: TerminateContractRequest
  ) {}
}

@Injectable({ providedIn: 'root' })
export class GetContractsQueryHandler
  implements IQueryHandler<GetContractsQuery, LeaseContractResponse[]>
{
  private readonly repo = inject(ContractRepository);
  execute(query: GetContractsQuery): Observable<LeaseContractResponse[]> {
    return this.repo.getAll(query.filters);
  }
}

@Injectable({ providedIn: 'root' })
export class GetContractByIdQueryHandler
  implements IQueryHandler<GetContractByIdQuery, LeaseContractResponse>
{
  private readonly repo = inject(ContractRepository);
  execute(query: GetContractByIdQuery): Observable<LeaseContractResponse> {
    return this.repo.getById(query.id);
  }
}

@Injectable({ providedIn: 'root' })
export class CreateContractCommandHandler
  implements ICommandHandler<CreateContractCommand, LeaseContractResponse>
{
  private readonly repo = inject(ContractRepository);
  private readonly toast = inject(ToastService);

  execute(command: CreateContractCommand): Observable<LeaseContractResponse> {
    return this.repo.create(command.payload).pipe(
      tap(contract => {
        const count = contract.charges?.length ?? 0;
        this.toast.success(
          `Contrato ativado! ${count ? count + ' parcelas mensais foram geradas' : 'Parcelas geradas'} no Calendário Financeiro.`,
          'Locação confirmada'
        );
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class ReadjustContractCommandHandler
  implements ICommandHandler<ReadjustContractCommand, LeaseContractResponse>
{
  private readonly repo = inject(ContractRepository);
  private readonly toast = inject(ToastService);

  execute(command: ReadjustContractCommand): Observable<LeaseContractResponse> {
    return this.repo.readjust(command.id, command.payload).pipe(
      tap(() =>
        this.toast.success(
          'Reajuste anual aplicado! Todas as parcelas futuras em aberto foram recalculadas.',
          'Aluguel reajustado'
        )
      )
    );
  }
}

@Injectable({ providedIn: 'root' })
export class TerminateContractCommandHandler
  implements ICommandHandler<TerminateContractCommand, LeaseContractResponse>
{
  private readonly repo = inject(ContractRepository);
  private readonly toast = inject(ToastService);

  execute(command: TerminateContractCommand): Observable<LeaseContractResponse> {
    return this.repo.terminate(command.id, command.payload).pipe(
      tap(() =>
        this.toast.success(
          'Contrato rescindido! O imóvel voltou para Disponível e as parcelas futuras foram canceladas.',
          'Contrato encerrado'
        )
      )
    );
  }
}
