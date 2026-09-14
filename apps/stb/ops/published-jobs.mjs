import {
  S001_CENTERED_ARCH_CLASS_ID,
  S001_CENTERED_ARCH_DEFAULTS,
  S001_CENTERED_ARCH_FIXED,
  deriveS001CenteredArchGeometry,
} from '../shared/class-config.mjs';
import { MACHINE_FAMILIES } from '../shared/secondary-operation-library.mjs';

export const PUBLISHED_JOB_STORE_PIN = '4402abeb6b0299a5b6db2eec85ed04c3b0236bcc';
export const PUBLISHED_JOB_STORE_REPOSITORY = 'GeorgePlattDemo/scan-to-build-store';

const REQUIRED_LABEL = Object.freeze({
  required: true,
  timing: 'WHEN_PART_OR_PACKAGE_LEAVES_PRIMARY_CELL_STREAM',
  authorityEffect: false,
});

export const PUBLISHED_JOBS = Object.freeze([
  Object.freeze({
    id: 'square-stick',
    label: 'Square 2x4',
    machineFamily: MACHINE_FAMILIES.D001,
    requestType: 'BOARD_SQUARE_V1',
    storeSku: 'STB-ZERO-SPF-2X4-72-001',
    defaults: Object.freeze({ keptLengthIn: 45 }),
    operationalRequirements: Object.freeze({ labeling: REQUIRED_LABEL }),
    boundary: 'One square CROSSCUT on the published 72 in SPF 2x4 offering. D-001 drilling is separate and only appears when a dimensional project actually requires a declared pilot/spot operation.',
    notClaimed: Object.freeze(['order', 'reservation', 'machine readiness', 'Cycle Start', 'physical fabrication']),
  }),
  Object.freeze({
    id: 'rect-stencil',
    label: 'Rectangular sheet stencil',
    machineFamily: MACHINE_FAMILIES.S001,
    requestType: 'SHEET_MODE2_STENCIL_V1',
    storeSku: 'STB-ZERO-PLY-075-48X96-001',
    defaults: Object.freeze({ lengthIn: 24, widthIn: 18 }),
    fixed: Object.freeze({
      profileKind: 'STRAIGHT_RECT',
      tabCount: 4,
      routeDepthIn: 0.5,
    }),
    operationalRequirements: Object.freeze({
      labeling: REQUIRED_LABEL,
      sheetDrillingThisRound: false,
      tabRemovalSelective: true,
    }),
    boundary: 'One straight rectangular Mode-2 stencil retained by tabs on the published 3/4 in sheet offering. Sheet drilling is not part of S-001 this round; tab removal is a selective downstream choice.',
    notClaimed: Object.freeze(['order', 'reservation', 'sheet drilling', 'G-code', 'controller program', 'Cycle Start', 'automated secondary separation']),
  }),
  Object.freeze({
    id: 'arched-opening',
    projectClassId: S001_CENTERED_ARCH_CLASS_ID,
    projectRole: 'CANONICAL_S001_BOUNDED_PROJECT',
    label: 'Centered arched cutout in 1/2 in ply',
    machineFamily: MACHINE_FAMILIES.S001,
    requestType: 'SHEET_MODE2_ARCHED_APERTURE_V0',
    storeSku: 'STB-ZERO-PLY-050-48X96-001',
    defaults: S001_CENTERED_ARCH_DEFAULTS,
    fixed: S001_CENTERED_ARCH_FIXED,
    operationalRequirements: Object.freeze({
      labeling: REQUIRED_LABEL,
      sheetDrillingThisRound: false,
      tabRemovalSelective: true,
    }),
    boundary: 'One centered reconstructable arched aperture retained by tabs on the published full 48 x 96 in 1/2 in sheet offering. Whole profile must stay inside the centered 48 x 36 in work field. Sheet drilling is not part of S-001 this round; tab removal is a selective downstream choice.',
    notClaimed: Object.freeze(['order', 'reservation', 'sheet drilling', 'G-code', 'controller program', 'Cycle Start', 'automated secondary separation', 'edge routing outside the centered work field']),
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

export function deriveCenteredArchedProjectGeometry(job, inputs = null) {
  if (!job || job.requestType !== 'SHEET_MODE2_ARCHED_APERTURE_V0') {
    throw new TypeError('centered arched project geometry requires the published arched job');
  }
  const values = normalizePublishedJobInputs(job, inputs);
  return Object.freeze({
    ...deriveS001CenteredArchGeometry(values),
    role: job.projectRole,
    note: 'This is a project/configurator preview only. Store independently evaluates the centered S-001 work field, curve, route depth, tab policy, and disposition.',
  });
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
      projectGeometry: deriveCenteredArchedProjectGeometry(job, values),
      evaluation: { title: `${job.label} — ${values.openingWidthIn} in opening`, line: { ...line } },
      estimate: { title: `${job.label} — ${values.openingWidthIn} in opening`, line: { ...line } },
    };
  }
  throw new TypeError(`unsupported published job request type: ${String(job.requestType)}`);
}
