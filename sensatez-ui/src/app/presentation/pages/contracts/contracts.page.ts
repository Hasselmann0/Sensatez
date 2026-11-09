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
  templateUrl: './contracts.page.html',
  styleUrl: './contracts.page.css'
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
