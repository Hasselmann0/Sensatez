import { Observable } from 'rxjs';
import { CreateOwnerRequest, OwnerResponse, UpdateOwnerRequest } from '../models/owner.model';

export abstract class OwnerPort {
  abstract getAll(params?: { search?: string; onlyActive?: boolean }): Observable<OwnerResponse[]>;
  abstract getById(id: string): Observable<OwnerResponse>;
  abstract create(request: CreateOwnerRequest): Observable<OwnerResponse>;
  abstract update(id: string, request: UpdateOwnerRequest): Observable<OwnerResponse>;
  abstract deactivate(id: string): Observable<void>;
}

