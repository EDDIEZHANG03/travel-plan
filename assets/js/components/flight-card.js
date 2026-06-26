import { formatCny, formatQueryTime } from '../currency.js';
import { externalAttrs } from '../links.js';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function renderFlightCard(segment) {
  const q = segment.latestQuery || {};
  const ctrip = segment.providers.find(p => p.name === 'Ctrip');
  const overseas = segment.providers.find(p => p.name === 'Google Flights') || segment.providers.find(p => p.name === 'Trip.com');
  const airline = segment.providers.find(p => p.type === 'airline');
  return `<article class="flight-card">
    <b>${esc(segment.id)}</b>
    <span>Last queried: ${esc(formatQueryTime(q.queriedAt))}</span>
    <span>${esc(segment.origin.iata)} → ${esc((segment.destination.iataOptions || [segment.destination.iata]).join('/'))} · ${esc(segment.date)}</span>
    <span>${esc(q.airline || 'Airline needs recheck')} ${esc(q.flightNumber || '')}</span>
    <span>${esc(q.stops == null ? 'Stops need recheck' : q.stops + ' stop(s)')} | Total duration: ${esc(q.durationMinutes == null ? 'needs recheck' : q.durationMinutes + ' minutes')}</span>
    <span>Checked baggage included: ${esc(q.baggage || 'needs recheck')}</span>
    <span>Saved queried price: ${esc(q.currency || '')} ${esc(q.amount ?? 'needs recheck')} · ${esc(formatCny(q.cnyAmount))}</span>
    <span>${esc(q.notes || '')}</span>
    <div class="links">
      <a class="btn primary" ${externalAttrs()} href="${esc(ctrip?.webUrl || '#')}">Recheck on Ctrip</a>
      <a class="btn" ${externalAttrs()} href="${esc(overseas?.webUrl || '#')}">Recheck overseas</a>
      <a class="btn" ${externalAttrs()} href="${esc(airline?.webUrl || 'https://www.google.com/search?q=airline+baggage+rules')}">Airline official site</a>
      <a class="btn" ${externalAttrs()} href="https://www.google.com/search?q=${encodeURIComponent(segment.origin.iata + ' ' + (segment.destination.iataOptions || []).join(' ') + ' baggage rules')}">Baggage rules</a>
    </div>
  </article>`;
}

