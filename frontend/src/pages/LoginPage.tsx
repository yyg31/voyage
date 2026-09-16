import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';
import { forgotPassword } from '../api/resources';
import { PasswordField } from '../components/PasswordField';

export function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(apiErrorMessage(err, 'Email ou mot de passe incorrect'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const message = await forgotPassword(email);
      setInfo(message);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>asia26 ✈️</h1>
        <p className="auth-subtitle">Voyage Back &amp; Ygouf — Déc. 2026 / Janv. 2027</p>

        {!showForgot ? (
          <form onSubmit={handleSubmit} className="form">
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
            <label>
              Mot de passe
              <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
            <button type="button" className="btn-link" onClick={() => setShowForgot(true)}>
              Mot de passe oublié ?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="form">
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
            {error && <div className="form-error">{error}</div>}
            {info && <div className="form-info">{info}</div>}
            <button type="submit" className="btn-primary">
              Envoyer le lien de réinitialisation
            </button>
            <button type="button" className="btn-link" onClick={() => setShowForgot(false)}>
              Retour à la connexion
            </button>
          </form>
        )}

        <p className="auth-note">Pas d'inscription publique — contactez un admin pour obtenir un compte.</p>
      </div>
    </div>
  );
}
