import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { validateDaySequence, validatePlaceSchedule } from '../assets/js/schedule.js';

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

const itinerary = await readJson('data/itinerary.json');
const placesData = await readJson('data/places.json');
const placeById = new Map(placesData.places.map((place) => [place.id, place]));
const lines = [];
let conflicts = 0;
let warnings = 0;
let needsRecheck = 0;

lines.push('# Schedule Validation');
lines.push('');
lines.push('Generated: ' + new Date().toISOString());
lines.push('');

for (const day of itinerary.days.filter((item) => item.id !== 0)) {
  lines.push('## ' + day.label + ' ' + day.date);
  const sequenceWarnings = validateDaySequence(day, placeById);
  for (const warning of sequenceWarnings) {
    warnings += 1;
    lines.push('- [warning] ' + warning.placeId + ': ' + warning.message);
  }

  for (const item of day.items || []) {
    const place = placeById.get(item.placeId);
    if (!place) {
      conflicts += 1;
      lines.push('- [conflict] ' + item.placeId + ': missing place data.');
      continue;
    }
    const result = validatePlaceSchedule(place);
    if (result.status === 'conflict') conflicts += 1;
    if (result.status === 'warning') warnings += 1;
    if (result.status === 'needs_recheck') needsRecheck += 1;
    lines.push('- [' + result.status + '] ' + (item.time || place.visit?.arrival || 'time TBD') + ' ' + place.name.local + ' / ' + place.name.zh + ': ' + result.message);
  }
  lines.push('');
}

lines.push('## Summary');
lines.push('');
lines.push('- conflicts: ' + conflicts);
lines.push('- warnings: ' + warnings);
lines.push('- needs_recheck: ' + needsRecheck);
lines.push('');

await mkdir('reports', { recursive: true });
await writeFile('reports/schedule-validation.md', lines.join('\n') + '\n', 'utf8');

if (conflicts > 0) {
  console.error('Schedule validation found ' + conflicts + ' conflict(s). See reports/schedule-validation.md.');
  process.exit(1);
}

console.log('Schedule validation complete: ' + warnings + ' warning(s), ' + needsRecheck + ' recheck item(s).');
