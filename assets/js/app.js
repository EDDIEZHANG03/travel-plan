import { initMap, showMap } from './map.js';
import { renderPlaceCard } from './components/place-card.js';
import { renderFlightCard } from './components/flight-card.js';
import { formatPrice } from './currency.js';

const state = {};

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

function byId(items) {
  return new Map(items.map(item => [item.id, item]));
}

function renderOverview() {
  const { itinerary, flights, sources, fxData, placeById } = state;
  const dayCards = itinerary.days.slice(1).map(day => `<div class="card" data-day-card="${day.id}"><h3>${day.label} · ${day.title}</h3><p>${day.date}</p></div>`).join('');
  const flightCards = flights.segments.map(renderFlightCard).join('');
  const sourceLinks = sources.items.map(s => `<a class="btn" target="_blank" rel="noopener noreferrer" href="${s.url}">${s.name}</a>`).join('');
  const keyPrices = [...placeById.values()].filter(p => p.type === 'flight' || p.type === 'transport').slice(0, 8).map(p => `<div class="price-row"><b>${p.name.local} | ${p.name.zh}</b><span>${formatPrice(p.price, fxData)}</span><a target="_blank" rel="noopener noreferrer" href="${p.price.sourceUrl || p.platforms.googlePlaceUrl}">Recheck source</a></div>`).join('');
  return `<section class="hero"><h1>${itinerary.title}</h1><div class="sub">${itinerary.notice}</div></section>
    <div class="grid"><div class="card"><h3>Route</h3><p>武汉 → İstanbul → Kapadokya → Antalya → Fethiye → القاهرة → الغردقة → 上海/武汉</p></div><div class="card"><h3>Data status</h3><p>Public source data is saved locally. Login-only prices and exact posts are marked needs recheck.</p></div></div>
    <div class="section">Key transport prices</div><div class="price-table">${keyPrices}</div>
    <div class="section">Flight query cards</div><div class="flight-list">${flightCards}</div>
    <div class="section">Daily itinerary</div><div class="grid">${dayCards}</div>
    <div class="section">Sources</div><div class="links">${sourceLinks}</div>`;
}

function renderDay(dayId) {
  const { itinerary, placeById, fxData } = state;
  const day = itinerary.days.find(d => d.id === dayId);
  return `<div class="day-head"><h2>${day.title}</h2><div class="date">${day.date}</div></div><div class="timeline">${day.items.map(item => renderPlaceCard(placeById.get(item.placeId), fxData, placeById)).join('')}</div>`;
}

function openNavigationSheet(placeId) {
  const tpl = document.getElementById('nav-' + CSS.escape(placeId));
  const sheet = document.getElementById('nav-sheet');
  sheet.querySelector('[data-nav-amap]').href = tpl.dataset.amap;
  sheet.querySelector('[data-nav-google]').href = tpl.dataset.google;
  sheet.classList.add('open');
}

function go(dayId) {
  const { itinerary, placeById } = state;
  document.querySelectorAll('.tab').forEach((tab, idx) => tab.classList.toggle('active', itinerary.days[idx].id === dayId));
  const day = itinerary.days.find(d => d.id === dayId);
  document.getElementById('content').innerHTML = dayId === 0 ? renderOverview() : renderDay(dayId);
  showMap(day, itinerary.days, placeById);
  window.scrollTo({ top:0, behavior:'smooth' });
}

async function main() {
  initMap();
  const [itinerary, placesData, flights, fxData, sources, queryLog] = await Promise.all([
    loadJson('data/itinerary.json'), loadJson('data/places.json'), loadJson('data/flights.json'), loadJson('data/fx.json'), loadJson('data/sources.json'), loadJson('data/query-log.json')
  ]);
  Object.assign(state, { itinerary, places:placesData.places, flights, fxData, sources, queryLog, placeById:byId(placesData.places) });
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = itinerary.days.map(d => `<button class="tab" data-day="${d.id}">${d.label}</button>`).join('');
  tabs.addEventListener('click', event => {
    const tab = event.target.closest('[data-day]');
    if (tab) go(Number(tab.dataset.day));
  });
  document.body.addEventListener('click', event => {
    const nav = event.target.closest('[data-nav-place]');
    const card = event.target.closest('[data-day-card]');
    if (nav) openNavigationSheet(nav.dataset.navPlace);
    if (card) go(Number(card.dataset.dayCard));
    if (event.target.matches('[data-sheet-close]')) document.getElementById('nav-sheet').classList.remove('open');
  });
  go(0);
}

main().catch(error => {
  console.error(error);
  const box = document.getElementById('app-error');
  box.textContent = 'The travel plan failed to load. Please refresh or check the data files.';
  box.style.display = 'block';
});

