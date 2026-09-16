import { useMemo, useState } from 'react';
import type { Activity } from '../types';
import { dayKey, groupByDay } from '../utils/date';
import { activityTypeLabel } from './Tag';

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildMonthGrid(monthCursor: Date) {
  const first = startOfMonth(monthCursor);
  const firstWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarView({ activities, initialMonth }: { activities: Activity[]; initialMonth: Date }) {
  const [monthCursor, setMonthCursor] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const byDay = useMemo(() => groupByDay(activities, (a) => a.startDateTime), [activities]);
  const cells = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const selectedActivities = selectedDay ? byDay.get(selectedDay) ?? [] : [];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="btn-link" onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}>
          ← Previous
        </button>
        <strong>{monthCursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</strong>
        <button className="btn-link" onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}>
          Next →
        </button>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {WEEKDAYS.map((w) => (
          <div key={w} className="calendar-weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="calendar-cell calendar-cell-empty" />;
          const key = dayKey(date.toISOString());
          const dayActivities = byDay.get(key) ?? [];
          const isSelected = selectedDay === key;
          return (
            <button
              key={i}
              className={`calendar-cell ${dayActivities.length ? 'has-activities' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDay(isSelected ? null : key)}
            >
              <span className="calendar-day-number">{date.getDate()}</span>
              {dayActivities.length > 0 && <span className="calendar-day-count">{dayActivities.length}</span>}
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="calendar-day-detail">
          <h3>
            {new Date(selectedDay).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {selectedActivities.length === 0 ? (
            <p className="muted">No activities that day.</p>
          ) : (
            <ul>
              {selectedActivities
                .slice()
                .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
                .map((a) => (
                  <li key={a.id}>
                    <strong>{a.title}</strong> — {activityTypeLabel(a.type)}
                    {a.stopover ? ` · ${a.stopover.name}` : ''}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
