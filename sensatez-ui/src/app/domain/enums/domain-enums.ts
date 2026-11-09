export enum PropertyType {
  House = 1,
  Apartment = 2,
  CommercialRoom = 3,
  Warehouse = 4,
  Land = 5,
  Other = 6
}

export enum PropertyStatus {
  Available = 1,
  Rented = 2,
  Maintenance = 3
}

export enum ContractStatus {
  Active = 1,
  Expired = 2,
  Terminated = 3
}

export enum ReadjustmentIndex {
  IGPM = 1,
  IPCA = 2,
  INPC = 3,
  Fixed = 4
}

export enum ChargeStatus {
  Pending = 1,
  Paid = 2,
  Cancelled = 3
}

export enum CalendarVisualStatus {
  Paid = 1,
  DueSoon = 2,
  Overdue = 3,
  Upcoming = 4
}

export interface EnumMeta {
  value: number;
  label: string;
  badgeClass: string;
  dotColor: string;
}

export const PROPERTY_TYPE_META: Record<number, EnumMeta> = {
  [PropertyType.House]: {
    value: PropertyType.House,
    label: 'Casa',
    badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
    dotColor: '#0EA5E9'
  },
  [PropertyType.Apartment]: {
    value: PropertyType.Apartment,
    label: 'Apartamento',
    badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30',
    dotColor: '#6366F1'
  },
  [PropertyType.CommercialRoom]: {
    value: PropertyType.CommercialRoom,
    label: 'Sala Comercial',
    badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
    dotColor: '#A855F7'
  },
  [PropertyType.Warehouse]: {
    value: PropertyType.Warehouse,
    label: 'Galpão',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    dotColor: '#F59E0B'
  },
  [PropertyType.Land]: {
    value: PropertyType.Land,
    label: 'Terreno',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    dotColor: '#10B981'
  },
  [PropertyType.Other]: {
    value: PropertyType.Other,
    label: 'Outro',
    badgeClass: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30',
    dotColor: '#71717A'
  }
};

export const PROPERTY_STATUS_META: Record<number, EnumMeta> = {
  [PropertyStatus.Available]: {
    value: PropertyStatus.Available,
    label: 'Disponível',
    badgeClass: 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30',
    dotColor: '#10B981'
  },
  [PropertyStatus.Rented]: {
    value: PropertyStatus.Rented,
    label: 'Alugado',
    badgeClass: 'bg-blue-600 text-white dark:bg-blue-500/20 dark:text-blue-300 dark:border dark:border-blue-500/30',
    dotColor: '#3B82F6'
  },
  [PropertyStatus.Maintenance]: {
    value: PropertyStatus.Maintenance,
    label: 'Em Manutenção',
    badgeClass: 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30',
    dotColor: '#F59E0B'
  }
};

export const CONTRACT_STATUS_META: Record<number, EnumMeta> = {
  [ContractStatus.Active]: {
    value: ContractStatus.Active,
    label: 'Vigente / Ativo',
    badgeClass: 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30',
    dotColor: '#10B981'
  },
  [ContractStatus.Expired]: {
    value: ContractStatus.Expired,
    label: 'Vencido / Expirado',
    badgeClass: 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30',
    dotColor: '#F59E0B'
  },
  [ContractStatus.Terminated]: {
    value: ContractStatus.Terminated,
    label: 'Rescindido / Encerrado',
    badgeClass: 'bg-rose-600 text-white dark:bg-rose-500/20 dark:text-rose-300 dark:border dark:border-rose-500/30',
    dotColor: '#EF4444'
  }
};

export const READJUSTMENT_INDEX_META: Record<number, EnumMeta> = {
  [ReadjustmentIndex.IGPM]: {
    value: ReadjustmentIndex.IGPM,
    label: 'IGP-M',
    badgeClass: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/30',
    dotColor: '#D4A872'
  },
  [ReadjustmentIndex.IPCA]: {
    value: ReadjustmentIndex.IPCA,
    label: 'IPCA',
    badgeClass: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/30',
    dotColor: '#D4A872'
  },
  [ReadjustmentIndex.INPC]: {
    value: ReadjustmentIndex.INPC,
    label: 'INPC',
    badgeClass: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/30',
    dotColor: '#D4A872'
  },
  [ReadjustmentIndex.Fixed]: {
    value: ReadjustmentIndex.Fixed,
    label: 'Fixo / Sem Índice',
    badgeClass: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/30',
    dotColor: '#71717A'
  }
};

export const CHARGE_STATUS_META: Record<number, EnumMeta> = {
  [ChargeStatus.Pending]: {
    value: ChargeStatus.Pending,
    label: 'A receber',
    badgeClass: 'bg-blue-600 text-white dark:bg-blue-500/20 dark:text-blue-300 dark:border dark:border-blue-500/30',
    dotColor: '#3B82F6'
  },
  [ChargeStatus.Paid]: {
    value: ChargeStatus.Paid,
    label: 'Recebido',
    badgeClass: 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30',
    dotColor: '#10B981'
  },
  [ChargeStatus.Cancelled]: {
    value: ChargeStatus.Cancelled,
    label: 'Cancelado',
    badgeClass: 'bg-zinc-500/20 text-zinc-500 line-through border border-zinc-500/30',
    dotColor: '#71717A'
  }
};

export const CALENDAR_VISUAL_STATUS_META: Record<number, EnumMeta> = {
  [CalendarVisualStatus.Paid]: {
    value: CalendarVisualStatus.Paid,
    label: 'Pago',
    badgeClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30',
    dotColor: '#10B981'
  },
  [CalendarVisualStatus.DueSoon]: {
    value: CalendarVisualStatus.DueSoon,
    label: 'Vence em Breve',
    badgeClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30',
    dotColor: '#F59E0B'
  },
  [CalendarVisualStatus.Overdue]: {
    value: CalendarVisualStatus.Overdue,
    label: 'Atrasado',
    badgeClass: 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30',
    dotColor: '#EF4444'
  },
  [CalendarVisualStatus.Upcoming]: {
    value: CalendarVisualStatus.Upcoming,
    label: 'A Vencer',
    badgeClass: 'bg-zinc-500/20 text-zinc-600 dark:text-zinc-300 border border-zinc-500/30',
    dotColor: '#6B7280'
  }
};

