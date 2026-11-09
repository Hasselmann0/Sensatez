import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOwnerRequest, OwnerResponse, UpdateOwnerRequest } from '../../domain/models/owner.model';
import { OwnerRepository } from '../../domain/repositories/owner.repository';

@Injectable({ providedIn: 'root' })
export class HttpOwnerRepository extends OwnerRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/owners`;

  override getAll(params?: { search?: string; onlyActive?: boolean }): Observable<OwnerResponse[]> {
    let httpParams = new HttpParams();
    if (params?.search?.trim()) httpParams = httpParams.set('search', params.search.trim());
    if (params?.onlyActive !== undefined) httpParams = httpParams.set('onlyActive', params.onlyActive);
    return this.http.get<OwnerResponse[]>(this.baseUrl, { params: httpParams });
  }

  override getById(id: string): Observable<OwnerResponse> {
    return this.http.get<OwnerResponse>(`${this.baseUrl}/${id}`);
  }

  override create(request: CreateOwnerRequest): Observable<OwnerResponse> {
    return this.http.post<OwnerResponse>(this.baseUrl, request);
  }

  override update(id: string, request: UpdateOwnerRequest): Observable<OwnerResponse> {
    return this.http.put<OwnerResponse>(`${this.baseUrl}/${id}`, request);
  }

  override deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

