import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateSheetRequirement } from '../../shared/sheet-rule.mjs';
import { radiusFromChordRise } from '../../shared/circular-segment.mjs';
import { representMode2CircularSegment } from '../../shared/mode2-reference-path.mjs';

test('arched aperture keeps a reconstructable circular segment', () => {
  assert.equal(radiusFromChordRise(36, 12), 19.5);
  const ok = evaluateSheetRequirement({
    profileKind: 'ARCHED_APERTURE',
    blankL: 72,
    blankW: 48,
    tabCount: 4,
    routeDepthIn: 0.5,
    unit: 'in',
    apertureW: 36,
    apertureStraightH: 36,
    arcChord: 36,
    arcRise: 12,
    arcRadius: 19.5,
  });
  assert.equal(ok.valid, true);
  assert.equal(ok.geometryClass, 'CURVILINEAR');
  assert.equal(ok.aperture.arcRadius, 19.5);
  assert.equal(ok.retentionClass, 'STENCIL_TABS');
});

test('contradictory or missing curve data is not accepted as CURVILINEAR', () => {
  const contradiction = evaluateSheetRequirement({
    profileKind: 'ARCHED_APERTURE',
    blankL: 72,
    blankW: 48,
    tabCount: 4,
    routeDepthIn: 0.5,
    unit: 'in',
    apertureW: 36,
    apertureStraightH: 36,
    arcChord: 36,
    arcRise: 12,
    arcRadius: 40,
  });
  assert.equal(contradiction.valid, false);
  assert.equal(contradiction.unresolvedReason, 'curve-contradiction');

  const missing = evaluateSheetRequirement({
    profileKind: 'ARCHED_APERTURE',
    blankL: 72,
    blankW: 48,
    tabCount: 4,
    routeDepthIn: 0.5,
    unit: 'in',
  });
  assert.equal(missing.valid, false);
  assert.equal(missing.unresolvedReason, 'missing-curve');

  const outside = evaluateSheetRequirement({
    profileKind: 'ARCHED_APERTURE',
    blankL: 72,
    blankW: 48,
    tabCount: 4,
    routeDepthIn: 0.5,
    unit: 'in',
    apertureW: 36,
    apertureStraightH: 70,
    arcChord: 36,
    arcRise: 12,
    arcRadius: 19.5,
  });
  assert.equal(outside.valid, false);
  assert.equal(outside.unresolvedReason, 'aperture-outside-outer');
});

test('reference path object is not executable machine language', () => {
  const path = representMode2CircularSegment();
  assert.equal(path.ok, true);
  assert.equal(path.executable, false);
  assert.equal(path.relationship.sheet, 'X');
  assert.equal(path.relationship.tool, 'Y');
  assert.equal(path.relationship.router, 'bounded Z');
  assert.ok(path.samples.length >= 3);
  assert.equal(path.samples.every((p) => p.geometryAxisZ === false), true);
  assert.equal(path.retention.fullSeverance, false);
  assert.ok(path.not_emitted.includes('G-code'));
});
