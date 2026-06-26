import { readFile } from 'node:fs/promises';

const requiredFiles = [
  'data/itinerary.json',
  'data/places.json',
  'data/flights.json',
  'data/fx.json',
  'data/sources.json',
  'data/query-log.json'
];

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    throw new Error(path + ': ' + error.message);
  }
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

const errors = [];
for (const file of requiredFiles) {
  await readJson(file).catch((error) => errors.push(error.message));
}

const [itinerary, placesData, flightsData, fxData, sourcesData, queryLog] = await Promise.all(
  requiredFiles.map((file) => readJson(file))
);

const places = placesData.places || [];
const placeIds = new Set();
const childIds = new Set();

assert(Array.isArray(itinerary.days) && itinerary.days.length >= 2, 'itinerary.days must contain overview and trip days.', errors);
assert(Array.isArray(places) && places.length > 0, 'places.json must contain places.', errors);
const flightSegments = flightsData.flights || flightsData.segments || [];
const sourceItems = sourcesData.sources || sourcesData.items || [];
const queryItems = queryLog.queries || queryLog.items || [];

assert(Array.isArray(flightSegments) && flightSegments.length > 0, 'flights.json must contain flight segments.', errors);
assert(fxData.base === 'CNY', 'fx.json base must be CNY.', errors);
assert(fxData.rates && typeof fxData.rates === 'object', 'fx.json rates must be present.', errors);
assert(Array.isArray(sourceItems), 'sources.json must contain sources/items array.', errors);
assert(Array.isArray(queryItems), 'query-log.json must contain queries/items array.', errors);

for (const place of places) {
  assert(place.id && typeof place.id === 'string', 'every place needs a string id.', errors);
  if (place.id) {
    assert(!placeIds.has(place.id), 'duplicate place id: ' + place.id, errors);
    placeIds.add(place.id);
  }
  assert(place.name?.local && place.name?.zh, (place.id || 'unknown place') + ' needs local and Chinese names.', errors);
  assert(place.city?.local && place.city?.zh, (place.id || 'unknown place') + ' needs local and Chinese city names.', errors);
  assert(place.type, (place.id || 'unknown place') + ' needs a type.', errors);
  assert(place.coordinates && isFiniteNumber(place.coordinates.lat) && isFiniteNumber(place.coordinates.lng), (place.id || 'unknown place') + ' needs numeric WGS84 coordinates.', errors);
  assert(place.coordinates?.system === 'wgs84', (place.id || 'unknown place') + ' coordinates must declare wgs84.', errors);
  assert(place.visit?.date, (place.id || 'unknown place') + ' needs visit.date.', errors);
  assert(Array.isArray(place.images) && place.images.length > 0, (place.id || 'unknown place') + ' needs at least one image entry.', errors);
  assert(place.platforms?.googlePlaceUrl || place.platforms?.googlePlaceId, (place.id || 'unknown place') + ' needs a Google Maps place/search link.', errors);
  assert(place.platforms?.xiaohongshuSearchUrl, (place.id || 'unknown place') + ' needs a Xiaohongshu search link.', errors);
  assert(place.platforms?.tripadvisorUrl, (place.id || 'unknown place') + ' needs a TripAdvisor search link.', errors);
  for (const childId of place.childPlaceIds || []) childIds.add(childId);
}

for (const childId of childIds) {
  assert(placeIds.has(childId), 'childPlaceId does not exist: ' + childId, errors);
}

for (const day of itinerary.days || []) {
  assert(typeof day.id === 'number', 'day ' + (day.label || '(missing label)') + ' needs numeric id.', errors);
  assert(day.label && day.title && day.date, 'day ' + (day.id ?? '(unknown)') + ' needs label, title, and date.', errors);
  for (const item of day.items || []) {
    assert(placeIds.has(item.placeId), 'itinerary references missing place: ' + item.placeId, errors);
  }
}

for (const flight of flightSegments) {
  assert(flight.id, 'each flight segment needs id.', errors);
  assert(flight.route?.from && flight.route?.to || flight.origin && flight.destination, (flight.id || 'flight') + ' needs route/origin/destination.', errors);
  const providers = flight.providers || [];
  const providerNames = providers.map((provider) => provider.name);
  assert(providerNames.includes('Ctrip'), (flight.id || 'flight') + ' needs a Ctrip query link.', errors);
  assert(providerNames.some((name) => name === 'Trip.com' || name === 'Google Flights'), (flight.id || 'flight') + ' needs an overseas query link.', errors);
  assert(flight.latestQuery?.queriedAt, (flight.id || 'flight') + ' needs latestQuery.queriedAt.', errors);
}

if (errors.length) {
  console.error(errors.map((error) => '- ' + error).join('\n'));
  process.exit(1);
}

console.log('Validated ' + places.length + ' places, ' + ((itinerary.days || []).length - 1) + ' trip days, and ' + flightSegments.length + ' flight/transport query cards.');
