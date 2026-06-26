function toMinutes(time) {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function addMinutes(time, minutes) {
  const start = toMinutes(time);
  return start == null ? null : start + minutes;
}

export function validatePlaceSchedule(place) {
  const visit = place.visit || {};
  const arrival = toMinutes(visit.arrival);
  const duration = visit.durationMinutes || 0;
  const status = place.hours?.status || 'needs_recheck';
  if (status === 'needs_recheck' || !place.hours?.weekly || Object.keys(place.hours.weekly).length === 0) {
    return { status: 'needs_recheck', message: 'Opening status needs recheck before visit.' };
  }
  if (arrival == null) return { status: 'warning', message: 'Planned arrival time is not precise.' };
  const day = new Date(visit.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toLowerCase();
  const intervals = place.hours.weekly[day] || [];
  const end = arrival + duration;
  const ok = intervals.some(([open, close]) => arrival >= toMinutes(open) && end <= toMinutes(close));
  if (!ok) return { status: 'conflict', message: 'Planned time may conflict with opening hours.' };
  const lastEntry = toMinutes(place.hours.lastEntry);
  if (lastEntry != null && arrival > lastEntry) return { status: 'conflict', message: 'Planned arrival is after last entry.' };
  return { status: 'ok', message: 'Enough time based on saved hours.' };
}

export function validateDaySequence(day, placeById) {
  const warnings = [];
  let previous = null;
  for (const item of day.items || []) {
    const place = placeById.get(item.placeId);
    if (!place) continue;
    const arrival = toMinutes(place.visit?.arrival);
    if (previous && arrival != null && previous.endWithBuffer != null && arrival < previous.endWithBuffer) {
      warnings.push({ placeId: place.id, status: 'warning', message: 'Travel buffer overlaps with previous place.' });
    }
    previous = { endWithBuffer: addMinutes(place.visit?.arrival, (place.visit?.durationMinutes || 0) + (place.visit?.travelBufferMinutes || 0)) };
  }
  return warnings;
}

