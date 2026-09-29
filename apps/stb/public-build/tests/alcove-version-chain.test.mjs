import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// Rule 10 (information before atoms) and the Alcove version chain.
// Links 1-3 are read from the Store Zero answer; the decision and every event after it are the shared
// terms flow (stb-terms-flow.js), the same for every tile.
const shell = fs.readFileSync(new URL('../system-build-current.html', import.meta.url), 'utf8');
const base = fs.readFileSync(new URL('../system-build-base-8d8a9dd.html', import.meta.url), 'utf8');

test('Alcove chain shows sent, arrived and answered on the Store page; the shared terms flow carries the rest', () => {
  for (const link of ['1 · SENT', '2 · ARRIVED AT STORE ZERO', '3 · ANSWERED', '4 · YOUR CALL AND AFTER']) {
    assert.ok(shell.includes(link), `chain link missing: ${link}`);
  }
  assert.match(shell, /\['store'\]\.forEach\(pageId =>/);
  for (const step of ['call', 'yard', 'record']) assert.ok(shell.includes('<div class="alcove-terms-host" data-terms-step="' + step + '"></div>'), 'Alcove terms host missing: ' + step);
  assert.match(shell, /YOUR DEFINITION · SENT/);
  assert.match(shell, /STORE ZERO · ARRIVAL RECEIPT/);
  assert.match(shell, /receipt\.receiptHash/, 'arrival receipt hash must come from the Store answer');
  assert.match(shell, /answer\.payloadDigest/, 'sent hash must come from the Store answer');
});

test('decisions and every later event are hashed by the shared terms flow, never plain labels', () => {
  const flow = fs.readFileSync(new URL('../stb-terms-flow.js', import.meta.url), 'utf8');
  assert.match(shell, /window\.STBTermsFlow\.create\(\{ projectId:'alcove'/);
  assert.match(flow, /crypto\.subtle\.digest\('SHA-256'/);
  assert.match(flow, /prevHash: prev\?\.hash/);
  assert.doesNotMatch(shell, /recordAlcoveDecision|ACKNOWLEDGE REFERENCE ANSWER/);
});

test('a changed definition makes a new version; old versions are kept', () => {
  assert.match(base, /window\.STBAlcoveVersions\.push\(\{n:\(lastVersion\?lastVersion\.n:0\)\+1/);
  assert.match(shell, /kept, not edited/);
  assert.doesNotMatch(shell, /'alcove-order-version':'Version 1 · confirmed'/);
});

test('Configure shows the running modeled cell time from the Store answer', () => {
  assert.match(base, /id="p-cycle-run"/);
  for (const op of ['Cutting', 'Milling', 'Spot drilling', 'Total modeled cell time']) assert.ok(base.includes(op), op);
  assert.match(base, /machineEvaluation\|\|\{\}\)\.time/, 'cycle time must be read from the Store answer, not computed in the page');
});
