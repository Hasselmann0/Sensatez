import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTenantRequest, TenantResponse, UpdateTenantRequest } from '../../domain/models/tenant.model';
import { TenantRepository } from '../../domain/repositories/tenant.repository';

@Injectable({ providedIn: 'root' })
export class HttpTenantRepository extends TenantRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tenants`;

  override getAll(params?: { search?: string; onlyActive?: boolean }): Observable<TenantResponse[]> {
    let httpParams = new HttpParams();
    if (params?.search?.trim()) httpParams = httpParams.set('search', params.search.trim());
    if (params?.onlyActive !== undefined) httpParams = httpParams.set('onlyActive', params.onlyActive);
    return this.http.get<TenantResponse[]>(this.baseUrl, { params: httpParams });
  }

  override getById(id: string): Observable<TenantResponse> {
    return this.http.get<TenantResponse>(`${this.baseUrl}/${id}`);
  }

  override create(request: CreateTenantRequest): Observable<TenantResponse> {
    return this.http.post<TenantResponse>(this.baseUrl, request);
  }

  override update(id: string, request: UpdateTenantRequest): Observable<TenantResponse> {
    return this.http.put<TenantResponse>(`${this.baseUrl}/${id}`, request);
  }

  override deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

