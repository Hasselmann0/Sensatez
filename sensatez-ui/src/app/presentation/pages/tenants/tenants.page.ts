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
  templateUrl: './tenants.page.html',
  styleUrl: './tenants.page.css'
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
