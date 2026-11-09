import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FinancialHubStore,
  HubActiveTab,
  SemaphoreFilter
} from '../../../application/use-cases/dashboard-hub/financial-hub.cqrs';
import { CalendarVisualStatus, ChargeStatus } from '../../../domain/enums/domain-enums';
import { CalendarChargeItemResponse } from '../../../domain/models/rent-charge.model';
import { ChargeAgendaCardComponent } from '../../shared/components/charge-agenda-card.component';
import {
  KpiMetricCardComponent,
  PillTabsComponent,
  StatusStripItem,
  StatusSummaryStripComponent,
  TabItem,
  WhatsappButtonComponent
} from '../../shared/components/ui-primitives';
import { ChargeXrayDrawerComponent } from './drawers/charge-xray-drawer.component';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

@Component({
  selector: 'app-financial-hub-page',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    KpiMetricCardComponent,
    PillTabsComponent,
    StatusSummaryStripComponent,
    ChargeAgendaCardComponent,
    WhatsappButtonComponent,
    ChargeXrayDrawerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './financial-hub.page.html',
  styleUrl: './financial-hub.page.css'
})
export class FinancialHubPageComponent implements OnInit {
  readonly hubStore = inject(FinancialHubStore);
  readonly router = inject(Router);
  private readonly currency = new CurrencyPipe('pt-BR');

  readonly VisualStatus = CalendarVisualStatus;

  readonly monthName = computed(() => MONTH_NAMES[this.hubStore.selectedMonth() - 1] ?? '');

  readonly receivedPercentage = computed(() => {
    const exp = this.hubStore.calendarData()?.totalExpected ?? 0;
    const paid = this.hubStore.calendarData()?.totalPaid ?? 0;
    if (exp <= 0) return 0;
    return Math.min(100, Math.round((paid / exp) * 100));
  });

  readonly occupancyRate = computed(() => {
    const total = this.hubStore.summaryData()?.totalProperties ?? 0;
    const rented = this.hubStore.summaryData()?.rentedProperties ?? 0;
    if (total <= 0) return 0;
    return Math.round((rented / total) * 100);
  });

  readonly hubTabs = computed<TabItem[]>(() => [
    {
      id: 'AGENDA',
      label: 'Agenda do Mês',
      count: this.hubStore.calendarData()?.totalChargesCount ?? 0,
      badgeColor: 'neutral'
    },
    {
      id: 'CALENDAR_GRID',
      label: 'Grade de Calendário'
    },
    {
      id: 'OVERDUE',
      label: 'Inadimplência & Cobrança',
      count: this.hubStore.overdueData()?.overdueChargesCount ?? 0,
      badgeColor: 'danger'
    },
    {
      id: 'EXECUTIVE',
      label: 'Visão Executiva & Ocupação'
    }
  ]);

  readonly semaphoreTabs = computed<TabItem[]>(() => {
    const items = this.hubStore.calendarData()?.items ?? [];
    return [
      { id: 'ALL', label: 'Todos', count: items.length },
      {
        id: 'PAID',
        label: '🟢 Pagos',
        count: items.filter(i => i.visualStatus === CalendarVisualStatus.Paid).length,
        badgeColor: 'success'
      },
      {
        id: 'DUE_SOON',
        label: '🟡 Vence em 5d',
        count: items.filter(i => i.visualStatus === CalendarVisualStatus.DueSoon).length,
        badgeColor: 'warning'
      },
      {
        id: 'OVERDUE',
        label: '🔴 Atrasados',
        count: items.filter(i => i.visualStatus === CalendarVisualStatus.Overdue).length,
        badgeColor: 'danger'
      },
      {
        id: 'UPCOMING',
        label: '⚪ A Vencer',
        count: items.filter(i => i.visualStatus === CalendarVisualStatus.Upcoming).length
      },
      {
        id: 'PENDING_TRANSFER',
        label: '🤝 Repasse Pendente',
        count: items.filter(i => i.status === ChargeStatus.Paid && !i.isTransferredToOwner).length,
        badgeColor: 'warning'
      }
    ];
  });

  readonly overdueStripItems = computed<StatusStripItem[]>(() => {
    const ov = this.hubStore.overdueData();
    return [
      {
        label: 'Total Original Vencido',
        value: this.currency.transform(ov?.totalOriginalOverdueAmount ?? 0, 'BRL') ?? 'R$ 0,00',
        dotColor: '#F59E0B'
      },
      {
        label: 'Total Corrigido (Multa + Juros Hoje)',
        value: this.currency.transform(ov?.totalUpdatedOverdueAmount ?? 0, 'BRL') ?? 'R$ 0,00',
        dotColor: '#EF4444'
      },
      {
        label: 'Parcelas em Atraso',
        value: `${ov?.overdueChargesCount ?? 0} parcelas`,
        dotColor: '#EF4444'
      },
      {
        label: 'Contratos Inadimplentes',
        value: `${ov?.overdueContractsCount ?? 0} contratos`,
        dotColor: '#6366F1'
      },
      {
        label: 'Encargos Acumulados',
        value:
          this.currency.transform(
            (ov?.totalUpdatedOverdueAmount ?? 0) - (ov?.totalOriginalOverdueAmount ?? 0),
            'BRL'
          ) ?? 'R$ 0,00',
        dotColor: '#D4A872'
      }
    ];
  });

  readonly calendarGridCells = computed(() => {
    const year = this.hubStore.selectedYear();
    const month = this.hubStore.selectedMonth();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const charges = this.hubStore.calendarData()?.items ?? [];

    const cells: Array<{
      dayKey: string;
      dayNumber: number | null;
      charges: CalendarChargeItemResponse[];
    }> = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ dayKey: `empty-${i}`, dayNumber: null, charges: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayCharges = charges.filter(c => c.dueDate.startsWith(dateStr));
      cells.push({ dayKey: dateStr, dayNumber: day, charges: dayCharges });
    }

    return cells;
  });

  ngOnInit(): void {
    this.hubStore.loadAllHubData();
  }

  onHubTabChange(tabId: string): void {
    this.hubStore.activeTab.set(tabId as HubActiveTab);
  }

  onSemaphoreFilterChange(filterId: string): void {
    this.hubStore.semaphoreFilter.set(filterId as SemaphoreFilter);
  }
}
