import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse
} from '../../../domain/models/auth.model';
import {
  AuthPort,
  NotificationPort,
  SessionStoragePort
} from '../../../domain/ports/ports.tokens';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authPort = inject(AuthPort);
  private readonly sessionStorage = inject(SessionStoragePort);
  private readonly notification = inject(NotificationPort);

  private readonly _user = signal<AuthenticatedUser | null>(this.sessionStorage.getSession());
  private readonly _loading = signal<boolean>(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user()?.token);

  login(payload: LoginRequest, onSuccess?: (response: LoginResponse) => void): void {
    this._loading.set(true);
    this.authPort.login(payload).subscribe({
      next: response => {
        this.setSession(response);
        this._loading.set(false);
        this.notification.success(`Bem-vindo(a), ${response.fullName}!`, 'Acesso autorizado');
        onSuccess?.(response);
      },
      error: () => {
        this._loading.set(false);
      }
    });
  }

  logout(onSuccess?: () => void): void {
    this.clearSession();
    this.notification.info('Sessão encerrada com segurança.');
    onSuccess?.();
  }

  setSession(session: AuthenticatedUser): void {
    this.sessionStorage.saveSession(session);
    this._user.set(session);
  }

  clearSession(): void {
    this.sessionStorage.clear();
    this._user.set(null);
  }
}
