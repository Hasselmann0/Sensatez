import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, tap } from 'rxjs';
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
import {
  ChargeRepository,
  DashboardRepository
} from '../../../domain/repositories/repositories.tokens';
import { ToastService } from '../../../presentation/shared/services/toast.service';
import {
  CommandBus,
  ICommand,
  ICommandHandler,
  IQuery,
  IQueryHandler,
  QueryBus
} from '../../cqrs/cqrs-bus';

// ==================== QUERIES ====================
export class GetCalendarMonthQuery implements IQuery<CalendarMonthResponse> {
  readonly __queryResultType?: CalendarMonthResponse;
  constructor(public readonly year: number, public readonly month: number) {}
}

export class GetMonthlySummaryQuery implements IQuery<MonthlyDashboardResponse> {
  readonly __queryResultType?: MonthlyDashboardResponse;
  constructor(public readonly year: number, public readonly month: number) {}
}

export class GetOperationalAlertsQuery implements IQuery<OperationalAlertsResponse> {
  readonly __queryResultType?: OperationalAlertsResponse;
}

export class GetOverdueChargesQuery implements IQuery<OverdueSummaryResponse> {
  readonly __queryResultType?: OverdueSummaryResponse;
}

export class GetChargeDetailQuery implements IQuery<RentChargeDetailResponse> {
  readonly __queryResultType?: RentChargeDetailResponse;
  constructor(public readonly chargeId: string) {}
}

// ==================== COMMANDS ====================
export class PayChargeCommand implements ICommand<RentChargeDetailResponse> {
  readonly __commandResultType?: RentChargeDetailResponse;
  constructor(
    public readonly chargeId: string,
    public readonly payload: PayChargeRequest
  ) {}
}

export class TransferToOwnerCommand implements ICommand<RentChargeDetailResponse> {
  readonly __commandResultType?: RentChargeDetailResponse;
  constructor(
    public readonly chargeId: string,
    public readonly payload: TransferToOwnerRequest
  ) {}
}

export class UpdateChargeNotesCommand implements ICommand<RentChargeDetailResponse> {
  readonly __commandResultType?: RentChargeDetailResponse;
  constructor(
    public readonly chargeId: string,
    public readonly notes: string
  ) {}
}

// ==================== HANDLERS ====================
@Injectable({ providedIn: 'root' })
export class GetCalendarMonthQueryHandler
  implements IQueryHandler<GetCalendarMonthQuery, CalendarMonthResponse>
{
  private readonly chargeRepo = inject(ChargeRepository);
  execute(query: GetCalendarMonthQuery): Observable<CalendarMonthResponse> {
    return this.chargeRepo.getCalendarMonth(query.year, query.month);
  }
}

@Injectable({ providedIn: 'root' })
export class GetMonthlySummaryQueryHandler
  implements IQueryHandler<GetMonthlySummaryQuery, MonthlyDashboardResponse>
{
  private readonly dashboardRepo = inject(DashboardRepository);
  execute(query: GetMonthlySummaryQuery): Observable<MonthlyDashboardResponse> {
    return this.dashboardRepo.getMonthlySummary(query.year, query.month);
  }
}

@Injectable({ providedIn: 'root' })
export class GetOperationalAlertsQueryHandler
  implements IQueryHandler<GetOperationalAlertsQuery, OperationalAlertsResponse>
{
  private readonly dashboardRepo = inject(DashboardRepository);
  execute(): Observable<OperationalAlertsResponse> {
    return this.dashboardRepo.getAlerts();
  }
}

@Injectable({ providedIn: 'root' })
export class GetOverdueChargesQueryHandler
  implements IQueryHandler<GetOverdueChargesQuery, OverdueSummaryResponse>
{
  private readonly chargeRepo = inject(ChargeRepository);
  execute(): Observable<OverdueSummaryResponse> {
    return this.chargeRepo.getOverdue();
  }
}

@Injectable({ providedIn: 'root' })
export class GetChargeDetailQueryHandler
  implements IQueryHandler<GetChargeDetailQuery, RentChargeDetailResponse>
{
  private readonly chargeRepo = inject(ChargeRepository);
  execute(query: GetChargeDetailQuery): Observable<RentChargeDetailResponse> {
    return this.chargeRepo.getById(query.chargeId);
  }
}

@Injectable({ providedIn: 'root' })
export class PayChargeCommandHandler
  implements ICommandHandler<PayChargeCommand, RentChargeDetailResponse>
{
  private readonly chargeRepo = inject(ChargeRepository);
  private readonly toast = inject(ToastService);

  execute(command: PayChargeCommand): Observable<RentChargeDetailResponse> {
    return this.chargeRepo.pay(command.chargeId, command.payload).pipe(
      tap(() => {
        this.toast.success('Pagamento registrado com sucesso! O semáforo mudou para Verde.', 'Baixa realizada');
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class TransferToOwnerCommandHandler
  implements ICommandHandler<TransferToOwnerCommand, RentChargeDetailResponse>
{
  private readonly chargeRepo = inject(ChargeRepository);
  private readonly toast = inject(ToastService);

  execute(command: TransferToOwnerCommand): Observable<RentChargeDetailResponse> {
    return this.chargeRepo.transferToOwner(command.chargeId, command.payload).pipe(
      tap(() => {
        this.toast.success('Repasse líquido ao proprietário confirmado com sucesso!', 'Repasse Pix registrado');
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateChargeNotesCommandHandler
  implements ICommandHandler<UpdateChargeNotesCommand, RentChargeDetailResponse>
{
  private readonly chargeRepo = inject(ChargeRepository);
  private readonly toast = inject(ToastService);

  execute(command: UpdateChargeNotesCommand): Observable<RentChargeDetailResponse> {
    return this.chargeRepo.updateNotes(command.chargeId, { notes: command.notes }).pipe(
      tap(() => {
        this.toast.success('Anotação de cobrança salva no histórico da parcela.');
      })
    );
  }
}

// ==================== SIGNAL STORE UNIFICADA (TELAS 2, 3 E 4) ====================
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

