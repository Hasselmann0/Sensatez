import { ChargeStatus, ContractStatus, ReadjustmentIndex } from '../enums/domain-enums';

export interface CreateLeaseContractRequest {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  dueDay: number;
  rentAmount: number;
  commissionPercentage: number;
  securityDepositAmount: number;
  penaltyPercentage: number;
  monthlyInterestPercentage: number;
  readjustmentIndex: ReadjustmentIndex;
  notes?: string | null;
}

export interface TerminateContractRequest {
  reason: string;
}

export interface ReadjustContractRequest {
  readjustmentPercentage: number;
  effectiveFromDate?: string | null;
  notes?: string | null;
}

export interface ContractChargeSummaryItem {
  id: string;
  referenceYear: number;
  referenceMonth: number;
  dueDate: string;
  originalAmount: number;
  totalAmount: number;
  commissionAmount: number;
  netOwnerAmount: number;
  status: ChargeStatus;
  paidAt: string | null;
  isTransferredToOwner: boolean;
}

export interface LeaseContractResponse {
  id: string;
  propertyId: string;
  propertyCode?: string;
  propertyAddress: string;
  ownerId?: string;
  ownerName: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  dueDay: number;
  rentAmount: number;
  commissionPercentage: number;
  securityDepositAmount: number;
  penaltyPercentage: number;
  monthlyInterestPercentage: number;
  readjustmentIndex: ReadjustmentIndex;
  status: ContractStatus;
  terminatedAt?: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  charges?: ContractChargeSummaryItem[];
}

