import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../application/use-cases/auth/auth.store';
import { FinancialHubStore } from '../../application/use-cases/dashboard-hub/financial-hub.store';
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
  private readonly router = inject(Router);

  readonly collapsed = signal<boolean>(false);
  readonly alertsPopoverOpen = signal<boolean>(false);
  readonly mobileMenuOpen = signal<boolean>(false);

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

  isRouteActive(pathPrefix: string): boolean {
    return this.router.url.startsWith(pathPrefix);
  }

  onQuickSearch(term: string): void {
    this.hubStore.searchQuery.set(term);
    if (!this.router.url.startsWith('/painel')) {
      this.router.navigate(['/painel']);
    }
  }

  navigateToHubTab(tab: 'AGENDA' | 'CALENDAR_GRID' | 'OVERDUE' | 'EXECUTIVE'): void {
    this.hubStore.activeTab.set(tab);
    this.mobileMenuOpen.set(false);
    this.router.navigate(['/painel']);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.mobileMenuOpen.set(false);
    this.authStore.logout(() => {
      this.router.navigate(['/login']);
    });
  }
}
