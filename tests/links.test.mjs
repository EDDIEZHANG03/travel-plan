import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAmapLink, buildGoogleNavigationLink, buildGooglePlaceLink, buildPlatformSearchLink, externalAttrs } from '../assets/js/links.js';

const place = {
  coordinates: { lat: 41.0086, lng: 28.9802 },
  name: { local: 'Hagia Sophia', zh: '圣索菲亚大清真寺' },
  city: { local: 'Istanbul', zh: '伊斯坦布尔' },
  platforms: {
    googlePlaceId: 'ChIJiQobMmpLHRUR6Bg7YuN5z_Q',
    googlePlaceUrl: 'https://www.google.com/maps/search/?api=1&query=Hagia%20Sophia',
    xiaohongshuSearchUrl: 'https://www.xiaohongshu.com/search_result?keyword=Hagia%20Sophia',
    tripadvisorUrl: 'https://www.tripadvisor.com/Search?q=Hagia%20Sophia'
  }
};

test('Amap link uses coordinates, native handoff, and WGS84 flag', () => {
  const url = buildAmapLink(place);
  assert.match(url, /^https:\/\/uri\.amap\.com\/marker\?/);
  assert.match(url, /position=28\.9802,41\.0086/);
  assert.match(url, /coordinate=wgs84/);
  assert.match(url, /callnative=1/);
});

test('Google navigation includes destination place id when available', () => {
  const url = buildGoogleNavigationLink(place);
  assert.match(url, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1/);
  assert.match(url, /dir_action=navigate/);
  assert.match(url, /destination_place_id=ChIJiQobMmpLHRUR6Bg7YuN5z_Q/);
});

test('review/search links cover the required platforms', () => {
  assert.match(buildGooglePlaceLink(place), /query_place_id=/);
  assert.match(buildPlatformSearchLink(place, 'xhs'), /^https:\/\/www\.xiaohongshu\.com\/search_result/);
  assert.match(buildPlatformSearchLink(place, 'dianping'), /^https:\/\/m\.dianping\.com\/searchshop/);
  assert.match(buildPlatformSearchLink(place, 'tripadvisor'), /^https:\/\/www\.tripadvisor\.com\/Search/);
});

test('external link attributes protect tab opener', () => {
  assert.equal(externalAttrs(), 'target="_blank" rel="noopener noreferrer"');
});
