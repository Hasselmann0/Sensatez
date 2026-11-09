import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContractsStore } from '../../../application/use-cases/contracts/contracts.cqrs';
import { PropertiesStore } from '../../../application/use-cases/properties/properties.cqrs';
import { TenantsStore } from '../../../application/use-cases/tenants/tenants.cqrs';
import {
  ContractStatus,
  PropertyStatus,
  READJUSTMENT_INDEX_META,
  ReadjustmentIndex
} from '../../../domain/enums/domain-enums';
import { LeaseContractResponse } from '../../../domain/models/lease-contract.model';
import {
  StatusBadgeComponent,
  StatusStripItem,
  StatusSummaryStripComponent,
  TabItem,
  UnderlineTabsComponent
} from '../../shared/components/ui-primitives';

@Component({
  selector: 'app-contracts-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    UnderlineTabsComponent,
    StatusSummaryStripComponent,
    StatusBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- 1. CABEÇALHO ESTILO ANEXO 3 -->
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-zinc-100">
            Gestão de Contratos de Locação
          </h1>
        </div>
        <button
          type="button"
          (click)="openNewContractModal()"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5C3A21] dark:bg-[#D4A872] text-white dark:text-zinc-950 hover:brightness-105 transition-all shadow-sm"
        >
          Novo contrato
        </button>
      </div>

      <!-- 2. ABAS COM SUBLINHADO -->
      <div class="space-y-3">
        <app-underline-tabs
          [tabs]="contractTabs()"
          [activeTab]="selectedTab()"
          (tabChange)="selectedTab.set($event)"
        />
        <p class="text-xs text-slate-500 dark:text-zinc-400">
          Contratos ativos geram automaticamente todas as parcelas mensais no Calendário Financeiro.
        </p>
      </div>

      <!-- 3. BARRA DE PESQUISA + FILTROS EM PILLS -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="relative w-full sm:max-w-sm">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">🔍</span>
          <input
            type="text"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            placeholder="Pesquisar por imóvel, inquilino ou proprietário..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-100/90 dark:bg-[#151519] border border-slate-200 dark:border-[#262630] focus:outline-none focus:border-[#D4A872]"
          />
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <label
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium cursor-pointer border transition-colors"
            [ngClass]="
              onlyExpiring45d()
                ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold'
                : 'bg-white dark:bg-[#151519] border-slate-200 dark:border-[#262630]'
            "
          >
            <input
              type="checkbox"
              class="hidden"
              [ngModel]="onlyExpiring45d()"
              (ngModelChange)="toggleExpiring45d($event)"
            />
            <span>⏳ Vencendo nos próximos 45 dias</span>
          </label>
        </div>
      </div>

      <!-- 4. FAIXA DE RESUMO -->
      <app-status-summary-strip [items]="summaryStripItems()" />

      <!-- 5. TABELA DE CONTRATOS ESTILO ANEXO 3 -->
      <div
        class="rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] overflow-hidden shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="border-b border-slate-200 dark:border-[#262630] text-[11px] font-medium text-slate-400 dark:text-zinc-500"
              >
                <th class="py-3.5 px-5">Imóvel & Inquilino ⌄</th>
                <th class="py-3.5 px-4">Proprietário ⌄</th>
                <th class="py-3.5 px-4">Vigência ⌄</th>
                <th class="py-3.5 px-4">Dia Venc. ⌄</th>
                <th class="py-3.5 px-4">Índice ⌄</th>
                <th class="py-3.5 px-4">Aluguel Mensal ⌄</th>
                <th class="py-3.5 px-4">Status ⌄</th>
                <th class="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-[#22222A] text-xs">
              @for (c of filteredContracts(); track c.id) {
                <tr class="hover:bg-slate-50/80 dark:hover:bg-[#1B1B22] transition-colors">
                  <td class="py-4 px-5">
                    <div class="flex items-center gap-3.5">
                      <div
                        class="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#1E1E26] flex items-center justify-center text-base shrink-0"
                      >
                        📝
                      </div>
                      <div>
                        <div class="font-bold text-slate-900 dark:text-zinc-100">
                          {{ c.tenantName }}
                        </div>
                        <div class="text-[11px] text-slate-400 dark:text-zinc-500">
                          {{ c.propertyAddress }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-4 font-medium">{{ c.ownerName }}</td>
                  <td class="py-4 px-4">
                    <div>{{ c.startDate | date: 'dd/MM/yyyy' }} até</div>
                    <div class="font-semibold">{{ c.endDate | date: 'dd/MM/yyyy' }}</div>
                  </td>
                  <td class="py-4 px-4 font-semibold">Todo dia {{ c.dueDay }}</td>
                  <td class="py-4 px-4">
                    <app-status-badge type="readjustmentIndex" [value]="c.readjustmentIndex" />
                  </td>
                  <td class="py-4 px-4 font-bold text-slate-900 dark:text-zinc-100">
                    {{ c.rentAmount | currency: 'BRL' }}
                  </td>
                  <td class="py-4 px-4">
                    <app-status-badge type="contractStatus" [value]="c.status" />
                  </td>
                  <td class="py-4 px-5 text-right whitespace-nowrap space-x-1.5">
                    <button
                      type="button"
                      (click)="openContractDetailDrawer(c.id)"
                      class="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-zinc-800 dark:text-zinc-100 hover:border-[#D4A872]"
                    >
                      Parcelas & Detalhes
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="py-12 text-center text-slate-400">
                    Nenhum contrato encontrado para este filtro.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DE NOVO CONTRATO DE LOCAÇÃO (POST /api/contracts) -->
    @if (newModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#151519] shadow-2xl overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-[#262632] flex items-center justify-between">
            <h2 class="text-base font-bold">Novo Contrato de Locação</h2>
            <button type="button" (click)="newModalOpen.set(false)" class="text-slate-400">✕</button>
          </div>

          <form
            [formGroup]="contractForm"
            (ngSubmit)="submitNewContract()"
            class="p-6 space-y-4 max-h-[82vh] overflow-y-auto"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium mb-1">Imóvel Disponível *</label>
                <select
                  formControlName="propertyId"
                  (change)="onPropertySelected()"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                >
                  <option value="">Selecione um imóvel disponível...</option>
                  @for (p of availableProperties(); track p.id) {
                    <option [value]="p.id">
                      {{ p.code }} — {{ p.fullAddress }} ({{ p.suggestedRentAmount | currency: 'BRL' }})
                    </option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium mb-1">Inquilino(a) *</label>
                <select
                  formControlName="tenantId"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                >
                  <option value="">Selecione o inquilino...</option>
                  @for (t of tenantsStore.tenants(); track t.id) {
                    <option [value]="t.id">{{ t.fullName }} ({{ t.document }})</option>
                  }
                </select>
              </div>
            </div>

            <!-- Datas e Atalhos +12m / +24m / +30m -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label class="block text-xs font-medium mb-1">Data de Início *</label>
                <input
                  type="date"
                  formControlName="startDate"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Data de Término *</label>
                <input
                  type="date"
                  formControlName="endDate"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  (click)="applyDurationMonths(12)"
                  class="flex-1 py-2 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 hover:border-[#D4A872] border border-transparent"
                >
                  +12m
                </button>
                <button
                  type="button"
                  (click)="applyDurationMonths(24)"
                  class="flex-1 py-2 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 hover:border-[#D4A872] border border-transparent"
                >
                  +24m
                </button>
                <button
                  type="button"
                  (click)="applyDurationMonths(30)"
                  class="flex-1 py-2 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 hover:border-[#D4A872] border border-transparent"
                >
                  +30m
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-medium mb-1">Dia Vencimento (1-31) *</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  formControlName="dueDay"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Valor do Aluguel (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  formControlName="rentAmount"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">% Comissão Imob. *</label>
                <input
                  type="number"
                  step="0.1"
                  formControlName="commissionPercentage"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Valor Caução (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  formControlName="securityDepositAmount"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium mb-1">% Multa Atraso (Padrão 2%)</label>
                <input
                  type="number"
                  step="0.1"
                  formControlName="penaltyPercentage"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">% Juros Mensal (Padrão 1%)</label>
                <input
                  type="number"
                  step="0.1"
                  formControlName="monthlyInterestPercentage"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Índice de Reajuste *</label>
                <select
                  formControlName="readjustmentIndex"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                >
                  @for (idx of readjustmentIndices; track idx.value) {
                    <option [ngValue]="idx.value">{{ idx.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium mb-1">Observações do Contrato</label>
              <input
                type="text"
                formControlName="notes"
                placeholder="Ex: Caução de 3 aluguéis depositada."
                class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
              />
            </div>

            <div class="p-3.5 rounded-xl bg-[#D4A872]/10 border border-[#D4A872]/30 text-xs text-slate-700 dark:text-zinc-200">
              ✨ <strong>Automação do Motor de Contratos:</strong> Ao confirmar, o imóvel mudará automaticamente para
              <strong>Alugado</strong> e todas as parcelas mensais da vigência serão geradas no Calendário Financeiro.
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                (click)="newModalOpen.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="contractForm.invalid || contractsStore.loading()"
                class="px-5 py-2 rounded-xl text-xs font-bold bg-[#5C3A21] dark:bg-[#D4A872] text-white dark:text-zinc-950 disabled:opacity-50"
              >
                Ativar Contrato & Gerar Parcelas
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- DRAWER LATERAL DE DETALHES DO CONTRATO + CRONOGRAMA DE PARCELAS + REAJUSTE E RESCISÃO -->
    @if (detailDrawerOpen()) {
      <div class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <div
          class="w-full max-w-2xl h-full bg-white dark:bg-[#14141A] border-l border-slate-200 dark:border-[#262632] shadow-2xl flex flex-col overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-[#262632] flex items-center justify-between">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#D4A872]">
                Detalhes do Contrato & Parcelas
              </span>
              @if (contractsStore.selectedContract(); as sc) {
                <h2 class="text-base font-bold">{{ sc.propertyAddress }}</h2>
              }
            </div>
            <button type="button" (click)="detailDrawerOpen.set(false)" class="text-sm">✕</button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            @if (contractsStore.selectedContract(); as sc) {
              <div
                class="p-4 rounded-2xl border border-slate-200 dark:border-[#262632] bg-slate-50 dark:bg-[#191922] space-y-3"
              >
                <div class="flex items-center justify-between">
                  <app-status-badge type="contractStatus" [value]="sc.status" />
                  <span class="text-xs text-slate-400">
                    Vigência: {{ sc.startDate | date: 'dd/MM/yyyy' }} a {{ sc.endDate | date: 'dd/MM/yyyy' }}
                  </span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
                  <div>
                    <span class="text-slate-400 block">Inquilino(a)</span>
                    <strong>{{ sc.tenantName }}</strong>
                  </div>
                  <div>
                    <span class="text-slate-400 block">Proprietário(a)</span>
                    <strong>{{ sc.ownerName }}</strong>
                  </div>
                  <div>
                    <span class="text-slate-400 block">Aluguel Atual</span>
                    <strong class="text-sm text-[#D4A872]">{{ sc.rentAmount | currency: 'BRL' }}</strong>
                  </div>
                </div>

                <!-- Botões de Ação do Contrato Ativo: Reajustar Aluguel & Rescindir -->
                @if (sc.status === ContractStatus.Active) {
                  <div class="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      (click)="showReadjustBox.set(!showReadjustBox()); showTerminateBox.set(false)"
                      class="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white"
                    >
                      📈 Reajustar Aluguel
                    </button>
                    <button
                      type="button"
                      (click)="showTerminateBox.set(!showTerminateBox()); showReadjustBox.set(false)"
                      class="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-600 text-white"
                    >
                      🛑 Rescindir / Encerrar Contrato
                    </button>
                  </div>
                }
              </div>

              <!-- Box de Reajuste Anual (POST /api/contracts/{id}/readjust) -->
              @if (showReadjustBox()) {
                <div class="p-4 rounded-2xl border border-purple-500/40 bg-purple-500/10 space-y-3">
                  <h3 class="text-xs font-bold uppercase text-purple-400">
                    📈 Aplicar Reajuste Anual de Aluguel
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] mb-1">% de Reajuste (ex: 4.50)</label>
                      <input
                        type="number"
                        step="0.01"
                        [(ngModel)]="readjustPercentage"
                        class="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#14141A] border border-slate-200 dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] mb-1">Vigência a partir de</label>
                      <input
                        type="date"
                        [(ngModel)]="readjustEffectiveDate"
                        class="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#14141A] border border-slate-200 dark:border-zinc-700"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    [(ngModel)]="readjustNotes"
                    placeholder="Ex: Reajuste anual IGP-M acumulado"
                    class="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#14141A] border border-slate-200 dark:border-zinc-700"
                  />
                  <button
                    type="button"
                    (click)="confirmReadjust(sc.id)"
                    class="w-full py-2 rounded-xl text-xs font-bold bg-purple-600 text-white"
                  >
                    Confirmar Reajuste e Recalcular Parcelas Futuras
                  </button>
                </div>
              }

              <!-- Box de Rescisão (POST /api/contracts/{id}/terminate) -->
              @if (showTerminateBox()) {
                <div class="p-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 space-y-3">
                  <h3 class="text-xs font-bold uppercase text-rose-400">
                    🛑 Rescindir Contrato e Liberar Imóvel
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-zinc-300">
                    O imóvel voltará automaticamente para <strong>Disponível</strong> e todas as parcelas futuras em aberto serão canceladas.
                  </p>
                  <input
                    type="text"
                    [(ngModel)]="terminateReason"
                    placeholder="Motivo da rescisão (ex: Entrega das chaves amigável)"
                    class="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#14141A] border border-slate-200 dark:border-zinc-700"
                  />
                  <button
                    type="button"
                    (click)="confirmTerminate(sc.id)"
                    class="w-full py-2 rounded-xl text-xs font-bold bg-rose-600 text-white"
                  >
                    Confirmar Rescisão do Contrato
                  </button>
                </div>
              }

              <!-- Tabela de Todas as Parcelas do Contrato -->
              <div class="space-y-2">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cronograma de Parcelas Mensais ({{ sc.charges?.length ?? 0 }})
                </h3>
                <div class="rounded-xl border border-slate-200 dark:border-[#262632] overflow-hidden">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 dark:bg-[#191922] text-[11px] text-slate-400">
                      <tr>
                        <th class="py-2.5 px-3">Comp.</th>
                        <th class="py-2.5 px-3">Vencimento</th>
                        <th class="py-2.5 px-3">Total</th>
                        <th class="py-2.5 px-3">Líq. Prop.</th>
                        <th class="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-zinc-800">
                      @for (ch of sc.charges ?? []; track ch.id) {
                        <tr>
                          <td class="py-2.5 px-3 font-semibold">
                            {{ ch.referenceMonth | number: '2.0-0' }}/{{ ch.referenceYear }}
                          </td>
                          <td class="py-2.5 px-3">{{ ch.dueDate | date: 'dd/MM/yyyy' }}</td>
                          <td class="py-2.5 px-3 font-bold">{{ ch.totalAmount | currency: 'BRL' }}</td>
                          <td class="py-2.5 px-3 text-emerald-500 font-medium">
                            {{ ch.netOwnerAmount | currency: 'BRL' }}
                          </td>
                          <td class="py-2.5 px-3">
                            <app-status-badge type="chargeStatus" [value]="ch.status" />
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class ContractsPageComponent implements OnInit {
  readonly contractsStore = inject(ContractsStore);
  readonly propertiesStore = inject(PropertiesStore);
  readonly tenantsStore = inject(TenantsStore);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly currency = new CurrencyPipe('pt-BR');

  readonly ContractStatus = ContractStatus;
  readonly readjustmentIndices = Object.values(READJUSTMENT_INDEX_META);

  readonly selectedTab = signal<string>('ALL');
  readonly searchTerm = signal<string>('');
  readonly onlyExpiring45d = signal<boolean>(false);

  readonly newModalOpen = signal<boolean>(false);
  readonly detailDrawerOpen = signal<boolean>(false);
  readonly showReadjustBox = signal<boolean>(false);
  readonly showTerminateBox = signal<boolean>(false);

  readjustPercentage = 4.5;
  readjustEffectiveDate = new Date().toISOString().slice(0, 10);
  readjustNotes = 'Reajuste anual pelo índice contratual.';
  terminateReason = 'Entrega das chaves amigável.';

  readonly availableProperties = computed(() =>
    this.propertiesStore.properties().filter(p => p.status === PropertyStatus.Available)
  );

  readonly contractForm = this.fb.nonNullable.group({
    propertyId: ['', Validators.required],
    tenantId: ['', Validators.required],
    startDate: [new Date().toISOString().slice(0, 10), Validators.required],
    endDate: ['', Validators.required],
    dueDay: [10, [Validators.required, Validators.min(1), Validators.max(31)]],
    rentAmount: [2500, [Validators.required, Validators.min(1)]],
    commissionPercentage: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
    securityDepositAmount: [7500, [Validators.min(0)]],
    penaltyPercentage: [2, [Validators.min(0)]],
    monthlyInterestPercentage: [1, [Validators.min(0)]],
    readjustmentIndex: [ReadjustmentIndex.IGPM, Validators.required],
    notes: ['']
  });

  readonly filteredContracts = computed<LeaseContractResponse[]>(() => {
    const all = this.contractsStore.contracts();
    const tab = this.selectedTab();
    const search = this.searchTerm().trim().toLowerCase();

    return all.filter(c => {
      if (tab === 'ACTIVE' && c.status !== ContractStatus.Active) return false;
      if (tab === 'TERMINATED' && c.status === ContractStatus.Active) return false;
      if (search) {
        return (
          c.propertyAddress.toLowerCase().includes(search) ||
          c.tenantName.toLowerCase().includes(search) ||
          c.ownerName.toLowerCase().includes(search)
        );
      }
      return true;
    });
  });

  readonly contractTabs = computed<TabItem[]>(() => {
    const all = this.contractsStore.contracts();
    return [
      { id: 'ALL', label: 'Todos', count: all.length },
      {
        id: 'ACTIVE',
        label: 'Vigentes (Ativos)',
        count: all.filter(c => c.status === ContractStatus.Active).length
      },
      {
        id: 'TERMINATED',
        label: 'Rescindidos / Expirados',
        count: all.filter(c => c.status !== ContractStatus.Active).length
      }
    ];
  });

  readonly summaryStripItems = computed<StatusStripItem[]>(() => {
    const all = this.contractsStore.contracts();
    const active = all.filter(c => c.status === ContractStatus.Active);
    const totalRent = active.reduce((acc, c) => acc + c.rentAmount, 0);
    const totalDeposit = active.reduce((acc, c) => acc + c.securityDepositAmount, 0);

    return [
      {
        label: 'Receita Mensal Contratada',
        value: this.currency.transform(totalRent, 'BRL') ?? 'R$ 0,00',
        dotColor: '#10B981'
      },
      {
        label: 'Total em Cauções',
        value: this.currency.transform(totalDeposit, 'BRL') ?? 'R$ 0,00',
        dotColor: '#3B82F6'
      },
      {
        label: 'Contratos Vigentes',
        value: `${active.length} contratos`,
        dotColor: '#10B981'
      },
      {
        label: 'Encerrados / Expirados',
        value: `${all.length - active.length} contratos`,
        dotColor: '#EF4444'
      },
      {
        label: 'Total Histórico',
        value: `${all.length} contratos`,
        dotColor: '#D4A872'
      }
    ];
  });

  ngOnInit(): void {
    this.contractsStore.loadContracts();
    this.propertiesStore.loadProperties();
    this.tenantsStore.loadTenants({ onlyActive: true });
    this.applyDurationMonths(12);

    this.route.queryParamMap.subscribe(params => {
      const newPropertyId = params.get('newPropertyId');
      if (newPropertyId) {
        setTimeout(() => {
          this.openNewContractModal(newPropertyId);
        }, 250);
      }

      const readjustId = params.get('readjustContractId');
      if (readjustId) {
        this.openContractDetailDrawer(readjustId);
        this.showReadjustBox.set(true);
      }
    });
  }

  toggleExpiring45d(checked: boolean): void {
    this.onlyExpiring45d.set(checked);
    this.contractsStore.loadContracts(checked ? { expiringWithinDays: 45 } : undefined);
  }

  openNewContractModal(preselectedPropertyId?: string): void {
    this.applyDurationMonths(12);
    if (preselectedPropertyId) {
      this.contractForm.patchValue({ propertyId: preselectedPropertyId });
      this.onPropertySelected();
    }
    this.newModalOpen.set(true);
  }

  onPropertySelected(): void {
    const propId = this.contractForm.getRawValue().propertyId;
    const prop = this.propertiesStore.properties().find(p => p.id === propId);
    if (prop) {
      this.contractForm.patchValue({
        rentAmount: prop.suggestedRentAmount,
        commissionPercentage: prop.defaultCommissionPercentage,
        securityDepositAmount: prop.suggestedRentAmount * 3
      });
    }
  }

  applyDurationMonths(months: number): void {
    const startStr = this.contractForm.getRawValue().startDate || new Date().toISOString().slice(0, 10);
    const start = new Date(startStr + 'T00:00:00');
    start.setMonth(start.getMonth() + months);
    start.setDate(start.getDate() - 1);
    this.contractForm.patchValue({
      endDate: start.toISOString().slice(0, 10)
    });
  }

  submitNewContract(): void {
    if (this.contractForm.invalid) return;
    const raw = this.contractForm.getRawValue();
    this.contractsStore.createContract(
      {
        propertyId: raw.propertyId,
        tenantId: raw.tenantId,
        startDate: raw.startDate,
        endDate: raw.endDate,
        dueDay: Number(raw.dueDay),
        rentAmount: Number(raw.rentAmount),
        commissionPercentage: Number(raw.commissionPercentage),
        securityDepositAmount: Number(raw.securityDepositAmount),
        penaltyPercentage: Number(raw.penaltyPercentage),
        monthlyInterestPercentage: Number(raw.monthlyInterestPercentage),
        readjustmentIndex: Number(raw.readjustmentIndex),
        notes: raw.notes || null
      },
      () => {
        this.newModalOpen.set(false);
        this.propertiesStore.loadProperties();
      }
    );
  }

  openContractDetailDrawer(id: string): void {
    this.showReadjustBox.set(false);
    this.showTerminateBox.set(false);
    this.detailDrawerOpen.set(true);
    this.contractsStore.loadContractDetail(id);
  }

  confirmReadjust(id: string): void {
    this.contractsStore.readjustContract(
      id,
      {
        readjustmentPercentage: Number(this.readjustPercentage),
        effectiveFromDate: this.readjustEffectiveDate,
        notes: this.readjustNotes
      },
      () => this.showReadjustBox.set(false)
    );
  }

  confirmTerminate(id: string): void {
    this.contractsStore.terminateContract(
      id,
      { reason: this.terminateReason },
      () => {
        this.showTerminateBox.set(false);
        this.propertiesStore.loadProperties();
      }
    );
  }
}

