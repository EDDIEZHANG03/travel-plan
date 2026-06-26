import { formatPrice, formatQueryTime } from '../currency.js';
import { buildAmapLink, buildGoogleNavigationLink, buildGooglePlaceLink, buildPlatformSearchLink, externalAttrs } from '../links.js';
import { validatePlaceSchedule } from '../schedule.js';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function childCards(place, placeById) {
  if (!place.childPlaceIds?.length) return '';
  return `<div class="child-list">${place.childPlaceIds.map(id => {
    const child = placeById.get(id);
    if (!child) return '';
    return `<div class="child-card"><b>${esc(child.name.local)}</b><div>${esc(child.name.zh)}</div><div class="meta">Research status: ${esc(child.research.status)}</div></div>`;
  }).join('')}</div>`;
}

export function renderPlaceCard(place, fxData, placeById) {
  const image = place.images?.[0] || { path:'assets/images/places/placeholder.svg', alt:'Place placeholder' };
  const schedule = validatePlaceSchedule(place);
  const scheduleClass = schedule.status === 'ok' ? 'ok' : 'warning';
  const official = place.platforms?.officialUrl ? `<a class="btn" ${externalAttrs()} href="${esc(place.platforms.officialUrl)}">Official website</a>` : '';
  const booking = place.platforms?.bookingUrl ? `<a class="btn" ${externalAttrs()} href="${esc(place.platforms.bookingUrl)}">Book / Reserve</a>` : '';
  return `<article class="item">
    <img class="place-img" src="${esc(image.path)}" alt="${esc(image.alt)}" loading="lazy" decoding="async">
    <div>
      <div class="time">${esc(place.visit?.arrival || 'time needs recheck')}</div>
      <div class="name">${esc(place.name.local)}</div>
      <div class="zh-name">${esc(place.name.zh)}</div>
      <div class="meta">${esc(place.city.local)} | ${esc(place.city.zh)} · ${esc(place.type)}</div>
      <div class="meta">Plan: ${esc(place.visit?.arrival || 'TBD')} · Opening: ${esc(place.hours?.note || 'needs recheck')}</div>
      <div class="${scheduleClass}">Time status: ${esc(schedule.message)} · Queried: ${esc(formatQueryTime(place.hours?.checkedAt))}</div>
      <div class="desc">${esc(place.introduction || place.desc || '')}</div>
      <div class="detail">Research status: ${esc(place.research?.status || 'needs_recheck')}</div>
      <div class="detail">${esc((place.research?.riskSummary || []).join(' '))}</div>
      <div class="budget">${esc(formatPrice(place.price, fxData))}</div>
      <div class="meta">Price queried: ${esc(formatQueryTime(place.price?.queriedAt))} · FX rate source: ${esc(fxData.sourceName)}</div>
      <div class="links">
        <button class="btn primary" data-nav-place="${esc(place.id)}">Navigation</button>
        <a class="btn" ${externalAttrs()} href="${esc(buildGooglePlaceLink(place))}">Google place and reviews</a>
        <a class="btn" ${externalAttrs()} href="${esc(buildPlatformSearchLink(place, 'xhs'))}">Xiaohongshu search</a>
        <a class="btn" ${externalAttrs()} href="${esc(buildPlatformSearchLink(place, 'dianping'))}">Dianping search</a>
        <a class="btn" ${externalAttrs()} href="${esc(buildPlatformSearchLink(place, 'tripadvisor'))}">TripAdvisor</a>
        ${official}${booking}
      </div>
      ${childCards(place, placeById)}
      <template id="nav-${esc(place.id)}" data-amap="${esc(buildAmapLink(place))}" data-google="${esc(buildGoogleNavigationLink(place))}"></template>
    </div>
  </article>`;
}

