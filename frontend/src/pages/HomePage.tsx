import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchStopovers, fetchActivities } from '../api/resources';
import { useAuth } from '../context/AuthContext';
import { Tag } from '../components/Tag';
import { formatDate } from '../utils/date';

const TRIP_START = '2026-12-25';
const TRIP_END = '2027-01-10';

export function HomePage() {
  const { user } = useAuth();
  const { data: stopovers = [] } = useQuery({ queryKey: ['stopovers'], queryFn: fetchStopovers });
  const { data: activities = [] } = useQuery({ queryKey: ['activities', {}], queryFn: () => fetchActivities() });

  const now = new Date();
  const start = new Date(TRIP_START);
  const daysToGo = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const upcoming = activities
    .filter((a) => new Date(a.startDateTime) >= now)
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
    .slice(0, 5);

  return (
    <div className="page">
      <section className="hero">
        <h1>Bienvenue {user?.firstName} 👋</h1>
        <p className="hero-subtitle">
          Voyage en Asie des familles <strong>Back</strong> &amp; <strong>Ygouf</strong> — du{' '}
          {formatDate(TRIP_START)} au {formatDate(TRIP_END)}
        </p>
        {daysToGo > 0 ? (
          <div className="hero-countdown">J-{daysToGo} avant le départ !</div>
        ) : (
          <div className="hero-countdown">Le voyage est en cours ou terminé 🎒</div>
        )}
      </section>

      <section>
        <h2>Les escales</h2>
        <div className="stopover-grid">
          {stopovers.map((s) => (
            <Link to={`/stopovers#${s.id}`} key={s.id} className="card stopover-card" style={{ borderTopColor: s.colorHex }}>
              <h3>{s.name}</h3>
              <p className="muted">{s.country}</p>
              <p className="muted">
                {formatDate(s.startDate)} → {formatDate(s.endDate)}
              </p>
              <div className="tag-row">
                {s.families.map((sf) => (
                  <Tag key={sf.id} label={sf.family.name} color={sf.family.colorHex} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>Prochaines activités</h2>
          <Link to="/agenda">Voir l'agenda complet →</Link>
        </div>
        {upcoming.length === 0 && <p className="muted">Aucune activité à venir pour le moment.</p>}
        <ul className="upcoming-list">
          {upcoming.map((a) => (
            <li key={a.id}>
              <span className="muted">{formatDate(a.startDateTime)}</span> — <strong>{a.title}</strong>
              {a.stopover && <Tag label={a.stopover.name} color={a.stopover.colorHex} outline />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
