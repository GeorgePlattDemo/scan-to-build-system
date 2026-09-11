import { SHEET_DEFINITION } from './contracts.mjs';
import { canonicalInchString } from './canonical.mjs';

function emptyEvaluation(unresolvedReason, extra = {}) {
  return {
    valid: false,
    unresolvedReason,
    profileKind: extra.profileKind ?? null,
    blankL: null,
    blankW: null,
    tabCount: extra.tabCount ?? null,
    routeDepthIn: extra.routeDepthIn ?? null,
    unit: SHEET_DEFINITION.unit,
  };
}

export function evaluateSheetRequirement(input) {
  if (!input) {
    return emptyEvaluation('missing-sheet-definition');
  }
  const profileKind = input.profileKind ?? null;
  if (!profileKind) {
    return emptyEvaluation('missing-profile-kind');
  }
  if (!SHEET_DEFINITION.profileKinds.includes(profileKind)) {
    return emptyEvaluation('unsupported-profile-kind', { profileKind });
  }

  const unit = input.unit ?? SHEET_DEFINITION.unit;
  if (unit !== SHEET_DEFINITION.unit) {
    return emptyEvaluation('unsupported-unit', { profileKind });
  }

  const L = input.blankL;
  const W = input.blankW;
  if (L == null || W == null) {
    return emptyEvaluation('missing-blank-size', { profileKind });
  }
  if (!(Number.isFinite(L) && Number.isFinite(W))) {
    return emptyEvaluation('nonfinite', { profileKind });
  }
  if (L < SHEET_DEFINITION.minInches || W < SHEET_DEFINITION.minInches) {
    return emptyEvaluation('below-minimum', { profileKind });
  }
  if (L > SHEET_DEFINITION.maxLengthInches || W > SHEET_DEFINITION.maxWidthInches) {
    return emptyEvaluation('above-maximum', { profileKind });
  }

  const tabCount = input.tabCount;
  if (tabCount == null) {
    return emptyEvaluation('missing-tab-count', { profileKind });
  }
  if (!Number.isInteger(tabCount) || tabCount < SHEET_DEFINITION.minTabCount) {
    return emptyEvaluation('tabs-required', { profileKind, tabCount });
  }

  const routeDepthIn = input.routeDepthIn;
  if (routeDepthIn == null) {
    return emptyEvaluation('missing-route-depth', { profileKind, tabCount });
  }
  if (!Number.isFinite(routeDepthIn) || routeDepthIn <= 0) {
    return emptyEvaluation('invalid-route-depth', { profileKind, tabCount, routeDepthIn });
  }
  if (routeDepthIn > SHEET_DEFINITION.maxRouteDepthInches) {
    return emptyEvaluation('route-depth-above-envelope', { profileKind, tabCount, routeDepthIn });
  }

  if (input.spline || input.toolpath || input.gcode || input.controller) {
    return emptyEvaluation('machine-local-language', { profileKind, tabCount, routeDepthIn });
  }

  return {
    valid: true,
    unresolvedReason: null,
    profileKind,
    blankL: L,
    blankW: W,
    blankLCanonical: canonicalInchString(L),
    blankWCanonical: canonicalInchString(W),
    tabCount,
    routeDepthIn,
    routeDepthCanonical: canonicalInchString(routeDepthIn),
    unit: SHEET_DEFINITION.unit,
  };
}
