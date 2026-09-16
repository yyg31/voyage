import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchForumThread, postForumMessage } from '../api/resources';
import { formatDateTime } from '../utils/date';
import { apiErrorMessage } from '../api/client';

export function ForumThreadPage() {
  const { threadId = '' } = useParams();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: thread, isLoading } = useQuery({
    queryKey: ['forum-thread', threadId],
    queryFn: () => fetchForumThread(threadId),
  });

  const postMutation = useMutation({
    mutationFn: (text: string) => postForumMessage(threadId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-thread', threadId] });
      setContent('');
    },
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await postMutation.mutateAsync(content);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (isLoading) return <p className="page">Chargement…</p>;
  if (!thread) return <p className="page">Sujet introuvable.</p>;

  return (
    <div className="page">
      <Link to="/forum">← Retour au forum</Link>
      <h1>{thread.title}</h1>
      <p className="muted">{thread.category.name}</p>

      <div className="message-list">
        {thread.messages?.map((m) => (
          <div key={m.id} className="card message-card">
            <div className="message-card-header">
              <strong style={{ color: m.author.avatarColor }}>
                {m.author.firstName} {m.author.lastName}
              </strong>
              <span className="muted">{formatDateTime(m.createdAt)}</span>
            </div>
            <p>{m.content}</p>
          </div>
        ))}
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Répondre
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} required />
        </label>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="btn-primary" disabled={postMutation.isPending}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
