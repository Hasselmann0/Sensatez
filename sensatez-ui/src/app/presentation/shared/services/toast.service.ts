import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string, title = 'Sucesso'): void {
    this.push({ type: 'success', title, message });
  }

  error(message: string, title = 'Atenção'): void {
    this.push({ type: 'error', title, message });
  }

  warning(message: string, title = 'Validação'): void {
    this.push({ type: 'warning', title, message });
  }

  info(message: string, title = 'Informação'): void {
    this.push({ type: 'info', title, message });
  }

  dismiss(id: string): void {
    this._toasts.update(list => list.filter(item => item.id !== id));
  }

  private push(toast: Omit<ToastMessage, 'id'>): void {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this._toasts.update(list => [...list, { ...toast, id }]);
    setTimeout(() => this.dismiss(id), 5500);
  }
}

