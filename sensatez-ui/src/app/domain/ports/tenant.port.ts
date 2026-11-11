import { Observable } from 'rxjs';
import { CreateTenantRequest, TenantResponse, UpdateTenantRequest } from '../models/tenant.model';

export abstract class TenantPort {
  abstract getAll(params?: { search?: string; onlyActive?: boolean }): Observable<TenantResponse[]>;
  abstract getById(id: string): Observable<TenantResponse>;
  abstract create(request: CreateTenantRequest): Observable<TenantResponse>;
  abstract update(id: string, request: UpdateTenantRequest): Observable<TenantResponse>;
  abstract deactivate(id: string): Observable<void>;
}

