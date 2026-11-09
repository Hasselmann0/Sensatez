import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthenticatedUser } from '../../../domain/models/auth.model';
import { TokenStorageService } from '../../../infrastructure/storage/token-storage.service';

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

