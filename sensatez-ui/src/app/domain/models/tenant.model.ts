export interface CreateTenantRequest {
  fullName: string;
  document: string;
  email?: string | null;
  phone: string;
  additionalInfo?: string | null;
}

export interface UpdateTenantRequest {
  fullName: string;
  email?: string | null;
  phone: string;
  additionalInfo?: string | null;
}

export interface TenantResponse {
  id: string;
  fullName: string;
  document: string;
  email: string | null;
  phone: string;
  additionalInfo: string | null;
  isActive: boolean;
  createdAt: string;
}

