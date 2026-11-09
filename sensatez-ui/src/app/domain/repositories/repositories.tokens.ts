import { Observable } from 'rxjs';
import { ContractStatus, PropertyStatus } from '../enums/domain-enums';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import {
  MonthlyDashboardResponse,
  OperationalAlertsResponse,
  OwnerStatementResponse
} from '../models/dashboard.model';
import {
  CreateLeaseContractRequest,
  LeaseContractResponse,
  ReadjustContractRequest,
  TerminateContractRequest
} from '../models/lease-contract.model';
import { CreateOwnerRequest, OwnerResponse, UpdateOwnerRequest } from '../models/owner.model';
import {
  CreatePropertyRequest,
  PropertyResponse,
  UpdatePropertyRequest,
  UpdatePropertyStatusRequest
} from '../models/property.model';
import {
  CalendarMonthResponse,
  OverdueSummaryResponse,
  PayChargeRequest,
  RentChargeDetailResponse,
  TransferToOwnerRequest,
  UpdateChargeNotesRequest
} from '../models/rent-charge.model';
import { CreateTenantRequest, TenantResponse, UpdateTenantRequest } from '../models/tenant.model';

export abstract class AuthRepository {
  abstract login(request: LoginRequest): Observable<LoginResponse>;
}

export abstract class OwnerRepository {
  abstract getAll(params?: { search?: string; onlyActive?: boolean }): Observable<OwnerResponse[]>;
  abstract getById(id: string): Observable<OwnerResponse>;
  abstract create(request: CreateOwnerRequest): Observable<OwnerResponse>;
  abstract update(id: string, request: UpdateOwnerRequest): Observable<OwnerResponse>;
  abstract deactivate(id: string): Observable<void>;
}

export abstract class TenantRepository {
  abstract getAll(params?: { search?: string; onlyActive?: boolean }): Observable<TenantResponse[]>;
  abstract getById(id: string): Observable<TenantResponse>;
  abstract create(request: CreateTenantRequest): Observable<TenantResponse>;
  abstract update(id: string, request: UpdateTenantRequest): Observable<TenantResponse>;
  abstract deactivate(id: string): Observable<void>;
}

export abstract class PropertyRepository {
  abstract getAll(params?: {
    status?: PropertyStatus;
    ownerId?: string;
    search?: string;
  }): Observable<PropertyResponse[]>;
  abstract getById(id: string): Observable<PropertyResponse>;
  abstract create(request: CreatePropertyRequest): Observable<PropertyResponse>;
  abstract update(id: string, request: UpdatePropertyRequest): Observable<PropertyResponse>;
  abstract updateStatus(id: string, request: UpdatePropertyStatusRequest): Observable<PropertyResponse>;
}

export abstract class ContractRepository {
  abstract getAll(params?: {
    status?: ContractStatus;
    propertyId?: string;
    tenantId?: string;
    expiringWithinDays?: number;
  }): Observable<LeaseContractResponse[]>;
  abstract getById(id: string): Observable<LeaseContractResponse>;
  abstract create(request: CreateLeaseContractRequest): Observable<LeaseContractResponse>;
  abstract terminate(id: string, request: TerminateContractRequest): Observable<LeaseContractResponse>;
  abstract readjust(id: string, request: ReadjustContractRequest): Observable<LeaseContractResponse>;
}

export abstract class ChargeRepository {
  abstract getCalendarMonth(year?: number, month?: number): Observable<CalendarMonthResponse>;
  abstract getById(id: string): Observable<RentChargeDetailResponse>;
  abstract pay(id: string, request: PayChargeRequest): Observable<RentChargeDetailResponse>;
  abstract transferToOwner(id: string, request: TransferToOwnerRequest): Observable<RentChargeDetailResponse>;
  abstract getOverdue(): Observable<OverdueSummaryResponse>;
  abstract updateNotes(id: string, request: UpdateChargeNotesRequest): Observable<RentChargeDetailResponse>;
}

export abstract class DashboardRepository {
  abstract getMonthlySummary(year?: number, month?: number): Observable<MonthlyDashboardResponse>;
  abstract getOwnerStatement(ownerId: string, year?: number, month?: number): Observable<OwnerStatementResponse>;
  abstract getAlerts(): Observable<OperationalAlertsResponse>;
}

