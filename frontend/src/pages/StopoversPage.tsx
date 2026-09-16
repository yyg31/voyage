import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchStopovers, fetchLinks } from '../api/resources';
import { Tag, linkTypeLabel } from '../components/Tag';
import { formatDate } from '../utils/date';

export function StopoversPage() {
  const { data: stopovers = [], isLoading } = useQuery({ queryKey: ['stopovers'], queryFn: fetchStopovers });
  const { data: links = [] } = useQuery({ queryKey: ['links'], queryFn: () => fetchLinks() });

  return (
    <div className="page">
      <h1>Stopovers</h1>
      {isLoading && <p>Loading…</p>}
      <div className="stopover-list">
        {stopovers.map((s) => {
          const stopoverLinks = links.filter((l) => l.stopoverId === s.id);
          return (
            <section key={s.id} id={s.id} className="card stopover-detail" style={{ borderLeftColor: s.colorHex }}>
              <div className="section-header">
                <h2>
                  {s.name} <span className="muted">· {s.country}</span>
                </h2>
                <Link to={`/agenda?stopoverId=${s.id}`}>View agenda →</Link>
              </div>
              <p className="muted">
                {formatDate(s.startDate)} → {formatDate(s.endDate)}
              </p>
              <div className="tag-row">
                {s.families.map((sf) => (
                  <Tag key={sf.id} label={`${sf.family.name}: ${formatDate(sf.arrivalDate)} → ${formatDate(sf.departureDate)}`} color={sf.family.colorHex} />
                ))}
              </div>

              <h3>Links &amp; resources</h3>
              {stopoverLinks.length === 0 ? (
                <p className="muted">No links for this stopover.</p>
              ) : (
                <ul className="link-list">
                  {stopoverLinks.map((l) => (
                    <li key={l.id}>
                      <a href={l.url} target="_blank" rel="noreferrer">
                        {l.title}
                      </a>
                      <Tag label={linkTypeLabel(l.type)} outline />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
