import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PropertyStatus } from '../../domain/enums/domain-enums';
import {
  CreatePropertyRequest,
  PropertyResponse,
  UpdatePropertyRequest,
  UpdatePropertyStatusRequest
} from '../../domain/models/property.model';
import { PropertyRepository } from '../../domain/repositories/property.repository';

@Injectable({ providedIn: 'root' })
export class HttpPropertyRepository extends PropertyRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/properties`;

  override getAll(params?: {
    status?: PropertyStatus;
    ownerId?: string;
    search?: string;
  }): Observable<PropertyResponse[]> {
    let httpParams = new HttpParams();
    if (params?.status !== undefined) httpParams = httpParams.set('status', params.status);
    if (params?.ownerId) httpParams = httpParams.set('ownerId', params.ownerId);
    if (params?.search?.trim()) httpParams = httpParams.set('search', params.search.trim());
    return this.http.get<PropertyResponse[]>(this.baseUrl, { params: httpParams });
  }

  override getById(id: string): Observable<PropertyResponse> {
    return this.http.get<PropertyResponse>(`${this.baseUrl}/${id}`);
  }

  override create(request: CreatePropertyRequest): Observable<PropertyResponse> {
    return this.http.post<PropertyResponse>(this.baseUrl, request);
  }

  override update(id: string, request: UpdatePropertyRequest): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${this.baseUrl}/${id}`, request);
  }

  override updateStatus(id: string, request: UpdatePropertyStatusRequest): Observable<PropertyResponse> {
    return this.http.patch<PropertyResponse>(`${this.baseUrl}/${id}/status`, request);
  }
}

