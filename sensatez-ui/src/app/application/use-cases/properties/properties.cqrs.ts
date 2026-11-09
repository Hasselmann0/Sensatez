import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PropertyStatus } from '../../../domain/enums/domain-enums';
import {
  CreatePropertyRequest,
  PropertyResponse,
  UpdatePropertyRequest,
  UpdatePropertyStatusRequest
} from '../../../domain/models/property.model';
import { PropertyRepository } from '../../../domain/repositories/repositories.tokens';
import { ToastService } from '../../../presentation/shared/services/toast.service';
import { ICommand, ICommandHandler, IQuery, IQueryHandler } from '../../cqrs/cqrs-bus';

export { PropertiesStore } from './properties.store';

export class GetPropertiesQuery implements IQuery<PropertyResponse[]> {
  readonly __queryResultType?: PropertyResponse[];
  constructor(
    public readonly filters?: {
      status?: PropertyStatus;
      ownerId?: string;
      search?: string;
    }
  ) {}
}

export class GetPropertyByIdQuery implements IQuery<PropertyResponse> {
  readonly __queryResultType?: PropertyResponse;
  constructor(public readonly id: string) {}
}

export class CreatePropertyCommand implements ICommand<PropertyResponse> {
  readonly __commandResultType?: PropertyResponse;
  constructor(public readonly payload: CreatePropertyRequest) {}
}

export class UpdatePropertyCommand implements ICommand<PropertyResponse> {
  readonly __commandResultType?: PropertyResponse;
  constructor(
    public readonly id: string,
    public readonly payload: UpdatePropertyRequest
  ) {}
}

export class UpdatePropertyStatusCommand implements ICommand<PropertyResponse> {
  readonly __commandResultType?: PropertyResponse;
  constructor(
    public readonly id: string,
    public readonly payload: UpdatePropertyStatusRequest
  ) {}
}

@Injectable({ providedIn: 'root' })
export class GetPropertiesQueryHandler
  implements IQueryHandler<GetPropertiesQuery, PropertyResponse[]>
{
  private readonly repo = inject(PropertyRepository);
  execute(query: GetPropertiesQuery): Observable<PropertyResponse[]> {
    return this.repo.getAll(query.filters);
  }
}

@Injectable({ providedIn: 'root' })
export class GetPropertyByIdQueryHandler
  implements IQueryHandler<GetPropertyByIdQuery, PropertyResponse>
{
  private readonly repo = inject(PropertyRepository);
  execute(query: GetPropertyByIdQuery): Observable<PropertyResponse> {
    return this.repo.getById(query.id);
  }
}

@Injectable({ providedIn: 'root' })
export class CreatePropertyCommandHandler
  implements ICommandHandler<CreatePropertyCommand, PropertyResponse>
{
  private readonly repo = inject(PropertyRepository);
  private readonly toast = inject(ToastService);

  execute(command: CreatePropertyCommand): Observable<PropertyResponse> {
    return this.repo.create(command.payload).pipe(
      tap(prop => this.toast.success(`Imóvel ${prop.code} cadastrado com sucesso!`))
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UpdatePropertyCommandHandler
  implements ICommandHandler<UpdatePropertyCommand, PropertyResponse>
{
  private readonly repo = inject(PropertyRepository);
  private readonly toast = inject(ToastService);

  execute(command: UpdatePropertyCommand): Observable<PropertyResponse> {
    return this.repo.update(command.id, command.payload).pipe(
      tap(prop => this.toast.success(`Imóvel ${prop.code} atualizado com sucesso!`))
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UpdatePropertyStatusCommandHandler
  implements ICommandHandler<UpdatePropertyStatusCommand, PropertyResponse>
{
  private readonly repo = inject(PropertyRepository);
  private readonly toast = inject(ToastService);

  execute(command: UpdatePropertyStatusCommand): Observable<PropertyResponse> {
    return this.repo.updateStatus(command.id, command.payload).pipe(
      tap(() => this.toast.success('Status de disponibilidade do imóvel atualizado!'))
    );
  }
}
