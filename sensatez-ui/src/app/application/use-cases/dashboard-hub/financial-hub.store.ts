import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CalendarVisualStatus, ChargeStatus } from '../../../domain/enums/domain-enums';
import {
  MonthlyDashboardResponse,
  OperationalAlertsResponse
} from '../../../domain/models/dashboard.model';
import {
  CalendarChargeItemResponse,
  CalendarMonthResponse,
  OverdueSummaryResponse,
  PayChargeRequest,
  RentChargeDetailResponse,
  TransferToOwnerRequest
} from '../../../domain/models/rent-charge.model';
import { CommandBus, QueryBus } from '../../cqrs/cqrs-bus';
import {
  GetCalendarMonthQuery,
  GetChargeDetailQuery,
  GetMonthlySummaryQuery,
  GetOperationalAlertsQuery,
  GetOverdueChargesQuery,
  PayChargeCommand,
  TransferToOwnerCommand,
  UpdateChargeNotesCommand
} from './financial-hub.cqrs';

export type SemaphoreFilter =
  | 'ALL'
  | 'PAID'
  | 'DUE_SOON'
  | 'OVERDUE'
  | 'UPCOMING'
  | 'PENDING_TRANSFER';

export type HubActiveTab = 'AGENDA' | 'CALENDAR_GRID' | 'OVERDUE' | 'EXECUTIVE';

@Injectable({ providedIn: 'root' })
export class FinancialHubStore {
  private readonly queryBus = inject(QueryBus);
  private readonly commandBus = inject(CommandBus);

  private readonly now = new Date();
  readonly selectedYear = signal<number>(this.now.getFullYear());
  readonly selectedMonth = signal<number>(this.now.getMonth() + 1);
  readonly activeTab = signal<HubActiveTab>('AGENDA');
  readonly semaphoreFilter = signal<SemaphoreFilter>('ALL');
  readonly searchQuery = signal<string>('');

  readonly loading = signal<boolean>(false);
  readonly calendarData = signal<CalendarMonthResponse | null>(null);
  readonly summaryData = signal<MonthlyDashboardResponse | null>(null);
  readonly alertsData = signal<OperationalAlertsResponse | null>(null);
  readonly overdueData = signal<OverdueSummaryResponse | null>(null);

  readonly selectedChargeDetail = signal<RentChargeDetailResponse | null>(null);
  readonly drawerOpen = signal<boolean>(false);
  readonly drawerLoading = signal<boolean>(false);

  readonly filteredCalendarItems = computed<CalendarChargeItemResponse[]>(() => {
    const items = this.calendarData()?.items ?? [];
    const filter = this.semaphoreFilter();
    const search = this.searchQuery().trim().toLowerCase();

    return items.filter(item => {
      if (filter === 'PAID' && item.visualStatus !== CalendarVisualStatus.Paid) return false;
      if (filter === 'DUE_SOON' && item.visualStatus !== CalendarVisualStatus.DueSoon) return false;
      if (filter === 'OVERDUE' && item.visualStatus !== CalendarVisualStatus.Overdue) return false;
      if (filter === 'UPCOMING' && item.visualStatus !== CalendarVisualStatus.Upcoming) return false;
      if (
        filter === 'PENDING_TRANSFER' &&
        !(item.status === ChargeStatus.Paid && !item.isTransferredToOwner)
      ) {
        return false;
      }

      if (search) {
        const matchAddress = item.propertyAddress.toLowerCase().includes(search);
        const matchTenant = item.tenantName.toLowerCase().includes(search);
        const matchOwner = item.ownerName.toLowerCase().includes(search);
        return matchAddress || matchTenant || matchOwner;
      }

      return true;
    });
  });

  readonly totalAlertsCount = computed<number>(() => {
    const alerts = this.alertsData();
    if (!alerts) return 0;
    return (
      alerts.overdueCharges.length +
      alerts.pendingOwnerTransfers.length +
      alerts.dueSoonCharges.length +
      alerts.expiringContracts.length +
      alerts.readjustmentEligibleContracts.length
    );
  });

  loadAllHubData(): void {
    const year = this.selectedYear();
    const month = this.selectedMonth();
    this.loading.set(true);

    forkJoin({
      calendar: this.queryBus.dispatch(new GetCalendarMonthQuery(year, month)),
      summary: this.queryBus.dispatch(new GetMonthlySummaryQuery(year, month)),
      alerts: this.queryBus.dispatch(new GetOperationalAlertsQuery()),
      overdue: this.queryBus.dispatch(new GetOverdueChargesQuery())
    }).subscribe({
      next: ({ calendar, summary, alerts, overdue }) => {
        this.calendarData.set(calendar);
        this.summaryData.set(summary);
        this.alertsData.set(alerts);
        this.overdueData.set(overdue);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  changeCompetence(year: number, month: number): void {
    this.selectedYear.set(year);
    this.selectedMonth.set(month);
    this.loadAllHubData();
  }

  previousMonth(): void {
    let y = this.selectedYear();
    let m = this.selectedMonth() - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    this.changeCompetence(y, m);
  }

  nextMonth(): void {
    let y = this.selectedYear();
    let m = this.selectedMonth() + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    this.changeCompetence(y, m);
  }

  goToCurrentMonth(): void {
    const today = new Date();
    this.changeCompetence(today.getFullYear(), today.getMonth() + 1);
  }

  openChargeDrawer(chargeId: string): void {
    this.drawerOpen.set(true);
    this.drawerLoading.set(true);
    this.queryBus.dispatch(new GetChargeDetailQuery(chargeId)).subscribe({
      next: detail => {
        this.selectedChargeDetail.set(detail);
        this.drawerLoading.set(false);
      },
      error: () => {
        this.drawerLoading.set(false);
      }
    });
  }

  closeChargeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedChargeDetail.set(null);
  }

  payCharge(chargeId: string, payload: PayChargeRequest): void {
    this.drawerLoading.set(true);
    this.commandBus.dispatch(new PayChargeCommand(chargeId, payload)).subscribe({
      next: updated => {
        this.selectedChargeDetail.set(updated);
        this.drawerLoading.set(false);
        this.loadAllHubData();
      },
      error: () => {
        this.drawerLoading.set(false);
      }
    });
  }

  transferToOwner(chargeId: string, payload: TransferToOwnerRequest): void {
    this.drawerLoading.set(true);
    this.commandBus.dispatch(new TransferToOwnerCommand(chargeId, payload)).subscribe({
      next: updated => {
        this.selectedChargeDetail.set(updated);
        this.drawerLoading.set(false);
        this.loadAllHubData();
      },
      error: () => {
        this.drawerLoading.set(false);
      }
    });
  }

  updateNotes(chargeId: string, notes: string): void {
    this.drawerLoading.set(true);
    this.commandBus.dispatch(new UpdateChargeNotesCommand(chargeId, notes)).subscribe({
      next: updated => {
        this.selectedChargeDetail.set(updated);
        this.drawerLoading.set(false);
        this.loadAllHubData();
      },
      error: () => {
        this.drawerLoading.set(false);
      }
    });
  }
}

