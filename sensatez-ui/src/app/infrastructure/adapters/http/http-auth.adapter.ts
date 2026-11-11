import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse } from '../../../domain/models/auth.model';
import { AuthPort } from '../../../domain/ports/auth.port';

@Injectable({ providedIn: 'root' })
export class HttpAuthAdapter extends AuthPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  override login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request);
  }
}

