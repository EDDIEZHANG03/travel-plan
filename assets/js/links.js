export function buildAmapLink(place) {
  const { lat, lng } = place.coordinates;
  const name = `${place.name.local} ${place.name.zh}`;
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(name)}&coordinate=wgs84&callnative=1&src=travel-plan`;
}

export function buildGoogleNavigationLink(place) {
  const { lat, lng } = place.coordinates;
  let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}&dir_action=navigate`;
  const placeId = place.platforms?.googlePlaceId;
  if (placeId) url += `&destination_place_id=${encodeURIComponent(placeId)}`;
  return url;
}

export function buildGooglePlaceLink(place) {
  const query = encodeURIComponent(`${place.name.local}, ${place.city.local}`);
  const placeId = place.platforms?.googlePlaceId;
  return placeId
    ? `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${encodeURIComponent(placeId)}`
    : (place.platforms?.googlePlaceUrl || `https://www.google.com/maps/search/?api=1&query=${query}`);
}

export function buildPlatformSearchLink(place, platform) {
  const q = encodeURIComponent(`${place.name.local} ${place.name.zh} ${place.city.zh}`);
  if (platform === 'xhs') return place.platforms?.xiaohongshuSearchUrl || `https://www.xiaohongshu.com/search_result?keyword=${q}&source=web_explore_feed`;
  if (platform === 'dianping') return `https://m.dianping.com/searchshop?keyword=${q}`;
  if (platform === 'tripadvisor') return place.platforms?.tripadvisorUrl || `https://www.tripadvisor.com/Search?q=${q}`;
  return buildGooglePlaceLink(place);
}

export function externalAttrs() {
  return 'target="_blank" rel="noopener noreferrer"';
}

