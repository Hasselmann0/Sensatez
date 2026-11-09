import { Injectable, inject } from '@angular/core';
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
import { ICommand, ICommandHandler, IQuery, IQueryHandler } from '../../cqrs/cqrs-bus';

export { OwnersStore } from './owners.store';

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
