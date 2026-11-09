import { ChargeStatus, ReadjustmentIndex } from '../enums/domain-enums';

export interface MonthlyDashboardResponse {
  year: number;
  month: number;
  totalExpectedRent: number;
  totalReceivedRent: number;
  totalPendingRent: number;
  totalOverdueRentInMonth: number;
  totalAccumulatedOverdueRent: number;
  expectedCommission: number;
  realizedCommission: number;
  netOwnerPendingTransfer: number;
  netOwnerTransferred: number;
  totalProperties: number;
  rentedProperties: number;
  availableProperties: number;
  maintenanceProperties: number;
}

export interface OwnerStatementItemResponse {
  chargeId: string;
  propertyId: string;
  propertyAddress: string;
  tenantName: string;
  dueDate: string;
  grossRentAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  netOwnerAmount: number;
  status: ChargeStatus;
  paidAt: string | null;
  isTransferredToOwner: boolean;
  transferredToOwnerAt: string | null;
}

export interface OwnerStatementResponse {
  ownerId: string;
  ownerName: string;
  ownerDocument: string;
  ownerPixKey: string | null;
  ownerBankName: string | null;
  ownerBankAgency: string | null;
  ownerBankAccount: string | null;
  year: number;
  month: number;
  totalGrossExpected: number;
  totalGrossReceived: number;
  totalCommissionRetained: number;
  totalNetPendingTransfer: number;
  totalNetTransferred: number;
  items: OwnerStatementItemResponse[];
}

export interface ChargeAlertItemResponse {
  chargeId: string;
  leaseContractId: string;
  propertyAddress: string;
  tenantName: string;
  tenantPhone: string;
  ownerName: string;
  ownerPixKey: string | null;
  dueDate: string;
  amount: number;
  netOwnerAmount: number;
  daysDifference: number;
}

export interface ContractAlertItemResponse {
  contractId: string;
  propertyAddress: string;
  tenantName: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  currentRentAmount: number;
  readjustmentIndex: ReadjustmentIndex;
  daysUntilEnd: number;
  monthsActive: number;
}

export interface OperationalAlertsResponse {
  dueSoonCharges: ChargeAlertItemResponse[];
  overdueCharges: ChargeAlertItemResponse[];
  pendingOwnerTransfers: ChargeAlertItemResponse[];
  expiringContracts: ContractAlertItemResponse[];
  readjustmentEligibleContracts: ContractAlertItemResponse[];
}

