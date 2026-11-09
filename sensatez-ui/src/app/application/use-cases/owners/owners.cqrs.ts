import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { OwnerStatementResponse } from '../../../domain/models/dashboard.model';
import {
  CreateOwnerRequest,
  OwnerResponse,
  UpdateOwnerRequest
} from '../../../domain/models/owner.model';
import {
  DashboardRepository,
  OwnerRepository
} from '../../../domain/repositories/repositories.tokens';
import { ToastService } from '../../../presentation/shared/services/toast.service';
import {
  CommandBus,
  ICommand,
  ICommandHandler,
  IQuery,
  IQueryHandler,
  QueryBus
} from '../../cqrs/cqrs-bus';

export class GetOwnersQuery implements IQuery<OwnerResponse[]> {
  readonly __queryResultType?: OwnerResponse[];
  constructor(public readonly filters?: { search?: string; onlyActive?: boolean }) {}
}

export class GetOwnerStatementQuery implements IQuery<OwnerStatementResponse> {
  readonly __queryResultType?: OwnerStatementResponse;
  constructor(
    public readonly ownerId: string,
    public readonly year: number,
    public readonly month: number
  ) {}
}

export class CreateOwnerCommand implements ICommand<OwnerResponse> {
  readonly __commandResultType?: OwnerResponse;
  constructor(public readonly payload: CreateOwnerRequest) {}
}

export class UpdateOwnerCommand implements ICommand<OwnerResponse> {
  readonly __commandResultType?: OwnerResponse;
  constructor(
    public readonly id: string,
    public readonly payload: UpdateOwnerRequest
  ) {}
}

export class DeactivateOwnerCommand implements ICommand<void> {
  readonly __commandResultType?: void;
  constructor(public readonly id: string) {}
}

@Injectable({ providedIn: 'root' })
export class GetOwnersQueryHandler implements IQueryHandler<GetOwnersQuery, OwnerResponse[]> {
  private readonly repo = inject(OwnerRepository);
  execute(query: GetOwnersQuery): Observable<OwnerResponse[]> {
    return this.repo.getAll(query.filters);
  }
}

@Injectable({ providedIn: 'root' })
export class GetOwnerStatementQueryHandler
  implements IQueryHandler<GetOwnerStatementQuery, OwnerStatementResponse>
{
  private readonly dashboardRepo = inject(DashboardRepository);
  execute(query: GetOwnerStatementQuery): Observable<OwnerStatementResponse> {
    return this.dashboardRepo.getOwnerStatement(query.ownerId, query.year, query.month);
  }
}

@Injectable({ providedIn: 'root' })
export class CreateOwnerCommandHandler
  implements ICommandHandler<CreateOwnerCommand, OwnerResponse>
{
  private readonly repo = inject(OwnerRepository);
  private readonly toast = inject(ToastService);

  execute(command: CreateOwnerCommand): Observable<OwnerResponse> {
    return this.repo.create(command.payload).pipe(
      tap(owner => this.toast.success(`Proprietário ${owner.fullName} cadastrado com sucesso!`))
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateOwnerCommandHandler
  implements ICommandHandler<UpdateOwnerCommand, OwnerResponse>
{
  private readonly repo = inject(OwnerRepository);
  private readonly toast = inject(ToastService);

  execute(command: UpdateOwnerCommand): Observable<OwnerResponse> {
    return this.repo.update(command.id, command.payload).pipe(
      tap(owner => this.toast.success(`Dados de ${owner.fullName} atualizados!`))
    );
  }
}

@Injectable({ providedIn: 'root' })
export class DeactivateOwnerCommandHandler
  implements ICommandHandler<DeactivateOwnerCommand, void>
{
  private readonly repo = inject(OwnerRepository);
  private readonly toast = inject(ToastService);

  execute(command: DeactivateOwnerCommand): Observable<void> {
    return this.repo.deactivate(command.id).pipe(
      tap(() => this.toast.info('Proprietário inativado com sucesso.'))
    );
  }
}

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

