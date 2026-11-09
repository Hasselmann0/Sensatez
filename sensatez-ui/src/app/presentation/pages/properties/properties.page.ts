import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OwnersStore } from '../../../application/use-cases/owners/owners.cqrs';
import { PropertiesStore } from '../../../application/use-cases/properties/properties.cqrs';
import {
  PROPERTY_TYPE_META,
  PropertyStatus,
  PropertyType
} from '../../../domain/enums/domain-enums';
import { PropertyResponse } from '../../../domain/models/property.model';
import { CepBrPipe } from '../../pipes/format.pipes';
import {
  StatusBadgeComponent,
  StatusStripItem,
  StatusSummaryStripComponent,
  TabItem,
  UnderlineTabsComponent
} from '../../shared/components/ui-primitives';

@Component({
  selector: 'app-properties-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    CepBrPipe,
    UnderlineTabsComponent,
    StatusSummaryStripComponent,
    StatusBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- 1. CABEÇALHO FIEL AO ANEXO 3 ("Gestão de cobranças" -> "Carteira de Imóveis") -->
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-zinc-100">
            Carteira de Imóveis
          </h1>
        </div>
        <button
          type="button"
          (click)="openCreateModal()"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5C3A21] hover:bg-[#4A2E1A] dark:bg-[#D4A872] dark:text-zinc-950 text-white transition-all shadow-sm"
        >
          Nova propriedade
        </button>
      </div>

      <!-- 2. ABAS COM SUBLINHADO (Estilo Anexo 3: Todas | Disponíveis | Alugados | Em Manutenção) -->
      <div class="space-y-3">
        <app-underline-tabs
          [tabs]="statusTabs()"
          [activeTab]="selectedTab()"
          (tabChange)="onTabChange($event)"
        />
        <p class="text-xs text-slate-500 dark:text-zinc-400">
          Acompanhe a disponibilidade, valores sugeridos, comissões e vínculo com proprietários de toda a carteira.
        </p>
      </div>

      <!-- 3. BARRA DE PESQUISA + PILLS DE FILTROS À DIREITA (Estilo Anexo 3) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="relative w-full sm:max-w-sm">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">🔍</span>
          <input
            type="text"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            placeholder="Pesquisar por código (IMO-001), rua, bairro ou cidade..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-100/90 dark:bg-[#151519] border border-slate-200 dark:border-[#262630] focus:outline-none focus:border-[#D4A872]"
          />
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <select
            [ngModel]="selectedOwnerId()"
            (ngModelChange)="onOwnerFilterChange($event)"
            class="px-3.5 py-2 rounded-full text-xs font-medium bg-white dark:bg-[#151519] border border-slate-200 dark:border-[#262630] text-slate-700 dark:text-zinc-200"
          >
            <option value="">Proprietário: Todos</option>
            @for (owner of ownersStore.owners(); track owner.id) {
              <option [value]="owner.id">Proprietário: {{ owner.fullName }}</option>
            }
          </select>

          <select
            [ngModel]="selectedType()"
            (ngModelChange)="selectedType.set($event)"
            class="px-3.5 py-2 rounded-full text-xs font-medium bg-slate-900 text-white dark:bg-[#24242E] dark:text-zinc-100"
          >
            <option value="">Tipo: Todos</option>
            @for (t of propertyTypes; track t.value) {
              <option [value]="t.value">Tipo: {{ t.label }}</option>
            }
          </select>

          @if (selectedOwnerId() || selectedType() || searchTerm()) {
            <button
              type="button"
              (click)="clearFilters()"
              class="px-3 py-1.5 rounded-full text-xs text-rose-500 hover:bg-rose-500/10"
            >
              Limpar filtros ✕
            </button>
          }
        </div>
      </div>

      <!-- 4. FAIXA DE RESUMO COM BOLINHAS COLORIDAS (Estilo Anexo 3) -->
      <app-status-summary-strip [items]="summaryStripItems()" />

      <!-- 5. BARRA AUXILIAR ACIMA DA TABELA (Exportar + Contador à direita igual ao Anexo 3) -->
      <div class="flex items-center justify-between">
        <button
          type="button"
          (click)="exportCsv()"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] hover:border-[#D4A872] transition-colors"
        >
          <span>Exportar relatório</span>
          <span>↓</span>
        </button>

        <div class="text-right">
          <span class="text-[11px] text-slate-400 block">Total de imóveis na listagem</span>
          <strong class="text-xs font-bold text-slate-900 dark:text-zinc-100">
            {{ filteredProperties().length }} imóveis
          </strong>
        </div>
      </div>

      <!-- 6. TABELA DE DADOS ESTILO ANEXO 3 -->
      <div
        class="rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] overflow-hidden shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="border-b border-slate-200 dark:border-[#262630] text-[11px] font-medium text-slate-400 dark:text-zinc-500"
              >
                <th class="py-3.5 px-5">Imóvel / Endereço ⌄</th>
                <th class="py-3.5 px-4">Cód. de controle ⌄</th>
                <th class="py-3.5 px-4">Proprietário ⌄</th>
                <th class="py-3.5 px-4">Tipo ⌄</th>
                <th class="py-3.5 px-4">Comissão ⌄</th>
                <th class="py-3.5 px-4">Aluguel Sugerido ⌄</th>
                <th class="py-3.5 px-4">Status ⌄</th>
                <th class="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-[#22222A] text-xs">
              @for (prop of filteredProperties(); track prop.id) {
                <tr class="hover:bg-slate-50/80 dark:hover:bg-[#1B1B22] transition-colors">
                  <!-- Coluna 1 com Ícone Quadrado à Esquerda + Título em Negrito + Subtexto Cinza (Fiel ao Anexo 3) -->
                  <td class="py-4 px-5">
                    <div class="flex items-center gap-3.5">
                      <div
                        class="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#1E1E26] flex items-center justify-center text-base shrink-0"
                      >
                        🏠
                      </div>
                      <div class="min-w-0">
                        <div class="font-bold text-slate-900 dark:text-zinc-100 truncate max-w-md">
                          {{ prop.street }}, {{ prop.number }}
                          @if (prop.complement) {
                            <span class="font-normal text-slate-500"> ({{ prop.complement }})</span>
                          }
                        </div>
                        <div class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                          {{ prop.neighborhood }} — {{ prop.city }}/{{ prop.state }} • CEP:
                          {{ prop.zipCode | cepBr }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td class="py-4 px-4 font-mono font-semibold text-slate-700 dark:text-zinc-300">
                    {{ prop.code }}
                  </td>

                  <td class="py-4 px-4 font-medium text-slate-700 dark:text-zinc-200">
                    {{ prop.ownerName }}
                  </td>

                  <td class="py-4 px-4">
                    <app-status-badge type="propertyType" [value]="prop.type" />
                  </td>

                  <td class="py-4 px-4 text-slate-600 dark:text-zinc-300">
                    {{ prop.defaultCommissionPercentage }}%
                  </td>

                  <td class="py-4 px-4 font-bold text-slate-900 dark:text-zinc-100">
                    {{ prop.suggestedRentAmount | currency: 'BRL' }}
                  </td>

                  <td class="py-4 px-4">
                    <app-status-badge type="propertyStatus" [value]="prop.status" />
                  </td>

                  <td class="py-4 px-5 text-right whitespace-nowrap space-x-1.5">
                    @if (prop.status === PropertyStatus.Available) {
                      <button
                        type="button"
                        (click)="goToCreateContract(prop)"
                        class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                        title="Criar Contrato de Locação para este imóvel"
                      >
                        + Alugar
                      </button>
                    }

                    @if (prop.status !== PropertyStatus.Rented) {
                      <button
                        type="button"
                        (click)="propertiesStore.toggleMaintenance(prop)"
                        class="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-zinc-700 hover:border-amber-500"
                        title="Alternar entre Disponível e Em Manutenção"
                      >
                        {{ prop.status === PropertyStatus.Maintenance ? '✓ Liberar' : '🔧 Manut.' }}
                      </button>
                    }

                    <button
                      type="button"
                      (click)="openEditModal(prop)"
                      class="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-zinc-700 hover:border-[#D4A872]"
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="py-12 text-center text-slate-400">
                    Nenhum imóvel encontrado com os filtros aplicados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DE CADASTRO / EDIÇÃO DE IMÓVEL -->
    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          class="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-[#262632] bg-white dark:bg-[#151519] shadow-2xl overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-[#262632] flex items-center justify-between">
            <h2 class="text-base font-bold">
              {{ editingProperty() ? 'Editar Imóvel — ' + editingProperty()!.code : 'Cadastrar Novo Imóvel' }}
            </h2>
            <button type="button" (click)="modalOpen.set(false)" class="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>

          <form [formGroup]="propertyForm" (ngSubmit)="saveProperty()" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              @if (!editingProperty()) {
                <div class="sm:col-span-2">
                  <label class="block text-xs font-medium mb-1">Proprietário do Imóvel *</label>
                  <select
                    formControlName="ownerId"
                    class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                  >
                    <option value="">Selecione um proprietário ativo...</option>
                    @for (o of ownersStore.owners(); track o.id) {
                      <option [value]="o.id">{{ o.fullName }} ({{ o.document }})</option>
                    }
                  </select>
                </div>
              }
              <div>
                <label class="block text-xs font-medium mb-1">Código Interno *</label>
                <input
                  type="text"
                  formControlName="code"
                  placeholder="IMO-001"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Tipo de Imóvel *</label>
                <select
                  formControlName="type"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                >
                  @for (t of propertyTypes; track t.value) {
                    <option [ngValue]="t.value">{{ t.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-medium mb-1">Rua / Logradouro *</label>
                <input
                  type="text"
                  formControlName="street"
                  placeholder="Rua das Palmeiras"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Número *</label>
                <input
                  type="text"
                  formControlName="number"
                  placeholder="450"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">CEP (8 dígitos) *</label>
                <input
                  type="text"
                  formControlName="zipCode"
                  placeholder="01420000"
                  maxlength="8"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs font-medium mb-1">Complemento</label>
                <input
                  type="text"
                  formControlName="complement"
                  placeholder="Apto 82 - Bloco B"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Bairro *</label>
                <input
                  type="text"
                  formControlName="neighborhood"
                  placeholder="Jardim Paulista"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Cidade *</label>
                <input
                  type="text"
                  formControlName="city"
                  placeholder="São Paulo"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">UF (2 letras) *</label>
                <input
                  type="text"
                  formControlName="state"
                  placeholder="SP"
                  maxlength="2"
                  class="w-full px-3 py-2 rounded-xl text-xs uppercase bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium mb-1">Aluguel Sugerido (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  formControlName="suggestedRentAmount"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">% Comissão Padrão da Imobiliária *</label>
                <input
                  type="number"
                  step="0.1"
                  formControlName="defaultCommissionPercentage"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium mb-1">Observações do Imóvel</label>
              <textarea
                rows="2"
                formControlName="notes"
                placeholder="Ex: 2 vagas de garagem, aceita pet de pequeno porte."
                class="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-[#1C1C24] border border-slate-200 dark:border-zinc-700"
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                (click)="modalOpen.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="propertyForm.invalid || propertiesStore.loading()"
                class="px-5 py-2 rounded-xl text-xs font-bold bg-[#5C3A21] dark:bg-[#D4A872] text-white dark:text-zinc-950 disabled:opacity-50"
              >
                Salvar Imóvel
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class PropertiesPageComponent implements OnInit {
  readonly propertiesStore = inject(PropertiesStore);
  readonly ownersStore = inject(OwnersStore);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly currency = new CurrencyPipe('pt-BR');

  readonly PropertyStatus = PropertyStatus;
  readonly propertyTypes = Object.values(PROPERTY_TYPE_META);

  readonly selectedTab = signal<string>('ALL');
  readonly searchTerm = signal<string>('');
  readonly selectedOwnerId = signal<string>('');
  readonly selectedType = signal<string>('');

  readonly modalOpen = signal<boolean>(false);
  readonly editingProperty = signal<PropertyResponse | null>(null);

  readonly propertyForm = this.fb.nonNullable.group({
    ownerId: ['', Validators.required],
    code: ['IMO-001', Validators.required],
    street: ['', Validators.required],
    number: ['', Validators.required],
    complement: [''],
    neighborhood: ['', Validators.required],
    city: ['São Paulo', Validators.required],
    state: ['SP', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    zipCode: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    type: [PropertyType.Apartment, Validators.required],
    suggestedRentAmount: [2500, [Validators.required, Validators.min(1)]],
    defaultCommissionPercentage: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
    notes: ['']
  });

  readonly filteredProperties = computed(() => {
    const all = this.propertiesStore.properties();
    const tab = this.selectedTab();
    const owner = this.selectedOwnerId();
    const type = this.selectedType();
    const search = this.searchTerm().trim().toLowerCase();

    return all.filter(p => {
      if (tab === 'AVAILABLE' && p.status !== PropertyStatus.Available) return false;
      if (tab === 'RENTED' && p.status !== PropertyStatus.Rented) return false;
      if (tab === 'MAINTENANCE' && p.status !== PropertyStatus.Maintenance) return false;
      if (owner && p.ownerId !== owner) return false;
      if (type && p.type !== Number(type)) return false;
      if (search) {
        return (
          p.code.toLowerCase().includes(search) ||
          p.fullAddress.toLowerCase().includes(search) ||
          p.ownerName.toLowerCase().includes(search)
        );
      }
      return true;
    });
  });

  readonly statusTabs = computed<TabItem[]>(() => {
    const all = this.propertiesStore.properties();
    return [
      { id: 'ALL', label: 'Todas', count: all.length },
      {
        id: 'AVAILABLE',
        label: 'Disponíveis',
        count: all.filter(p => p.status === PropertyStatus.Available).length
      },
      {
        id: 'RENTED',
        label: 'Alugados',
        count: all.filter(p => p.status === PropertyStatus.Rented).length
      },
      {
        id: 'MAINTENANCE',
        label: 'Em Manutenção',
        count: all.filter(p => p.status === PropertyStatus.Maintenance).length
      }
    ];
  });

  readonly summaryStripItems = computed<StatusStripItem[]>(() => {
    const all = this.propertiesStore.properties();
    const available = all.filter(p => p.status === PropertyStatus.Available);
    const rented = all.filter(p => p.status === PropertyStatus.Rented);
    const maintenance = all.filter(p => p.status === PropertyStatus.Maintenance);

    const rentedRevenue = rented.reduce((acc, p) => acc + p.suggestedRentAmount, 0);
    const availablePotential = available.reduce((acc, p) => acc + p.suggestedRentAmount, 0);

    return [
      {
        label: 'Alugados (Em Contrato)',
        value: this.currency.transform(rentedRevenue, 'BRL') ?? 'R$ 0,00',
        dotColor: '#3B82F6',
        tooltip: `${rented.length} imóveis alugados`
      },
      {
        label: 'Disponíveis p/ Locação',
        value: this.currency.transform(availablePotential, 'BRL') ?? 'R$ 0,00',
        dotColor: '#10B981',
        tooltip: `${available.length} imóveis prontos para alugar`
      },
      {
        label: 'Unidades Disponíveis',
        value: `${available.length} imóveis`,
        dotColor: '#10B981'
      },
      {
        label: 'Unidades Locadas',
        value: `${rented.length} imóveis`,
        dotColor: '#6366F1'
      },
      {
        label: 'Em Manutenção',
        value: `${maintenance.length} imóveis`,
        dotColor: '#F59E0B'
      }
    ];
  });

  ngOnInit(): void {
    this.propertiesStore.loadProperties();
    this.ownersStore.loadOwners({ onlyActive: true });

    this.route.queryParamMap.subscribe(params => {
      const ownerId = params.get('ownerId');
      if (ownerId) {
        this.selectedOwnerId.set(ownerId);
      }
    });
  }

  onTabChange(tab: string): void {
    this.selectedTab.set(tab);
  }

  onOwnerFilterChange(ownerId: string): void {
    this.selectedOwnerId.set(ownerId);
  }

  clearFilters(): void {
    this.selectedTab.set('ALL');
    this.selectedOwnerId.set('');
    this.selectedType.set('');
    this.searchTerm.set('');
  }

  openCreateModal(): void {
    this.editingProperty.set(null);
    const nextNum = this.propertiesStore.properties().length + 1;
    this.propertyForm.reset({
      ownerId: this.selectedOwnerId() || (this.ownersStore.owners()[0]?.id ?? ''),
      code: `IMO-${String(nextNum).padStart(3, '0')}`,
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '',
      type: PropertyType.Apartment,
      suggestedRentAmount: 2500,
      defaultCommissionPercentage: 10,
      notes: ''
    });
    this.modalOpen.set(true);
  }

  openEditModal(prop: PropertyResponse): void {
    this.editingProperty.set(prop);
    this.propertyForm.patchValue({
      ownerId: prop.ownerId,
      code: prop.code,
      street: prop.street,
      number: prop.number,
      complement: prop.complement ?? '',
      neighborhood: prop.neighborhood,
      city: prop.city,
      state: prop.state,
      zipCode: prop.zipCode.replace(/\D/g, ''),
      type: prop.type,
      suggestedRentAmount: prop.suggestedRentAmount,
      defaultCommissionPercentage: prop.defaultCommissionPercentage,
      notes: prop.notes ?? ''
    });
    this.modalOpen.set(true);
  }

  saveProperty(): void {
    if (this.propertyForm.invalid) return;
    const raw = this.propertyForm.getRawValue();
    const editing = this.editingProperty();

    if (editing) {
      this.propertiesStore.updateProperty(
        editing.id,
        {
          code: raw.code,
          street: raw.street,
          number: raw.number,
          complement: raw.complement || null,
          neighborhood: raw.neighborhood,
          city: raw.city,
          state: raw.state.toUpperCase(),
          zipCode: raw.zipCode.replace(/\D/g, ''),
          type: Number(raw.type),
          suggestedRentAmount: Number(raw.suggestedRentAmount),
          defaultCommissionPercentage: Number(raw.defaultCommissionPercentage),
          notes: raw.notes || null
        },
        () => this.modalOpen.set(false)
      );
    } else {
      this.propertiesStore.createProperty(
        {
          ownerId: raw.ownerId,
          code: raw.code,
          street: raw.street,
          number: raw.number,
          complement: raw.complement || null,
          neighborhood: raw.neighborhood,
          city: raw.city,
          state: raw.state.toUpperCase(),
          zipCode: raw.zipCode.replace(/\D/g, ''),
          type: Number(raw.type),
          suggestedRentAmount: Number(raw.suggestedRentAmount),
          defaultCommissionPercentage: Number(raw.defaultCommissionPercentage),
          notes: raw.notes || null
        },
        () => this.modalOpen.set(false)
      );
    }
  }

  goToCreateContract(prop: PropertyResponse): void {
    this.router.navigate(['/contratos'], {
      queryParams: { newPropertyId: prop.id }
    });
  }

  exportCsv(): void {
    const rows = this.filteredProperties().map(p =>
      [p.code, `"${p.fullAddress}"`, `"${p.ownerName}"`, p.suggestedRentAmount, p.status].join(';')
    );
    const csv = ['Codigo;Endereco;Proprietario;AluguelSugerido;Status', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carteira-imoveis-sensatez.csv';
    a.click();
  }
}

