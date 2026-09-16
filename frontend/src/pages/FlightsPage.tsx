import { FormEvent, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFlight, deleteFlight, fetchFlights, fetchUsers, uploadFlightTicket } from '../api/resources';
import { formatDateTime } from '../utils/date';
import { apiErrorMessage } from '../api/client';

export function FlightsPage() {
  const queryClient = useQueryClient();
  const { data: flights = [], isLoading } = useQuery({ queryKey: ['flights'], queryFn: fetchFlights });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const createMutation = useMutation({
    mutationFn: createFlight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFlight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadFlightTicket(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flights'] }),
  });

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);
    const participantIds = form.getAll('participantIds') as string[];
    try {
      await createMutation.mutateAsync({
        airline: form.get('airline'),
        flightNumber: form.get('flightNumber'),
        departureCity: form.get('departureCity'),
        arrivalCity: form.get('arrivalCity'),
        departureDateTime: form.get('departureDateTime'),
        arrivalDateTime: form.get('arrivalDateTime'),
        participantIds,
      });
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

  return (
    <div className="page">
      <div className="section-header">
        <h1>Vols &amp; transports</h1>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Annuler' : '+ Ajouter un vol'}
        </button>
      </div>

      {showForm && (
        <form className="form card" onSubmit={handleCreate}>
          <div className="form-grid">
            <label>
              Compagnie
              <input name="airline" required />
            </label>
            <label>
              N° de vol
              <input name="flightNumber" required />
            </label>
            <label>
              Ville de départ
              <input name="departureCity" required />
            </label>
            <label>
              Ville d'arrivée
              <input name="arrivalCity" required />
            </label>
            <label>
              Départ
              <input type="datetime-local" name="departureDateTime" required />
            </label>
            <label>
              Arrivée
              <input type="datetime-local" name="arrivalDateTime" required />
            </label>
          </div>
          <label>
            Membres concernés
            <select name="participantIds" multiple size={Math.min(users.length, 6)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.family?.name})
                </option>
              ))}
            </select>
          </label>
          {formError && <div className="form-error">{formError}</div>}
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            Enregistrer
          </button>
        </form>
      )}

      {isLoading && <p>Chargement…</p>}

      <div className="flight-list">
        {flights.map((f) => (
          <div key={f.id} className="card flight-card">
            <div className="flight-card-header">
              <strong>
                {f.airline} {f.flightNumber}
              </strong>
              <span className="muted">
                {f.departureCity} → {f.arrivalCity}
              </span>
            </div>
            <div className="flight-card-times">
              <span>{formatDateTime(f.departureDateTime)}</span>
              <span>→</span>
              <span>{formatDateTime(f.arrivalDateTime)}</span>
            </div>
            {f.participants.length > 0 && (
              <div className="muted">👤 {f.participants.map((p) => p.user.firstName).join(', ')}</div>
            )}
            <div className="flight-card-actions">
              {f.ticketFileUrl ? (
                <a href={f.ticketFileUrl} target="_blank" rel="noreferrer">
                  📄 Voir le billet
                </a>
              ) : (
                <span className="muted">Aucun billet uploadé</span>
              )}
              <input
                type="file"
                accept="application/pdf,image/*"
                style={{ display: 'none' }}
                ref={(el) => {
                  fileInputs.current[f.id] = el;
                }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadMutation.mutate({ id: f.id, file });
                  e.target.value = '';
                }}
              />
              <button className="btn-link" onClick={() => fileInputs.current[f.id]?.click()}>
                Uploader le billet
              </button>
              <button className="btn-link btn-danger" onClick={() => deleteMutation.mutate(f.id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {!isLoading && flights.length === 0 && <p className="muted">Aucun vol enregistré.</p>}
      </div>
    </div>
  );
}
