export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export function groupByDay<T>(items: T[], getDate: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = dayKey(getDate(item));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}
