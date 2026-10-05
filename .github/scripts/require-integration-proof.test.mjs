import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from './require-integration-proof.mjs';

const SHA = 'a'.repeat(40);
const OTHER = 'b'.repeat(40);
const MAIN = 'refs/heads/main';

function run(conclusion, overrides = {}) {
  return {
    id: 1, head_sha: SHA, event: 'push', status: 'completed',
    jobs: [{ id: 10, name: 'playhouse-candidate', head_sha: SHA, conclusion }],
    ...overrides,
  };
}

test('green integration job for this SHA at main head publishes', () => {
  assert.equal(decide({ sha: SHA, ref: MAIN, mainHeadSha: SHA, runs: [run('success')] }).ok, true);
});

for (const conclusion of ['failure', 'skipped', 'cancelled', 'timed_out', null]) {
  test(`integration job ${conclusion} denies`, () => {
    const v = decide({ sha: SHA, ref: MAIN, mainHeadSha: SHA, runs: [run(conclusion)] });
    assert.equal(v.ok, false);
    assert.match(v.reason, /no successful/);
  });
}

test('no integration run for this SHA denies', () => {
  assert.equal(decide({ sha: SHA, ref: MAIN, mainHeadSha: SHA, runs: [] }).ok, false);
});

test('a green run for a different SHA is not proof', () => {
  const v = decide({ sha: SHA, ref: MAIN, mainHeadSha: SHA, runs: [run('success', { head_sha: OTHER })] });
  assert.equal(v.ok, false);
});

test('a job that ran a different SHA is not proof', () => {
  const r = run('success');
  r.jobs[0].head_sha = OTHER;
  assert.equal(decide({ sha: SHA, ref: MAIN, mainHeadSha: SHA, runs: [r] }).ok, false);
});

test('a pull_request run is not proof for the pushed SHA', () => {
  const v = decide({ sha: SHA, ref: MAIN, mainHeadSha: SHA, runs: [run('success', { event: 'pull_request' })] });
  assert.equal(v.ok, false);
});

test('a run still in progress denies', () => {
  const v = decide({ sha: SHA, ref: MAIN, mainHeadSha: SHA, runs: [run(null, { status: 'in_progress' })] });
  assert.equal(v.ok, false);
});

test('one failed or cancelled run beside a green run for the same SHA still publishes', () => {
  for (const conclusion of ['failure', 'cancelled']) {
    const runs = [run('success'), run(conclusion, { id: 2 })];
    assert.equal(decide({ sha: SHA, ref: MAIN, mainHeadSha: SHA, runs }).ok, true, conclusion);
  }
});

test('a missing integration job denies', () => {
  assert.equal(decide({ sha: SHA, ref: MAIN, mainHeadSha: SHA, runs: [run('success', { jobs: [] })] }).ok, false);
});

test('green proof off main denies', () => {
  assert.equal(decide({ sha: SHA, ref: 'refs/heads/topic', mainHeadSha: SHA, runs: [run('success')] }).ok, false);
});

test('green proof for a SHA main has moved past denies', () => {
  assert.equal(decide({ sha: SHA, ref: MAIN, mainHeadSha: OTHER, runs: [run('success')] }).ok, false);
});
