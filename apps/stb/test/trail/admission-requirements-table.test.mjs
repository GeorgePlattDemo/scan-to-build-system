// Admission requirements table: every current admission check, in both layers, has a row with an owner and a
// destination in docs/application/ADMISSION-REQUIREMENTS.md. None is dropped.
// Fixture: test/fixtures/admission-requirements.mjs. Reads source text only; changes no admission behavior.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { ADMISSION_PROFILES } from '../../shared/tile-host-admission-contract.mjs';
import { PROFILE_CHECKS, OLD_PATH_ROWS, OLD_PATH_GATES, KEPT_ASKS } from '../fixtures/admission-requirements.mjs';

const read = rel => fs.readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const OLD_PATH = read('../../public-build/stb-public-admission.mjs');
const DEFINITION_CONTRACT = read('../../shared/definition-contract.mjs');
const WINDOW_SEAT = read('../../public-build/stb-window-seat-0.9.html');
const TABLE = read('../../../../docs/application/ADMISSION-REQUIREMENTS.md');

const sorted = list => [...list].sort();

// Rows of the one table: cells by header name.
function tableRows() {
  const lines = TABLE.split('\n').filter(line => line.startsWith('|'));
  const split = line => line.slice(1, -1).split('|').map(cell => cell.trim());
  const header = split(lines[0]);
  return lines.slice(2).map(line => {
    const cells = split(line);
    return Object.fromEntries(header.map((name, i) => [name, cells[i] ?? '']));
  });
}

test('the fixture lists every profile requirement, and only those', () => {
  const actual = Object.entries(ADMISSION_PROFILES).flatMap(([, profile]) =>
    Object.entries(profile.scopes).flatMap(([scope, def]) => def.requires.map(req => `P:${req.id}@${scope}`)));
  assert.deepEqual(sorted(PROFILE_CHECKS), sorted(actual));
});

test('the fixture lists every old-path responsibility row, and only those', () => {
  const actual = new Set([...OLD_PATH.matchAll(/\b(?:row|notRequiredRow|deferredRow)\('([a-z-]+\.[a-z-]+)'/g)].map(m => `O:${m[1]}`));
  assert.deepEqual(sorted(OLD_PATH_ROWS), sorted(actual));
});

test('the fixture lists every old-path failure code, and only those', () => {
  const literal = [...OLD_PATH.matchAll(/'(SYSTEM_ADMISSION_[A-Z_]+)'/g)].map(m => m[1]);
  const body = DEFINITION_CONTRACT.slice(DEFINITION_CONTRACT.indexOf('export function storeSubmissionReadiness'));
  const readiness = body.slice(0, body.indexOf('\n}\n'));
  const reasons = [...readiness.matchAll(/reason: '([A-Z_]+)'/g)].map(m => 'SYSTEM_ADMISSION_' + m[1]);
  assert.ok(OLD_PATH.includes("'SYSTEM_ADMISSION_' + readiness.reason"), 'old path still prefixes readiness reasons');
  assert.deepEqual(sorted(OLD_PATH_GATES), sorted(new Set([...literal, ...reasons].map(code => 'G:' + code))));
});

test('the fixture lists every Window Seat kept ask, and only those', () => {
  const block = WINDOW_SEAT.slice(WINDOW_SEAT.indexOf('const KEPT_ASKS=['));
  const keys = [...block.slice(0, block.indexOf('];')).matchAll(/\{k:'([a-z]+)'/g)].map(m => `K:window-seat.kept-asks/${m[1]}`);
  assert.deepEqual(sorted(KEPT_ASKS.map(item => item.check)), sorted(keys));
});

test('every current check has a row with an owner and a destination; none is dropped', () => {
  const rows = tableRows();
  const byCheck = new Map();
  for (const row of rows) {
    const id = /^`([^`]+)`/.exec(row.Check)?.[1];
    if (id) byCheck.set(id, [...(byCheck.get(id) || []), row]);
  }
  const all = [...PROFILE_CHECKS, ...OLD_PATH_ROWS, ...OLD_PATH_GATES, ...KEPT_ASKS.map(item => item.check)];
  for (const id of all) {
    const found = byCheck.get(id);
    assert.ok(found, `${id}: no row in ADMISSION-REQUIREMENTS.md`);
    for (const row of found) {
      for (const column of ['Fact', 'Owner', 'Inquiry scope', 'Valid form', 'Source', 'Blocking condition', 'Test', 'Destination']) {
        assert.ok(row[column], `${id}: ${column} is blank`);
      }
    }
  }
  const known = new Set(all);
  for (const id of byCheck.keys()) assert.ok(known.has(id), `${id}: row names a check the code does not have`);
});

test('every kept ask has one disposition, not a count', () => {
  const rows = tableRows();
  for (const { check, disposition } of KEPT_ASKS) {
    assert.ok(['included', 'excluded', 'blocking'].includes(disposition), check);
    const row = rows.find(item => item.Check === '`' + check + '`');
    assert.match(row.Destination, new RegExp('\\*\\*' + disposition + '\\.?\\*\\*', 'i'), `${check}: table disposition is ${disposition}`);
  }
});

test('a profile fact that accepts any nonempty object is marked as not complete', () => {
  const rows = tableRows();
  for (const [tile, profile] of Object.entries(ADMISSION_PROFILES)) {
    for (const [scope, def] of Object.entries(profile.scopes)) {
      for (const req of def.requires.filter(item => item.kind === 'object')) {
        const row = rows.find(item => item.Check === '`P:' + req.id + '@' + scope + '`');
        assert.match(row['Valid form'], /any nonempty object/, `${tile} ${req.id}: valid form names the object kind`);
      }
    }
  }
});
