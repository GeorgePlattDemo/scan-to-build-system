// Outdoor 0.4 carries the plan rule's sizes and unresolved notes, because the published site can't load
// apps/stb/shared/picnic-rule.mjs. This test keeps the page identical to the rule, and checks the page's own
// promises in its source: the plans' angles are the plans', and the page holds no Store logic.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { PICNIC_FIXTURE, evaluatePicnicConfiguration, normalizePicnicConfiguration } from '../../shared/picnic-rule.mjs';

const page = fs.readFileSync(new URL('../../public-build/stb-outdoor-picnic-0.4.html', import.meta.url), 'utf8');
const script = page.slice(page.indexOf('<script>\n'));
const ruleSource = script.match(/const RULE=(Object\.freeze\(\{[\s\S]*?\}\));\n/)[1];
const RULE = vm.runInNewContext('(' + ruleSource + ')');
const ruled = evaluatePicnicConfiguration(normalizePicnicConfiguration({ productLength: '72', requestedScope: 'complete-part-set' }));

test('sizes come from the plan rule: its range, to the inch, and its reference lengths', () => {
  assert.deepEqual({ ...RULE.lengthIn }, { min: PICNIC_FIXTURE.candidateProductLengthRange.min, max: PICNIC_FIXTURE.candidateProductLengthRange.max });
  assert.deepEqual([...RULE.referenceLengthsIn], [...PICNIC_FIXTURE.referenceProductLengths]);
  assert.match(page, /id="len"[^>]*step="1"/, 'the length moves to the inch');
  assert.match(page, /data-size="1"/);
  // Nothing outside the rule is offered: every way of changing the length clamps to the rule's range.
  assert.match(script, /const clampLen=n=>Math\.min\(RULE\.lengthIn\.max,Math\.max\(RULE\.lengthIn\.min,Math\.round\(Number\(n\)\)\)\)/);
  assert.match(script, /function setLength\(n\)\{if\(!S\.cfg\)return;n=clampLen\(n\)/, 'every way of changing the length goes through setLength');
});

test('the rule\'s unresolved notes and disclosure are carried whole', () => {
  assert.deepEqual([...RULE.unresolved], ruled.unresolvedConditions);
  assert.equal(RULE.disclosure, ruled.disclosure);
  for (const code of ruled.unresolvedConditions) assert.match(script, new RegExp(code + ':\''), 'plain words for ' + code);
});

test('the plans\' angles are the plans\': 25° on the A-frame legs and cross supports, square elsewhere', () => {
  assert.match(script, /\{id:'LEGS',label:'Legs',board:\[2,6\],angle:25,/);
  assert.match(script, /\{id:'BRACES',label:'Cross supports',board:\[2,4\],angle:25,/);
  assert.equal((script.match(/angle:25/g) || []).length, 2, 'no other 25° part');
  assert.match(script, /\{id:'SLATS',label:'Tabletop and seat boards',board:\[2,6\],angle:0,scales:true,/);
  assert.match(script, /\{id:'SLATS',label:'Table and bench slats',board:\[2,4\],angle:0,scales:true,/);
  assert.match(script, /\{id:'FRAMES',label:'Legs and supports',board:\[2,4\],angle:0,parts/);
});

test('no Store logic and no automatic holes in the page', () => {
  assert.doesNotMatch(script, /STB-ZERO-/, 'no Store item numbers');
  assert.doesNotMatch(script, /sellingPrice|onHand|MAX_CUT|45\s*°?\s*\)|angle\s*>\s*45|<=\s*45/, 'no Store price, stock or angle limit');
  assert.doesNotMatch(script, /centered\(/, 'no automatic screw-hole spots');
  assert.doesNotMatch(page, /every screw hole/i);
  assert.match(page, /photo of a finished table, not a drawing/i, 'the pictures are named as photos');
  // Hole locations: published plans aren't detailed enough to drill from. The page says so, and draws none until the customer places them.
  assert.match(script, /'Hole locations','Published plans aren’t detailed enough to drill from/);
  assert.match(script, /hole locations: not published by the plan · none until you place them/);
  // A decorative cut is offered only on boards whose ends are square in the plan.
  assert.match(script, /if\(p\.g\.angle===0\)k\.push\('DECO:'\+p\.kind\)/);
  assert.match(script, /const decoAngle=\(p,g\)=>g\.angle===0&&/);
  // The edge page states no angle limit of its own: the Store decides.
  assert.doesNotMatch(script, /0° to 45°|past 45°/);
});
