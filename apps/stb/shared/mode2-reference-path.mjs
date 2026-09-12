/**
 * Non-executable Mode-2 reference path.
 * Represents the 36/12/19.5 circular segment as coordinated sheet-X / tool-Y samples.
 * Z is depth only. No G-code. No Cycle Start. Not a controller packet.
 */
import { evaluateCircularSegment } from './circular-segment.mjs';

export function representMode2CircularSegment({
  chord_in = 36,
  rise_in = 12,
  radius_in = 19.5,
  samples = 25,
  tabCount = 4,
  routeDepthIn = 0.5,
} = {}) {
  const curve = evaluateCircularSegment({ chord_in, rise_in, radius_in });
  if (!curve.ok) {
    return { ok: false, executable: false, reason: curve.reason, samples: [] };
  }
  const R = curve.radius_in;
  const half = chord_in / 2;
  const centerY = rise_in - R;
  const points = [];
  for (let i = 0; i < samples; i += 1) {
    const t = i / (samples - 1);
    const sheetX = -half + chord_in * t;
    const radial = Math.max(0, R * R - sheetX * sheetX);
    const toolY = centerY + Math.sqrt(radial);
    points.push({
      sheetX_in: Number(sheetX.toFixed(6)),
      toolY_in: Number(toolY.toFixed(6)),
      depthZ_in: routeDepthIn,
      geometryAxisZ: false,
    });
  }
  return {
    ok: true,
    executable: false,
    language: 'REFERENCE_PATH_OBJECT',
    relationship: {
      sheet: 'X',
      tool: 'Y',
      router: 'bounded Z',
    },
    curve: {
      kind: 'CIRCULAR_SEGMENT',
      chord_in,
      rise_in,
      radius_in: R,
    },
    retention: {
      class: 'STENCIL_TABS',
      tabCount,
      fullSeverance: false,
      secondarySeparation: 'OPERATOR_OR_LATER',
    },
    samples: points,
    not_emitted: ['G-code', 'controller packet', 'Cycle Start'],
  };
}
