import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ContractStatus } from '../../../domain/enums/domain-enums';
import {
  CreateLeaseContractRequest,
  LeaseContractResponse,
  ReadjustContractRequest,
  TerminateContractRequest
} from '../../../domain/models/lease-contract.model';
import { ContractPort } from '../../../domain/ports/contract.port';

@Injectable({ providedIn: 'root' })
export class HttpContractAdapter extends ContractPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/contracts`;

  override getAll(params?: {
    status?: ContractStatus;
    propertyId?: string;
    tenantId?: string;
    expiringWithinDays?: number;
  }): Observable<LeaseContractResponse[]> {
    let httpParams = new HttpParams();
    if (params?.status !== undefined) httpParams = httpParams.set('status', params.status);
    if (params?.propertyId) httpParams = httpParams.set('propertyId', params.propertyId);
    if (params?.tenantId) httpParams = httpParams.set('tenantId', params.tenantId);
    if (params?.expiringWithinDays !== undefined) {
      httpParams = httpParams.set('expiringWithinDays', params.expiringWithinDays);
    }
    return this.http.get<LeaseContractResponse[]>(this.baseUrl, { params: httpParams });
  }

  override getById(id: string): Observable<LeaseContractResponse> {
    return this.http.get<LeaseContractResponse>(`${this.baseUrl}/${id}`);
  }

  override create(request: CreateLeaseContractRequest): Observable<LeaseContractResponse> {
    return this.http.post<LeaseContractResponse>(this.baseUrl, request);
  }

  override terminate(id: string, request: TerminateContractRequest): Observable<LeaseContractResponse> {
    return this.http.post<LeaseContractResponse>(`${this.baseUrl}/${id}/terminate`, request);
  }

  override readjust(id: string, request: ReadjustContractRequest): Observable<LeaseContractResponse> {
    return this.http.post<LeaseContractResponse>(`${this.baseUrl}/${id}/readjust`, request);
  }
}

