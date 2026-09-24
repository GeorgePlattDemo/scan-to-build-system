import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('Job 1 Accept/Pay exposes exactly two customer actions and preserves receipt events', () => {
  const shell=fs.readFileSync(new URL('../system-build-current.html',import.meta.url),'utf8');
  const start=shell.indexOf("ensureProjectJourneyPage('proof-accept'");
  const end=shell.indexOf("ensureProjectJourneyPage('proof-yard'",start);
  assert.ok(start>=0 && end>start);
  const block=shell.slice(start,end);
  const buttons=[...block.matchAll(/<button\b/g)];
  assert.equal(buttons.length,2);
  assert.match(block,/data-proof-return-source>← GO BACK \/ CHANGE DEFINITION<\/button>/);
  assert.match(block,/data-proof-sim-action="accept-pay-yard">ACCEPT ESTIMATE \/ PAY \/ SEND TO YARD →<\/button>/);
  assert.equal(block.includes('CREATE SIMULATED OFFER'),false);
  assert.equal(block.includes('ACCEPT SIMULATED OFFER'),false);
  assert.equal(block.includes('SIMULATE PAYMENT'),false);

  assert.match(shell,/action==='accept-pay-yard'[\s\S]*SIMULATED_OFFER[\s\S]*SIMULATED_ACCEPTANCE[\s\S]*SIMULATED_PAYMENT[\s\S]*originalShow\.call\(win,'proof-yard'\)/);
});
