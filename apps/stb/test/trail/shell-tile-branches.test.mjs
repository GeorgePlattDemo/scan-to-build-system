// Shell tile-branch ratchet (System AGENTS.md, "Trail rules"): shared behavior does not branch on tile identity.
//
// Counts tile-identity branches in the shared shell code and holds them under a ceiling.
// - The count may not rise above CEILING. A new branch fails this test.
// - The count may fall. When it does, lower CEILING to the new count in the same PR so it stays down.
//
// What counts, in SHELL_FILES only (tile pages are out of scope):
//   1. activeJourneyProject compared with a declared tile id: ===, !==, ==, !=, either operand order,
//      and `case 'tile-id':` under a switch on activeJourneyProject.
//   2. Per-tile nav functions: a function whose name carries a declared tile's name and a nav word
//      (Nav or Go), e.g. applyAlcoveNavState, wireStartOwnJourneyNav, seatGo.
// Tile ids come from public-build/stb-trail-contract.js, so a newly declared tile is counted too.
// A registry keyed by tile id (e.g. TRAIL_NAV_CONTEXT) is not a branch and is not counted.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../public-build/', import.meta.url));

const SHELL_FILES = [
  'system-build-current.html',
  'system-build-front-door-0.5.html',
];

// Recorded on System main 2ad8cff (#129, docs/idea-intent-vocabulary, head c7ab5b8): 29.
// Lowered to 24 on system/playhouse-on-shared-host: Playhouse moved onto the shared tile host
// (applyPlayhouseNavState and four activeJourneyProject === 'playhouse' comparisons removed).
// Lowered to 19 on system/window-seat-on-shared-host: Window Seat moved onto the shared tile host
// (seatGo, seatNavButton, applySeatNavState and two activeJourneyProject 'window-seat' comparisons removed).
// Lowered to 11 on system/alcove-on-shared-host: Alcove moved onto the shared tile host
// (applyAlcoveNavState and seven activeJourneyProject 'alcove' comparisons removed).
// Lowered to 7 on system/outdoor-on-shared-host: Outdoor moved onto the shared tile host
// (applyOutdoorNavState and three activeJourneyProject 'outdoor' comparisons removed).
// system-build-current.html: 5 activeJourneyProject comparisons + 2 per-tile nav functions.
// system-build-front-door-0.5.html: 0 + 0.
const CEILING = 7;

const sandbox = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'stb-trail-contract.js'), 'utf8'), sandbox, { filename: 'stb-trail-contract.js' });
const TILE_IDS = sandbox.STBTrailContract.tiles.map(tile => tile.id);

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const camel = id => id.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');

// 1. activeJourneyProject compared with a tile id literal.
const idAlt = TILE_IDS.map(escape).join('|');
const quoted = n => `(['"\`])(?:${idAlt})\\${n}`; // n = backreference number of the quote group
const COMPARISON = new RegExp(
  `\\bactiveJourneyProject\\s*[!=]==?\\s*${quoted(1)}` +
  `|${quoted(2)}\\s*[!=]==?\\s*activeJourneyProject\\b`,
  'g',
);
const SWITCH = /\bswitch\s*\(\s*activeJourneyProject\s*\)\s*\{/g;
const CASE = new RegExp(`\\bcase\\s+${quoted(1)}\\s*:`, 'g');

// 2. Per-tile nav functions. A tile's name is its camel-cased id (StartOwn, WindowSeat) or, for a
// hyphenated id, its last word (Seat), matched as a camelCase word so "dropdownNav" is not "Own".
const tileWords = [...new Set(TILE_IDS.flatMap(id => {
  const words = [camel(id)];
  if (id.includes('-')) words.push(camel(id.split('-').pop()));
  return words;
}))];
const startsWithTile = name => tileWords.some(w => name.startsWith(w[0].toLowerCase() + w.slice(1)));
const hasTileWord = name => tileWords.some(w => new RegExp(`[a-z0-9_$]${w}(?![a-z])`).test(name)) || startsWithTile(name);
const hasNavWord = name => /^(nav|go)(?![a-z])|[a-z0-9_$](Nav|Go)(?![a-z])/.test(name);
const FUNCTION_NAMES = /\bfunction\s+([A-Za-z_$][\w$]*)|\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:function\b|\([^()]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/g;

function countFile(file) {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const comparisons = (source.match(COMPARISON) || []).length;
  let switchCases = 0;
  for (const m of source.matchAll(SWITCH)) {
    // Count tile-id cases in the switch body (up to its matching brace).
    let depth = 1, i = m.index + m[0].length;
    for (; i < source.length && depth; i++) depth += source[i] === '{' ? 1 : source[i] === '}' ? -1 : 0;
    switchCases += (source.slice(m.index, i).match(CASE) || []).length;
  }
  const navFunctions = [...source.matchAll(FUNCTION_NAMES)]
    .map(m => m[1] || m[2])
    .filter(name => hasTileWord(name) && hasNavWord(name));
  return { file, comparisons: comparisons + switchCases, navFunctions };
}

test('shared shell code does not gain tile-identity branches (ratchet)', () => {
  assert.ok(TILE_IDS.length > 0, 'trail contract declares no tiles');
  const results = SHELL_FILES.map(countFile);
  const total = results.reduce((sum, r) => sum + r.comparisons + r.navFunctions.length, 0);
  const report = results
    .map(r => `  ${r.file}: ${r.comparisons} activeJourneyProject tile comparisons, ${r.navFunctions.length} per-tile nav functions [${r.navFunctions.join(', ')}]`)
    .join('\n');
  console.log(`shell tile-identity branches: ${total} (ceiling ${CEILING})\n${report}`);

  assert.ok(total <= CEILING,
    `Shared shell gained tile-identity branches: ${total} > ceiling ${CEILING}. ` +
    `Shared behavior does not branch on tile identity; put the difference in contract data with an owner.\n${report}`);
  assert.equal(total, CEILING,
    `Tile-identity branches fell to ${total}. Lower CEILING in this test to ${total} so it stays down.\n${report}`);
});
