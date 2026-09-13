export const PUBLISHED_JOB_STORE_PIN = '096e99d645d745b1670185f46c75de75f9e59661';
export const PUBLISHED_JOB_STORE_REPOSITORY = 'GeorgePlattDemo/scan-to-build-store';

export const PUBLISHED_JOBS = Object.freeze([
  Object.freeze({
    id: 'square-stick',
    label: 'Square 2x4',
    requestType: 'BOARD_SQUARE_V1',
    storeSku: 'STB-ZERO-SPF-2X4-72-001',
    defaults: Object.freeze({ keptLengthIn: 45 }),
    boundary: 'One square CROSSCUT on the published 72 in SPF 2x4 offering.',
    notClaimed: Object.freeze(['order', 'reservation', 'machine readiness', 'Cycle Start', 'physical fabrication']),
  }),
  Object.freeze({
    id: 'rect-stencil',
    label: 'Rectangular sheet stencil',
    requestType: 'SHEET_MODE2_STENCIL_V1',
    storeSku: 'STB-ZERO-PLY-075-48X96-001',
    defaults: Object.freeze({ lengthIn: 24, widthIn: 18 }),
    fixed: Object.freeze({
      profileKind: 'STRAIGHT_RECT',
      tabCount: 4,
      routeDepthIn: 0.5,
    }),
    boundary: 'One straight rectangular Mode-2 stencil retained by tabs on the published 3/4 in sheet offering.',
    notClaimed: Object.freeze(['order', 'reservation', 'G-code', 'controller program', 'Cycle Start', 'automated secondary separation']),
  }),
  Object.freeze({
    id: 'arched-opening',
    label: 'Arched opening in 1/2 in ply',
    requestType: 'SHEET_MODE2_ARCHED_APERTURE_V0',
    storeSku: 'STB-ZERO-PLY-050-48X96-001',
    defaults: Object.freeze({ openingWidthIn: 36, straightHeightIn: 36, riseIn: 12 }),
    fixed: Object.freeze({
      outerL_in: 72,
      outerW_in: 48,
      tabCount: 4,
      routeDepthIn: 0.5,
    }),
    boundary: 'One reconstructable arched aperture retained by tabs on the published 1/2 in sheet offering.',
    notClaimed: Object.freeze(['order', 'reservation', 'G-code', 'controller program', 'Cycle Start', 'automated secondary separation']),
  }),
]);

export function publishedJob(id) {
  return PUBLISHED_JOBS.find((job) => job.id === id) ?? null;
}

export function normalizePublishedJobInputs(job, inputs = null) {
  if (!job) throw new TypeError('published job is required');
  if (inputs == null) return { ...job.defaults };
  if (typeof inputs !== 'object' || Array.isArray(inputs)) {
    throw new TypeError('published job inputs must be an object');
  }
  const expected = Object.keys(job.defaults).sort();
  const actual = Object.keys(inputs).sort();
  if (expected.length !== actual.length || expected.some((key, index) => key !== actual[index])) {
    throw new TypeError(`published job inputs must be exactly: ${expected.join(', ')}`);
  }
  const normalized = {};
  for (const key of expected) {
    const value = inputs[key];
    if (!Number.isFinite(value)) throw new TypeError(`${key} must be a finite number`);
    normalized[key] = value;
  }
  return normalized;
}

export function buildPublishedJobSpec(job, inputs = null) {
  if (!job) throw new TypeError('published job is required');
  const values = normalizePublishedJobInputs(job, inputs);
  if (job.requestType === 'BOARD_SQUARE_V1') {
    return {
      inputs: values,
      evaluation: {
        title: `${job.label} — ${values.keptLengthIn} in`,
        lines: [{
          storeSku: job.storeSku,
          qty: 1,
          requiredOps: ['CROSSCUT'],
          keptLengthIn: values.keptLengthIn,
        }],
      },
      estimate: {
        title: `${job.label} — ${values.keptLengthIn} in`,
        classId: 'app.board.square.v1',
        pieces: [{
          storeSku: job.storeSku,
          qty: 1,
          keptLengthIn: values.keptLengthIn,
          widthIn: 3.5,
        }],
      },
    };
  }
  if (job.requestType === 'SHEET_MODE2_STENCIL_V1') {
    const line = {
      storeSku: job.storeSku,
      qty: 1,
      profileKind: job.fixed.profileKind,
      blankL_in: values.lengthIn,
      blankW_in: values.widthIn,
      tabCount: job.fixed.tabCount,
      routeDepthIn: job.fixed.routeDepthIn,
    };
    return {
      inputs: values,
      evaluation: { title: `${job.label} — ${values.lengthIn} × ${values.widthIn} in`, line: { ...line } },
      estimate: { title: `${job.label} — ${values.lengthIn} × ${values.widthIn} in`, line: { ...line } },
    };
  }
  if (job.requestType === 'SHEET_MODE2_ARCHED_APERTURE_V0') {
    const line = {
      storeSku: job.storeSku,
      qty: 1,
      outerL_in: job.fixed.outerL_in,
      outerW_in: job.fixed.outerW_in,
      apertureW_in: values.openingWidthIn,
      apertureStraightH_in: values.straightHeightIn,
      arcChord_in: values.openingWidthIn,
      arcRise_in: values.riseIn,
      tabCount: job.fixed.tabCount,
      routeDepthIn: job.fixed.routeDepthIn,
    };
    return {
      inputs: values,
      evaluation: { title: `${job.label} — ${values.openingWidthIn} in opening`, line: { ...line } },
      estimate: { title: `${job.label} — ${values.openingWidthIn} in opening`, line: { ...line } },
    };
  }
  throw new TypeError(`unsupported published job request type: ${String(job.requestType)}`);
}
