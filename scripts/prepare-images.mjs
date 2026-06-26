import { access, readFile } from 'node:fs/promises';

const placesData = JSON.parse(await readFile('data/places.json', 'utf8'));
const missing = [];

for (const place of placesData.places || []) {
  for (const image of place.images || []) {
    if (!image.path) {
      missing.push(place.id + ': image path missing');
      continue;
    }
    try {
      await access(image.path);
    } catch {
      missing.push(place.id + ': ' + image.path);
    }
  }
}

if (missing.length) {
  console.error(missing.map((item) => '- ' + item).join('\n'));
  process.exit(1);
}

console.log('Image check complete for ' + (placesData.places || []).length + ' places.');
