import { Observable } from 'rxjs';
import { PropertyStatus } from '../enums/domain-enums';
import {
  CreatePropertyRequest,
  PropertyResponse,
  UpdatePropertyRequest,
  UpdatePropertyStatusRequest
} from '../models/property.model';

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

