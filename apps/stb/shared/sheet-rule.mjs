import { SHEET_DEFINITION } from './contracts.mjs';
import { canonicalInchString } from './canonical.mjs';
import { evaluateCircularSegment } from './circular-segment.mjs';

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
    geometryClass: extra.geometryClass ?? null,
    aperture: extra.aperture ?? null,
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

  let geometryClass = null;
  let aperture = null;
  if (profileKind === 'ARCHED_APERTURE') {
    const apertureW = input.apertureW;
    const apertureStraightH = input.apertureStraightH;
    const chord = input.arcChord;
    const rise = input.arcRise;
    const radius = input.arcRadius;
    if (apertureW == null || apertureStraightH == null || chord == null || rise == null) {
      return emptyEvaluation('missing-curve', { profileKind, tabCount, routeDepthIn });
    }
    if (![apertureW, apertureStraightH, chord, rise, radius ?? chord].every((value) => Number.isFinite(value))) {
      return emptyEvaluation('curve-not-numeric', { profileKind, tabCount, routeDepthIn });
    }
    const unit = input.unit ?? SHEET_DEFINITION.unit;
    if (unit !== SHEET_DEFINITION.unit) {
      return emptyEvaluation('unsupported-unit', { profileKind, tabCount, routeDepthIn });
    }
    const curve = evaluateCircularSegment({
      chord_in: chord,
      rise_in: rise,
      radius_in: radius,
    });
    if (!curve.ok) {
      return emptyEvaluation(curve.reason, { profileKind, tabCount, routeDepthIn });
    }
    if (apertureW !== chord) {
      return emptyEvaluation('aperture-width-must-equal-chord', { profileKind, tabCount, routeDepthIn });
    }
    const openingH = apertureStraightH + rise;
    const margin = SHEET_DEFINITION.minApertureMarginInches;
    if (apertureW + 2 * margin > W || openingH + 2 * margin > L) {
      return emptyEvaluation('aperture-outside-outer', { profileKind, tabCount, routeDepthIn });
    }
    geometryClass = 'CURVILINEAR';
    aperture = {
      kind: 'ARCHED_RECT',
      width: apertureW,
      straightHeight: apertureStraightH,
      arcChord: chord,
      arcRise: rise,
      arcRadius: curve.radius_in,
      derivedRadius: curve.derivedRadius_in,
      widthCanonical: canonicalInchString(apertureW),
      straightHeightCanonical: canonicalInchString(apertureStraightH),
      chordCanonical: canonicalInchString(chord),
      riseCanonical: canonicalInchString(rise),
      radiusCanonical: canonicalInchString(curve.radius_in),
    };
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
    geometryClass,
    aperture,
    processClass: 'MODE2_STENCIL_ROUTE',
    retentionClass: 'STENCIL_TABS',
  };
}
