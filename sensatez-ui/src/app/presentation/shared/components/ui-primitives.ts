import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import {
  CALENDAR_VISUAL_STATUS_META,
  CHARGE_STATUS_META,
  CONTRACT_STATUS_META,
  EnumMeta,
  PROPERTY_STATUS_META,
  PROPERTY_TYPE_META,
  READJUSTMENT_INDEX_META
} from '../../../domain/enums/domain-enums';
import { ToastService } from '../services/toast.service';

// ==================== 1. STATUS BADGE COMPONENT ====================
export type BadgeEnumType =
  | 'propertyType'
  | 'propertyStatus'
  | 'contractStatus'
  | 'readjustmentIndex'
  | 'chargeStatus'
  | 'visualStatus';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inline-flex flex-col items-start">
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide transition-colors"
        [ngClass]="meta().badgeClass"
      >
        @if (showDot()) {
          <span class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="meta().dotColor"></span>
        }
        {{ customLabel() || meta().label }}
      </span>
      @if (subtext()) {
        <span class="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-normal">
          {{ subtext() }}
        </span>
      }
    </div>
  `
})
export class StatusBadgeComponent {
  readonly type = input.required<BadgeEnumType>();
  readonly value = input.required<number>();
  readonly subtext = input<string | null | undefined>(null);
  readonly customLabel = input<string | null | undefined>(null);
  readonly showDot = input<boolean>(false);

  readonly meta = computed<EnumMeta>(() => {
    const val = this.value();
    const mapByType: Record<BadgeEnumType, Record<number, EnumMeta>> = {
      propertyType: PROPERTY_TYPE_META,
      propertyStatus: PROPERTY_STATUS_META,
      contractStatus: CONTRACT_STATUS_META,
      readjustmentIndex: READJUSTMENT_INDEX_META,
      chargeStatus: CHARGE_STATUS_META,
      visualStatus: CALENDAR_VISUAL_STATUS_META
    };
    return (
      mapByType[this.type()]?.[val] ?? {
        value: val,
        label: 'Desconhecido',
        badgeClass: 'bg-zinc-500/20 text-zinc-400',
        dotColor: '#71717A'
      }
    );
  });
}

// ==================== 2. KPI METRIC CARD (ESTILO ANEXO 2) ====================
@Component({
  selector: 'app-kpi-metric-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#151519] p-4 shadow-sm hover:border-[#D4A872]/40 transition-all"
    >
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="text-xs font-medium text-slate-500 dark:text-zinc-400 truncate">
          {{ title() }}
        </span>
        @if (badgeText()) {
          <span
            class="px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
            [ngClass]="{
              'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30':
                badgeVariant() === 'success',
              'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30':
                badgeVariant() === 'warning',
              'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30':
                badgeVariant() === 'danger',
              'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border border-zinc-500/30':
                badgeVariant() === 'neutral'
            }"
          >
            {{ badgeText() }}
          </span>
        }
      </div>

      <div class="flex items-end justify-between gap-3">
        <div>
          <div class="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            {{ mainValue() }}
          </div>
          @if (subValue()) {
            <p class="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              {{ subValue() }}
            </p>
          }
        </div>

        @if (chartType() === 'bars') {
          <div class="flex items-end gap-1 h-9 shrink-0" aria-hidden="true">
            <span class="w-1.5 h-4 rounded-full bg-purple-500/40"></span>
            <span class="w-1.5 h-6 rounded-full bg-purple-500/60"></span>
            <span class="w-1.5 h-5 rounded-full bg-purple-500/50"></span>
            <span class="w-1.5 h-8 rounded-full bg-purple-500"></span>
            <span class="w-1.5 h-6 rounded-full bg-purple-400"></span>
            <span class="w-1.5 h-9 rounded-full bg-[#D4A872]"></span>
          </div>
        } @else if (chartType() === 'sparkline') {
          <svg class="w-16 h-9 shrink-0 text-purple-400" viewBox="0 0 64 36" fill="none">
            <path
              d="M2 28 C14 24, 20 30, 32 18 C42 8, 50 14, 62 4"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        } @else if (chartType() === 'dots') {
          <div class="flex items-center -space-x-1.5 shrink-0">
            <span class="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center justify-center">L</span>
            <span class="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-bold flex items-center justify-center">D</span>
            <span class="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold flex items-center justify-center">M</span>
          </div>
        }
      </div>
    </div>
  `
})
export class KpiMetricCardComponent {
  readonly title = input.required<string>();
  readonly mainValue = input.required<string>();
  readonly subValue = input<string>('');
  readonly badgeText = input<string>('');
  readonly badgeVariant = input<'success' | 'warning' | 'danger' | 'neutral'>('neutral');
  readonly chartType = input<'bars' | 'sparkline' | 'dots' | 'none'>('none');
}

// ==================== 3. STATUS SUMMARY STRIP (ESTILO ANEXO 3) ====================
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
  template: `
    <div
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 py-3.5 px-4 rounded-xl bg-white dark:bg-[#151519] border border-slate-200 dark:border-[#262630]"
    >
      @for (item of items(); track item.label; let last = $last) {
        <div
          class="flex flex-col pr-3"
          [ngClass]="{ 'lg:border-r lg:border-slate-200 dark:lg:border-[#262630]': !last }"
        >
          <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
            <span class="w-2 h-2 rounded-full shrink-0" [style.backgroundColor]="item.dotColor"></span>
            <span class="truncate">{{ item.label }}</span>
            @if (item.tooltip) {
              <span
                class="text-[10px] text-slate-400 dark:text-zinc-500 cursor-help"
                [title]="item.tooltip"
              >ⓘ</span>
            }
          </div>
          <div class="text-base font-bold text-slate-900 dark:text-zinc-100 mt-1">
            {{ item.value }}
          </div>
        </div>
      }
    </div>
  `
})
export class StatusSummaryStripComponent {
  readonly items = input.required<StatusStripItem[]>();
}

// ==================== 4. UNDERLINE TABS (ESTILO ANEXO 3) ====================
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
  template: `
    <div class="border-b border-slate-200 dark:border-[#262630] flex items-center gap-6 overflow-x-auto">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          (click)="tabChange.emit(tab.id)"
          class="relative pb-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2"
          [ngClass]="
            activeTab() === tab.id
              ? 'text-[#5C3A21] dark:text-[#D4A872] font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          "
        >
          <span>{{ tab.label }}</span>
          @if (tab.count !== undefined) {
            <span
              class="px-1.5 py-0.2 rounded-full text-[11px] font-semibold"
              [ngClass]="
                activeTab() === tab.id
                  ? 'bg-[#5C3A21]/15 text-[#5C3A21] dark:bg-[#D4A872]/20 dark:text-[#D4A872]'
                  : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
              "
            >
              {{ tab.count }}
            </span>
          }
          @if (activeTab() === tab.id) {
            <span
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5C3A21] dark:bg-[#D4A872] rounded-full"
            ></span>
          }
        </button>
      }
    </div>
  `
})
export class UnderlineTabsComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly activeTab = input.required<string>();
  readonly tabChange = output<string>();
}

// ==================== 5. PILL TABS (ESTILO ANEXO 2) ====================
@Component({
  selector: 'app-pill-tabs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1.5 flex-wrap">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          (click)="tabChange.emit(tab.id)"
          class="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5"
          [ngClass]="
            activeTab() === tab.id
              ? 'bg-slate-900 text-white dark:bg-[#262632] dark:text-zinc-100 shadow-sm border border-transparent dark:border-zinc-700'
              : 'text-slate-600 hover:bg-slate-200/70 dark:text-zinc-400 dark:hover:bg-[#1C1C24] dark:hover:text-zinc-200'
          "
        >
          <span>{{ tab.label }}</span>
          @if (tab.count !== undefined && tab.count > 0) {
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
              [ngClass]="{
                'bg-rose-500 text-white': tab.badgeColor === 'danger',
                'bg-amber-500 text-zinc-950': tab.badgeColor === 'warning',
                'bg-emerald-500 text-white': tab.badgeColor === 'success',
                'bg-zinc-700 text-zinc-200': !tab.badgeColor || tab.badgeColor === 'neutral'
              }"
            >
              {{ tab.count }}
            </span>
          }
        </button>
      }
    </div>
  `
})
export class PillTabsComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly activeTab = input.required<string>();
  readonly tabChange = output<string>();
}

// ==================== 6. PIX COPY BUTTON ====================
@Component({
  selector: 'app-pix-copy-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pixKey()) {
      <button
        type="button"
        (click)="copy($event)"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition-colors"
        title="Copiar Chave Pix"
      >
        <span class="truncate max-w-[140px]">Pix: {{ pixKey() }}</span>
        @if (copied()) {
          <span class="text-emerald-500 font-bold">✓ Copiado</span>
        } @else {
          <span class="text-[#D4A872]">📋</span>
        }
      </button>
    } @else {
      <span class="text-xs text-slate-400 dark:text-zinc-500 italic">Sem chave Pix</span>
    }
  `
})
export class PixCopyButtonComponent {
  readonly pixKey = input<string | null | undefined>(null);
  readonly copied = signal<boolean>(false);
  private readonly toast = inject(ToastService);

  copy(event: Event): void {
    event.stopPropagation();
    const key = this.pixKey();
    if (!key) return;
    navigator.clipboard?.writeText(key);
    this.copied.set(true);
    this.toast.info(`Chave Pix "${key}" copiada para a área de transferência!`);
    setTimeout(() => this.copied.set(false), 2000);
  }
}

// ==================== 7. WHATSAPP BUTTON ====================
@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (phone()) {
      <button
        type="button"
        (click)="openWhatsApp($event)"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors"
        title="Iniciar conversa no WhatsApp"
      >
        <span>💬</span>
        <span>{{ label() }}</span>
      </button>
    }
  `
})
export class WhatsappButtonComponent {
  readonly phone = input<string | null | undefined>(null);
  readonly label = input<string>('WhatsApp');
  readonly message = input<string>('');

  openWhatsApp(event: Event): void {
    event.stopPropagation();
    const digits = (this.phone() ?? '').replace(/\D/g, '');
    if (!digits) return;
    const fullPhone = digits.startsWith('55') ? digits : `55${digits}`;
    const text = this.message() ? `?text=${encodeURIComponent(this.message())}` : '';
    window.open(`https://wa.me/${fullPhone}${text}`, '_blank', 'noopener');
  }
}

// ==================== 8. TOAST CONTAINER ====================
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      @for (t of toastService.toasts(); track t.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all"
          [ngClass]="{
            'bg-emerald-950/95 border-emerald-500/40 text-emerald-100': t.type === 'success',
            'bg-rose-950/95 border-rose-500/40 text-rose-100': t.type === 'error',
            'bg-amber-950/95 border-amber-500/40 text-amber-100': t.type === 'warning',
            'bg-zinc-900/95 border-zinc-700 text-zinc-100': t.type === 'info'
          }"
        >
          <span class="text-lg shrink-0">
            @switch (t.type) {
              @case ('success') { ✅ }
              @case ('error') { 🚨 }
              @case ('warning') { ⚠️ }
              @default { ℹ️ }
            }
          </span>
          <div class="flex-1 min-w-0">
            @if (t.title) {
              <h4 class="text-xs font-bold uppercase tracking-wider opacity-90">{{ t.title }}</h4>
            }
            <p class="text-xs mt-0.5 leading-relaxed break-words">{{ t.message }}</p>
          </div>
          <button
            type="button"
            (click)="toastService.dismiss(t.id)"
            class="text-xs opacity-60 hover:opacity-100 px-1"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}

