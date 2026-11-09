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
  PixCopyButtonComponent,
  StatusBadgeComponent,
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
    StatusBadgeComponent,
    ChargeAgendaCardComponent,
    PixCopyButtonComponent,
    WhatsappButtonComponent,
    ChargeXrayDrawerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- 1. HEADER + SELETOR DE COMPETÊNCIA (Estilo Topo do Anexo 2) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Central Financeira & Operacional
          </h1>
          <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Calendário de aluguéis, semáforo de vencimentos, inadimplência e repasses aos proprietários
          </p>
        </div>

        <!-- Seletor de Competência (< Mês / Ano > + Hoje) -->
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            (click)="hubStore.previousMonth()"
            class="px-3 py-2 rounded-xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#151519] text-xs font-semibold hover:border-[#D4A872] transition-colors"
          >
            ‹ Anterior
          </button>

          <div
            class="px-4 py-2 rounded-xl border border-[#D4A872]/40 bg-[#D4A872]/10 text-xs font-bold text-slate-900 dark:text-[#D4A872] min-w-[145px] text-center"
          >
            {{ monthName() }} {{ hubStore.selectedYear() }}
          </div>

          <button
            type="button"
            (click)="hubStore.nextMonth()"
            class="px-3 py-2 rounded-xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#151519] text-xs font-semibold hover:border-[#D4A872] transition-colors"
          >
            Próximo ›
          </button>

          <button
            type="button"
            (click)="hubStore.goToCurrentMonth()"
            class="px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-zinc-800 dark:text-zinc-200 text-xs font-medium hover:brightness-110"
          >
            Hoje
          </button>
        </div>
      </div>

      <!-- 2. ABAS SUPERIORES EM PILLS (Anexo 2: Overview | Team | Projects | Insights -> Telas 2, 3 e 4) -->
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <app-pill-tabs
          [tabs]="hubTabs()"
          [activeTab]="hubStore.activeTab()"
          (tabChange)="onHubTabChange($event)"
        />

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="router.navigate(['/contratos'])"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#5C3A21] dark:bg-[#D4A872] text-white dark:text-zinc-950 hover:brightness-105 transition-all"
          >
            + Novo Contrato
          </button>
        </div>
      </div>

      <!-- 3. FAIXA DE 5 KPI CARDS NO TOPO (Estilo Anexo 2) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <app-kpi-metric-card
          title="Receita Recebida no Mês"
          [mainValue]="((hubStore.calendarData()?.totalPaid ?? 0) | currency: 'BRL') || 'R$ 0,00'"
          [subValue]="'Previsto: ' + ((hubStore.calendarData()?.totalExpected ?? 0) | currency: 'BRL')"
          [badgeText]="receivedPercentage() + '% recebido'"
          badgeVariant="success"
          chartType="bars"
        />

        <app-kpi-metric-card
          title="Comissão da Imobiliária"
          [mainValue]="((hubStore.summaryData()?.realizedCommission ?? 0) | currency: 'BRL') || 'R$ 0,00'"
          [subValue]="'Prevista: ' + ((hubStore.calendarData()?.totalCommissionExpected ?? 0) | currency: 'BRL')"
          badgeText="Taxa Adm"
          badgeVariant="neutral"
          chartType="sparkline"
        />

        <app-kpi-metric-card
          title="Líquido Proprietários"
          [mainValue]="((hubStore.summaryData()?.netOwnerPendingTransfer ?? 0) | currency: 'BRL') || 'R$ 0,00'"
          [subValue]="'Já repassado: ' + ((hubStore.summaryData()?.netOwnerTransferred ?? 0) | currency: 'BRL')"
          [badgeText]="(hubStore.alertsData()?.pendingOwnerTransfers?.length ?? 0) + ' pendentes'"
          badgeVariant="warning"
          chartType="dots"
        />

        <app-kpi-metric-card
          title="Em Atraso no Mês"
          [mainValue]="((hubStore.calendarData()?.totalOverdue ?? 0) | currency: 'BRL') || 'R$ 0,00'"
          [subValue]="'Geral: ' + ((hubStore.overdueData()?.totalUpdatedOverdueAmount ?? 0) | currency: 'BRL')"
          [badgeText]="(hubStore.overdueData()?.overdueChargesCount ?? 0) + ' vencidos'"
          badgeVariant="danger"
        />

        <app-kpi-metric-card
          title="Ocupação da Carteira"
          [mainValue]="
            (hubStore.summaryData()?.rentedProperties ?? 0) +
            '/' +
            (hubStore.summaryData()?.totalProperties ?? 0) +
            ' Locados'
          "
          [subValue]="
            '🟢 ' +
            (hubStore.summaryData()?.availableProperties ?? 0) +
            ' Disp. • 🟠 ' +
            (hubStore.summaryData()?.maintenanceProperties ?? 0) +
            ' Manut.'
          "
          [badgeText]="occupancyRate() + '%'"
          badgeVariant="success"
        />
      </div>

      <!-- ==================== ABA 1: AGENDA DO MÊS + ALERTAS LATERAIS (ANEXO 2) ==================== -->
      @if (hubStore.activeTab() === 'AGENDA') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Coluna Principal Esquerda (8 colunas - Estilo "My day" do Anexo 2) -->
          <div class="lg:col-span-8 space-y-4">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <h2 class="text-base font-bold text-slate-900 dark:text-zinc-100">
                Aluguéis da Competência ({{ hubStore.filteredCalendarItems().length }})
              </h2>

              <!-- Filtros Rápidos do Semáforo -->
              <app-pill-tabs
                [tabs]="semaphoreTabs()"
                [activeTab]="hubStore.semaphoreFilter()"
                (tabChange)="onSemaphoreFilterChange($event)"
              />
            </div>

            @if (hubStore.filteredCalendarItems().length === 0) {
              <div
                class="p-12 rounded-2xl border border-dashed border-slate-200 dark:border-[#262632] bg-white dark:bg-[#151519] text-center space-y-2"
              >
                <div class="text-2xl">📅</div>
                <h3 class="text-sm font-semibold">Nenhuma cobrança encontrada para este filtro</h3>
                <p class="text-xs text-slate-400">
                  Altere o filtro do semáforo acima ou selecione outra competência mensal.
                </p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (item of hubStore.filteredCalendarItems(); track item.chargeId) {
                  <app-charge-agenda-card
                    [charge]="item"
                    (selectCharge)="hubStore.openChargeDrawer($event)"
                  />
                }
              </div>
            }
          </div>

          <!-- Coluna Direita (4 colunas - Estilo "Team capacity / Recent mentions" do Anexo 2) -->
          <div class="lg:col-span-4 space-y-6">
            <!-- Bloco Superior Direito: Repasses Pix Pendentes & Vencendo em 5 Dias -->
            <div
              class="rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] p-5 space-y-4"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  🤝 Repasses Pix Pendentes
                </h3>
                <span
                  class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-500"
                >
                  {{ hubStore.alertsData()?.pendingOwnerTransfers?.length ?? 0 }}
                </span>
              </div>

              @if ((hubStore.alertsData()?.pendingOwnerTransfers?.length ?? 0) === 0) {
                <p class="text-xs text-slate-400 dark:text-zinc-500 py-2">
                  Todos os aluguéis recebidos já foram repassados aos proprietários!
                </p>
              } @else {
                <div class="space-y-2.5">
                  @for (
                    transfer of hubStore.alertsData()?.pendingOwnerTransfers ?? [];
                    track transfer.chargeId
                  ) {
                    <div
                      (click)="hubStore.openChargeDrawer(transfer.chargeId)"
                      class="p-3 rounded-xl border border-slate-100 dark:border-[#22222C] bg-slate-50 dark:bg-[#1B1B22] hover:border-[#D4A872] cursor-pointer transition-all flex items-center justify-between gap-2"
                    >
                      <div class="min-w-0">
                        <div class="text-xs font-semibold truncate">{{ transfer.ownerName }}</div>
                        <div class="text-[11px] text-slate-400 truncate">
                          {{ transfer.propertyAddress }}
                        </div>
                        <div class="text-[11px] text-emerald-500 font-bold mt-0.5">
                          Líquido: {{ transfer.netOwnerAmount | currency: 'BRL' }}
                        </div>
                      </div>
                      <button
                        type="button"
                        class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#D4A872] text-zinc-950 shrink-0"
                      >
                        Repassar
                      </button>
                    </div>
                  }
                </div>
              }

              <!-- Sub-bloco: Vencendo nos Próximos 5 Dias -->
              <div class="pt-3 border-t border-slate-100 dark:border-[#22222C] space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-amber-500">
                    🟡 Vencendo em até 5 dias
                  </span>
                  <span class="text-xs font-bold">
                    {{ hubStore.alertsData()?.dueSoonCharges?.length ?? 0 }}
                  </span>
                </div>
                @for (soon of (hubStore.alertsData()?.dueSoonCharges ?? []).slice(0, 4); track soon.chargeId) {
                  <div
                    (click)="hubStore.openChargeDrawer(soon.chargeId)"
                    class="flex items-center justify-between text-xs py-1.5 cursor-pointer hover:text-[#D4A872]"
                  >
                    <span class="truncate max-w-[180px]">{{ soon.tenantName }}</span>
                    <span class="font-semibold">{{ soon.amount | currency: 'BRL' }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Bloco Inferior Direito: Alertas de Contratos (Reajuste Anual & Fim de Vigência) -->
            <div
              class="rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] p-5 space-y-4"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  📈 Renovação & Reajuste Anual
                </h3>
                <button
                  type="button"
                  (click)="router.navigate(['/contratos'])"
                  class="text-[11px] text-[#D4A872] hover:underline"
                >
                  Ver contratos →
                </button>
              </div>

              @if (
                (hubStore.alertsData()?.readjustmentEligibleContracts?.length ?? 0) === 0 &&
                (hubStore.alertsData()?.expiringContracts?.length ?? 0) === 0
              ) {
                <p class="text-xs text-slate-400 dark:text-zinc-500 py-2">
                  Nenhum contrato pendente de reajuste anual ou próximo do vencimento (45d).
                </p>
              }

              @for (
                eligible of hubStore.alertsData()?.readjustmentEligibleContracts ?? [];
                track eligible.contractId
              ) {
                <div
                  class="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-1.5"
                >
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-purple-400">
                      🎉 {{ eligible.monthsActive }} meses (Elegível a Reajuste)
                    </span>
                    <span class="font-semibold">
                      {{ eligible.currentRentAmount | currency: 'BRL' }}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-600 dark:text-zinc-300 truncate">
                    {{ eligible.propertyAddress }} • Inq: {{ eligible.tenantName }}
                  </p>
                  <button
                    type="button"
                    (click)="router.navigate(['/contratos'], { queryParams: { readjustContractId: eligible.contractId } })"
                    class="w-full py-1.5 rounded-lg text-[11px] font-bold bg-purple-600 text-white hover:bg-purple-500"
                  >
                    Aplicar Reajuste Anual
                  </button>
                </div>
              }

              @for (exp of hubStore.alertsData()?.expiringContracts ?? []; track exp.contractId) {
                <div
                  class="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1"
                >
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-amber-500">
                      ⏳ Vence em {{ exp.daysUntilEnd }} dias
                    </span>
                    <span class="text-[11px] text-slate-400">{{ exp.endDate | date: 'dd/MM/yyyy' }}</span>
                  </div>
                  <p class="text-[11px] text-slate-600 dark:text-zinc-300 truncate">
                    {{ exp.propertyAddress }} ({{ exp.tenantName }})
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- ==================== ABA 2: GRADE DE CALENDÁRIO MENSAL (TELA 2 GRADE) ==================== -->
      @if (hubStore.activeTab() === 'CALENDAR_GRID') {
        <div
          class="rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] p-5 space-y-4"
        >
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h2 class="text-base font-bold">
              Grade de Vencimentos — {{ monthName() }} {{ hubStore.selectedYear() }}
            </h2>
            <div class="flex items-center gap-3 text-xs">
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Pago</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Vence em até 5d</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Atrasado</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-zinc-500"></span> A Vencer</span>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 pb-1">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          <div class="grid grid-cols-7 gap-2">
            @for (cell of calendarGridCells(); track cell.dayKey) {
              <div
                class="min-h-[110px] rounded-xl p-2 border transition-colors flex flex-col justify-between"
                [ngClass]="
                  cell.dayNumber
                    ? 'border-slate-200 dark:border-[#24242E] bg-slate-50/50 dark:bg-[#191920]'
                    : 'border-transparent bg-transparent'
                "
              >
                @if (cell.dayNumber) {
                  <div class="text-xs font-bold text-slate-400 dark:text-zinc-500">
                    {{ cell.dayNumber }}
                  </div>
                  <div class="space-y-1.5 mt-1">
                    @for (ch of cell.charges; track ch.chargeId) {
                      <button
                        type="button"
                        (click)="hubStore.openChargeDrawer(ch.chargeId)"
                        class="w-full text-left p-1.5 rounded-lg text-[10px] font-medium border truncate transition-transform hover:scale-[1.02]"
                        [ngClass]="{
                          'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300':
                            ch.visualStatus === VisualStatus.Paid,
                          'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300':
                            ch.visualStatus === VisualStatus.DueSoon,
                          'bg-rose-500/20 border-rose-500/50 text-rose-600 dark:text-rose-300':
                            ch.visualStatus === VisualStatus.Overdue,
                          'bg-zinc-500/15 border-zinc-500/30 text-slate-600 dark:text-zinc-300':
                            ch.visualStatus === VisualStatus.Upcoming
                        }"
                      >
                        <div class="font-bold truncate">{{ ch.tenantName }}</div>
                        <div>{{ ch.updatedTotalAmount | currency: 'BRL' }}</div>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- ==================== ABA 3: PAINEL DE INADIMPLÊNCIA & COBRANÇA (TELA 4 INTEGRADA) ==================== -->
      @if (hubStore.activeTab() === 'OVERDUE') {
        <div class="space-y-5">
          <!-- Faixa de Resumo de Inadimplência (Estilo Anexo 3) -->
          <app-status-summary-strip [items]="overdueStripItems()" />

          <!-- Tabela de Cobrança Ativa (Estilo Anexo 3) -->
          <div
            class="rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] overflow-hidden shadow-sm"
          >
            <div class="px-6 py-4 border-b border-slate-200 dark:border-[#262630] flex items-center justify-between">
              <div>
                <h2 class="text-base font-bold text-slate-900 dark:text-zinc-100">
                  🚨 Fila Prioritária de Cobrança Ativa
                </h2>
                <p class="text-xs text-slate-500 dark:text-zinc-400">
                  Ordenada automaticamente do maior tempo em atraso para o mais recente, com cálculo pro rata die hoje
                </p>
              </div>
              <span class="text-xs font-semibold text-rose-500">
                Total listado: {{ hubStore.overdueData()?.items?.length ?? 0 }} parcelas vencidas
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr
                    class="border-b border-slate-200 dark:border-[#262630] text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500"
                  >
                    <th class="py-3.5 px-4">Inquilino & Imóvel</th>
                    <th class="py-3.5 px-4">Competência / Venc.</th>
                    <th class="py-3.5 px-4">Dias em Atraso</th>
                    <th class="py-3.5 px-4">Valor Original</th>
                    <th class="py-3.5 px-4">Multa + Juros</th>
                    <th class="py-3.5 px-4">Total Corrigido</th>
                    <th class="py-3.5 px-4">Última Anotação</th>
                    <th class="py-3.5 px-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-[#22222A] text-xs">
                  @for (ov of hubStore.overdueData()?.items ?? []; track ov.chargeId) {
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-[#1B1B22] transition-colors">
                      <td class="py-3.5 px-4">
                        <div class="font-bold text-slate-900 dark:text-zinc-100">
                          {{ ov.tenantName }}
                        </div>
                        <div class="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-xs">
                          {{ ov.propertyAddress }}
                        </div>
                      </td>
                      <td class="py-3.5 px-4">
                        <div class="font-semibold">
                          {{ ov.referenceMonth | number: '2.0-0' }}/{{ ov.referenceYear }}
                        </div>
                        <div class="text-[11px] text-slate-400">
                          {{ ov.dueDate | date: 'dd/MM/yyyy' }}
                        </div>
                      </td>
                      <td class="py-3.5 px-4">
                        <span
                          class="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30"
                        >
                          🔴 {{ ov.daysOverdue }} dias
                        </span>
                      </td>
                      <td class="py-3.5 px-4 font-medium">
                        {{ ov.originalAmount | currency: 'BRL' }}
                      </td>
                      <td class="py-3.5 px-4 text-rose-500 font-medium">
                        + {{ ov.penaltyAmount + ov.interestAmount | currency: 'BRL' }}
                      </td>
                      <td class="py-3.5 px-4 font-bold text-sm text-rose-500">
                        {{ ov.updatedTotalAmount | currency: 'BRL' }}
                      </td>
                      <td class="py-3.5 px-4 max-w-[200px]">
                        <span class="truncate block text-slate-500 dark:text-zinc-400 italic">
                          {{ ov.notes || 'Sem anotação' }}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <app-whatsapp-button
                          [phone]="ov.tenantPhone"
                          label="Cobrar"
                          [message]="
                            'Olá ' +
                            ov.tenantName +
                            ', identificamos em aberto o aluguel ref. ' +
                            ov.referenceMonth +
                            '/' +
                            ov.referenceYear +
                            ' do imóvel ' +
                            ov.propertyAddress +
                            ' no valor atualizado de R$ ' +
                            ov.updatedTotalAmount.toFixed(2)
                          "
                        />
                        <button
                          type="button"
                          (click)="hubStore.openChargeDrawer(ov.chargeId)"
                          class="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Acordo / Baixa
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="py-12 text-center text-slate-400">
                        🎉 Parabéns! Nenhuma parcela vencida em atraso na carteira.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- ==================== ABA 4: VISÃO EXECUTIVA & OCUPAÇÃO (TELA 3 DETALHADA) ==================== -->
      @if (hubStore.activeTab() === 'EXECUTIVE') {
        @if (hubStore.summaryData(); as s) {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Barras de Progresso de Caixa e Comissões -->
            <div
              class="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] p-6 space-y-5"
            >
              <h2 class="text-base font-bold">📊 Desempenho de Caixa & Comissões no Mês</h2>

              <!-- Progresso Receita Bruta -->
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="font-medium text-slate-500 dark:text-zinc-400">
                    Receita Bruta de Aluguéis (Recebido vs Previsto)
                  </span>
                  <span class="font-bold">
                    {{ s.totalReceivedRent | currency: 'BRL' }} /
                    {{ s.totalExpectedRent | currency: 'BRL' }} ({{ receivedPercentage() }}%)
                  </span>
                </div>
                <div class="w-full h-3 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    [style.width.%]="receivedPercentage()"
                  ></div>
                </div>
                <p class="text-[11px] text-slate-400">
                  Falta entrar no mês: <strong>{{ s.totalPendingRent | currency: 'BRL' }}</strong>
                </p>
              </div>

              <!-- Progresso Comissões -->
              <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div class="flex justify-between text-xs">
                  <span class="font-medium text-slate-500 dark:text-zinc-400">
                    Resultado da Imobiliária (Comissão Realizada vs Prevista)
                  </span>
                  <span class="font-bold text-[#D4A872]">
                    {{ s.realizedCommission | currency: 'BRL' }} /
                    {{ s.expectedCommission | currency: 'BRL' }}
                  </span>
                </div>
                <div class="w-full h-3 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    class="h-full bg-[#D4A872] rounded-full transition-all duration-500"
                    [style.width.%]="
                      s.expectedCommission > 0
                        ? (s.realizedCommission / s.expectedCommission) * 100
                        : 0
                    "
                  ></div>
                </div>
              </div>

              <!-- Repasses aos Proprietários -->
              <div class="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span class="text-xs text-amber-500 block">Aguardando Repasse Pix</span>
                  <span class="text-xl font-bold text-amber-500 mt-1 block">
                    {{ s.netOwnerPendingTransfer | currency: 'BRL' }}
                  </span>
                </div>
                <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span class="text-xs text-emerald-500 block">Já Repassado no Mês</span>
                  <span class="text-xl font-bold text-emerald-500 mt-1 block">
                    {{ s.netOwnerTransferred | currency: 'BRL' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Ocupação da Carteira de Imóveis -->
            <div
              class="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] p-6 space-y-5"
            >
              <div class="flex items-center justify-between">
                <h2 class="text-base font-bold">🏠 Ocupação da Carteira</h2>
                <button
                  type="button"
                  (click)="router.navigate(['/imoveis'])"
                  class="text-xs text-[#D4A872] hover:underline"
                >
                  Gerenciar imóveis →
                </button>
              </div>

              <div class="grid grid-cols-3 gap-3 text-center">
                <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div class="text-2xl font-bold text-blue-400">{{ s.rentedProperties }}</div>
                  <div class="text-xs text-slate-400 mt-1">🔵 Locados</div>
                </div>
                <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div class="text-2xl font-bold text-emerald-400">{{ s.availableProperties }}</div>
                  <div class="text-xs text-slate-400 mt-1">🟢 Disponíveis</div>
                </div>
                <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div class="text-2xl font-bold text-amber-400">{{ s.maintenanceProperties }}</div>
                  <div class="text-xs text-slate-400 mt-1">🟠 Manutenção</div>
                </div>
              </div>

              <div class="p-4 rounded-xl bg-slate-50 dark:bg-[#1B1B22] flex items-center justify-between">
                <span class="text-xs text-slate-500 dark:text-zinc-400">Taxa de Ocupação Atual</span>
                <span class="text-lg font-bold text-emerald-500">{{ occupancyRate() }}%</span>
              </div>
            </div>
          </div>
        }
      }
    </div>

    <!-- DRAWER LATERAL DE RAIO-X DA COBRANÇA, BAIXA E REPASSE PIX -->
    <app-charge-xray-drawer />
  `
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

