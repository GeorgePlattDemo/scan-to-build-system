import assert from 'node:assert/strict';
import test from 'node:test';

import { STORE_PATHS } from '../../shared/contracts.mjs';
import { startServer } from '../../server/main.mjs';
import { rawRequest } from '../helpers/http.mjs';

const DISALLOWED_PATHS = [
  '/server/main.mjs',
  '/package.json',
  '/package-lock.json',
  '/README.md',
  '/.gitignore',
  '/.node-version',
  '/test/playwright.config.mjs',
  '/test/helpers/http.mjs',
  '/../README.md',
  '/../PACKAGE-MANIFEST.json',
  '/../docs/app/STB-APP-MASTER-ROADMAP-0.1.md',
  '/%2e%2e/README.md',
  '/shared/../server/main.mjs',
  '/browser/../server/main.mjs',
  '/store',
  '/store/',
  '/api/store',
  '/api/store/evaluate',
  '/api/store/estimate',
  '/stb-store-zero-http',
  '/store-zero-catalog.json',
  '/store-zero-observations.json',
  '/store-zero-pricing-engine.mjs',
  '/store-zero-stage2-store.mjs',
  '/d001-stage2-envelope.mjs',
  '/server/store-adapter.mjs',
  '/server/store-source.mjs',
  '/node_modules/@playwright/test/index.js',
];

test('only allowlisted browser and shared assets are served', async (t) => {
  const host = await startServer();
  t.after(() => host.close());

  const allowed = [
    ['/', 'text/html'],
    ['/index.html', 'text/html'],
    ['/begin', 'text/html'],
    ['/project', 'text/html'],
    ['/start/new', 'text/html'],
    ['/start/returning', 'text/html'],
    ['/start/professional', 'text/html'],
    ['/app.mjs', 'javascript'],
    ['/styles.css', 'text/css'],
    ['/ui/shell.mjs', 'javascript'],
    ['/ui/view-state.mjs', 'javascript'],
    ['/ui/panels.mjs', 'javascript'],
    ['/ui/source-viewer.mjs', 'javascript'],
    ['/ui/candidate-view.mjs', 'javascript'],
    ['/vendor/pdfjs/pdf.min.mjs', 'javascript'],
    ['/vendor/pdfjs/pdf.worker.min.mjs', 'javascript'],
    ['/domain/classes.mjs', 'javascript'],
    ['/domain/candidate.mjs', 'javascript'],
    ['/domain/evidence.mjs', 'javascript'],
    ['/domain/observation.mjs', 'javascript'],
    ['/domain/derive.mjs', 'javascript'],
    ['/domain/board.mjs', 'javascript'],
    ['/data/repository.mjs', 'javascript'],
    ['/data/selectors.mjs', 'javascript'],
    ['/data/store-view.mjs', 'javascript'],
    ['/integration/store-client.mjs', 'javascript'],
    ['/integration/store-coordinator.mjs', 'javascript'],
    ['/shared/contracts.mjs', 'javascript'],
    ['/shared/canonical.mjs', 'javascript'],
    ['/shared/board-rule.mjs', 'javascript'],
    ['/shared/store-wire.mjs', 'javascript'],
    ['/shared/store-present.mjs', 'javascript'],
    ['/ui/store-panel.mjs', 'javascript'],
  ];
  for (const [path, type] of allowed) {
    const response = await rawRequest({ path });
    assert.equal(response.status, 200, path);
    assert.match(response.headers['content-type'], new RegExp(type), path);
  }

  for (const path of DISALLOWED_PATHS) {
    const response = await rawRequest({ path });
    assert.equal(response.status, 404, path);
    assert.doesNotMatch(response.body, /Scan-to-Build Build 0/);
    assert.doesNotMatch(response.body, /createServer/);
    assert.doesNotMatch(response.body, /STB-APP-MASTER-ROADMAP/);
  }

  const head = await rawRequest({ method: 'HEAD', path: '/' });
  assert.equal(head.status, 200);
  assert.equal(head.body, '');

  const postRoot = await rawRequest({ method: 'POST', path: '/' });
  assert.equal(postRoot.status, 405);

  for (const path of [STORE_PATHS.offering, STORE_PATHS.job]) {
    const get = await rawRequest({ path });
    assert.equal(get.status, 405, path);
    assert.doesNotMatch(get.body, /STB-ZERO-SPF/);
    assert.doesNotMatch(get.body, /sellingPrice/);
  }

  assert.equal(head.headers['access-control-allow-origin'], undefined);
});
