import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TabItem } from '../underline-tabs/underline-tabs.component';

@Component({
  selector: 'app-pill-tabs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pill-tabs.component.html',
  styleUrl: './pill-tabs.component.css'
})
export class PillTabsComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly activeTab = input.required<string>();
  readonly tabChange = output<string>();
}

