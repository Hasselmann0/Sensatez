export interface CreateOwnerRequest {
  fullName: string;
  document: string;
  email: string;
  phone: string;
  pixKey?: string | null;
  bankName?: string | null;
  bankAgency?: string | null;
  bankAccount?: string | null;
  notes?: string | null;
}

export interface UpdateOwnerRequest {
  fullName: string;
  email: string;
  phone: string;
  pixKey?: string | null;
  bankName?: string | null;
  bankAgency?: string | null;
  bankAccount?: string | null;
  notes?: string | null;
}

export interface OwnerResponse {
  id: string;
  fullName: string;
  document: string;
  email: string;
  phone: string;
  pixKey: string | null;
  bankName: string | null;
  bankAgency: string | null;
  bankAccount: string | null;
  notes: string | null;
  propertiesCount: number;
  isActive: boolean;
  createdAt: string;
}

