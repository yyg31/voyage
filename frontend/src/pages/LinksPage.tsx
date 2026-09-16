import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLink, deleteLink, fetchFamilies, fetchLinks, fetchStopovers } from '../api/resources';
import type { LinkType, LinkVisibility } from '../types';
import { Tag, linkTypeLabel } from '../components/Tag';
import { apiErrorMessage } from '../api/client';

const LINK_TYPES: LinkType[] = ['HOTEL', 'FLIGHT', 'RESTAURANT', 'EXCURSION', 'INFO', 'OTHER'];

export function LinksPage() {
  const queryClient = useQueryClient();
  const [stopoverFilter, setStopoverFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['links', { stopoverId: stopoverFilter, type: typeFilter }],
    queryFn: () => fetchLinks({ stopoverId: stopoverFilter || undefined, type: (typeFilter || undefined) as LinkType | undefined }),
  });
  const { data: stopovers = [] } = useQuery({ queryKey: ['stopovers'], queryFn: fetchStopovers });
  const { data: families = [] } = useQuery({ queryKey: ['families'], queryFn: fetchFamilies });

  const createMutation = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setShowForm(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteLink,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  });

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);
    const visibility = form.get('visibility') as LinkVisibility;
    const familyName = visibility === 'BOTH' ? null : visibility;
    const family = families.find((f) => f.name.toUpperCase() === familyName);
    try {
      await createMutation.mutateAsync({
        title: String(form.get('title')),
        url: String(form.get('url')),
        type: form.get('type') as LinkType,
        stopoverId: (form.get('stopoverId') as string) || null,
        visibility,
        familyId: family?.id ?? null,
      });
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

  return (
    <div className="page">
      <div className="section-header">
        <h1>Links &amp; resources</h1>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add link'}
        </button>
      </div>

      <div className="filters">
        <select value={stopoverFilter} onChange={(e) => setStopoverFilter(e.target.value)}>
          <option value="">All stopovers</option>
          {stopovers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {LINK_TYPES.map((t) => (
            <option key={t} value={t}>
              {linkTypeLabel(t)}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <form className="form card" onSubmit={handleCreate}>
          <div className="form-grid">
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              URL
              <input name="url" type="url" required placeholder="https://..." />
            </label>
            <label>
              Type
              <select name="type" defaultValue="OTHER">
                {LINK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {linkTypeLabel(t)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Stopover
              <select name="stopoverId">
                <option value="">—</option>
                {stopovers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Visible to
              <select name="visibility" defaultValue="BOTH">
                <option value="BOTH">Both families</option>
                <option value="BACK">Back family only</option>
                <option value="YGOUF">Ygouf family only</option>
              </select>
            </label>
          </div>
          {formError && <div className="form-error">{formError}</div>}
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            Save
          </button>
        </form>
      )}

      {isLoading && <p>Loading…</p>}

      <div className="link-grid">
        {links.map((l) => (
          <div key={l.id} className="card link-card">
            <div className="section-header">
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.title}
              </a>
              <Tag label={linkTypeLabel(l.type)} />
            </div>
            <div className="tag-row">
              {l.stopover && <Tag label={l.stopover.name} outline />}
              {l.family ? <Tag label={l.family.name} color={l.family.colorHex} /> : <Tag label="Both families" outline />}
            </div>
            <div className="muted">
              Added by {l.createdBy.firstName} {l.createdBy.lastName}
            </div>
            <button className="btn-link btn-danger" onClick={() => deleteMutation.mutate(l.id)}>
              Delete
            </button>
          </div>
        ))}
        {!isLoading && links.length === 0 && <p className="muted">No links match these filters.</p>}
      </div>
    </div>
  );
}
