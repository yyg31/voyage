import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../api/resources';
import { apiErrorMessage } from '../api/client';
import { Tag } from '../components/Tag';
import { PasswordField } from '../components/PasswordField';

export function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="page">
      <h1>My profile</h1>
      <div className="card">
        <p>
          <strong>
            {user.firstName} {user.lastName}
          </strong>
        </p>
        <p className="muted">{user.email}</p>
        <div className="tag-row">
          <Tag label={user.family?.name ?? ''} color={user.family?.colorHex} />
          <Tag label={user.role === 'ADMIN' ? 'Admin' : 'Member'} outline />
        </div>
      </div>

      <h2>Change password</h2>
      <form className="form card" onSubmit={handleSubmit}>
        <label>
          Current password
          <PasswordField value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </label>
        <label>
          New password
          <PasswordField minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </label>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-info">Password updated.</div>}
        <button type="submit" className="btn-primary">
          Update
        </button>
      </form>
    </div>
  );
}
