import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';

export abstract class AuthRepository {
  abstract login(request: LoginRequest): Observable<LoginResponse>;
}

