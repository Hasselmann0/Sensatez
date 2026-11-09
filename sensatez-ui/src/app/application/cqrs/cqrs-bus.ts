import { Injectable, Injector, Type, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ICommand<TResult = void> {
  readonly __commandResultType?: TResult;
}

export interface ICommandHandler<TCommand extends ICommand<TResult>, TResult = void> {
  execute(command: TCommand): Observable<TResult>;
}

export interface IQuery<TResult> {
  readonly __queryResultType?: TResult;
}

export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  execute(query: TQuery): Observable<TResult>;
}

@Injectable({ providedIn: 'root' })
export class CommandBus {
  private readonly injector = inject(Injector);
  private readonly registry = new Map<Type<ICommand<unknown>>, Type<ICommandHandler<ICommand<unknown>, unknown>>>();

  register<TCommand extends ICommand<TResult>, TResult>(
    commandType: Type<TCommand>,
    handlerType: Type<ICommandHandler<TCommand, TResult>>
  ): void {
    this.registry.set(
      commandType as Type<ICommand<unknown>>,
      handlerType as Type<ICommandHandler<ICommand<unknown>, unknown>>
    );
  }

    dispatch<TResult>(command: ICommand<TResult>): Observable < TResult > {
      const commandType = command.constructor as Type<ICommand<TResult>>;
      const handlerType = this.registry.get(commandType as Type<ICommand<unknown>>);
      if(!handlerType) {
        throw new Error(`Nenhum CommandHandler registrado para o comando: ${commandType.name}`);
      }
      const handler = this.injector.get(handlerType) as ICommandHandler<ICommand<TResult>, TResult>;
      return handler.execute(command);
    }
  }

  @Injectable({ providedIn: 'root' })
  export class QueryBus {
  private readonly injector = inject(Injector);
  private readonly registry = new Map<Type<IQuery<unknown>>, Type<IQueryHandler<IQuery<unknown>, unknown>>>();

  register<TQuery extends IQuery<TResult>, TResult>(
    queryType: Type<TQuery>,
    handlerType: Type<IQueryHandler<TQuery, TResult>>
  ): void {
    this.registry.set(
      queryType as Type<IQuery<unknown>>,
      handlerType as Type<IQueryHandler<IQuery<unknown>, unknown>>
    );
  }

    dispatch<TResult>(query: IQuery<TResult>): Observable<TResult> {
      const queryType = query.constructor as Type<IQuery<TResult>>;
      const handlerType = this.registry.get(queryType as Type<IQuery<unknown>>);
      if (!handlerType) {
        throw new Error(`Nenhum QueryHandler registrado para a query: ${queryType.name}`);
      }
      const handler = this.injector.get(handlerType) as IQueryHandler<IQuery<TResult>, TResult>;
      return handler.execute(query);
    }
  }

