import { Injectable } from '@angular/core';
import { AuthenticatedUser } from '../../domain/models/auth.model';

const AUTH_STORAGE_KEY = 'sensatez_auth_session';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  saveSession(session: AuthenticatedUser): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  getSession(): AuthenticatedUser | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as AuthenticatedUser;
      if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() <= Date.now()) {
        this.clear();
        return null;
      }
      return parsed;
    } catch {
      this.clear();
      return null;
    }
  }

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  }

  clear(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

