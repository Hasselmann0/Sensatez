import { Injectable, inject } from '@angular/core';
import { NotificationPort } from '../../../domain/ports/notification.port';
import { ToastService } from '../../../presentation/shared/services/toast.service';

@Injectable({ providedIn: 'root' })
export class ToastNotificationAdapter extends NotificationPort {
  private readonly toastService = inject(ToastService);

  override success(message: string, title?: string): void {
    this.toastService.success(message, title);
  }

  override error(message: string, title?: string): void {
    this.toastService.error(message, title);
  }

  override warning(message: string, title?: string): void {
    this.toastService.warning(message, title);
  }

  override info(message: string, title?: string): void {
    this.toastService.info(message, title);
  }
}

