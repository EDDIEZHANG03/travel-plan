export function convertToCny(amount, currency, fxData) {
  if (amount == null) return null;
  if (currency === 'CNY') return amount;
  const rate = fxData.rates[currency];
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Missing FX rate for ${currency}`);
  }
  return Math.round(amount * rate);
}

export function formatCny(amount) {
  if (amount == null) return 'needs recheck';
  return '¥' + Math.round(amount).toLocaleString('zh-CN');
}

export function formatPrice(price, fxData) {
  if (!price || (!Number.isFinite(price.amount) && !Number.isFinite(price.min))) return 'Price needs recheck';
  const currency = price.currency || 'CNY';
  if (Number.isFinite(price.amount)) {
    const cny = price.cnyAmount ?? convertToCny(price.amount, currency, fxData);
    return `${currency} ${price.amount.toLocaleString('en-US')} (approx. ${formatCny(cny)} at query time)`;
  }
  const cnyMin = price.cnyMin ?? convertToCny(price.min, currency, fxData);
  const cnyMax = price.cnyMax ?? convertToCny(price.max, currency, fxData);
  return `${currency} ${price.min.toLocaleString('en-US')}–${price.max.toLocaleString('en-US')} (approx. ${formatCny(cnyMin)}–${formatCny(cnyMax)} at query time)`;
}

export function formatQueryTime(iso) {
  if (!iso) return 'needs recheck';
  return iso.replace('T', ' ').replace(/:\d{2}(?:[+-]\d{2}:\d{2}|Z)$/, '');
}

