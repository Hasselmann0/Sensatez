import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { AuthenticatedUser, LoginRequest, LoginResponse } from '../../../domain/models/auth.model';
import { AuthRepository } from '../../../domain/repositories/repositories.tokens';
import { TokenStorageService } from '../../../infrastructure/storage/token-storage.service';
import { ToastService } from '../../../presentation/shared/services/toast.service';
import { ICommand, ICommandHandler } from '../../cqrs/cqrs-bus';

export class LoginCommand implements ICommand<LoginResponse> {
  readonly __commandResultType?: LoginResponse;
  constructor(public readonly payload: LoginRequest) {}
}

export class LogoutCommand implements ICommand<void> {
  readonly __commandResultType?: void;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly _user = signal<AuthenticatedUser | null>(this.tokenStorage.getSession());
  private readonly _loading = signal<boolean>(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user()?.token);

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setSession(session: AuthenticatedUser): void {
    this.tokenStorage.saveSession(session);
    this._user.set(session);
  }

  clearSession(): void {
    this.tokenStorage.clear();
    this._user.set(null);
  }
}

@Injectable({ providedIn: 'root' })
export class LoginCommandHandler implements ICommandHandler<LoginCommand, LoginResponse> {
  private readonly authRepo = inject(AuthRepository);
  private readonly authStore = inject(AuthStore);
  private readonly toast = inject(ToastService);

  execute(command: LoginCommand): Observable<LoginResponse> {
    this.authStore.setLoading(true);
    return this.authRepo.login(command.payload).pipe(
      tap({
        next: response => {
          this.authStore.setSession(response);
          this.authStore.setLoading(false);
          this.toast.success(`Bem-vindo(a), ${response.fullName}!`, 'Acesso autorizado');
        },
        error: () => {
          this.authStore.setLoading(false);
        }
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class LogoutCommandHandler implements ICommandHandler<LogoutCommand, void> {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  execute(): Observable<void> {
    this.authStore.clearSession();
    this.toast.info('Sessão encerrada com segurança.');
    this.router.navigate(['/login']);
    return of(void 0);
  }
}

