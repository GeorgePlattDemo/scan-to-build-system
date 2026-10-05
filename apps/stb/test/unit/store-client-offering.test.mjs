// The browser Store client's ITEM LOOKUP transport. Runs the real stb-store-client.js; only the network is replaced.
// - The runtime configuration names both Store paths. Each is checked under the same rules, on one host.
// - lookupOfferings() sends one OFFERING_LOOKUP to the offering endpoint, never the job endpoint, and accepts only
//   an answer correlated to that request at the configured pin. A failed Store is an error, never a local answer.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import { STORE_PIN } from '../../shared/contracts.mjs';

const PUBLIC = new URL('../../public-build/', import.meta.url);
const HOST = 'https://store-zero-runtime-production.up.railway.app';
const CONFIG = { jobEndpoint: HOST + '/api/store-zero/job', offeringEndpoint: HOST + '/api/store-zero/offering', storePin: STORE_PIN };
const ROW = { storeSku: 'STB-ZERO-PINE-1X6-96-001', description: '1x6 x 96 in select pine S4S', offered: true, sellingPrice: 20.99 };

function client({ config = CONFIG, pageHost = 'georgeplattdemo.github.io', answer = null, fail = false } = {}) {
  const posts = [];
  const window = {
    location: { hostname: pageHost },
    document: { currentScript: { src: 'https://' + pageHost + '/stb-store-client.js' } },
    URL, TextEncoder, AbortSignal, crypto, JSON, Promise, Error, TypeError, Object, Array, Number, String, Math, Set,
    async fetch(url, init) {
      if (String(url).endsWith('/stb-store-runtime.json')) return { ok: true, json: async () => config };
      const body = JSON.parse(init.body);
      posts.push({ url: String(url), body });
      if (fail) throw new TypeError('Failed to fetch');
      const echo = Object.fromEntries(['protocolVersion', 'requestId', 'attemptId', 'attemptNumber', 'projectId', 'candidateRevisionId',
        'requestType', 'scope', 'demandSignature', 'querySignature', 'payloadDigest'].map(key => [key, body[key]]));
      const reply = { ...echo, storePin: STORE_PIN, rawOfferings: [ROW], totalMatches: 1, truncated: false, ...(answer ? answer(body) : {}) };
      return { ok: true, json: async () => reply };
    },
  };
  window.window = window;
  vm.createContext(window);
  new vm.Script(fs.readFileSync(fileURLToPath(new URL('stb-store-client.js', PUBLIC)), 'utf8'), { filename: 'stb-store-client.js' }).runInContext(window);
  return { api: window.STBStoreClient, posts };
}
const lookUp = api => api.lookupOfferings({ projectId: 'start-own', candidateRevisionId: 'SYO-USER1-XBRACE-0.1-v1', searchText: ' 1 x 6 pine ' });

test('the runtime configuration names the job and offering endpoints on one Store host, with the unchanged pin', () => {
  const runtime = JSON.parse(fs.readFileSync(fileURLToPath(new URL('stb-store-runtime.json', PUBLIC)), 'utf8'));
  assert.deepEqual(Object.keys(runtime).sort(), ['jobEndpoint', 'offeringEndpoint', 'storePin']);
  assert.equal(runtime.storePin, STORE_PIN);
  assert.equal(runtime.jobEndpoint, 'https://store-zero-runtime-production.up.railway.app/api/store-zero/job');
  assert.equal(new URL(runtime.offeringEndpoint).origin, new URL(runtime.jobEndpoint).origin);
  assert.equal(new URL(runtime.offeringEndpoint).pathname, '/api/store-zero/offering');
});

test('loadConfig checks both endpoints under the same rules', async () => {
  assert.deepEqual({ ...(await client().api.loadConfig()) },
    { endpoint: CONFIG.jobEndpoint, offeringEndpoint: CONFIG.offeringEndpoint, storePin: STORE_PIN });
  const rejects = async (config, code, pageHost) => {
    await assert.rejects(client({ config, pageHost }).api.loadConfig(), new RegExp(code), JSON.stringify(config));
  };
  await rejects({ jobEndpoint: CONFIG.jobEndpoint, storePin: STORE_PIN }, 'STORE_RUNTIME_NOT_DEPLOYED');
  for (const offeringEndpoint of [
    'not a url',
    HOST + '/api/store-zero/job',
    HOST + '/api/store-zero/search',
    HOST + '/api/store-zero/offering?q=pine',
    HOST + '/api/store-zero/offering#x',
    'https://user:pw@store-zero-runtime-production.up.railway.app/api/store-zero/offering',
    'http://store-zero-runtime-production.up.railway.app/api/store-zero/offering',
    'http://127.0.0.1:4317/api/store-zero/offering',
    'https://another-store.example/api/store-zero/offering',
  ]) {
    await rejects({ ...CONFIG, offeringEndpoint }, 'STORE_RUNTIME_ENDPOINT_INVALID');
  }
  await rejects({ ...CONFIG, jobEndpoint: HOST + '/api/store-zero/offering' }, 'STORE_RUNTIME_ENDPOINT_INVALID');
  // A loopback page may use a loopback Store, for local tests only.
  const local = { jobEndpoint: 'http://127.0.0.1:4317/api/store-zero/job', offeringEndpoint: 'http://127.0.0.1:4317/api/store-zero/offering', storePin: STORE_PIN };
  assert.equal((await client({ config: local, pageHost: '127.0.0.1' }).api.loadConfig()).offeringEndpoint, local.offeringEndpoint);
});

test('one lookup is one OFFERING_LOOKUP to the offering endpoint, with request identity, pin, query signature and digest', async () => {
  const { api, posts } = client();
  const answer = await lookUp(api);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].url, CONFIG.offeringEndpoint);
  const wire = posts[0].body;
  assert.deepEqual({ ...wire.payload }, { searchText: '1 x 6 pine' });
  assert.equal(wire.requestType, 'OFFERING_LOOKUP');
  assert.equal(wire.scope, 'OFFERING_LOOKUP');
  assert.equal(wire.demandSignature, null);
  assert.equal(wire.expectedStorePin, STORE_PIN);
  assert.match(wire.querySignature, /^[0-9a-f]{64}$/);
  assert.equal(wire.payloadDigest, await api.sha256(wire.payload));
  assert.equal(answer.rawOfferings[0].storeSku, ROW.storeSku);
});

test('an uncorrelated, wrong-pin, malformed or unreachable answer is an error, never a local answer', async () => {
  for (const [answer, code] of [
    [() => ({ requestId: 'someone-else' }), 'STORE_CORRELATION_ERROR'],
    [() => ({ querySignature: 'other' }), 'STORE_CORRELATION_ERROR'],
    [() => ({ storePin: '0'.repeat(40) }), 'STORE_PIN_MISMATCH'],
    [() => ({ rawOfferings: undefined, rawOffering: ROW }), 'STORE_MALFORMED_RESPONSE'],
    [() => ({ totalMatches: 30, truncated: false }), 'STORE_MALFORMED_RESPONSE'],
    [() => ({ rawOfferings: [{ ...ROW, offered: false }] }), 'STORE_MALFORMED_RESPONSE'],
    [() => ({ rawOfferings: Array(21).fill(ROW), totalMatches: 21, truncated: false }), 'STORE_MALFORMED_RESPONSE'],
    [() => ({ adapterError: true, code: 'STORE_PIN_MISMATCH' }), 'STORE_PIN_MISMATCH'],
  ]) {
    await assert.rejects(lookUp(client({ answer }).api), new RegExp(code));
  }
  await assert.rejects(lookUp(client({ fail: true }).api), /Failed to fetch/);
  await assert.rejects(client().api.lookupOfferings({ projectId: 'start-own', candidateRevisionId: 'v1', searchText: '   ' }), /STORE_CLIENT_REQUEST_INCOMPLETE/);
});
