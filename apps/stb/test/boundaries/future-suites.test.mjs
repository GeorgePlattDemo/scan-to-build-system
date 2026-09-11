import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const APP_ROOT = fileURLToPath(new URL('../..', import.meta.url));

test('vertical suite is a real Playwright whole-path runner', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(APP_ROOT, 'package.json'), 'utf8'));
  assert.match(pkg.scripts['test:vertical'], /playwright test/);
  assert.match(pkg.scripts['test:vertical'], /playwright\.vertical\.config/);
  assert.doesNotMatch(pkg.scripts['test:vertical'], /not-implemented/);
  const dir = path.join(APP_ROOT, 'test/vertical');
  const specs = fs.readdirSync(dir).filter((name) => name.endsWith('.spec.mjs'));
  assert.ok(specs.length >= 3, 'vertical suite must contain whole-path spec files');
  for (const spec of specs) {
    const source = fs.readFileSync(path.join(dir, spec), 'utf8');
    assert.doesNotMatch(source, /setStoreTransport/);
    assert.doesNotMatch(source, /test\.only/);
    assert.match(source, /expect\(/);
  }
  const helpers = fs.readFileSync(path.join(dir, 'helpers.mjs'), 'utf8');
  assert.doesNotMatch(helpers, /setStoreTransport/);
});
