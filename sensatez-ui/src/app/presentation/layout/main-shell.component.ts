import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommandBus } from '../../application/cqrs/cqrs-bus';
import { AuthStore, LogoutCommand } from '../../application/use-cases/auth/auth.cqrs';
import { FinancialHubStore } from '../../application/use-cases/dashboard-hub/financial-hub.cqrs';
import { ThemeService } from '../../infrastructure/storage/theme.service';

@Component({
  selector: 'app-main-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-shell.component.html',
  styleUrl: './main-shell.component.css'
})
export class MainShellComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly hubStore = inject(FinancialHubStore);
  readonly themeService = inject(ThemeService);
  private readonly commandBus = inject(CommandBus);
  private readonly router = inject(Router);

  readonly collapsed = signal<boolean>(false);
  readonly alertsPopoverOpen = signal<boolean>(false);

  ngOnInit(): void {
    if (!this.hubStore.summaryData()) {
      this.hubStore.loadAllHubData();
    }
  }

  overdueCount(): number {
    return (
      this.hubStore.overdueData()?.overdueChargesCount ??
      this.hubStore.alertsData()?.overdueCharges.length ??
      0
    );
  }

  onQuickSearch(term: string): void {
    this.hubStore.searchQuery.set(term);
    if (!this.router.url.startsWith('/painel')) {
      this.router.navigate(['/painel']);
    }
  }

  navigateToHubTab(tab: 'AGENDA' | 'CALENDAR_GRID' | 'OVERDUE' | 'EXECUTIVE'): void {
    this.hubStore.activeTab.set(tab);
    this.router.navigate(['/painel']);
  }

  logout(): void {
    this.commandBus.dispatch(new LogoutCommand()).subscribe();
  }
}
