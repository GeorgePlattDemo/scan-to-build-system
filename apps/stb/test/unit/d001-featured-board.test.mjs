import assert from 'node:assert/strict';
import test from 'node:test';

import {
  D001_FEATURED_BOARD_DEFINITION,
  d001FeaturedBoardStoreSpec,
  evaluateD001FeaturedBoardRequirement,
} from '../../shared/d001-featured-board.mjs';

test('featured board keeps part-relative dado geometry without deciding Store support', () => {
  const result = evaluateD001FeaturedBoardRequirement({
    keptLengthIn: 60,
    features: [
      {
        kind: 'DADO',
        xFromLeftIn: 18,
        widthIn: 0.75,
        depthIn: 0.5,
      },
    ],
  });
  assert.equal(result.valid, true);
  assert.equal(result.normalized.features[0].depthIn, 0.5);
  assert.equal(result.normalized.features[0].extent, 'FULL_WIDTH');
});

test('pilot diameter is fixed at 3/16 and is not a user-selected family', () => {
  assert.equal(D001_FEATURED_BOARD_DEFINITION.pilotDiameterIn, 0.1875);
  const ok = evaluateD001FeaturedBoardRequirement({
    keptLengthIn: 60,
    features: [
      { kind: 'PILOT_FACE_3_16', xFromLeftIn: 20, yFromFenceIn: 1.75 },
      { kind: 'PILOT_EDGE_3_16', xFromLeftIn: 30, zFromTableIn: 0.75 },
    ],
  });
  assert.equal(ok.valid, true);
  assert.equal(ok.normalized.features[0].diameterIn, 0.1875);
  assert.equal(ok.normalized.features[1].diameterIn, 0.1875);

  const wrong = evaluateD001FeaturedBoardRequirement({
    keptLengthIn: 60,
    features: [
      { kind: 'PILOT_FACE_3_16', xFromLeftIn: 20, yFromFenceIn: 1.75, diameterIn: 0.25 },
    ],
  });
  assert.equal(wrong.valid, false);
  assert.equal(wrong.unresolvedReason, 'pilot-diameter-fixed-3-16');
});

test('app accepts bounded demand that Store may later mark unresolved', () => {
  const result = evaluateD001FeaturedBoardRequirement({
    keptLengthIn: 60,
    features: [
      { kind: 'ANGLED_END_SINGLE_PLANE', end: 'RIGHT', angleDeg: 30 },
      { kind: 'EDGE_NOTCH', xFromLeftIn: 12 },
      { kind: 'ROUTED_END', end: 'RIGHT' },
    ],
  });
  assert.equal(result.valid, true);
});

test('machine-local language cannot enter the featured-board requirement', () => {
  const result = evaluateD001FeaturedBoardRequirement({
    keptLengthIn: 60,
    features: [
      {
        kind: 'DADO',
        xFromLeftIn: 18,
        widthIn: 0.75,
        depthIn: 0.25,
        gcode: 'G1 X18',
      },
    ],
  });
  assert.equal(result.valid, false);
  assert.equal(result.unresolvedReason, 'machine-local-field-not-accepted:gcode');
});

test('Store spec contains only normalized part-relative demand', () => {
  const result = d001FeaturedBoardStoreSpec({
    keptLengthIn: 60,
    features: [
      { kind: 'DADO', xFromLeftIn: 18, widthIn: 0.75, depthIn: 0.375 },
      { kind: 'PILOT_FACE_3_16', xFromLeftIn: 24, yFromFenceIn: 1.75 },
    ],
  });
  assert.equal(result.valid, true);
  assert.equal(result.spec.keptLengthIn, 60);
  assert.equal(result.spec.features.length, 2);
  assert.equal(JSON.stringify(result.spec).includes('toolNumber'), false);
  assert.equal(JSON.stringify(result.spec).includes('stationXIn'), false);
  assert.equal(JSON.stringify(result.spec).includes('gcode'), false);
});
