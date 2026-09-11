import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateSheetRequirement } from '../../shared/sheet-rule.mjs';

test('straight and curvilinear sheet requirements stay distinct', () => {
  const straight = evaluateSheetRequirement({
    profileKind: 'STRAIGHT_RECT',
    blankL: 24,
    blankW: 18,
    tabCount: 4,
    routeDepthIn: 0.5,
    unit: 'in',
  });
  const curve = evaluateSheetRequirement({
    profileKind: 'CURVILINEAR_OUTLINE',
    blankL: 24,
    blankW: 18,
    tabCount: 4,
    routeDepthIn: 0.5,
    unit: 'in',
  });
  assert.equal(straight.valid, true);
  assert.equal(curve.valid, true);
  assert.equal(straight.profileKind, 'STRAIGHT_RECT');
  assert.equal(curve.profileKind, 'CURVILINEAR_OUTLINE');
});

test('sheet rule refuses missing tabs and machine-local language', () => {
  const tabs = evaluateSheetRequirement({
    profileKind: 'STRAIGHT_RECT',
    blankL: 24,
    blankW: 18,
    tabCount: 0,
    routeDepthIn: 0.5,
    unit: 'in',
  });
  assert.equal(tabs.valid, false);
  assert.equal(tabs.unresolvedReason, 'tabs-required');

  const gcode = evaluateSheetRequirement({
    profileKind: 'STRAIGHT_RECT',
    blankL: 24,
    blankW: 18,
    tabCount: 4,
    routeDepthIn: 0.5,
    unit: 'in',
    gcode: 'G0 X0',
  });
  assert.equal(gcode.valid, false);
  assert.equal(gcode.unresolvedReason, 'machine-local-language');
});
