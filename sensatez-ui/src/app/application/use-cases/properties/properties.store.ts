import { Injectable, inject, signal } from '@angular/core';
import { PropertyStatus } from '../../../domain/enums/domain-enums';
import {
  CreatePropertyRequest,
  PropertyResponse,
  UpdatePropertyRequest
} from '../../../domain/models/property.model';
import { NotificationPort, PropertyPort } from '../../../domain/ports/ports.tokens';

@Injectable({ providedIn: 'root' })
export class PropertiesStore {
  private readonly propertyPort = inject(PropertyPort);
  private readonly notification = inject(NotificationPort);

  readonly properties = signal<PropertyResponse[]>([]);
  readonly loading = signal<boolean>(false);

  loadProperties(filters?: { status?: PropertyStatus; ownerId?: string; search?: string }): void {
    this.loading.set(true);
    this.propertyPort.getAll(filters).subscribe({
      next: list => {
        this.properties.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createProperty(payload: CreatePropertyRequest, onSuccess?: (created: PropertyResponse) => void): void {
    this.loading.set(true);
    this.propertyPort.create(payload).subscribe({
      next: created => {
        this.notification.success(`Imóvel ${created.code} cadastrado com sucesso!`);
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
    this.propertyPort.update(id, payload).subscribe({
      next: updated => {
        this.notification.success(`Imóvel ${updated.code} atualizado com sucesso!`);
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

    this.propertyPort
      .updateStatus(property.id, { status: nextStatus })
      .subscribe({
        next: () => {
          this.notification.success('Status de disponibilidade do imóvel atualizado!');
          this.loadProperties();
        }
      });
  }
}
