import { readFile, writeFile } from 'node:fs/promises';

const [, , targetFile, id, status, note = ''] = process.argv;
if (!targetFile || !id || !status) {
  console.error('Usage: node scripts/update-query-result.mjs <data/flights.json|data/places.json> <id> <status> [note]');
  process.exit(1);
}

const doc = JSON.parse(await readFile(targetFile, 'utf8'));
const collection = Array.isArray(doc.flights) ? doc.flights : doc.places;
if (!Array.isArray(collection)) {
  console.error('Target file must contain flights[] or places[].');
  process.exit(1);
}

const item = collection.find((entry) => entry.id === id);
if (!item) {
  console.error('No entry found for id: ' + id);
  process.exit(1);
}

const now = new Date().toISOString();
if (item.latestQuery) {
  item.latestQuery.status = status;
  item.latestQuery.note = note;
  item.latestQuery.queriedAt = now;
} else {
  item.research = item.research || {};
  item.research.status = status;
  item.research.checkedAt = now;
  if (note) item.research.riskSummary = [note];
}

await writeFile(targetFile, JSON.stringify(doc, null, 2) + '\n', 'utf8');
console.log('Updated ' + id + ' in ' + targetFile + '.');
