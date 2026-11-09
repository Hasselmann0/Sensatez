import { PropertyStatus, PropertyType } from '../enums/domain-enums';

export interface CreatePropertyRequest {
  ownerId: string;
  code: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  type: PropertyType;
  suggestedRentAmount: number;
  defaultCommissionPercentage: number;
  notes?: string | null;
}

export interface UpdatePropertyRequest {
  code: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  type: PropertyType;
  suggestedRentAmount: number;
  defaultCommissionPercentage: number;
  notes?: string | null;
}

export interface UpdatePropertyStatusRequest {
  status: PropertyStatus;
}

export interface PropertyResponse {
  id: string;
  ownerId: string;
  ownerName: string;
  code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  type: PropertyType;
  status: PropertyStatus;
  suggestedRentAmount: number;
  defaultCommissionPercentage: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

