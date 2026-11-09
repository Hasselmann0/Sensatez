import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  MonthlyDashboardResponse,
  OperationalAlertsResponse
} from '../../../domain/models/dashboard.model';
import {
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
import { ICommand, ICommandHandler, IQuery, IQueryHandler } from '../../cqrs/cqrs-bus';

export { FinancialHubStore, type HubActiveTab, type SemaphoreFilter } from './financial-hub.store';

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
