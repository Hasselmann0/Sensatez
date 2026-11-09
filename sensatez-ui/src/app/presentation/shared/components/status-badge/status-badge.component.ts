import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  CALENDAR_VISUAL_STATUS_META,
  CHARGE_STATUS_META,
  CONTRACT_STATUS_META,
  EnumMeta,
  PROPERTY_STATUS_META,
  PROPERTY_TYPE_META,
  READJUSTMENT_INDEX_META
} from '../../../../domain/enums/domain-enums';

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
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css'
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

