import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createForumThread, fetchForumCategories, fetchForumThreads } from '../api/resources';
import { Tag } from '../components/Tag';
import { formatDateTime } from '../utils/date';
import { apiErrorMessage } from '../api/client';

export function ForumPage() {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({ queryKey: ['forum-categories'], queryFn: fetchForumCategories });
  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['forum-threads', categoryId],
    queryFn: () => fetchForumThreads(categoryId || undefined),
  });

  const createMutation = useMutation({
    mutationFn: ({ catId, title, message }: { catId: string; title: string; message: string }) =>
      createForumThread(catId, title, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      setShowForm(false);
    },
  });

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);
    try {
      await createMutation.mutateAsync({
        catId: String(form.get('categoryId')),
        title: String(form.get('title')),
        message: String(form.get('message')),
      });
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

  return (
    <div className="page">
      <div className="section-header">
        <h1>Forum</h1>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Annuler' : '+ Nouveau sujet'}
        </button>
      </div>

      <div className="filters">
        <button className={categoryId === '' ? 'active-chip' : 'chip'} onClick={() => setCategoryId('')}>
          Toutes catégories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={categoryId === c.id ? 'active-chip' : 'chip'}
            onClick={() => setCategoryId(c.id)}
          >
            {c.name} {c._count ? `(${c._count.threads})` : ''}
          </button>
        ))}
      </div>

      {showForm && (
        <form className="form card" onSubmit={handleCreate}>
          <label>
            Catégorie
            <select name="categoryId" required defaultValue={categoryId}>
              <option value="" disabled>
                Choisir…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Titre du sujet
            <input name="title" required />
          </label>
          <label>
            Message
            <textarea name="message" rows={3} required />
          </label>
          {formError && <div className="form-error">{formError}</div>}
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            Publier
          </button>
        </form>
      )}

      {isLoading && <p>Chargement…</p>}

      <div className="thread-list">
        {threads.map((t) => (
          <Link to={`/forum/${t.id}`} key={t.id} className="card thread-card">
            <div className="section-header">
              <strong>{t.title}</strong>
              <Tag label={t.category.name} outline />
            </div>
            <div className="muted">
              Par {t.author.firstName} {t.author.lastName} · {formatDateTime(t.createdAt)} ·{' '}
              {t._count?.messages ?? 0} message(s)
            </div>
          </Link>
        ))}
        {!isLoading && threads.length === 0 && <p className="muted">Aucun sujet pour le moment.</p>}
      </div>
    </div>
  );
}
