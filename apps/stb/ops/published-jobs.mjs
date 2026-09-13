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
    defaults: Object.freeze({
      profileKind: 'STRAIGHT_RECT',
      blankL_in: 24,
      blankW_in: 18,
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
    defaults: Object.freeze({
      geometryClass: 'CURVILINEAR',
      outerL_in: 72,
      outerW_in: 48,
      apertureW_in: 36,
      apertureStraightH_in: 36,
      arcChord_in: 36,
      arcRise_in: 12,
      arcRadius_in: 19.5,
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

export function buildPublishedJobSpec(job) {
  if (!job) throw new TypeError('published job is required');
  if (job.requestType === 'BOARD_SQUARE_V1') {
    return {
      evaluation: {
        title: `${job.label} — ${job.defaults.keptLengthIn} in`,
        lines: [{
          storeSku: job.storeSku,
          qty: 1,
          requiredOps: ['CROSSCUT'],
          keptLengthIn: job.defaults.keptLengthIn,
        }],
      },
      estimate: {
        title: `${job.label} — ${job.defaults.keptLengthIn} in`,
        classId: 'app.board.square.v1',
        pieces: [{
          storeSku: job.storeSku,
          qty: 1,
          keptLengthIn: job.defaults.keptLengthIn,
          widthIn: 3.5,
        }],
      },
    };
  }
  if (job.requestType === 'SHEET_MODE2_STENCIL_V1') {
    return {
      evaluation: {
        title: job.label,
        line: { storeSku: job.storeSku, qty: 1, ...job.defaults },
      },
      estimate: {
        title: job.label,
        line: { storeSku: job.storeSku, qty: 1, ...job.defaults },
      },
    };
  }
  if (job.requestType === 'SHEET_MODE2_ARCHED_APERTURE_V0') {
    return {
      evaluation: {
        title: job.label,
        line: { storeSku: job.storeSku, qty: 1, ...job.defaults },
      },
      estimate: {
        title: job.label,
        line: { storeSku: job.storeSku, qty: 1, ...job.defaults },
      },
    };
  }
  throw new TypeError(`unsupported published job request type: ${String(job.requestType)}`);
}
