import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OwnersStore } from '../../../application/use-cases/owners/owners.cqrs';
import { OwnerResponse } from '../../../domain/models/owner.model';
import { DocumentValidator } from '../../../domain/validators/document.validator';
import { CpfCnpjPipe, PhoneBrPipe } from '../../pipes/format.pipes';
import {
  PixCopyButtonComponent,
  StatusBadgeComponent,
  StatusStripItem,
  StatusSummaryStripComponent,
  TabItem,
  UnderlineTabsComponent,
  WhatsappButtonComponent
} from '../../shared/components/ui-primitives';

@Component({
  selector: 'app-owners-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    CpfCnpjPipe,
    PhoneBrPipe,
    UnderlineTabsComponent,
    StatusSummaryStripComponent,
    PixCopyButtonComponent,
    WhatsappButtonComponent,
    StatusBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 no-print">
      <!-- 1. CABEÇALHO ESTILO ANEXO 3 -->
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-zinc-100">
          Proprietários & Extrato de Repasses
        </h1>
        <button
          type="button"
          (click)="openCreateModal()"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5C3A21] dark:bg-[#D4A872] text-white dark:text-zinc-950 hover:brightness-105 transition-all"
        >
          Novo proprietário
        </button>
      </div>

      <!-- 2. ABAS -->
      <div class="space-y-3">
        <app-underline-tabs
          [tabs]="ownerTabs()"
          [activeTab]="selectedTab()"
          (tabChange)="onTabChange($event)"
        />
        <p class="text-xs text-slate-500 dark:text-zinc-400">
          Gerencie dados bancários, chaves Pix para repasse e emita o Demonstrativo Contábil Mensal em PDF.
        </p>
      </div>

      <!-- 3. BUSCA -->
      <div class="relative w-full sm:max-w-sm">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">🔍</span>
        <input
          type="text"
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
          placeholder="Pesquisar proprietário por nome, CPF/CNPJ ou e-mail..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-100/90 dark:bg-[#151519] border border-slate-200 dark:border-[#262630]"
        />
      </div>

      <!-- 4. FAIXA DE RESUMO -->
      <app-status-summary-strip [items]="summaryStripItems()" />

      <!-- 5. TABELA DE PROPRIETÁRIOS ESTILO ANEXO 3 -->
      <div
        class="rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] overflow-hidden shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="border-b border-slate-200 dark:border-[#262630] text-[11px] font-medium text-slate-400 dark:text-zinc-500"
              >
                <th class="py-3.5 px-5">Proprietário / CPF-CNPJ ⌄</th>
                <th class="py-3.5 px-4">Contato ⌄</th>
                <th class="py-3.5 px-4">Conta Bancária & Pix ⌄</th>
                <th class="py-3.5 px-4">Carteira ⌄</th>
                <th class="py-3.5 px-5 text-right">Ações & Extrato</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-[#22222A] text-xs">
              @for (owner of filteredOwners(); track owner.id) {
                <tr class="hover:bg-slate-50/80 dark:hover:bg-[#1B1B22] transition-colors">
                  <td class="py-4 px-5">
                    <div class="flex items-center gap-3.5">
                      <div
                        class="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#1E1E26] flex items-center justify-center font-bold text-[#D4A872]"
                      >
                        {{ owner.fullName.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900 dark:text-zinc-100">
                          {{ owner.fullName }}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono">
                          {{ owner.document | cpfCnpj }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-4 space-y-1">
                    <div>{{ owner.email }}</div>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-400">{{ owner.phone | phoneBr }}</span>
                      <app-whatsapp-button [phone]="owner.phone" label="Chat" />
                    </div>
                  </td>
                  <td class="py-4 px-4 space-y-1">
                    <div class="text-slate-600 dark:text-zinc-300">
                      {{ owner.bankName || 'Banco não inf.' }}
                      @if (owner.bankAgency || owner.bankAccount) {
                        <span class="text-[11px] text-slate-400">
                          (Ag: {{ owner.bankAgency }} / Cc: {{ owner.bankAccount }})
                        </span>
                      }
                    </div>
                    <app-pix-copy-button [pixKey]="owner.pixKey" />
                  </td>
                  <td class="py-4 px-4">
                    <button
                      type="button"
                      (click)="goToOwnerProperties(owner.id)"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-500 border border-blue-500/30 hover:bg-blue-500/25"
                      title="Filtrar imóveis deste proprietário"
                    >
                      🏠 {{ owner.propertiesCount }} imóveis →
                    </button>
                  </td>
                  <td class="py-4 px-5 text-right whitespace-nowrap space-x-1.5">
                    <button
                      type="button"
                      (click)="openStatementModal(owner)"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4A872] text-zinc-950 hover:brightness-105"
                    >
                      📄 Extrato Mensal
                    </button>
                    <button
                      type="button"
                      (click)="openEditModal(owner)"
                      class="px-2.5 py-1 rounded-lg text-xs border border-slate-200 dark:border-zinc-700"
                    >
                      ✏️ Editar
                    </button>
                    @if (owner.isActive) {
                      <button
                        type="button"
                        (click)="ownersStore.deactivateOwner(owner.id)"
                        class="px-2.5 py-1 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10"
                      >
                        🚫 Inativar
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-12 text-center text-slate-400">
                    Nenhum proprietário encontrado.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DE CADASTRO / EDIÇÃO DE PROPRIETÁRIO -->
    @if (formModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
        <div
          class="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#151519] shadow-2xl overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-[#262632] flex items-center justify-between">
            <h2 class="text-base font-bold">
              {{ editingOwner() ? 'Editar Proprietário' : 'Novo Proprietário' }}
            </h2>
            <button type="button" (click)="formModalOpen.set(false)" class="text-slate-400">✕</button>
          </div>

          <form [formGroup]="ownerForm" (ngSubmit)="saveOwner()" class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium mb-1">Nome Completo / Razão Social *</label>
                <input
                  type="text"
                  formControlName="fullName"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">CPF ou CNPJ (Módulo 11) *</label>
                <input
                  type="text"
                  formControlName="document"
                  [readonly]="!!editingOwner()"
                  placeholder="Somente números"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700 read-only:opacity-60"
                />
                @if (ownerForm.controls.document.touched && ownerForm.controls.document.errors?.['invalidDocument']) {
                  <span class="text-[10px] text-rose-500">CPF ou CNPJ matematicamente inválido.</span>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium mb-1">E-mail *</label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  formControlName="phone"
                  placeholder="11999998888"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div class="sm:col-span-2">
                <label class="block text-xs font-medium mb-1">Chave Pix p/ Repasse</label>
                <input
                  type="text"
                  formControlName="pixKey"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Banco</label>
                <input
                  type="text"
                  formControlName="bankName"
                  placeholder="Banco Inter"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Agência / Conta</label>
                <div class="flex gap-1">
                  <input
                    type="text"
                    formControlName="bankAgency"
                    placeholder="0001"
                    class="w-1/2 px-2 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                  />
                  <input
                    type="text"
                    formControlName="bankAccount"
                    placeholder="12345-6"
                    class="w-1/2 px-2 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium mb-1">Observações</label>
              <input
                type="text"
                formControlName="notes"
                placeholder="Ex: Prefere receber repasse todo dia 15 via Pix."
                class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
              />
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                (click)="formModalOpen.set(false)"
                class="px-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="ownerForm.invalid || ownersStore.loading()"
                class="px-5 py-2 rounded-xl text-xs font-bold bg-[#5C3A21] dark:bg-[#D4A872] text-white dark:text-zinc-950 disabled:opacity-50"
              >
                Salvar Proprietário
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- 🌟 MODAL / DEMONSTRATIVO CONTÁBIL: EXTRATO MENSAL DE REPASSE DO PROPRIETÁRIO (PRONTO P/ PDF) -->
    @if (statementModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
        <div
          class="print-area w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#14141A] shadow-2xl overflow-hidden my-8"
        >
          <!-- Barra de Controles (Não sai na impressão) -->
          <div
            class="no-print px-6 py-4 border-b border-slate-200 dark:border-[#262632] bg-slate-50 dark:bg-[#191922] flex items-center justify-between flex-wrap gap-3"
          >
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-[#D4A872]">
                📄 Extrato Mensal de Repasse
              </span>
              <input
                type="number"
                min="1"
                max="12"
                [(ngModel)]="statementMonth"
                (change)="reloadStatement()"
                class="w-16 px-2 py-1 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
              />
              <input
                type="number"
                [(ngModel)]="statementYear"
                (change)="reloadStatement()"
                class="w-24 px-2 py-1 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
              />
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="printStatement()"
                class="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4A872] text-zinc-950 hover:brightness-105"
              >
                🖨️ Imprimir / Salvar PDF
              </button>
              <button
                type="button"
                (click)="statementModalOpen.set(false)"
                class="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-zinc-700"
              >
                Fechar ✕
              </button>
            </div>
          </div>

          <!-- Corpo do Demonstrativo Contábil -->
          @if (ownersStore.currentStatement(); as st) {
            <div class="p-8 space-y-6">
              <!-- Cabeçalho do Demonstrativo -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-zinc-800">
                <div>
                  <h2 class="text-xl font-bold">
                    Demonstrativo Mensal de Locação e Repasse
                  </h2>
                  <p class="text-xs text-slate-500 dark:text-zinc-400">
                    Sensatez Administração Imobiliária • Competência {{ st.month | number: '2.0-0' }}/{{ st.year }}
                  </p>
                </div>

                <div class="text-xs sm:text-right space-y-0.5">
                  <div class="font-bold text-sm">{{ st.ownerName }}</div>
                  <div class="text-slate-500">CPF/CNPJ: {{ st.ownerDocument | cpfCnpj }}</div>
                  <div class="text-slate-500">
                    Banco: {{ st.ownerBankName || '-' }} • Ag: {{ st.ownerBankAgency || '-' }} • Conta:
                    {{ st.ownerBankAccount || '-' }}
                  </div>
                  <div class="font-semibold text-[#D4A872]">Chave Pix: {{ st.ownerPixKey || '-' }}</div>
                </div>
              </div>

              <!-- 4 Totais do Proprietário no Mês -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span class="text-[11px] text-slate-400 block">Total Bruto Recebido</span>
                  <span class="text-lg font-bold">{{ st.totalGrossReceived | currency: 'BRL' }}</span>
                </div>
                <div class="p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span class="text-[11px] text-slate-400 block">(-) Comissão Imobiliária</span>
                  <span class="text-lg font-bold text-rose-500">
                    {{ st.totalCommissionRetained | currency: 'BRL' }}
                  </span>
                </div>
                <div class="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                  <span class="text-[11px] text-amber-500 block">Líquido Pendente de Repasse</span>
                  <span class="text-lg font-bold text-amber-500">
                    {{ st.totalNetPendingTransfer | currency: 'BRL' }}
                  </span>
                </div>
                <div class="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <span class="text-[11px] text-emerald-500 block">Líquido Já Repassado</span>
                  <span class="text-lg font-bold text-emerald-500">
                    {{ st.totalNetTransferred | currency: 'BRL' }}
                  </span>
                </div>
              </div>

              <!-- Tabela Discriminando Imóvel por Imóvel -->
              <div class="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-100 dark:bg-[#191922] text-[11px] uppercase text-slate-500">
                    <tr>
                      <th class="py-3 px-4">Imóvel / Inquilino</th>
                      <th class="py-3 px-4">Vencimento</th>
                      <th class="py-3 px-4">Aluguel Bruto</th>
                      <th class="py-3 px-4">Comissão</th>
                      <th class="py-3 px-4">Valor Líquido</th>
                      <th class="py-3 px-4">Situação do Repasse</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-zinc-800">
                    @for (item of st.items; track item.chargeId) {
                      <tr>
                        <td class="py-3 px-4">
                          <div class="font-bold">{{ item.propertyAddress }}</div>
                          <div class="text-[11px] text-slate-400">Inquilino: {{ item.tenantName }}</div>
                        </td>
                        <td class="py-3 px-4">{{ item.dueDate | date: 'dd/MM/yyyy' }}</td>
                        <td class="py-3 px-4 font-medium">{{ item.grossRentAmount | currency: 'BRL' }}</td>
                        <td class="py-3 px-4 text-rose-500">
                          - {{ item.commissionAmount | currency: 'BRL' }} ({{ item.commissionPercentage }}%)
                        </td>
                        <td class="py-3 px-4 font-bold text-emerald-500">
                          {{ item.netOwnerAmount | currency: 'BRL' }}
                        </td>
                        <td class="py-3 px-4">
                          @if (item.isTransferredToOwner) {
                            <span class="font-semibold text-emerald-500">
                              ✅ Repassado em {{ item.transferredToOwnerAt | date: 'dd/MM/yyyy' }}
                            </span>
                          } @else {
                            <span class="font-semibold text-amber-500">⏳ Pendente de Repasse</span>
                          }
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6" class="py-8 text-center text-slate-400">
                          Nenhuma cobrança registrada para este proprietário na competência selecionada.
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
    }
  `
})
export class OwnersPageComponent implements OnInit {
  readonly ownersStore = inject(OwnersStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly selectedTab = signal<string>('ACTIVE');
  readonly searchTerm = signal<string>('');

  readonly formModalOpen = signal<boolean>(false);
  readonly editingOwner = signal<OwnerResponse | null>(null);

  readonly statementModalOpen = signal<boolean>(false);
  readonly selectedOwnerForStatement = signal<OwnerResponse | null>(null);
  statementYear = new Date().getFullYear();
  statementMonth = new Date().getMonth() + 1;

  readonly ownerForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    document: ['', [Validators.required, DocumentValidator.cpfOrCnpjValidator()]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    pixKey: [''],
    bankName: [''],
    bankAgency: [''],
    bankAccount: [''],
    notes: ['']
  });

  readonly filteredOwners = computed(() => {
    const all = this.ownersStore.owners();
    const search = this.searchTerm().trim().toLowerCase();
    return all.filter(o => {
      if (this.selectedTab() === 'ACTIVE' && !o.isActive) return false;
      if (search) {
        return (
          o.fullName.toLowerCase().includes(search) ||
          o.document.includes(search) ||
          o.email.toLowerCase().includes(search)
        );
      }
      return true;
    });
  });

  readonly ownerTabs = computed<TabItem[]>(() => [
    { id: 'ACTIVE', label: 'Ativos', count: this.ownersStore.owners().filter(o => o.isActive).length },
    { id: 'ALL', label: 'Todos', count: this.ownersStore.owners().length }
  ]);

  readonly summaryStripItems = computed<StatusStripItem[]>(() => {
    const all = this.ownersStore.owners();
    const totalProps = all.reduce((acc, o) => acc + o.propertiesCount, 0);
    const withPix = all.filter(o => !!o.pixKey).length;
    return [
      { label: 'Proprietários Cadastrados', value: `${all.length}`, dotColor: '#10B981' },
      { label: 'Imóveis Vinculados', value: `${totalProps} imóveis`, dotColor: '#3B82F6' },
      { label: 'Com Chave Pix Ativa', value: `${withPix} proprietários`, dotColor: '#D4A872' }
    ];
  });

  ngOnInit(): void {
    this.ownersStore.loadOwners({ onlyActive: false });
  }

  onTabChange(tab: string): void {
    this.selectedTab.set(tab);
  }

  openCreateModal(): void {
    this.editingOwner.set(null);
    this.ownerForm.reset({
      fullName: '',
      document: '',
      email: '',
      phone: '',
      pixKey: '',
      bankName: '',
      bankAgency: '',
      bankAccount: '',
      notes: ''
    });
    this.formModalOpen.set(true);
  }

  openEditModal(owner: OwnerResponse): void {
    this.editingOwner.set(owner);
    this.ownerForm.patchValue({
      fullName: owner.fullName,
      document: owner.document,
      email: owner.email,
      phone: owner.phone,
      pixKey: owner.pixKey ?? '',
      bankName: owner.bankName ?? '',
      bankAgency: owner.bankAgency ?? '',
      bankAccount: owner.bankAccount ?? '',
      notes: owner.notes ?? ''
    });
    this.formModalOpen.set(true);
  }

  saveOwner(): void {
    if (this.ownerForm.invalid) return;
    const raw = this.ownerForm.getRawValue();
    const editing = this.editingOwner();

    if (editing) {
      this.ownersStore.updateOwner(
        editing.id,
        {
          fullName: raw.fullName,
          email: raw.email,
          phone: raw.phone.replace(/\D/g, ''),
          pixKey: raw.pixKey || null,
          bankName: raw.bankName || null,
          bankAgency: raw.bankAgency || null,
          bankAccount: raw.bankAccount || null,
          notes: raw.notes || null
        },
        () => this.formModalOpen.set(false)
      );
    } else {
      this.ownersStore.createOwner(
        {
          fullName: raw.fullName,
          document: raw.document.replace(/\D/g, ''),
          email: raw.email,
          phone: raw.phone.replace(/\D/g, ''),
          pixKey: raw.pixKey || null,
          bankName: raw.bankName || null,
          bankAgency: raw.bankAgency || null,
          bankAccount: raw.bankAccount || null,
          notes: raw.notes || null
        },
        () => this.formModalOpen.set(false)
      );
    }
  }

  goToOwnerProperties(ownerId: string): void {
    this.router.navigate(['/imoveis'], { queryParams: { ownerId } });
  }

  openStatementModal(owner: OwnerResponse): void {
    this.selectedOwnerForStatement.set(owner);
    this.statementModalOpen.set(true);
    this.reloadStatement();
  }

  reloadStatement(): void {
    const owner = this.selectedOwnerForStatement();
    if (!owner) return;
    this.ownersStore.loadStatement(owner.id, Number(this.statementYear), Number(this.statementMonth));
  }

  printStatement(): void {
    window.print();
  }
}

