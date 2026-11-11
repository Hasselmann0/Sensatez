import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';

export abstract class AuthPort {
  abstract login(request: LoginRequest): Observable<LoginResponse>;
}

