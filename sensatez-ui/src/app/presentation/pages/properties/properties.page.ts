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
  templateUrl: './properties.page.html',
  styleUrl: './properties.page.css'
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
