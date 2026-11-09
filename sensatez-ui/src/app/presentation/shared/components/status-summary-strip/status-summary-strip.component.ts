import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface StatusStripItem {
  label: string;
  value: string;
  dotColor: string;
  tooltip?: string;
}

@Component({
  selector: 'app-status-summary-strip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-summary-strip.component.html',
  styleUrl: './status-summary-strip.component.css'
})
export class StatusSummaryStripComponent {
  readonly items = input.required<StatusStripItem[]>();
}

