import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CalendarVisualStatus, ChargeStatus } from '../../../domain/enums/domain-enums';
import { CalendarChargeItemResponse } from '../../../domain/models/rent-charge.model';
import { StatusBadgeComponent } from './status-badge/status-badge.component';

@Component({
  selector: 'app-charge-agenda-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './charge-agenda-card.component.html',
  styleUrl: './charge-agenda-card.component.css'
})
export class ChargeAgendaCardComponent {
  readonly charge = input.required<CalendarChargeItemResponse>();
  readonly selectCharge = output<string>();

  readonly VisualStatus = CalendarVisualStatus;
  readonly ChargeStatus = ChargeStatus;
}
