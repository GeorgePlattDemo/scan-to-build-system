import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { STATIC_ASSETS } from '../../shared/contracts.mjs';

const APP_ROOT = fileURLToPath(new URL('../..', import.meta.url));

const SOURCE_EXTENSIONS = new Set(['.mjs', '.js', '.html', '.css', '.md', '.json']);

const BROWSER_FORBIDDEN = [
  /store-zero-catalog/i,
  /store-zero-observations/i,
  /store-zero-pricing-engine/i,
  /store-zero-stage2-store/i,
  /d001-stage2-envelope/i,
  /evaluateJob/,
  /estimateJob/,
  /envelopeCheck/,
  /estimateCut001/,
  /\bcycleStart\s*\(/,
  /\bstartCycle\s*\(/,
  /['"]CYCLE_START['"]/,
  /workpacket/i,
  /governed issuer/i,
  /STB_STORE_ZERO_ROOT/,
];

const SERVER_FORBIDDEN = [
  /Cycle Start/,
  /cycleStart/,
  /workpacket/i,
  /governed issuer/i,
  /estimateCut001/,
  /NodeEvaluationResult/,
  /NodePlan/,
  /NodeOutcomeRecord/,
];

const IMPORT_RE =
  /(?:import|export)\s+(?:[^'"\n]+from\s+)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function walkFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'test-results') {
      continue;
    }
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(full));
      continue;
    }
    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function collectImports(source) {
  const specifiers = [];
  for (const match of source.matchAll(IMPORT_RE)) {
    specifiers.push(match[1] ?? match[2]);
  }
  return specifiers;
}

function mapUrlToFile(specifier) {
  const asset = STATIC_ASSETS[specifier];
  if (!asset) {
    return null;
  }
  return path.join(APP_ROOT, asset.relativePath);
}

test('browser and shared import graph stay on the static allowlist and cannot import Store or server code', () => {
  const html = fs.readFileSync(path.join(APP_ROOT, 'browser/index.html'), 'utf8');
  const scriptSrc = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  const styles = [...html.matchAll(/<link[^>]+href=["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(scriptSrc, ['/app.mjs']);
  assert.deepEqual(styles, ['/styles.css']);
  assert.equal(Boolean(STATIC_ASSETS['/styles.css']), true);

  const visited = new Set();
  const queue = [
    ...scriptSrc.map(mapUrlToFile),
    mapUrlToFile('/integration/store-client.mjs'),
    mapUrlToFile('/integration/store-coordinator.mjs'),
    mapUrlToFile('/ui/store-panel.mjs'),
    mapUrlToFile('/data/store-view.mjs'),
    mapUrlToFile('/shared/store-present.mjs'),
    mapUrlToFile('/domain/review.mjs'),
    mapUrlToFile('/data/review-view.mjs'),
    mapUrlToFile('/ui/review-panel.mjs'),
    mapUrlToFile('/data/archive.mjs'),
    mapUrlToFile('/data/record-view.mjs'),
    mapUrlToFile('/ui/record-panel.mjs'),
    mapUrlToFile('/shared/archive-format.mjs'),
  ];
  assert.equal(queue.every(Boolean), true);

  while (queue.length > 0) {
    const file = queue.pop();
    if (visited.has(file)) {
      continue;
    }
    visited.add(file);
    const source = fs.readFileSync(file, 'utf8');
    for (const specifier of collectImports(source)) {
      assert.equal(specifier.startsWith('node:'), false, specifier);
      assert.equal(specifier.includes('server/'), false, specifier);
      assert.equal(specifier.includes('store-adapter'), false, specifier);
      assert.equal(specifier.includes('store-source'), false, specifier);
      assert.equal(specifier.includes('scan-to-build-store'), false, specifier);
      const resolved = specifier.startsWith('/')
        ? mapUrlToFile(specifier)
        : path.resolve(path.dirname(file), specifier);
      assert.ok(resolved, `unmapped import ${specifier}`);
      const relative = path.relative(APP_ROOT, resolved);
      assert.equal(relative.startsWith('..'), false, specifier);
      assert.equal(
        relative.startsWith('browser' + path.sep) || relative.startsWith('shared' + path.sep),
        true,
        specifier,
      );
      assert.equal(fs.existsSync(resolved), true, specifier);
      const vendor = relative.split(path.sep).includes('vendor');
      if (!vendor) {
        queue.push(resolved);
      }
    }
  }
});

test('browser and shared contain no Store implementation, pricing engine, or executable Cycle Start source', () => {
  const files = [
    ...['browser', 'shared'].flatMap((dir) => walkFiles(path.join(APP_ROOT, dir))),
  ];
  assert.ok(files.length > 0);
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of BROWSER_FORBIDDEN) {
      assert.equal(pattern.test(source), false, `${file} matched ${pattern}`);
    }
  }
  // Plain-language statements such as “Store support is not Cycle Start” are
  // intentionally allowed. The boundary is executable command authority, not
  // the ability to explain the boundary to a human.
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'server/store-adapter.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'server/store-source.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/domain/candidate.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/domain/classes.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/domain/evidence.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/domain/observation.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/domain/derive.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/domain/board.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'shared/board-rule.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'shared/store-wire.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'shared/store-present.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/data/store-view.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/ui/store-panel.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/integration/store-client.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/integration/store-coordinator.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/ui/candidate-view.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/domain/review.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/data/review-view.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/ui/review-panel.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/data/archive.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/data/record-view.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/ui/record-panel.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'shared/archive-format.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/domain/configurator.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/domain/class-runner.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/domain/alcove-engine.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/ui/project-configurator.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'browser/ui/project-renderer.mjs')), true);
  assert.equal(fs.existsSync(path.join(APP_ROOT, 'shared/alcove-rule.mjs')), true);
});

test('server may load pinned Store modules but cannot contain governed or machine command source', () => {
  const files = walkFiles(path.join(APP_ROOT, 'server'));
  assert.ok(files.length > 0);
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of SERVER_FORBIDDEN) {
      assert.equal(pattern.test(source), false, `${file} matched ${pattern}`);
    }
    assert.equal(source.includes('Access-Control-Allow-Origin: *'), false, file);
    assert.equal(/Access-Control-Allow-Origin'\s*,\s*'\*'/.test(source), false, file);
  }
  const adapter = fs.readFileSync(path.join(APP_ROOT, 'server/store-adapter.mjs'), 'utf8');
  assert.match(adapter, /evaluateJob/);
  assert.match(adapter, /estimateJob/);
  assert.equal(adapter.includes('estimateCut001'), false);
});

test('repository source does not delete or reset IndexedDB', () => {
  const source = fs.readFileSync(
    path.join(APP_ROOT, 'browser/data/repository.mjs'),
    'utf8',
  );
  assert.equal(/deleteDatabase/.test(source), false);
  assert.equal(/indexedDB\.delete/.test(source), false);
});
