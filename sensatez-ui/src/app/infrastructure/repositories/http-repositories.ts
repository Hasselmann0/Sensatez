import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContractStatus, PropertyStatus } from '../../domain/enums/domain-enums';
import { LoginRequest, LoginResponse } from '../../domain/models/auth.model';
import {
  MonthlyDashboardResponse,
  OperationalAlertsResponse,
  OwnerStatementResponse
} from '../../domain/models/dashboard.model';
import {
  CreateLeaseContractRequest,
  LeaseContractResponse,
  ReadjustContractRequest,
  TerminateContractRequest
} from '../../domain/models/lease-contract.model';
import { CreateOwnerRequest, OwnerResponse, UpdateOwnerRequest } from '../../domain/models/owner.model';
import {
  CreatePropertyRequest,
  PropertyResponse,
  UpdatePropertyRequest,
  UpdatePropertyStatusRequest
} from '../../domain/models/property.model';
import {
  CalendarMonthResponse,
  OverdueSummaryResponse,
  PayChargeRequest,
  RentChargeDetailResponse,
  TransferToOwnerRequest,
  UpdateChargeNotesRequest
} from '../../domain/models/rent-charge.model';
import { CreateTenantRequest, TenantResponse, UpdateTenantRequest } from '../../domain/models/tenant.model';
import {
  AuthRepository,
  ChargeRepository,
  ContractRepository,
  DashboardRepository,
  OwnerRepository,
  PropertyRepository,
  TenantRepository
} from '../../domain/repositories/repositories.tokens';

@Injectable({ providedIn: 'root' })
export class HttpAuthRepository extends AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  override login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request);
  }
}

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

@Injectable({ providedIn: 'root' })
export class HttpContractRepository extends ContractRepository {
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

@Injectable({ providedIn: 'root' })
export class HttpChargeRepository extends ChargeRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/charges`;

  override getCalendarMonth(year?: number, month?: number): Observable<CalendarMonthResponse> {
    let httpParams = new HttpParams();
    if (year !== undefined) httpParams = httpParams.set('year', year);
    if (month !== undefined) httpParams = httpParams.set('month', month);
    return this.http.get<CalendarMonthResponse>(`${this.baseUrl}/calendar`, { params: httpParams });
  }

  override getById(id: string): Observable<RentChargeDetailResponse> {
    return this.http.get<RentChargeDetailResponse>(`${this.baseUrl}/${id}`);
  }

  override pay(id: string, request: PayChargeRequest): Observable<RentChargeDetailResponse> {
    return this.http.post<RentChargeDetailResponse>(`${this.baseUrl}/${id}/pay`, request);
  }

  override transferToOwner(id: string, request: TransferToOwnerRequest): Observable<RentChargeDetailResponse> {
    return this.http.post<RentChargeDetailResponse>(`${this.baseUrl}/${id}/transfer-to-owner`, request);
  }

  override getOverdue(): Observable<OverdueSummaryResponse> {
    return this.http.get<OverdueSummaryResponse>(`${this.baseUrl}/overdue`);
  }

  override updateNotes(id: string, request: UpdateChargeNotesRequest): Observable<RentChargeDetailResponse> {
    return this.http.patch<RentChargeDetailResponse>(`${this.baseUrl}/${id}/notes`, request);
  }
}

@Injectable({ providedIn: 'root' })
export class HttpDashboardRepository extends DashboardRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  override getMonthlySummary(year?: number, month?: number): Observable<MonthlyDashboardResponse> {
    let httpParams = new HttpParams();
    if (year !== undefined) httpParams = httpParams.set('year', year);
    if (month !== undefined) httpParams = httpParams.set('month', month);
    return this.http.get<MonthlyDashboardResponse>(`${this.baseUrl}/summary`, { params: httpParams });
  }

  override getOwnerStatement(ownerId: string, year?: number, month?: number): Observable<OwnerStatementResponse> {
    let httpParams = new HttpParams();
    if (year !== undefined) httpParams = httpParams.set('year', year);
    if (month !== undefined) httpParams = httpParams.set('month', month);
    return this.http.get<OwnerStatementResponse>(`${this.baseUrl}/owner-statement/${ownerId}`, {
      params: httpParams
    });
  }

  override getAlerts(): Observable<OperationalAlertsResponse> {
    return this.http.get<OperationalAlertsResponse>(`${this.baseUrl}/alerts`);
  }
}

