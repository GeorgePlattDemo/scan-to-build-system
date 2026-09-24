import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ACTOR_CARD_ORDER,
  ACTOR_ORDER,
  ACTORS,
  CLASS_REFERENCES,
  COPY,
  GR_SOURCE,
  INTAKE_CARDS,
  OWN_ENTRY,
  PDFJS,
  PRIMARY_PAGES,
  ROUTES,
  actorFromPath,
  projectHref,
  screenFromLocation,
  screenFromPath,
} from '../../shared/contracts.mjs';

test('locked landing copy is exact and ordered', () => {
  assert.equal(COPY.title, 'SCAN TO BUILD');
  assert.equal(COPY.tagline, 'Your idea. Your measurements. Your parts.');
  assert.deepEqual([...COPY.sequence], [
    'YOU SCAN',
    'YOU DEFINE',
    'YOU SELECT',
    'YOU CONFIRM YOUR DEFINITION',
    'YOUR DEFINITION REACHES THE CUT',
    'WE CUT · MILL · DRILL · LABEL',
    'YOU BUILD.',
  ]);
  assert.equal(
    COPY.service,
    'WE CUT · MILL · DRILL · LABEL — Within stated limits. Staged for pickup. We tell you when YOUR parts are ready.',
  );
  assert.equal(
    COPY.referenceDemonstration,
    'Reference demonstration. Ordering, physical fabrication, and pickup notifications are not available in this build.',
  );
  assert.equal(COPY.howStarting, 'HOW ARE YOU STARTING?');
  assert.equal(COPY.invariant, 'NO BLOOD ON WOOD');
  assert.equal(COPY.beginHeading, 'Begin your project');
});

test('exactly three actor orientations use the compact §21.2 copy', () => {
  assert.deepEqual([...ACTOR_ORDER], ['new', 'returning', 'professional']);
  assert.equal(Object.keys(ACTORS).length, 3);
  assert.equal(ACTORS.new.label, 'NEW USER');
  assert.equal(ACTORS.new.heading, 'Bring what you know.');
  assert.equal(
    ACTORS.new.body,
    'We keep what you provide and show what remains unknown. Measurements stay tied to their source. Fit, load, and code suitability need appropriate evidence and qualified review where required.',
  );
  assert.equal(ACTORS.returning.label, 'RETURNING USER');
  assert.equal(
    ACTORS.returning.heading,
    'Open your saved project, inspect what changed, or begin another.',
  );
  assert.equal(ACTORS.professional.label, 'PROFESSIONAL');
  assert.equal(ACTORS.professional.heading, 'Bring your drawing, takeoff or dimensions.');
  assert.equal(
    ACTORS.professional.body,
    'We retain the source and show what can become a definition. A file does not authorize fabrication.',
  );
});

test('all three orientations resolve to the same Begin route', () => {
  assert.equal(ROUTES.begin, '/begin');
  assert.equal(screenFromPath('/').name, 'landing');
  assert.equal(screenFromPath('/index.html').name, 'landing');
  assert.equal(actorFromPath('/start/new').id, 'new');
  assert.equal(actorFromPath('/start/returning').id, 'returning');
  assert.equal(actorFromPath('/start/professional').id, 'professional');
  assert.equal(screenFromPath('/begin').name, 'begin');
  assert.equal(screenFromPath('/project').name, 'project');
  assert.equal(PRIMARY_PAGES[0].label, 'Begin');
  assert.equal(PRIMARY_PAGES[0].implemented, true);
  assert.equal(PRIMARY_PAGES.length, 8);
  assert.equal(PRIMARY_PAGES[4].id, 'store');
  assert.equal(PRIMARY_PAGES[4].label, 'Store');
  assert.equal(PRIMARY_PAGES[4].implemented, true);
  assert.equal(PRIMARY_PAGES[5].id, 'confirm');
  assert.equal(PRIMARY_PAGES[5].label, 'Review');
  assert.equal(PRIMARY_PAGES[5].implemented, true);
  assert.equal(PRIMARY_PAGES[6].id, 'result');
  assert.equal(PRIMARY_PAGES[6].label, 'Result');
  assert.equal(PRIMARY_PAGES[6].implemented, true);
  assert.equal(PRIMARY_PAGES[7].id, 'record');
  assert.equal(PRIMARY_PAGES[7].implemented, true);
  assert.equal(
    PRIMARY_PAGES.filter((page) => page.implemented).length,
    5,
  );
});

test('Page 6 and Page 7 are existing project views, not new pathnames', () => {
  const review = screenFromLocation({
    pathname: '/project',
    search: '?id=local-1&view=confirm',
  });
  assert.equal(review.view, 'confirm');
  assert.equal(projectHref('local-1', 'confirm'), '/project?id=local-1&view=confirm');
  const result = screenFromLocation({
    pathname: '/project',
    search: '?id=local-1&view=result',
  });
  assert.equal(result.view, 'result');
  assert.equal(COPY.reviewHeading, 'Review your definition');
  assert.equal(COPY.reviewConfirm, 'Confirm this definition');
  assert.equal(COPY.reviewUnresolved, 'Save unresolved definition');
  assert.equal(COPY.resultRetained, 'Your definition is retained.');
});

test('Page 8 is the existing Record view, not a ninth primary page', () => {
  const screen = screenFromLocation({
    pathname: '/project',
    search: '?id=local-1&view=record',
  });
  assert.equal(screen.name, 'project');
  assert.equal(screen.view, 'record');
  assert.equal(screen.localRecordId, 'local-1');
  assert.equal(projectHref('local-1', 'record'), '/project?id=local-1&view=record');
  assert.equal(PRIMARY_PAGES[7].label, 'Record');
  assert.equal(COPY.recordHeading, 'Keep your project record');
  assert.equal(PRIMARY_PAGES.length, 8);
});

test('Page 5 is the existing Store view, not a ninth primary page', () => {
  const screen = screenFromLocation({
    pathname: '/project',
    search: '?id=local-1&view=store',
  });
  assert.equal(screen.name, 'project');
  assert.equal(screen.view, 'store');
  assert.equal(screen.localRecordId, 'local-1');
  assert.equal(screen.child, null);
  assert.equal(projectHref('local-1', 'store'), '/project?id=local-1&view=store');
  assert.equal(PRIMARY_PAGES.length, 8);
});

test('class register exposes two mapped candidate classes and one unclassified own start', () => {
  assert.equal(CLASS_REFERENCES.length, 2);
  const alcove = CLASS_REFERENCES.find((entry) => entry.classId === 'alcove-shelf-blanks');
  const picnic = CLASS_REFERENCES.find((entry) => entry.classId === 'classic-picnic-table-fixture');
  assert.ok(alcove);
  assert.equal(alcove.kind, 'mapped');
  assert.equal(alcove.label, 'Alcove shelf blanks — bounded reference');
  assert.equal(alcove.status, 'candidate-reference');
  assert.equal(alcove.storePath, 'unresolved');
  assert.equal(alcove.classVersion, '0.1-reference');
  assert.equal(alcove.ruleVersion, null);
  assert.equal(alcove.source.repository, GR_SOURCE.repository);
  assert.equal(alcove.source.pin, GR_SOURCE.pin);
  assert.equal(
    alcove.source.basis,
    'GR dimensional definition from roadmap §5.2 (bounded alcove shelf blanks)',
  );
  assert.equal(alcove.source.ruleVersion, null);
  assert.equal(alcove.source.sourceFile, null);
  assert.equal(alcove.source.executable, false);
  assert.equal(alcove.source.authority, false);

  assert.ok(picnic);
  assert.equal(picnic.kind, 'mapped');
  assert.equal(picnic.label, 'Classic Picnic Table — configurable demonstration');
  assert.equal(picnic.classVersion, '0.1-software-fixture');
  assert.equal(picnic.ruleVersion, 'classic.picnic-table.fixture/0.1');
  assert.equal(picnic.status, 'candidate-software-fixture');
  assert.equal(picnic.storePath, 'unresolved');
  assert.equal(picnic.source.authority, false);
  assert.equal(picnic.source.executable, false);
  assert.match(picnic.source.basis, /software-fixture assumptions/);

  assert.equal(OWN_ENTRY.kind, 'own');
  assert.equal(OWN_ENTRY.classId, null);
  assert.equal(OWN_ENTRY.classVersion, null);
  assert.equal(OWN_ENTRY.ruleVersion, null);
  assert.equal(OWN_ENTRY.source, null);
  assert.equal(OWN_ENTRY.unclassified, true);
  assert.equal(OWN_ENTRY.label, 'START YOUR OWN PROJECT');
});

test('page 2 intake cards keep locked names and planned versus active status', () => {
  assert.deepEqual(
    INTAKE_CARDS.map((card) => card.name),
    [
      'PICK A BOARD',
      'MEASUREMENTS',
      'SCAN A SPACE',
      'SKETCH / PHOTO',
      'DRAWING / PDF',
      'TAKEOFF / CUT LIST',
      'CAD / BIM / STRUCTURED FILE',
    ],
  );
  assert.equal(INTAKE_CARDS.find((card) => card.id === 'scan').status, 'planned');
  assert.equal(INTAKE_CARDS.find((card) => card.id === 'cad').status, 'planned');
  assert.equal(INTAKE_CARDS.find((card) => card.id === 'sketch').status, 'active');
  assert.equal(ACTOR_CARD_ORDER.new[0], 'board');
  assert.equal(ACTOR_CARD_ORDER.professional[0], 'drawing');
  assert.equal(PDFJS.version, '4.10.38');
  assert.equal(PDFJS.cdn, false);
  assert.equal(PDFJS.enableScripting, false);
});

