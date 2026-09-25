(function(g){
  'use strict';

  // STB trail contract: one protocol for every project tile.
  // The nine trail rules live in System AGENTS.md ("Trail rules"). This file is the machine-readable half:
  // the six steps every trail uses, and which pages belong to which tile.
  // Adding a tile means adding it here. Nothing else. The trail scoreboard test picks it up automatically.

  const VERSION = 'STB-TRAIL-CONTRACT-0.1';

  // Rule 1: one trail, same steps, same order, same labels.
  const STEPS = Object.freeze([
    'Your idea',
    'Make it yours',
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
      id: 'outdoor',
      tileLabel: 'Outdoor build',
      pages: Object.freeze(['outdoor-build-live'])
    }),
    Object.freeze({
      id: 'alcove',
      tileLabel: 'Critical fit',
      pages: Object.freeze(['alcove-capture', 'alcove-config', 'alcove-review', 'store', 'request', 'yard', 'terms', 'recap', 'record'])
    }),
    Object.freeze({
      id: 'window-seat',
      tileLabel: 'Space utilization',
      pages: Object.freeze(['window-seat-live']),
      // Rule 7: the one declared exception. Window Seat keeps its long-scroll configurator and is not
      // held to the trail rules until it is separately brought in. No other tile may use this flag.
      exception: 'Window Seat: long-scroll configurator, outside the trail rules until separately brought in.'
    }),
    Object.freeze({
      id: 'playhouse',
      tileLabel: 'Playhouse arched window',
      pages: Object.freeze(['playhouse-s001', 'playhouse-machine', 'playhouse-store', 'playhouse-review', 'playhouse-request', 'playhouse-yard', 'playhouse-terms', 'playhouse-result', 'playhouse-record'])
    })
  ]);

  const EXCEPTION_IDS = Object.freeze(TILES.filter(tile => tile.exception).map(tile => tile.id));

  g.STBTrailContract = Object.freeze({
    version: VERSION,
    steps: STEPS,
    sharedPages: SHARED_PAGES,
    tiles: TILES,
    exceptionIds: EXCEPTION_IDS
  });
})(typeof window !== 'undefined' ? window : globalThis);
