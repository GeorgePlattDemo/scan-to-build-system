import assert from 'node:assert/strict';
import test from 'node:test';

import { STATIC_ASSETS } from '../../shared/contracts.mjs';
import { resolveStaticAsset } from '../../server/main.mjs';

test('allowlisted paths resolve to known relative files', () => {
  assert.equal(resolveStaticAsset('/').relativePath, 'browser/index.html');
  assert.equal(resolveStaticAsset('/index.html').relativePath, 'browser/index.html');
  assert.equal(resolveStaticAsset('/begin').relativePath, 'browser/index.html');
  assert.equal(resolveStaticAsset('/project').relativePath, 'browser/index.html');
  assert.equal(resolveStaticAsset('/start/new').relativePath, 'browser/index.html');
  assert.equal(resolveStaticAsset('/start/returning').relativePath, 'browser/index.html');
  assert.equal(resolveStaticAsset('/start/professional').relativePath, 'browser/index.html');
  assert.equal(resolveStaticAsset('/app.mjs').relativePath, 'browser/app.mjs');
  assert.equal(resolveStaticAsset('/styles.css').relativePath, 'browser/styles.css');
  assert.equal(resolveStaticAsset('/ui/shell.mjs').relativePath, 'browser/ui/shell.mjs');
  assert.equal(resolveStaticAsset('/ui/view-state.mjs').relativePath, 'browser/ui/view-state.mjs');
  assert.equal(resolveStaticAsset('/ui/panels.mjs').relativePath, 'browser/ui/panels.mjs');
  assert.equal(
    resolveStaticAsset('/ui/source-viewer.mjs').relativePath,
    'browser/ui/source-viewer.mjs',
  );
  assert.equal(
    resolveStaticAsset('/ui/candidate-view.mjs').relativePath,
    'browser/ui/candidate-view.mjs',
  );
  assert.equal(resolveStaticAsset('/domain/classes.mjs').relativePath, 'browser/domain/classes.mjs');
  assert.equal(
    resolveStaticAsset('/domain/candidate.mjs').relativePath,
    'browser/domain/candidate.mjs',
  );
  assert.equal(
    resolveStaticAsset('/domain/evidence.mjs').relativePath,
    'browser/domain/evidence.mjs',
  );
  assert.equal(
    resolveStaticAsset('/domain/observation.mjs').relativePath,
    'browser/domain/observation.mjs',
  );
  assert.equal(resolveStaticAsset('/domain/derive.mjs').relativePath, 'browser/domain/derive.mjs');
  assert.equal(resolveStaticAsset('/domain/board.mjs').relativePath, 'browser/domain/board.mjs');
  assert.equal(
    resolveStaticAsset('/shared/board-rule.mjs').relativePath,
    'shared/board-rule.mjs',
  );
  assert.equal(
    resolveStaticAsset('/data/repository.mjs').relativePath,
    'browser/data/repository.mjs',
  );
  assert.equal(
    resolveStaticAsset('/data/selectors.mjs').relativePath,
    'browser/data/selectors.mjs',
  );
  assert.equal(
    resolveStaticAsset('/integration/store-client.mjs').relativePath,
    'browser/integration/store-client.mjs',
  );
  assert.equal(
    resolveStaticAsset('/integration/store-coordinator.mjs').relativePath,
    'browser/integration/store-coordinator.mjs',
  );
  assert.equal(
    resolveStaticAsset('/shared/contracts.mjs').relativePath,
    'shared/contracts.mjs',
  );
  assert.equal(
    resolveStaticAsset('/shared/canonical.mjs').relativePath,
    'shared/canonical.mjs',
  );
  assert.equal(
    resolveStaticAsset('/shared/store-wire.mjs').relativePath,
    'shared/store-wire.mjs',
  );
  assert.equal(
    resolveStaticAsset('/shared/store-present.mjs').relativePath,
    'shared/store-present.mjs',
  );
  assert.equal(
    resolveStaticAsset('/data/store-view.mjs').relativePath,
    'browser/data/store-view.mjs',
  );
  assert.equal(
    resolveStaticAsset('/ui/store-panel.mjs').relativePath,
    'browser/ui/store-panel.mjs',
  );
  assert.equal(
    resolveStaticAsset('/ui/review-panel.mjs').relativePath,
    'browser/ui/review-panel.mjs',
  );
  assert.equal(
    resolveStaticAsset('/domain/review.mjs').relativePath,
    'browser/domain/review.mjs',
  );
  assert.equal(
    resolveStaticAsset('/data/review-view.mjs').relativePath,
    'browser/data/review-view.mjs',
  );
  assert.equal(
    resolveStaticAsset('/shared/review-digest.mjs').relativePath,
    'shared/review-digest.mjs',
  );
  assert.equal(
    resolveStaticAsset('/data/archive.mjs').relativePath,
    'browser/data/archive.mjs',
  );
  assert.equal(
    resolveStaticAsset('/data/record-view.mjs').relativePath,
    'browser/data/record-view.mjs',
  );
  assert.equal(
    resolveStaticAsset('/ui/record-panel.mjs').relativePath,
    'browser/ui/record-panel.mjs',
  );
  assert.equal(
    resolveStaticAsset('/shared/archive-format.mjs').relativePath,
    'shared/archive-format.mjs',
  );
});

test('query strings do not bypass the allowlist', () => {
  assert.equal(resolveStaticAsset('/app.mjs?cache=1').relativePath, 'browser/app.mjs');
});

test('unknown, server, and repository-root paths are rejected', () => {
  const rejected = [
    '/server/main.mjs',
    '/package.json',
    '/README.md',
    '/../README.md',
    '/shared/../server/main.mjs',
    '/browser/../server/main.mjs',
    '/%2e%2e/README.md',
    '/shared/%2e%2e/server/main.mjs',
    '/store',
    '/api/store',
    '/store-zero-catalog.json',
    '/server/store-adapter.mjs',
    '/test/unit/canonical.test.mjs',
    '/node_modules/@playwright/test/index.js',
    '/browser/data/repository.mjs',
  ];
  for (const path of rejected) {
    assert.equal(resolveStaticAsset(path), null, path);
  }
});

test('dot and encoded-null paths are rejected', () => {
  assert.equal(resolveStaticAsset('/./app.mjs'), null);
  assert.equal(resolveStaticAsset('/app.mjs%00.js'), null);
});

test('allowlist is exact and finite', () => {
  assert.deepEqual(Object.keys(STATIC_ASSETS).sort(), [
    '/',
    '/app.mjs',
    '/begin',
    '/data/archive.mjs',
    '/data/record-view.mjs',
    '/data/repository.mjs',
    '/data/review-view.mjs',
    '/data/selectors.mjs',
    '/data/store-view.mjs',
    '/domain/alcove-engine.mjs',
    '/domain/board.mjs',
    '/domain/candidate.mjs',
    '/domain/class-runner.mjs',
    '/domain/classes.mjs',
    '/domain/configurator.mjs',
    '/domain/derive.mjs',
    '/domain/evidence.mjs',
    '/domain/observation.mjs',
    '/domain/picnic-engine.mjs',
    '/domain/review-child.mjs',
    '/domain/review.mjs',
    '/index.html',
    '/integration/store-client.mjs',
    '/integration/store-coordinator.mjs',
    '/project',
    '/projects/review/STB-OUTDOOR-ANGLED-FRAME-RESEARCH-DOSSIER-0.1.html',
    '/projects/review/assets/project-tiles/plywood-curvilinear-shapes.webp',
    '/projects/review/assets/project-tiles/start-your-own.webp',
    '/projects/review/stb-canonical-journey.js',
    '/projects/review/stb-outdoor-build-deck-0.1.html',
    '/projects/review/stb-outdoor-build.html',
    '/projects/review/stb-outdoor-reference-authority-0.3.html',
    '/projects/review/stb-start-own-0.10.html',
    '/projects/review/stb-start-own-0.11.html',
    '/projects/review/stb-store-handoff-contract.js',
    '/projects/review/stb-window-seat-space-utilization-0.7.4.html',
    '/projects/review/store-zero-canonical-doctrine.js',
    '/projects/review/system-build-base-8d8a9dd.html',
    '/shared/alcove-rule.mjs',
    '/shared/archive-format.mjs',
    '/shared/board-rule.mjs',
    '/shared/canonical.mjs',
    '/shared/class-config.mjs',
    '/shared/contracts.mjs',
    '/shared/picnic-rule.mjs',
    '/shared/project-registry.mjs',
    '/shared/review-digest.mjs',
    '/shared/store-present.mjs',
    '/shared/store-wire.mjs',
    '/start/new',
    '/start/professional',
    '/start/returning',
    '/styles.css',
    '/ui/candidate-view.mjs',
    '/ui/canonical-project-host.mjs',
    '/ui/future-chain.mjs',
    '/ui/narrative.mjs',
    '/ui/open-door.mjs',
    '/ui/panels.mjs',
    '/ui/project-configurator.mjs',
    '/ui/project-renderer.mjs',
    '/ui/record-panel.mjs',
    '/ui/review-panel.mjs',
    '/ui/shell.mjs',
    '/ui/source-viewer.mjs',
    '/ui/store-panel.mjs',
    '/ui/view-state.mjs',
    '/vendor/pdfjs/pdf.min.mjs',
    '/vendor/pdfjs/pdf.worker.min.mjs',
  ]);
});
