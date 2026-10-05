// OFFERING_LOOKUP text search against the real pinned Store catalog. The hosted offering service finds offered
// Store Zero items by keyword or SKU; the browser sends text and renders what comes back. The exact-SKU form of
// OFFERING_LOOKUP is unchanged (wrapper.test.mjs).
import assert from 'node:assert/strict';
import test from 'node:test';

import { STORE_PIN, STORE_REQUEST_TYPES, STORE_SCOPES } from '../../shared/contracts.mjs';
import { inspectStoreResponse, OFFERING_SEARCH_LIMITS } from '../../shared/store-wire.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { startServer } from '../../server/main.mjs';
import { offeringLookupBody, parseJson, postOffering, requireCleanPinnedStore } from './helpers.mjs';

async function withHost(t) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());
  return { adapter };
}

async function search(searchText, fields = {}) {
  const request = await offeringLookupBody({ payload: { searchText }, ...fields });
  const response = await postOffering(request);
  assert.equal(response.status, 200, searchText);
  const body = parseJson(response);
  // Every answer is correlated to its request and names the unchanged pin.
  assert.equal(body.storePin, STORE_PIN);
  for (const key of ['requestId', 'attemptId', 'projectId', 'candidateRevisionId', 'requestType', 'scope', 'querySignature', 'payloadDigest']) {
    assert.equal(body[key], request[key], searchText + ': ' + key);
  }
  assert.equal(body.requestType, STORE_REQUEST_TYPES.OFFERING_LOOKUP);
  assert.equal(body.scope, STORE_SCOPES.OFFERING_LOOKUP);
  assert.equal(body.rawEvaluation, undefined, 'a lookup is not an evaluation');
  assert.equal(body.rawEstimate, undefined, 'a lookup is not an estimate');
  assert.deepEqual(inspectStoreResponse(request, body, { httpStatus: 200 }).ok, true, searchText + ': response shape');
  return body;
}
const skus = (body) => body.rawOfferings.map((row) => row.storeSku);

test('a full Store SKU still resolves through the exact-SKU OFFERING_LOOKUP form', async (t) => {
  const { adapter } = await withHost(t);
  const response = await postOffering(await offeringLookupBody({ payload: { requestedStoreSku: 'STB-ZERO-SPF-2X4-96-001' } }));
  assert.equal(response.status, 200);
  const body = parseJson(response);
  assert.equal(body.found, true);
  assert.equal(body.rawOffering.storeSku, 'STB-ZERO-SPF-2X4-96-001');
  assert.equal(body.rawOffering.sellingPrice, adapter.modules.findSku(adapter.catalog, 'STB-ZERO-SPF-2X4-96-001').sellingPrice);
  assert.equal('rawOfferings' in body, false, 'the exact-SKU response shape is unchanged');
});

test('a full SKU, in any case, is the first search match and is the catalog row', async (t) => {
  const { adapter } = await withHost(t);
  const upper = await search('STB-ZERO-SPF-2X4-96-001');
  const lower = await search('stb-zero-spf-2x4-96-001');
  assert.deepEqual(skus(upper), ['STB-ZERO-SPF-2X4-96-001']);
  assert.deepEqual(skus(lower), skus(upper));
  const row = adapter.modules.findSku(adapter.catalog, 'STB-ZERO-SPF-2X4-96-001');
  assert.equal(upper.rawOfferings[0].description, row.description);
  assert.equal(upper.rawOfferings[0].sellingPrice, row.sellingPrice);
  assert.equal(upper.rawOfferings[0].species, 'spf');
  assert.equal(upper.rawOfferings[0].catalogClock, adapter.catalog.clock, 'Store attribution is kept');
  assert.equal(upper.totalMatches, 1);
  assert.equal(upper.truncated, false);
});

test('pine returns offered pine items from the pinned catalog, capped at 20 with the total', async (t) => {
  const { adapter } = await withHost(t);
  const body = await search('pine');
  const expected = adapter.catalog.offerings.filter((o) => o.offered === true && o.species === 'pine');
  assert.ok(expected.length > OFFERING_SEARCH_LIMITS.maxResults, 'the pinned catalog has more than 20 pine items');
  assert.equal(body.totalMatches, expected.length);
  assert.equal(body.rawOfferings.length, 20);
  assert.equal(body.truncated, true);
  assert.deepEqual(skus(body), expected.slice(0, 20).map((o) => o.storeSku), 'stable catalog order');
  for (const row of body.rawOfferings) {
    assert.equal(row.offered, true);
    assert.equal(row.species, 'pine');
  }
});

test('1x6 pine, 1 x 6 pine and 1×6 pine are the same search: 1×6 pine only, AND not OR', async (t) => {
  await withHost(t);
  const [a, b, c] = [await search('1x6 pine'), await search('1 x 6 pine'), await search('1×6 pine')];
  assert.deepEqual(skus(b), skus(a));
  assert.deepEqual(skus(c), skus(a));
  assert.deepEqual(skus(a), ['STB-ZERO-PINE-1X6-72-001', 'STB-ZERO-PINE-1X6-96-001', 'STB-ZERO-PINE-1X6-120-001', 'STB-ZERO-PINE-1X6-144-001']);
  for (const row of a.rawOfferings) {
    assert.equal(row.species, 'pine');
    assert.equal(row.nominalT, 1);
    assert.equal(row.nominalW, 6);
  }
  assert.ok(!skus(a).some((sku) => sku.includes('SPF')), 'no SPF 2×4 just because both are wood');
  // AND: each token alone matches more than the pair; the pair is the intersection.
  const pine = await search('pine');
  const oneBySix = await search('1x6');
  assert.ok(pine.totalMatches > a.totalMatches && oneBySix.totalMatches > a.totalMatches);
  assert.equal((await search('pine 2x4')).totalMatches, 0, 'pine AND 2x4 is empty in this catalog');
});

test('a partial SKU returns its offered rows', async (t) => {
  await withHost(t);
  const body = await search('STB-ZERO-PINE-1X6');
  assert.deepEqual(skus(body), ['STB-ZERO-PINE-1X6-72-001', 'STB-ZERO-PINE-1X6-96-001', 'STB-ZERO-PINE-1X6-120-001', 'STB-ZERO-PINE-1X6-144-001']);
  assert.deepEqual(skus(await search('stb-zero-pine-1x6')), skus(body));
});

test('a query that matches nothing is a valid answer with no item', async (t) => {
  await withHost(t);
  const body = await search('walnut zebra 9x99');
  assert.deepEqual(body.rawOfferings, []);
  assert.equal(body.totalMatches, 0);
  assert.equal(body.truncated, false);
});

test('only offered rows are returned; an offered:false row in the catalog is never shown', async () => {
  await requireCleanPinnedStore();
  const base = await createStoreAdapter();
  const catalog = base.cloneCatalog();
  catalog.offerings.find((o) => o.storeSku === 'STB-ZERO-PINE-1X6-96-001').offered = false;
  const adapter = await createStoreAdapter({ catalogOverride: catalog });
  const result = await adapter.dispatch(await offeringLookupBody({ payload: { searchText: '1 x 6 pine' } }));
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.rawOfferings.map((row) => row.storeSku),
    ['STB-ZERO-PINE-1X6-72-001', 'STB-ZERO-PINE-1X6-120-001', 'STB-ZERO-PINE-1X6-144-001']);
  const exact = await adapter.dispatch(await offeringLookupBody({ payload: { searchText: 'STB-ZERO-PINE-1X6-96-001' } }));
  assert.equal(exact.body.totalMatches, 0, 'not offered, even by its full SKU');
  // The pinned catalog's own not-offered rows stay out too.
  const notOffered = base.catalog.offerings.filter((o) => o.offered !== true).map((o) => o.storeSku);
  assert.ok(notOffered.length > 0);
  for (const sku of notOffered) {
    const answer = await base.dispatch(await offeringLookupBody({ payload: { searchText: sku } }));
    assert.equal(answer.body.totalMatches, 0, sku);
  }
});

test('more than 20 matching fixture rows: total is reported, 20 are returned, truncated is true', async () => {
  await requireCleanPinnedStore();
  const base = await createStoreAdapter();
  const catalog = base.cloneCatalog();
  const template = catalog.offerings.find((o) => o.storeSku === 'STB-ZERO-PINE-1X6-96-001');
  for (let i = 0; i < 25; i++) {
    catalog.offerings.push({ ...structuredClone(template), storeSku: `STB-ZERO-PINE-1X6-FIXTURE-${String(i).padStart(3, '0')}` });
  }
  const adapter = await createStoreAdapter({ catalogOverride: catalog });
  const result = await adapter.dispatch(await offeringLookupBody({ payload: { searchText: '1x6 pine' } }));
  assert.equal(result.status, 200);
  assert.equal(result.body.totalMatches, 29);
  assert.equal(result.body.rawOfferings.length, 20);
  assert.equal(result.body.truncated, true);
  assert.equal(result.body.storePin, STORE_PIN);
});

test('search payloads are bounded: searchText alone, a nonblank string of at most 80 characters', async () => {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  for (const payload of [
    { searchText: '' },
    { searchText: '   ' },
    { searchText: 'x'.repeat(81) },
    { searchText: 7 },
    { searchText: 'pine', species: 'pine' },
    { searchText: 'pine', requestedStoreSku: 'STB-ZERO-PINE-1X6-96-001' },
    { searchText: 'pine', materialDemand: { species: 'pine' } },
  ]) {
    const result = await adapter.dispatch(await offeringLookupBody({ payload }));
    assert.equal(result.status, 422, JSON.stringify(payload));
    assert.equal(result.body.adapterError, true);
  }
  const wrongPin = await offeringLookupBody({ payload: { searchText: 'pine' } });
  wrongPin.expectedStorePin = '0'.repeat(40);
  assert.equal((await adapter.dispatch(wrongPin)).status, 503, 'the exact pin is still required');
  const tampered = await offeringLookupBody({ payload: { searchText: 'pine' } });
  tampered.payload = { searchText: 'cedar' };
  assert.equal((await adapter.dispatch(tampered)).status, 422, 'the payload digest is still checked');
});
