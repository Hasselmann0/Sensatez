import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-metric-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kpi-metric-card.component.html',
  styleUrl: './kpi-metric-card.component.css'
})
export class KpiMetricCardComponent {
  readonly title = input.required<string>();
  readonly mainValue = input.required<string>();
  readonly subValue = input<string>('');
  readonly badgeText = input<string>('');
  readonly badgeVariant = input<'success' | 'warning' | 'danger' | 'neutral'>('neutral');
  readonly chartType = input<'bars' | 'sparkline' | 'dots' | 'none'>('none');
}

