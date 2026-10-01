(function(g){
  'use strict';

  // STB trail contract: one protocol for every project tile.
  // The nine trail rules live in System AGENTS.md ("Trail rules"). This file is the machine-readable half:
  // Idea is the unnumbered intake, then the six steps every trail uses, plus the pages that belong to each tile.
  // Adding a tile means adding it here. Nothing else. The trail scoreboard test picks it up automatically.

  const VERSION = 'STB-TRAIL-CONTRACT-0.2';

  // Rule 1: Idea is intake, not a step. Intent is step 1 for every tile.
  const IDEA = Object.freeze({ label: 'Idea', numbered: false, role: 'intake' });
  const STEPS = Object.freeze([
    'Intent',
    'The bench',
    'The Store answers',
    'Your call',
    'We cut it',
    'Pick up & build'
  ]);

  // Pages outside every trail. The top nav may lead here and still be inside the rules.
  const SHARED_PAGES = Object.freeze(['landing', 'projects']);

  // Rule 2: every visible trail button lands on one of the current tile's own pages.
  // A page belongs to exactly one tile. `tileLabel` is the text on the Shared Home tile.
  const TILES = Object.freeze([
    Object.freeze({
      id: 'start-own',
      tileLabel: 'Start your own',
      pages: Object.freeze(['start-own-live', 'proof-store', 'proof-accept', 'proof-yard', 'proof-terms', 'proof-record'])
    }),
    Object.freeze({
      id: 'alcove',
      tileLabel: 'Critical fit',
      pages: Object.freeze(['alcove-capture', 'alcove-config', 'alcove-review', 'store', 'request', 'yard', 'terms', 'recap', 'record'])
    }),
    Object.freeze({
      id: 'window-seat',
      tileLabel: 'Space utilization',
      pages: Object.freeze(['window-seat-live'])
    }),
    Object.freeze({
      id: 'outdoor',
      tileLabel: 'Outdoor build',
      pages: Object.freeze(['outdoor-build-live'])
    }),
    Object.freeze({
      id: 'playhouse',
      tileLabel: 'Playhouse arched window',
      pages: Object.freeze(['playhouse-s001', 'playhouse-machine', 'playhouse-store', 'playhouse-review', 'playhouse-request', 'playhouse-yard', 'playhouse-terms', 'playhouse-result', 'playhouse-record'])
    })
  ]);

  // Rule 7: one presentation exception, declared once. It changes no operational rule.
  const PRESENTATION_FORKS = Object.freeze([
    Object.freeze({
      tileId: 'window-seat',
      line: 'Idea',
      options: Object.freeze(['Intent', 'One full scroll'])
    })
  ]);

  // No tile is exempt from the trail rules.
  const EXCEPTION_IDS = Object.freeze([]);

  g.STBTrailContract = Object.freeze({
    version: VERSION,
    idea: IDEA,
    steps: STEPS,
    sharedPages: SHARED_PAGES,
    tiles: TILES,
    presentationForks: PRESENTATION_FORKS,
    exceptionIds: EXCEPTION_IDS
  });
})(typeof window !== 'undefined' ? window : globalThis);
