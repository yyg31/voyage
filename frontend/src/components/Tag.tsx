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
  FLIGHT: 'Vol',
  TRANSPORT: 'Transport',
  RESTAURANT: 'Restaurant',
  EXCURSION: 'Excursion',
  VISIT: 'Visite',
  HOTEL: 'Hôtel',
  OTHER: 'Autre',
};

export function activityTypeLabel(type: string) {
  return ACTIVITY_TYPE_LABELS[type] || type;
}

const LINK_TYPE_LABELS: Record<string, string> = {
  HOTEL: 'Hôtel',
  FLIGHT: 'Vol',
  RESTAURANT: 'Restaurant',
  EXCURSION: 'Excursion',
  INFO: 'Info pratique',
  OTHER: 'Autre',
};

export function linkTypeLabel(type: string) {
  return LINK_TYPE_LABELS[type] || type;
}
