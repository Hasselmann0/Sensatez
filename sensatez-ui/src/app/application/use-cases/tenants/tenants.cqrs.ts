import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  CreateTenantRequest,
  TenantResponse,
  UpdateTenantRequest
} from '../../../domain/models/tenant.model';
import { TenantRepository } from '../../../domain/repositories/repositories.tokens';
import { ToastService } from '../../../presentation/shared/services/toast.service';
import {
  CommandBus,
  ICommand,
  ICommandHandler,
  IQuery,
  IQueryHandler,
  QueryBus
} from '../../cqrs/cqrs-bus';

export class GetTenantsQuery implements IQuery<TenantResponse[]> {
  readonly __queryResultType?: TenantResponse[];
  constructor(public readonly filters?: { search?: string; onlyActive?: boolean }) {}
}

export class CreateTenantCommand implements ICommand<TenantResponse> {
  readonly __commandResultType?: TenantResponse;
  constructor(public readonly payload: CreateTenantRequest) {}
}

export class UpdateTenantCommand implements ICommand<TenantResponse> {
  readonly __commandResultType?: TenantResponse;
  constructor(
    public readonly id: string,
    public readonly payload: UpdateTenantRequest
  ) {}
}

export class DeactivateTenantCommand implements ICommand<void> {
  readonly __commandResultType?: void;
  constructor(public readonly id: string) {}
}

@Injectable({ providedIn: 'root' })
export class GetTenantsQueryHandler implements IQueryHandler<GetTenantsQuery, TenantResponse[]> {
  private readonly repo = inject(TenantRepository);
  execute(query: GetTenantsQuery): Observable<TenantResponse[]> {
    return this.repo.getAll(query.filters);
  }
}

@Injectable({ providedIn: 'root' })
export class CreateTenantCommandHandler
  implements ICommandHandler<CreateTenantCommand, TenantResponse>
{
  private readonly repo = inject(TenantRepository);
  private readonly toast = inject(ToastService);

  execute(command: CreateTenantCommand): Observable<TenantResponse> {
    return this.repo.create(command.payload).pipe(
      tap(t => this.toast.success(`Inquilino(a) ${t.fullName} cadastrado(a) com sucesso!`))
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateTenantCommandHandler
  implements ICommandHandler<UpdateTenantCommand, TenantResponse>
{
  private readonly repo = inject(TenantRepository);
  private readonly toast = inject(ToastService);

  execute(command: UpdateTenantCommand): Observable<TenantResponse> {
    return this.repo.update(command.id, command.payload).pipe(
      tap(t => this.toast.success(`Cadastro de ${t.fullName} atualizado!`))
    );
  }
}

@Injectable({ providedIn: 'root' })
export class DeactivateTenantCommandHandler
  implements ICommandHandler<DeactivateTenantCommand, void>
{
  private readonly repo = inject(TenantRepository);
  private readonly toast = inject(ToastService);

  execute(command: DeactivateTenantCommand): Observable<void> {
    return this.repo.deactivate(command.id).pipe(
      tap(() => this.toast.info('Inquilino inativado com sucesso.'))
    );
  }
}

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

