import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, deleteUser, fetchFamilies, fetchUsers } from '../api/resources';
import { Tag } from '../components/Tag';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const { data: families = [] } = useQuery({ queryKey: ['families'], queryFn: fetchFamilies });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);
    try {
      await createMutation.mutateAsync({
        email: String(form.get('email')),
        password: String(form.get('password')),
        firstName: String(form.get('firstName')),
        lastName: String(form.get('lastName')),
        familyId: String(form.get('familyId')),
        role: form.get('role') as 'ADMIN' | 'MEMBER',
      });
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

  return (
    <div className="page">
      <div className="section-header">
        <h1>Administration — Membres</h1>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Annuler' : '+ Créer un compte'}
        </button>
      </div>
      <p className="muted">Pas d'inscription publique : seuls les admins créent des comptes.</p>

      {showForm && (
        <form className="form card" onSubmit={handleCreate}>
          <div className="form-grid">
            <label>
              Prénom
              <input name="firstName" required />
            </label>
            <label>
              Nom
              <input name="lastName" required />
            </label>
            <label>
              Email
              <input type="email" name="email" required />
            </label>
            <label>
              Mot de passe initial
              <input type="password" name="password" minLength={8} required />
            </label>
            <label>
              Famille
              <select name="familyId" required>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rôle
              <select name="role" defaultValue="MEMBER">
                <option value="MEMBER">Membre</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
          </div>
          {formError && <div className="form-error">{formError}</div>}
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            Créer
          </button>
        </form>
      )}

      {isLoading && <p>Chargement…</p>}

      <table className="user-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Famille</th>
            <th>Rôle</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                {u.firstName} {u.lastName}
              </td>
              <td>{u.email}</td>
              <td>
                <Tag label={u.family?.name ?? ''} color={u.family?.colorHex} />
              </td>
              <td>{u.role === 'ADMIN' ? 'Admin' : 'Membre'}</td>
              <td>
                {u.id !== currentUser?.id && (
                  <button className="btn-link btn-danger" onClick={() => deleteMutation.mutate(u.id)}>
                    Supprimer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
