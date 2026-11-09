import { CommonModule, CurrencyPipe } from '@angular/common';
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
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex bg-slate-50 dark:bg-[#0D0D10] text-slate-900 dark:text-zinc-100">
      <!-- SIDEBAR ESQUERDA (Inspirada fielmente no Anexo 2) -->
      <aside
        class="no-print shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-[#22222A] bg-white dark:bg-[#111115] transition-all duration-200"
        [ngClass]="collapsed() ? 'w-20' : 'w-64'"
      >
        <!-- Topo da Sidebar: Logo + Collapse + Search -->
        <div class="p-4 space-y-4">
          <div class="flex items-center justify-between">
            <a routerLink="/painel" class="flex items-center gap-2.5 overflow-hidden">
              <div
                class="w-9 h-9 rounded-xl bg-[#D4A872]/15 border border-[#D4A872]/40 flex items-center justify-center shrink-0"
              >
                <svg class="w-5 h-5 text-[#D4A872]" viewBox="0 0 64 64" fill="none">
                  <polygon
                    points="32,6 56,19 56,45 32,58 8,45 8,19"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <polyline points="8,19 32,32 56,19" stroke="currentColor" stroke-width="3" />
                  <line x1="32" y1="32" x2="32" y2="58" stroke="currentColor" stroke-width="3" />
                </svg>
              </div>
              @if (!collapsed()) {
                <div class="truncate">
                  <span class="text-sm font-bold tracking-wide block text-slate-900 dark:text-zinc-100">
                    Sensatez
                  </span>
                  <span class="text-[10px] text-slate-500 dark:text-zinc-400 block">
                    Gestão Imobiliária
                  </span>
                </div>
              }
            </a>

            <button
              type="button"
              (click)="collapsed.set(!collapsed())"
              class="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 hover:text-[#D4A872] flex items-center justify-center"
              title="Recolher / Expandir menu"
            >
              {{ collapsed() ? '»' : '«' }}
            </button>
          </div>

          <!-- Search Input da Sidebar (Estilo "Search... ⌘F" do Anexo 2) -->
          @if (!collapsed()) {
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 dark:text-zinc-500">
                🔍
              </span>
              <input
                type="text"
                [ngModel]="hubStore.searchQuery()"
                (ngModelChange)="onQuickSearch($event)"
                placeholder="Buscar aluguel ou imóvel..."
                class="w-full pl-8 pr-10 py-2 rounded-xl text-xs bg-slate-100 dark:bg-[#191920] border border-slate-200 dark:border-[#282834] text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#D4A872]"
              />
              <span
                class="absolute inset-y-0 right-2 my-auto h-5 px-1.5 rounded bg-slate-200 dark:bg-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 flex items-center"
              >
                ⌘F
              </span>
            </div>
          }

          <!-- Grupo 1: Operacional & Financeiro (Telas 2, 3 e 4 unificadas na Tela Principal) -->
          <nav class="space-y-1">
            @if (!collapsed()) {
              <div class="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Central Financeira
              </div>
            }

            <a
              routerLink="/painel"
              routerLinkActive="bg-slate-900 text-white dark:bg-gradient-to-r dark:from-[#23232E] dark:to-[#191922] dark:text-white border-slate-900 dark:border-zinc-700/80 shadow-sm"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="hubStore.activeTab.set('AGENDA')"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#191922] border border-transparent transition-all"
            >
              <div class="flex items-center gap-2.5">
                <span>📅</span>
                @if (!collapsed()) {
                  <span>Painel & Calendário</span>
                }
              </div>
            </a>

            <button
              type="button"
              (click)="navigateToHubTab('CALENDAR_GRID')"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#191922] transition-all"
            >
              <div class="flex items-center gap-2.5">
                <span>🗓️</span>
                @if (!collapsed()) {
                  <span>Grade Mensal</span>
                }
              </div>
            </button>

            <button
              type="button"
              (click)="navigateToHubTab('OVERDUE')"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#191922] transition-all"
            >
              <div class="flex items-center gap-2.5">
                <span>🚨</span>
                @if (!collapsed()) {
                  <span>Inadimplência</span>
                }
              </div>
              @if (overdueCount() > 0 && !collapsed()) {
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {{ overdueCount() }}
                </span>
              }
            </button>

            <button
              type="button"
              (click)="navigateToHubTab('EXECUTIVE')"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#191922] transition-all"
            >
              <div class="flex items-center gap-2.5">
                <span>📊</span>
                @if (!collapsed()) {
                  <span>Indicadores & Alertas</span>
                }
              </div>
            </button>
          </nav>

          <!-- Divisor -->
          <div class="border-t border-slate-200 dark:border-[#22222A]"></div>

          <!-- Grupo 2: Gestão Imobiliária (Telas 5, 6, 7 e 8) -->
          <nav class="space-y-1">
            @if (!collapsed()) {
              <div class="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Gestão & Carteira
              </div>
            }

            <a
              routerLink="/imoveis"
              routerLinkActive="bg-slate-900 text-white dark:bg-[#23232E] dark:text-white border-slate-900 dark:border-zinc-700/80"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#191922] border border-transparent transition-all"
            >
              <div class="flex items-center gap-2.5">
                <span>🏠</span>
                @if (!collapsed()) {
                  <span>Carteira de Imóveis</span>
                }
              </div>
            </a>

            <a
              routerLink="/contratos"
              routerLinkActive="bg-slate-900 text-white dark:bg-[#23232E] dark:text-white border-slate-900 dark:border-zinc-700/80"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#191922] border border-transparent transition-all"
            >
              <div class="flex items-center gap-2.5">
                <span>📝</span>
                @if (!collapsed()) {
                  <span>Contratos de Locação</span>
                }
              </div>
            </a>

            <a
              routerLink="/proprietarios"
              routerLinkActive="bg-slate-900 text-white dark:bg-[#23232E] dark:text-white border-slate-900 dark:border-zinc-700/80"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#191922] border border-transparent transition-all"
            >
              <div class="flex items-center gap-2.5">
                <span>👤</span>
                @if (!collapsed()) {
                  <span>Proprietários & Extrato</span>
                }
              </div>
            </a>

            <a
              routerLink="/inquilinos"
              routerLinkActive="bg-slate-900 text-white dark:bg-[#23232E] dark:text-white border-slate-900 dark:border-zinc-700/80"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#191922] border border-transparent transition-all"
            >
              <div class="flex items-center gap-2.5">
                <span>👥</span>
                @if (!collapsed()) {
                  <span>Inquilinos</span>
                }
              </div>
            </a>
          </nav>
        </div>

        <!-- Rodapé da Sidebar: Ocupação da Carteira (Adaptado de "My team" do Anexo 2) + Usuário -->
        <div class="p-4 border-t border-slate-200 dark:border-[#22222A] space-y-4">
          @if (!collapsed() && hubStore.summaryData(); as summary) {
            <div class="space-y-2">
              <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                <span>Resumo da Carteira</span>
                <span>{{ summary.totalProperties }} imóveis</span>
              </div>

              <div class="space-y-1.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                    <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                    Locados
                  </span>
                  <span class="font-semibold">{{ summary.rentedProperties }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Disponíveis
                  </span>
                  <span class="font-semibold">{{ summary.availableProperties }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    Em Manutenção
                  </span>
                  <span class="font-semibold">{{ summary.maintenanceProperties }}</span>
                </div>
              </div>
            </div>
          }

          <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-8 h-8 rounded-full bg-[#D4A872]/20 border border-[#D4A872]/40 text-[#D4A872] font-bold text-xs flex items-center justify-center shrink-0"
              >
                {{ (authStore.user()?.fullName || 'A').charAt(0).toUpperCase() }}
              </div>
              @if (!collapsed()) {
                <div class="min-w-0">
                  <div class="text-xs font-semibold truncate">
                    {{ authStore.user()?.fullName || 'Administrador' }}
                  </div>
                  <div class="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                    {{ authStore.user()?.email }}
                  </div>
                </div>
              }
            </div>

            <button
              type="button"
              (click)="logout()"
              class="p-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Sair do Sistema"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      <!-- ÁREA CENTRAL DE CONTEÚDO -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Topbar Global com Sino de Alertas Operacionais e Toggle de Tema -->
        <header
          class="no-print h-14 px-6 border-b border-slate-200 dark:border-[#22222A] bg-white/80 dark:bg-[#111115]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30"
        >
          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Sensatez Administração Imobiliária</span>
            @if (hubStore.loading()) {
              <span class="text-[#D4A872] font-medium animate-pulse">• Sincronizando dados...</span>
            }
          </div>

          <div class="flex items-center gap-3 relative">
            <!-- Botão Sino de Alertas Operacionais (GET /api/dashboard/alerts) -->
            <button
              type="button"
              (click)="alertsPopoverOpen.set(!alertsPopoverOpen())"
              class="relative px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#181820] text-xs font-medium flex items-center gap-2 hover:border-[#D4A872] transition-colors"
            >
              <span>🔔</span>
              <span class="hidden sm:inline">Alertas Operacionais</span>
              @if (hubStore.totalAlertsCount() > 0) {
                <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {{ hubStore.totalAlertsCount() }}
                </span>
              }
            </button>

            <!-- Toggle Tema Claro / Escuro -->
            <button
              type="button"
              (click)="themeService.toggleTheme()"
              class="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#181820] flex items-center justify-center text-sm hover:border-[#D4A872] transition-colors"
              title="Alternar modo Escuro (Anexo 2) / Claro (Anexo 3)"
            >
              {{ themeService.isDark() ? '☀️' : '🌙' }}
            </button>

            <!-- Popover Rápido do Sino de Alertas -->
            @if (alertsPopoverOpen() && hubStore.alertsData(); as alerts) {
              <div
                class="absolute right-0 top-12 w-96 max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#16161D] shadow-2xl p-4 z-50 space-y-3"
              >
                <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <span class="text-xs font-bold uppercase tracking-wider text-[#D4A872]">
                    Central de Alertas Ativos
                  </span>
                  <button
                    type="button"
                    (click)="alertsPopoverOpen.set(false)"
                    class="text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div class="space-y-2 text-xs">
                  <div class="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span>🤝 Repasses Pix Pendentes</span>
                    <span class="font-bold text-amber-500">{{ alerts.pendingOwnerTransfers.length }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span>🔴 Aluguéis em Atraso</span>
                    <span class="font-bold text-rose-500">{{ alerts.overdueCharges.length }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <span>🟡 Vencendo em até 5 dias</span>
                    <span class="font-bold text-yellow-500">{{ alerts.dueSoonCharges.length }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span>⏳ Contratos vencendo (45d)</span>
                    <span class="font-bold text-blue-400">{{ alerts.expiringContracts.length }}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span>📈 Aniversário de Reajuste</span>
                    <span class="font-bold text-purple-400">{{ alerts.readjustmentEligibleContracts.length }}</span>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="alertsPopoverOpen.set(false); navigateToHubTab('EXECUTIVE')"
                  class="w-full py-2 rounded-xl text-xs font-semibold bg-[#D4A872] text-zinc-950 hover:brightness-105"
                >
                  Abrir Central de Alertas Completa
                </button>
              </div>
            }
          </div>
        </header>

        <!-- Conteúdo da Rota Ativa -->
        <main class="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <router-outlet />
        </main>
      </div>
    </div>
  `
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

