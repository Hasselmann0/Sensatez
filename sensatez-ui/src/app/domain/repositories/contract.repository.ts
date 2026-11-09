import { Observable } from 'rxjs';
import { ContractStatus } from '../enums/domain-enums';
import {
  CreateLeaseContractRequest,
  LeaseContractResponse,
  ReadjustContractRequest,
  TerminateContractRequest
} from '../models/lease-contract.model';

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

