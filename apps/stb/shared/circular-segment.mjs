/**
 * Circular-segment geometry for the first Mode-2 curvilinear family.
 * Canonical pair: chord + rise. Radius is derived.
 * App and Store use the same formula. Not a toolpath.
 */
export const CIRCULAR_SEGMENT_V0 = Object.freeze({
  id: 'CIRCULAR_SEGMENT_V0',
  radiusToleranceIn: 0.001,
});

export function radiusFromChordRise(chord, rise) {
  if (!(Number.isFinite(chord) && Number.isFinite(rise))) {
    return null;
  }
  if (!(chord > 0 && rise > 0)) {
    return null;
  }
  return chord * chord / (8 * rise) + rise / 2;
}

export function evaluateCircularSegment({ chord_in, rise_in, radius_in } = {}) {
  if (chord_in == null || rise_in == null) {
    return { ok: false, status: 'UNRESOLVED', reason: 'missing-curve', derivedRadius_in: null };
  }
  if (!(Number.isFinite(chord_in) && Number.isFinite(rise_in))) {
    return { ok: false, status: 'REFUSED', reason: 'curve-not-numeric', derivedRadius_in: null };
  }
  if (!(chord_in > 0 && rise_in > 0)) {
    return { ok: false, status: 'REFUSED', reason: 'curve-invalid', derivedRadius_in: null };
  }
  const derived = radiusFromChordRise(chord_in, rise_in);
  if (derived == null || !Number.isFinite(derived) || derived <= 0) {
    return { ok: false, status: 'REFUSED', reason: 'curve-not-constructible', derivedRadius_in: null };
  }
  if (radius_in != null) {
    if (!Number.isFinite(radius_in) || radius_in <= 0) {
      return { ok: false, status: 'REFUSED', reason: 'radius-invalid', derivedRadius_in: derived };
    }
    if (Math.abs(radius_in - derived) > CIRCULAR_SEGMENT_V0.radiusToleranceIn) {
      return { ok: false, status: 'REFUSED', reason: 'curve-contradiction', derivedRadius_in: derived };
    }
  }
  return {
    ok: true,
    status: 'SUPPORTABLE',
    reason: null,
    chord_in,
    rise_in,
    radius_in: radius_in ?? derived,
    derivedRadius_in: derived,
    geometryClass: 'CURVILINEAR',
    curveKind: 'CIRCULAR_SEGMENT',
  };
}
