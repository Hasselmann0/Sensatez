import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContractsStore } from '../../../application/use-cases/contracts/contracts.cqrs';
import { TenantsStore } from '../../../application/use-cases/tenants/tenants.cqrs';
import { TenantResponse } from '../../../domain/models/tenant.model';
import { DocumentValidator } from '../../../domain/validators/document.validator';
import { CpfCnpjPipe, PhoneBrPipe } from '../../pipes/format.pipes';
import {
  StatusBadgeComponent,
  TabItem,
  UnderlineTabsComponent,
  WhatsappButtonComponent
} from '../../shared/components/ui-primitives';

@Component({
  selector: 'app-tenants-page',
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
    WhatsappButtonComponent,
    StatusBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-zinc-100">
          Cadastro de Inquilinos
        </h1>
        <button
          type="button"
          (click)="openCreateModal()"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5C3A21] dark:bg-[#D4A872] text-white dark:text-zinc-950 hover:brightness-105 transition-all"
        >
          Novo inquilino
        </button>
      </div>

      <app-underline-tabs
        [tabs]="tenantTabs()"
        [activeTab]="selectedTab()"
        (tabChange)="selectedTab.set($event)"
      />

      <div class="relative w-full sm:max-w-sm">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">🔍</span>
        <input
          type="text"
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
          placeholder="Pesquisar inquilino por nome, CPF/CNPJ ou e-mail..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-100/90 dark:bg-[#151519] border border-slate-200 dark:border-[#262630]"
        />
      </div>

      <div
        class="rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] overflow-hidden shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="border-b border-slate-200 dark:border-[#262630] text-[11px] font-medium text-slate-400 dark:text-zinc-500"
              >
                <th class="py-3.5 px-5">Inquilino / CPF-CNPJ ⌄</th>
                <th class="py-3.5 px-4">E-mail ⌄</th>
                <th class="py-3.5 px-4">Telefone / WhatsApp ⌄</th>
                <th class="py-3.5 px-4">Informações Adicionais ⌄</th>
                <th class="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-[#22222A] text-xs">
              @for (t of filteredTenants(); track t.id) {
                <tr class="hover:bg-slate-50/80 dark:hover:bg-[#1B1B22] transition-colors">
                  <td class="py-4 px-5">
                    <div class="flex items-center gap-3.5">
                      <div
                        class="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#1E1E26] flex items-center justify-center font-bold text-[#D4A872]"
                      >
                        {{ t.fullName.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900 dark:text-zinc-100">{{ t.fullName }}</div>
                        <div class="text-[11px] text-slate-400 font-mono">{{ t.document | cpfCnpj }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-4">{{ t.email }}</td>
                  <td class="py-4 px-4 space-x-2">
                    <span>{{ t.phone | phoneBr }}</span>
                    <app-whatsapp-button [phone]="t.phone" label="WhatsApp" />
                  </td>
                  <td class="py-4 px-4 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                    {{ t.additionalInfo || '-' }}
                  </td>
                  <td class="py-4 px-5 text-right whitespace-nowrap space-x-1.5">
                    <button
                      type="button"
                      (click)="openHistoryDrawer(t)"
                      class="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-zinc-800"
                    >
                      📋 Contratos
                    </button>
                    <button
                      type="button"
                      (click)="openEditModal(t)"
                      class="px-2.5 py-1 rounded-lg text-xs border border-slate-200 dark:border-zinc-700"
                    >
                      ✏️ Editar
                    </button>
                    @if (t.isActive) {
                      <button
                        type="button"
                        (click)="tenantsStore.deactivateTenant(t.id)"
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
                    Nenhum inquilino encontrado.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DE CADASTRO / EDIÇÃO DE INQUILINO -->
    @if (formModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#151519] shadow-2xl overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-[#262632] flex items-center justify-between">
            <h2 class="text-base font-bold">
              {{ editingTenant() ? 'Editar Inquilino' : 'Novo Inquilino' }}
            </h2>
            <button type="button" (click)="formModalOpen.set(false)" class="text-slate-400">✕</button>
          </div>

          <form [formGroup]="tenantForm" (ngSubmit)="saveTenant()" class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-medium mb-1">Nome Completo *</label>
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
                [readonly]="!!editingTenant()"
                class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700 read-only:opacity-60"
              />
              @if (tenantForm.controls.document.touched && tenantForm.controls.document.errors?.['invalidDocument']) {
                <span class="text-[10px] text-rose-500">CPF ou CNPJ inválido.</span>
              }
            </div>

            <div class="grid grid-cols-2 gap-3">
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
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium mb-1">Informações Complementares</label>
              <textarea
                rows="2"
                formControlName="additionalInfo"
                placeholder="Ex: Renda comprovada, trabalha Home Office."
                class="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
              ></textarea>
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
                [disabled]="tenantForm.invalid || tenantsStore.loading()"
                class="px-5 py-2 rounded-xl text-xs font-bold bg-[#5C3A21] dark:bg-[#D4A872] text-white dark:text-zinc-950 disabled:opacity-50"
              >
                Salvar Inquilino
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- DRAWER DE HISTÓRICO DE CONTRATOS DO INQUILINO (GET /api/contracts?tenantId={id}) -->
    @if (historyDrawerOpen() && selectedTenantForHistory(); as tenant) {
      <div class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <div
          class="w-full max-w-lg h-full bg-white dark:bg-[#14141A] border-l border-slate-200 dark:border-[#262632] shadow-2xl p-6 space-y-4 overflow-y-auto"
        >
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <span class="text-[11px] font-bold uppercase text-[#D4A872]">Histórico de Locações</span>
              <h2 class="text-base font-bold">{{ tenant.fullName }}</h2>
            </div>
            <button type="button" (click)="historyDrawerOpen.set(false)">✕</button>
          </div>

          @for (c of contractsStore.contracts(); track c.id) {
            <div class="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <app-status-badge type="contractStatus" [value]="c.status" />
                <span class="font-bold">{{ c.rentAmount | currency: 'BRL' }}/mês</span>
              </div>
              <div class="font-semibold">{{ c.propertyAddress }}</div>
              <div class="text-slate-400">
                Vigência: {{ c.startDate | date: 'dd/MM/yyyy' }} até {{ c.endDate | date: 'dd/MM/yyyy' }}
              </div>
            </div>
          } @empty {
            <p class="text-xs text-slate-400 py-8 text-center">
              Nenhum contrato registrado para este inquilino.
            </p>
          }
        </div>
      </div>
    }
  `
})
export class TenantsPageComponent implements OnInit {
  readonly tenantsStore = inject(TenantsStore);
  readonly contractsStore = inject(ContractsStore);
  private readonly fb = inject(FormBuilder);

  readonly selectedTab = signal<string>('ACTIVE');
  readonly searchTerm = signal<string>('');
  readonly formModalOpen = signal<boolean>(false);
  readonly editingTenant = signal<TenantResponse | null>(null);
  readonly historyDrawerOpen = signal<boolean>(false);
  readonly selectedTenantForHistory = signal<TenantResponse | null>(null);

  readonly tenantForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    document: ['', [Validators.required, DocumentValidator.cpfOrCnpjValidator()]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    additionalInfo: ['']
  });

  readonly filteredTenants = computed(() => {
    const all = this.tenantsStore.tenants();
    const search = this.searchTerm().trim().toLowerCase();
    return all.filter(t => {
      if (this.selectedTab() === 'ACTIVE' && !t.isActive) return false;
      if (search) {
        return (
          t.fullName.toLowerCase().includes(search) ||
          t.document.includes(search) ||
          t.email.toLowerCase().includes(search)
        );
      }
      return true;
    });
  });

  readonly tenantTabs = computed<TabItem[]>(() => [
    { id: 'ACTIVE', label: 'Ativos', count: this.tenantsStore.tenants().filter(t => t.isActive).length },
    { id: 'ALL', label: 'Todos', count: this.tenantsStore.tenants().length }
  ]);

  ngOnInit(): void {
    this.tenantsStore.loadTenants({ onlyActive: false });
  }

  openCreateModal(): void {
    this.editingTenant.set(null);
    this.tenantForm.reset({
      fullName: '',
      document: '',
      email: '',
      phone: '',
      additionalInfo: ''
    });
    this.formModalOpen.set(true);
  }

  openEditModal(tenant: TenantResponse): void {
    this.editingTenant.set(tenant);
    this.tenantForm.patchValue({
      fullName: tenant.fullName,
      document: tenant.document,
      email: tenant.email,
      phone: tenant.phone,
      additionalInfo: tenant.additionalInfo ?? ''
    });
    this.formModalOpen.set(true);
  }

  saveTenant(): void {
    if (this.tenantForm.invalid) return;
    const raw = this.tenantForm.getRawValue();
    const editing = this.editingTenant();

    if (editing) {
      this.tenantsStore.updateTenant(
        editing.id,
        {
          fullName: raw.fullName,
          email: raw.email,
          phone: raw.phone.replace(/\D/g, ''),
          additionalInfo: raw.additionalInfo || null
        },
        () => this.formModalOpen.set(false)
      );
    } else {
      this.tenantsStore.createTenant(
        {
          fullName: raw.fullName,
          document: raw.document.replace(/\D/g, ''),
          email: raw.email,
          phone: raw.phone.replace(/\D/g, ''),
          additionalInfo: raw.additionalInfo || null
        },
        () => this.formModalOpen.set(false)
      );
    }
  }

  openHistoryDrawer(tenant: TenantResponse): void {
    this.selectedTenantForHistory.set(tenant);
    this.historyDrawerOpen.set(true);
    this.contractsStore.loadContracts({ tenantId: tenant.id });
  }
}

