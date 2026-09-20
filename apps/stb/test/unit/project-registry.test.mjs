import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_PROJECT_STAGES,
  getProjectDefinition,
  listCanonicalProjects,
  resolveProjectStage,
} from '../../shared/project-registry.mjs';

test('registry exposes exactly the five canonical visible project identities', () => {
  assert.deepEqual(
    listCanonicalProjects().map((entry) => entry.projectId),
    ['start-own', 'outdoor', 'alcove', 'window-seat', 's001'],
  );
});

test('every project declares the same legal actor-stage order', () => {
  assert.deepEqual(CANONICAL_PROJECT_STAGES, [
    'scan-evidence',
    'configure',
    'store-answer',
    'accept-pay',
    'store-yard',
    'handoff-record',
  ]);
  for (const entry of listCanonicalProjects()) {
    assert.deepEqual(entry.legalStages, CANONICAL_PROJECT_STAGES);
  }
});

test('stage resolution is current project plus requested stage and never selects another project', () => {
  const alcove = resolveProjectStage('alcove', 'store-answer');
  const seat = resolveProjectStage('window-seat', 'store-answer');
  assert.equal(alcove.projectId, 'alcove');
  assert.equal(seat.projectId, 'window-seat');
  assert.notEqual(alcove.destination, seat.destination);
});

test('unknown project or stage fails closed', () => {
  assert.equal(resolveProjectStage('unknown', 'configure'), null);
  assert.equal(resolveProjectStage('alcove', 'unknown'), null);
});

test('Alcove remains project-native for economics and Window Seat remains gold-standard donor', () => {
  const alcove = getProjectDefinition('alcove');
  const seat = getProjectDefinition('window-seat');
  assert.equal(alcove.sourceAuthority.economicsOwner, 'project-native');
  assert.equal(alcove.storeAdapterPath, 'project-native-alcove');
  assert.equal(seat.sourceAuthority.goldStandard, true);
  assert.equal(seat.sourceAuthority.blob, '96c85feef57b1196093e56495e7141452fc749a4');
});

test('S-001 remains System-native and retains exact accepted Store proof pin', () => {
  const s001 = getProjectDefinition('s001');
  assert.equal(s001.hostMode, 'system-native');
  assert.equal(s001.sourceAuthority.storeProofPin, '4402abeb6b0299a5b6db2eec85ed04c3b0236bcc');
});


test('Start Your Own uses the admitted Grab a Board child and exact path-specific Store pin', () => {
  const startOwn = getProjectDefinition('start-own');
  assert.equal(startOwn.entryArtifact, '/project-children/stb-start-own-picnic-leg-0.1.html');
  assert.equal(startOwn.sourceAuthority.class, 'SYSTEM_ADMITTED_USER_DEFINED_CHILD');
  assert.equal(startOwn.sourceAuthority.donorSha256, '455db6e8351c9f5f28feac98e80461c852cd0f7682a9834a378bbedc82c17fed');
  assert.equal(startOwn.sourceAuthority.storePin, '0e9ac7a5d83575ebe0e0e2b5f63b266f2431b24c');
  assert.equal(startOwn.storeAdapterPath, 'start-own-store-http/1');
  assert.equal(startOwn.sourceAuthority.priorReviewImplementationBlob, '45132afea1cc796b10e0fb667a7d2db3ee10e284');
});
