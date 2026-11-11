import { AuthenticatedUser } from '../models/auth.model';

export abstract class SessionStoragePort {
  abstract saveSession(session: AuthenticatedUser): void;
  abstract getSession(): AuthenticatedUser | null;
  abstract getToken(): string | null;
  abstract clear(): void;
}

