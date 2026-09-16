import type { Activity } from '../types';
import { formatTime } from '../utils/date';
import { Tag, activityTypeLabel } from './Tag';

const TYPE_COLORS: Record<string, string> = {
  FLIGHT: '#0ea5e9',
  TRANSPORT: '#64748b',
  RESTAURANT: '#f97316',
  EXCURSION: '#16a34a',
  VISIT: '#7c3aed',
  HOTEL: '#dc2626',
  OTHER: '#475569',
};

export function ActivityCard({ activity, onDelete }: { activity: Activity; onDelete?: (id: string) => void }) {
  const participantNames = activity.participants.map((p) => p.user.firstName);

  return (
    <div className="card activity-card">
      <div className="activity-card-time">
        {formatTime(activity.startDateTime)}
        {activity.endDateTime ? ` – ${formatTime(activity.endDateTime)}` : ''}
      </div>
      <div className="activity-card-body">
        <div className="activity-card-header">
          <strong>{activity.title}</strong>
          <Tag label={activityTypeLabel(activity.type)} color={TYPE_COLORS[activity.type]} />
          {activity.stopover && <Tag label={activity.stopover.name} color={activity.stopover.colorHex} outline />}
        </div>
        {activity.location && <div className="activity-card-location">📍 {activity.location}</div>}
        {activity.description && <p className="activity-card-desc">{activity.description}</p>}
        {participantNames.length > 0 && (
          <div className="activity-card-participants">👤 {participantNames.join(', ')}</div>
        )}
        {onDelete && (
          <button className="btn-link btn-danger" onClick={() => onDelete(activity.id)}>
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
