import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OwnersStore } from '../../../application/use-cases/owners/owners.store';
import { OwnerResponse } from '../../../domain/models/owner.model';
import { DocumentValidator } from '../../../domain/validators/document.validator';
import { CpfCnpjPipe, PhoneBrPipe } from '../../pipes/format.pipes';
import {
  PixCopyButtonComponent,
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
    WhatsappButtonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './owners.page.html',
  styleUrl: './owners.page.css'
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
