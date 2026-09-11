import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  DATABASE_NAME,
  FIXED_HOST,
  FIXED_ORIGIN,
  FIXED_PORT,
  OBJECT_STORES,
  SCHEMA_VERSION,
  STATIC_ASSETS,
  BOARD_DEFINITION,
  CUT001_DOCUMENTARY_REFERENCE,
  classifyDisplayType,
  isAllowedHost,
  isAllowedOrigin,
} from '../../shared/contracts.mjs';

const APP_ROOT = fileURLToPath(new URL('../..', import.meta.url));

test('fixed origin is the documented Build 0 host', () => {
  assert.equal(FIXED_ORIGIN, 'http://localhost:4317');
  assert.equal(FIXED_HOST, 'localhost:4317');
  assert.equal(FIXED_PORT, 4317);
  assert.equal(DATABASE_NAME, 'stb-app-v1');
  assert.equal(SCHEMA_VERSION, 1);
  assert.deepEqual([...OBJECT_STORES], ['blobs', 'drafts', 'projects', 'records']);
});

test('host and origin allowlists reject foreign values', () => {
  assert.equal(isAllowedHost('localhost:4317'), true);
  assert.equal(isAllowedHost('127.0.0.1:4317'), false);
  assert.equal(isAllowedHost('localhost'), false);
  assert.equal(isAllowedHost('evil.example:4317'), false);
  assert.equal(isAllowedOrigin('http://localhost:4317'), true);
  assert.equal(isAllowedOrigin('http://127.0.0.1:4317'), false);
  assert.equal(isAllowedOrigin('http://evil.example'), false);
});

test('static allowlist files exist and stay inside the app subtree', () => {
  for (const asset of Object.values(STATIC_ASSETS)) {
    const absolute = path.resolve(APP_ROOT, asset.relativePath);
    const relative = path.relative(APP_ROOT, absolute);
    assert.equal(path.isAbsolute(relative), false);
    assert.equal(relative.startsWith('..'), false);
    assert.equal(fs.existsSync(absolute), true);
  }
});

test('package scripts define real and future interfaces', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(APP_ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts.start, 'node server/main.mjs');
  assert.match(pkg.scripts['test:unit'], /node --test/);
  assert.match(pkg.scripts['test:browser'], /playwright test/);
  assert.match(pkg.scripts['test:boundaries'], /node --test/);
  assert.match(pkg.scripts['test:store'], /test\/store\/\*\.test\.mjs/);
  assert.match(pkg.scripts['test:vertical'], /playwright test/);
  assert.match(pkg.scripts['test:vertical'], /playwright\.vertical\.config/);
  assert.equal(pkg.devDependencies['@playwright/test'], '1.63.0');
  assert.equal(pkg.engines.node, '22.23.2');
});

test('display type classification retains supported MIME and treats the rest as opaque', () => {
  assert.equal(classifyDisplayType('text/plain'), 'text');
  assert.equal(classifyDisplayType('image/jpeg; charset=binary'), 'image-jpeg');
  assert.equal(classifyDisplayType('image/png'), 'image-png');
  assert.equal(classifyDisplayType('application/pdf'), 'pdf');
  assert.equal(classifyDisplayType('image/svg+xml'), 'opaque');
  assert.equal(classifyDisplayType('text/html'), 'opaque');
  assert.equal(classifyDisplayType('application/javascript'), 'opaque');
  assert.equal(classifyDisplayType('application/octet-stream'), 'opaque');
});

test('Board application definition is versioned and distinct from mapped classes', () => {
  assert.equal(BOARD_DEFINITION.kind, 'board.square.v1');
  assert.equal(BOARD_DEFINITION.ruleVersion, '0.1');
  assert.equal(CUT001_DOCUMENTARY_REFERENCE.pin, 'a6c7bef784c0468555735a1ad620d163aae9feea');
  assert.equal(CUT001_DOCUMENTARY_REFERENCE.authority, false);
});
