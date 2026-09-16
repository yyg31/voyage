import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, apiErrorMessage } from '../api/client';
import { PasswordField } from '../components/PasswordField';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Lien invalide ou expiré'));
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Réinitialiser le mot de passe</h1>
        {done ? (
          <p>
            Mot de passe mis à jour. <Link to="/login">Se connecter</Link>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <label>
              Nouveau mot de passe
              <PasswordField
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary">
              Valider
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
