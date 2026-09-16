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
      setError(apiErrorMessage(err, 'Invalid or expired link'));
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset password</h1>
        {done ? (
          <p>
            Password updated. <Link to="/login">Sign in</Link>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <label>
              New password
              <PasswordField
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary">
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
