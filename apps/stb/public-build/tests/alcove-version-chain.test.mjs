import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// Rule 10 (information before atoms) and the Alcove version chain.
// The chain has five links, read from the Store Zero answer (1-3) and hashed in the app (4-5).
const shell = fs.readFileSync(new URL('../system-build-current.html', import.meta.url), 'utf8');
const base = fs.readFileSync(new URL('../system-build-base-8d8a9dd.html', import.meta.url), 'utf8');

test('Alcove chain shows all five links on the Store, Your call, Yard and Record pages', () => {
  for (const link of ['1 · SENT', '2 · ARRIVED AT STORE ZERO', '3 · ANSWERED', '4 · YOUR CALL', '5 · FINAL VERSION']) {
    assert.ok(shell.includes(link), `chain link missing: ${link}`);
  }
  assert.match(shell, /\['store', 'request', 'yard', 'record'\]\.forEach\(pageId =>/);
  assert.match(shell, /YOUR DEFINITION · SENT/);
  assert.match(shell, /STORE ZERO · ARRIVAL RECEIPT/);
  assert.match(shell, /receipt\.receiptHash/, 'arrival receipt hash must come from the Store answer');
  assert.match(shell, /answer\.payloadDigest/, 'sent hash must come from the Store answer');
});

test('decisions and the final version are hashed, never plain labels', () => {
  assert.match(shell, /recordAlcoveDecision\('DECLINED'\)/);
  assert.match(shell, /recordAlcoveDecision\('ACKNOWLEDGED'\)/);
  assert.match(shell, /recordAlcoveOrder\(\);\s*originalShow\.call\(win,'yard'\)/);
  assert.match(shell, /crypto\.subtle\.digest\('SHA-256'/);
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
