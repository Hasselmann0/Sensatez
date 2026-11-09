import { CalendarVisualStatus, ChargeStatus } from '../enums/domain-enums';

export interface CalendarChargeItemResponse {
  chargeId: string;
  leaseContractId: string;
  propertyId: string;
  propertyAddress: string;
  tenantName: string;
  ownerName: string;
  dueDate: string;
  originalAmount: number;
  updatedTotalAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  netOwnerAmount: number;
  status: ChargeStatus;
  visualStatus: CalendarVisualStatus;
  daysOverdue: number;
  isTransferredToOwner: boolean;
}

export interface CalendarMonthResponse {
  year: number;
  month: number;
  totalExpected: number;
  totalPaid: number;
  totalOverdue: number;
  totalCommissionExpected: number;
  totalNetOwnerExpected: number;
  totalChargesCount: number;
  items: CalendarChargeItemResponse[];
}

export interface RentChargeDetailResponse {
  id: string;
  leaseContractId: string;
  propertyId: string;
  propertyAddress: string;
  ownerId: string;
  ownerName: string;
  ownerPixKey: string | null;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  referenceYear: number;
  referenceMonth: number;
  dueDate: string;
  originalAmount: number;
  penaltyAmount: number;
  interestAmount: number;
  discountAmount: number;
  totalAmount: number;
  suggestedUpdatedTotalAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  netOwnerAmount: number;
  status: ChargeStatus;
  visualStatus: CalendarVisualStatus;
  daysOverdue: number;
  paidAt: string | null;
  paidAmount: number | null;
  paymentMethod: string | null;
  isTransferredToOwner: boolean;
  transferredToOwnerAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PayChargeRequest {
  paidAt: string;
  penaltyAmount?: number | null;
  interestAmount?: number | null;
  discountAmount?: number | null;
  paymentMethod: string;
  notes?: string | null;
}

export interface TransferToOwnerRequest {
  transferredAt: string;
  notes?: string | null;
}

export interface UpdateChargeNotesRequest {
  notes: string;
}

export interface OverdueChargeItemResponse {
  chargeId: string;
  leaseContractId: string;
  propertyId: string;
  propertyAddress: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  ownerName: string;
  referenceYear: number;
  referenceMonth: number;
  dueDate: string;
  daysOverdue: number;
  originalAmount: number;
  penaltyAmount: number;
  interestAmount: number;
  updatedTotalAmount: number;
  notes: string | null;
}

export interface OverdueSummaryResponse {
  totalOriginalOverdueAmount: number;
  totalUpdatedOverdueAmount: number;
  overdueChargesCount: number;
  overdueContractsCount: number;
  items: OverdueChargeItemResponse[];
}

