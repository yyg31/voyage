import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createActivity, deleteActivity, fetchActivities, fetchFamilies, fetchStopovers } from '../api/resources';
import type { ActivityType } from '../types';
import { ActivityCard } from '../components/ActivityCard';
import { CalendarView } from '../components/CalendarView';
import { groupByDay } from '../utils/date';
import { apiErrorMessage } from '../api/client';

const ACTIVITY_TYPES: ActivityType[] = ['FLIGHT', 'TRANSPORT', 'RESTAURANT', 'EXCURSION', 'VISIT', 'HOTEL', 'OTHER'];

export function AgendaPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [stopoverId, setStopoverId] = useState('');
  const [type, setType] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      stopoverId: stopoverId || undefined,
      type: (type || undefined) as ActivityType | undefined,
      familyId: familyId || undefined,
    }),
    [stopoverId, type, familyId]
  );

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', filters],
    queryFn: () => fetchActivities(filters),
  });
  const { data: stopovers = [] } = useQuery({ queryKey: ['stopovers'], queryFn: fetchStopovers });
  const { data: families = [] } = useQuery({ queryKey: ['families'], queryFn: fetchFamilies });

  const createMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);
    try {
      await createMutation.mutateAsync({
        title: form.get('title'),
        type: form.get('type'),
        stopoverId: form.get('stopoverId') || null,
        location: form.get('location') || undefined,
        description: form.get('description') || undefined,
        startDateTime: form.get('startDateTime'),
        endDateTime: form.get('endDateTime') || null,
      });
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

  const grouped = groupByDay(activities, (a) => a.startDateTime);

  return (
    <div className="page">
      <div className="section-header">
        <h1>Trip agenda</h1>
        <div className="view-toggle">
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
            List
          </button>
          <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>
            Calendar
          </button>
        </div>
      </div>

      <div className="filters">
        <select value={stopoverId} onChange={(e) => setStopoverId(e.target.value)}>
          <option value="">All stopovers</option>
          {stopovers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {ACTIVITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={familyId} onChange={(e) => setFamilyId(e.target.value)}>
          <option value="">All families</option>
          {families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add activity'}
        </button>
      </div>

      {showForm && (
        <form className="form card" onSubmit={handleCreate}>
          <div className="form-grid">
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Type
              <select name="type" defaultValue="OTHER">
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
              Location
              <input name="location" />
            </label>
            <label>
              Start
              <input type="datetime-local" name="startDateTime" required />
            </label>
            <label>
              End
              <input type="datetime-local" name="endDateTime" />
            </label>
          </div>
          <label>
            Description
            <textarea name="description" rows={2} />
          </label>
          {formError && <div className="form-error">{formError}</div>}
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            Save
          </button>
        </form>
      )}

      {isLoading && <p>Loading…</p>}

      {view === 'calendar' ? (
        <CalendarView activities={activities} initialMonth={new Date(2026, 11, 1)} />
      ) : (
        <div className="agenda-list">
          {[...grouped.entries()].map(([day, dayActivities]) => (
            <div key={day} className="agenda-day">
              <h3>{new Date(day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <div className="agenda-day-items">
                {dayActivities
                  .slice()
                  .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
                  .map((a) => (
                    <ActivityCard key={a.id} activity={a} onDelete={(id) => deleteMutation.mutate(id)} />
                  ))}
              </div>
            </div>
          ))}
          {!isLoading && activities.length === 0 && <p className="muted">No activities match these filters.</p>}
        </div>
      )}
    </div>
  );
}
