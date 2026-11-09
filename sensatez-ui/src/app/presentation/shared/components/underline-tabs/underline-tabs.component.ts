import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  badgeColor?: 'danger' | 'warning' | 'success' | 'neutral';
}

@Component({
  selector: 'app-underline-tabs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './underline-tabs.component.html',
  styleUrl: './underline-tabs.component.css'
})
export class UnderlineTabsComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly activeTab = input.required<string>();
  readonly tabChange = output<string>();
}

