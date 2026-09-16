interface TagProps {
  label: string;
  color?: string;
  outline?: boolean;
}

export function Tag({ label, color = '#64748b', outline = false }: TagProps) {
  return (
    <span
      className="tag"
      style={
        outline
          ? { color, borderColor: color, background: 'transparent' }
          : { background: color, color: '#fff', borderColor: color }
      }
    >
      {label}
    </span>
  );
}

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  FLIGHT: 'Flight',
  TRANSPORT: 'Transport',
  RESTAURANT: 'Restaurant',
  EXCURSION: 'Excursion',
  VISIT: 'Visit',
  HOTEL: 'Hotel',
  OTHER: 'Other',
};

export function activityTypeLabel(type: string) {
  return ACTIVITY_TYPE_LABELS[type] || type;
}

const LINK_TYPE_LABELS: Record<string, string> = {
  HOTEL: 'Hotel',
  FLIGHT: 'Flight',
  RESTAURANT: 'Restaurant',
  EXCURSION: 'Excursion',
  INFO: 'Practical info',
  OTHER: 'Other',
};

export function linkTypeLabel(type: string) {
  return LINK_TYPE_LABELS[type] || type;
}
