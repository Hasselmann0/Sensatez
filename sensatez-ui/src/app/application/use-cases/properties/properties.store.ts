import { Injectable, inject, signal } from '@angular/core';
import { PropertyStatus } from '../../../domain/enums/domain-enums';
import {
  CreatePropertyRequest,
  PropertyResponse,
  UpdatePropertyRequest
} from '../../../domain/models/property.model';
import { CommandBus, QueryBus } from '../../cqrs/cqrs-bus';
import {
  CreatePropertyCommand,
  GetPropertiesQuery,
  UpdatePropertyCommand,
  UpdatePropertyStatusCommand
} from './properties.cqrs';

@Injectable({ providedIn: 'root' })
export class PropertiesStore {
  private readonly queryBus = inject(QueryBus);
  private readonly commandBus = inject(CommandBus);

  readonly properties = signal<PropertyResponse[]>([]);
  readonly loading = signal<boolean>(false);

  loadProperties(filters?: { status?: PropertyStatus; ownerId?: string; search?: string }): void {
    this.loading.set(true);
    this.queryBus.dispatch(new GetPropertiesQuery(filters)).subscribe({
      next: list => {
        this.properties.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createProperty(payload: CreatePropertyRequest, onSuccess?: (created: PropertyResponse) => void): void {
    this.loading.set(true);
    this.commandBus.dispatch(new CreatePropertyCommand(payload)).subscribe({
      next: created => {
        this.loading.set(false);
        this.loadProperties();
        onSuccess?.(created);
      },
      error: () => this.loading.set(false)
    });
  }

  updateProperty(
    id: string,
    payload: UpdatePropertyRequest,
    onSuccess?: (updated: PropertyResponse) => void
  ): void {
    this.loading.set(true);
    this.commandBus.dispatch(new UpdatePropertyCommand(id, payload)).subscribe({
      next: updated => {
        this.loading.set(false);
        this.loadProperties();
        onSuccess?.(updated);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleMaintenance(property: PropertyResponse): void {
    const nextStatus =
      property.status === PropertyStatus.Maintenance
        ? PropertyStatus.Available
        : PropertyStatus.Maintenance;

    this.commandBus
      .dispatch(new UpdatePropertyStatusCommand(property.id, { status: nextStatus }))
      .subscribe({
        next: () => this.loadProperties()
      });
  }
}

