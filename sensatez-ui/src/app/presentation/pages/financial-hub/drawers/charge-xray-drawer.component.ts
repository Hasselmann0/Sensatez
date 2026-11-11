import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinancialHubStore } from '../../../../application/use-cases/dashboard-hub/financial-hub.store';
import { ChargeStatus } from '../../../../domain/enums/domain-enums';
import {
  PixCopyButtonComponent,
  StatusBadgeComponent,
  WhatsappButtonComponent
} from '../../../shared/components/ui-primitives';

@Component({
  selector: 'app-charge-xray-drawer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    StatusBadgeComponent,
    PixCopyButtonComponent,
    WhatsappButtonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './charge-xray-drawer.component.html',
  styleUrl: './charge-xray-drawer.component.css'
})
export class ChargeXrayDrawerComponent {
  readonly hubStore = inject(FinancialHubStore);
  private readonly fb = inject(FormBuilder);

  readonly ChargeStatus = ChargeStatus;

  transferNotes = 'Pix enviado para a conta do proprietário.';
  quickNotes = '';

  readonly payForm = this.fb.nonNullable.group({
    paidAt: [new Date().toISOString().slice(0, 10), Validators.required],
    paymentMethod: ['Pix', Validators.required],
    penaltyAmount: [0],
    interestAmount: [0],
    discountAmount: [0],
    notes: ['Comprovante recebido via WhatsApp.']
  });

  constructor() {
    effect(() => {
      const detail = this.hubStore.selectedChargeDetail();
      if (detail) {
        this.quickNotes = detail.notes ?? '';
        this.payForm.patchValue({
          paidAt: new Date().toISOString().slice(0, 10),
          penaltyAmount: detail.penaltyAmount ?? 0,
          interestAmount: detail.interestAmount ?? 0,
          discountAmount: detail.discountAmount ?? 0,
          paymentMethod: 'Pix',
          notes: detail.notes ?? 'Comprovante Pix recebido.'
        });
      }
    });
  }

  buildWhatsAppMessage(detail: {
    tenantName: string;
    referenceMonth: number;
    referenceYear: number;
    propertyAddress: string;
    dueDate: string;
    suggestedUpdatedTotalAmount: number;
  }): string {
    return `Olá ${detail.tenantName}, tudo bem? Aqui é da Sensatez Administração Imobiliária. Gostaria de falar sobre o aluguel ref. ${String(
      detail.referenceMonth
    ).padStart(2, '0')}/${detail.referenceYear} do imóvel ${detail.propertyAddress} (Vencimento: ${detail.dueDate}, Valor atualizado: R$ ${detail.suggestedUpdatedTotalAmount.toFixed(
      2
    )}).`;
  }

  submitPayment(chargeId: string): void {
    const raw = this.payForm.getRawValue();
    this.hubStore.payCharge(chargeId, {
      paidAt: new Date(raw.paidAt).toISOString(),
      penaltyAmount: Number(raw.penaltyAmount),
      interestAmount: Number(raw.interestAmount),
      discountAmount: Number(raw.discountAmount),
      paymentMethod: raw.paymentMethod,
      notes: raw.notes
    });
  }

  submitTransfer(chargeId: string): void {
    this.hubStore.transferToOwner(chargeId, {
      transferredAt: new Date().toISOString(),
      notes: this.transferNotes
    });
  }

  saveNotes(chargeId: string): void {
    this.hubStore.updateNotes(chargeId, this.quickNotes);
  }
}
