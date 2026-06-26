import test from 'node:test';
import assert from 'node:assert/strict';
import { convertToCny, formatCny, formatPrice, formatQueryTime } from '../assets/js/currency.js';

const fx = { rates: { TRY: 0.1465, USD: 6.8 } };

test('converts supported currencies to rounded CNY amounts', () => {
  assert.equal(convertToCny(1000, 'TRY', fx), 147);
  assert.equal(convertToCny(2, 'USD', fx), 14);
});

test('returns null for missing amounts and throws for missing currencies', () => {
  assert.equal(convertToCny(null, 'TRY', fx), null);
  assert.throws(() => convertToCny(100, 'EGP', fx), /Missing FX rate for EGP/);
});

test('formats original and converted prices', () => {
  assert.equal(formatCny(146.5), '¥147');
  assert.equal(formatPrice({ amount: 1000, currency: 'TRY' }, fx), 'TRY 1,000 (approx. ¥147 at query time)');
  assert.equal(formatPrice({ min: 100, max: 200, currency: 'USD' }, fx), 'USD 100–200 (approx. ¥680–¥1,360 at query time)');
});

test('formats query time and missing query status', () => {
  assert.equal(formatQueryTime('2026-06-27T00:00:00+08:00'), '2026-06-27 00:00');
  assert.equal(formatQueryTime(''), 'needs recheck');
});
