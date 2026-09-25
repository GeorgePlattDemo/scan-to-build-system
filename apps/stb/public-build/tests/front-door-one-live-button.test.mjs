import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

// Front-door contract (Phase 0):
// each door has Back plus exactly ONE live forward button, which goes to the Shared Home (#projects).
// New user: LATER (browse and play without an account). Returning and Professional: SHARED HOME →.
// Every other door button is shown but inert, marked COMING, and listed under "Build later" in that door's Dev Guide.
// No demo-account buttons. Wrapper layers route; they never remove or inject door buttons.

const base = fs.readFileSync(new URL('../system-build-base-8d8a9dd.html', import.meta.url), 'utf8');
const middle = fs.readFileSync(new URL('../system-build-front-door-0.5.html', import.meta.url), 'utf8');
const guideSource = fs.readFileSync(new URL('../stb-build-guide-spec.js', import.meta.url), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(guideSource, sandbox, { filename: 'stb-build-guide-spec.js' });
const guide = sandbox.window.STBBuildGuideSpec;

const DOORS = ['new-user', 'returning', 'professional'];
const FORWARD = { 'new-user': 'LATER', returning: 'SHARED HOME →', professional: 'SHARED HOME →' };

function section(id) {
  const start = base.indexOf(`<section class="page" id="${id}">`);
  assert.ok(start >= 0, `door page missing: ${id}`);
  return base.slice(start, base.indexOf('</section>', start));
}
const buttons = html => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
  .map(m => ({ attrs: m[1], text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() }));

for (const id of DOORS) {
  test(`${id}: one live forward button to the Shared Home`, () => {
    const btns = buttons(section(id));
    const live = btns.filter(b => !/\bdisabled\b/.test(b.attrs));
    assert.equal(live.length, 1, `${id} must have exactly one live button, found: ${live.map(b => b.text).join(', ')}`);
    assert.equal(live[0].text, FORWARD[id]);
    assert.match(live[0].attrs, /data-canonical-go="projects"/);
    assert.match(live[0].attrs, /data-door-forward="true"/);
  });

  test(`${id}: one row of buttons, live button last`, () => {
    const sec = section(id);
    const rows = [...sec.matchAll(/<div class="btns[^"]*">([\s\S]*?)<\/div>/g)];
    assert.equal(rows.length, 1, `${id} must have exactly one button row`);
    const inRow = buttons(rows[0][1]);
    assert.equal(inRow.length, buttons(sec).length, `${id} has buttons outside its row`);
    assert.ok(!/\bdisabled\b/.test(inRow.at(-1).attrs), `${id} live button must be last in the row`);
  });

  test(`${id}: every other button is inert, marked COMING, and in the Dev Guide`, () => {
    const inert = buttons(section(id)).filter(b => /\bdisabled\b/.test(b.attrs));
    assert.ok(inert.length >= 1, `${id} should show its future buttons`);
    const later = (guide.pages[id].later || []).map(row => row[0]);
    for (const b of inert) {
      assert.match(b.attrs, /data-coming="[^"]+"/, `${b.text} lacks data-coming`);
      assert.match(b.attrs, /aria-disabled="true"/, `${b.text} lacks aria-disabled`);
      assert.doesNotMatch(b.attrs, /data-(canonical-)?go=/, `${b.text} is inert but routes somewhere`);
      const label = b.text.replace(/COMING$/, '').trim();
      assert.ok(later.includes(label), `${label} is not listed under Build later in the ${id} Dev Guide`);
    }
    assert.equal(later.length, inert.length, `${id} Dev Guide lists a Build later item with no button`);
  });

  test(`${id}: no demo-account buttons`, () => {
    assert.doesNotMatch(section(id), /data-demo-account|demo-account-gate/);
  });
}

test('new-user: LATER is explained on screen and in the Dev Guide', () => {
  assert.match(section('new-user'), /If not at all, hit “Later\.”/);
  const rows = guide.pages['new-user'].rows.map(row => row[0] + ' ' + row[1]).join(' | ');
  assert.match(rows, /Play without an account/);
  assert.match(rows, /Saving or buying asks who you are/);
});

test('wrapper layer routes but never removes or injects door buttons', () => {
  assert.doesNotMatch(middle, /#(new-user|returning|professional)\b[^\n]*\.(remove|append|replaceWith|prepend|insertAdjacent)/);
  assert.doesNotMatch(middle, /NEXT → HOME|data-professional-shared-home|data-new-user-home|replaceEntryHomeButton/);
});
