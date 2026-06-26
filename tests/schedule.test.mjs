import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDaySequence, validatePlaceSchedule } from '../assets/js/schedule.js';

function place(overrides = {}) {
  return {
    id: overrides.id || 'p1',
    visit: { date: '2026-07-16', arrival: '10:00', durationMinutes: 60, travelBufferMinutes: 15, ...overrides.visit },
    hours: { status: 'verified', weekly: { thu: [['09:00', '18:00']] }, lastEntry: null, ...overrides.hours }
  };
}

test('validates a visit inside saved opening hours', () => {
  assert.deepEqual(validatePlaceSchedule(place()), { status: 'ok', message: 'Enough time based on saved hours.' });
});

test('marks unknown opening hours for recheck', () => {
  const result = validatePlaceSchedule(place({ hours: { status: 'needs_recheck', weekly: {} } }));
  assert.equal(result.status, 'needs_recheck');
});

test('detects opening hour conflicts', () => {
  const result = validatePlaceSchedule(place({ visit: { arrival: '19:00' } }));
  assert.equal(result.status, 'conflict');
});

test('detects overlapping day buffers', () => {
  const first = place({ id: 'first', visit: { arrival: '10:00', durationMinutes: 60, travelBufferMinutes: 30 } });
  const second = place({ id: 'second', visit: { arrival: '11:00', durationMinutes: 30, travelBufferMinutes: 10 } });
  const warnings = validateDaySequence({ items: [{ placeId: 'first' }, { placeId: 'second' }] }, new Map([[first.id, first], [second.id, second]]));
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].placeId, 'second');
});
