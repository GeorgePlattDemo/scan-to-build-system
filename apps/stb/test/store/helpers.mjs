import assert from 'node:assert/strict';

import { canonicalInchString } from '../../shared/canonical.mjs';
import { PUBLISHED_BOARD_SKU, STORE_PATHS, USER_DEFINED_BOARD_MATERIAL_DEMAND } from '../../shared/contracts.mjs';
import {
  alcoveInsertDemandSignature,
  alcoveInsertJobPayload,
  boardDemandSignature,
  boardJobPayload,
  buildAlcoveInsertRequest,
  buildJobRequest,
  buildOfferingRequest,
  buildUserDefinedBoardRequest,
  userDefinedBoardDemandSignature,
  userDefinedBoardJobPayload,
} from '../../shared/store-wire.mjs';
import { inspectStoreSource, storeRootFromEnv } from '../../server/store-source.mjs';
import { postJson } from '../helpers/http.mjs';

export function requireStoreRoot() {
  const root = storeRootFromEnv();
  assert.ok(
    root,
    'STB_STORE_ZERO_ROOT is absent. Refusing to skip Store integration.',
  );
  return root;
}

export async function requireCleanPinnedStore() {
  const root = requireStoreRoot();
  const inspection = await inspectStoreSource(root);
  assert.equal(
    inspection.ok,
    true,
    `exact S2.2 Store runtime unavailable: ${inspection.code} ${JSON.stringify(inspection.details)}`,
  );
  return root;
}

export async function offeringLookupBody({
  requestId = crypto.randomUUID(),
  projectId = crypto.randomUUID(),
  candidateRevisionId = crypto.randomUUID(),
  attemptId = crypto.randomUUID(),
  attemptNumber = 1,
  payload = { requestedStoreSku: PUBLISHED_BOARD_SKU },
} = {}) {
  return buildOfferingRequest({
    requestId,
    projectId,
    candidateRevisionId,
    attemptId,
    attemptNumber,
    sentAt: new Date().toISOString(),
    payload,
  });
}

export async function boardJobBody({
  requestId = crypto.randomUUID(),
  projectId = crypto.randomUUID(),
  candidateRevisionId = crypto.randomUUID(),
  attemptId = crypto.randomUUID(),
  attemptNumber = 1,
  lineId = crypto.randomUUID(),
  storeSku = PUBLISHED_BOARD_SKU,
  keptLengthIn = 45,
} = {}) {
  const payload = boardJobPayload({
    lineId,
    storeSku,
    keptLengthCanonical: canonicalInchString(keptLengthIn),
  });
  const demandSignature = await boardDemandSignature(payload);
  return buildJobRequest({
    requestId,
    projectId,
    candidateRevisionId,
    attemptId,
    attemptNumber,
    sentAt: new Date().toISOString(),
    demandSignature,
    payload,
  });
}

export async function userDefinedBoardJobBody({
  requestId = crypto.randomUUID(),
  projectId = crypto.randomUUID(),
  candidateRevisionId = crypto.randomUUID(),
  attemptId = crypto.randomUUID(),
  attemptNumber = 1,
  lineId = crypto.randomUUID(),
  configurationId = 'SYO-USER1-XBRACE',
  configurationVersion = '0.1',
  materialDemand = USER_DEFINED_BOARD_MATERIAL_DEMAND,
  definedWorkpieceLengthIn = 60,
  sawCuts = 3,
  sawAngleDeg = 30,
  drillCycles = 0,
  drillDepthIn = null,
  requiredOps = ['MITER_LIMITED', 'SPOT_ON_LOCATION'],
  cutPlane = 'miter-face',
  endIdentity = 'both',
  endRelation = 'parallel',
  lengthDatum = 'long-long-outer-edge',
  datumCMethod = 'REFERENCE_CUT',
  parts = [
    {
      partId: 'PART-1',
      lengthIn: 16,
      features: [{
        featureId: 'SPOT-1',
        kind: 'SPOT_ON_LOCATION',
        xIn: 8,
        locationRule: 'CENTERED_ON_PART',
        acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
      }],
    },
    {
      partId: 'PART-2',
      lengthIn: 16,
      features: [{
        featureId: 'SPOT-2',
        kind: 'SPOT_ON_LOCATION',
        xIn: 8,
        locationRule: 'CENTERED_ON_PART',
        acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
      }],
    },
  ],
  spotDemand = {
    required: true,
    mode: 'SPOT_ON_LOCATION',
    countPerPart: 1,
    locationRule: 'CENTERED_ON_PART',
    acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
    totalCount: 2,
  },
  unresolvedConditions = [],
  materialSource = 'STORE_ZERO',
} = {}) {
  const payload = userDefinedBoardJobPayload({
    lineId,
    configurationId,
    configurationVersion,
    materialDemand,
    definedWorkpieceLengthCanonical: canonicalInchString(definedWorkpieceLengthIn),
    sawCuts,
    sawAngleDeg,
    drillCycles,
    drillDepthIn,
    requiredOps,
    cutPlane,
    endIdentity,
    endRelation,
    lengthDatum,
    datumCMethod,
    parts,
    spotDemand,
    unresolvedConditions,
    materialSource,
  });
  const demandSignature = await userDefinedBoardDemandSignature(payload);
  return buildUserDefinedBoardRequest({
    requestId,
    projectId,
    candidateRevisionId,
    attemptId,
    attemptNumber,
    sentAt: new Date().toISOString(),
    demandSignature,
    payload,
  });
}

function alcoveComponentPrograms({
  heightIn = 65,
  depthIn = 14,
  spanIn = 44,
  shelfCount = 5,
} = {}) {
  const stockWidthIn = 5.5;
  const across = Math.ceil(depthIn / stockWidthIn);
  const programs = [];

  for (let index = 0; index < 4; index += 1) {
    programs.push({
      componentId: 'ALCOVE-UPRIGHT-' + String(index + 1).padStart(2, '0'),
      requirementId: 'ALCOVE-UPRIGHT-PARENTS',
      finishedLengthIn: heightIn,
      finishedWidthIn: stockWidthIn,
      features: [],
    });
  }

  for (let shelf = 0; shelf < shelfCount; shelf += 1) {
    for (let strip = 0; strip < across; strip += 1) {
      const remaining = depthIn - stockWidthIn * strip;
      const finishedWidthIn = Math.min(stockWidthIn, Math.max(0, remaining));
      const needsMill = finishedWidthIn < stockWidthIn - 1e-9;
      programs.push({
        componentId:
          'ALCOVE-SHELF-' + String(shelf + 1).padStart(2, '0') +
          '-STRIP-' + String(strip + 1).padStart(2, '0'),
        requirementId: 'ALCOVE-SHELF-PARENTS',
        finishedLengthIn: spanIn,
        finishedWidthIn,
        features: needsMill
          ? [{
              featureId:
                'ALCOVE-SHELF-' + String(shelf + 1).padStart(2, '0') +
                '-STRIP-' + String(strip + 1).padStart(2, '0') + '-RIP',
              kind: 'MILL_LONGITUDINAL_PROFILE',
              pathLengthIn: spanIn,
              yIn: finishedWidthIn,
              totalDepthIn: 0.75,
            }]
          : [],
      });
    }
  }
  return programs;
}

export async function alcoveInsertJobBody({
  requestId = crypto.randomUUID(),
  projectId = crypto.randomUUID(),
  candidateRevisionId = crypto.randomUUID(),
  attemptId = crypto.randomUUID(),
  attemptNumber = 1,
  configurationId = 'ALCOVE-USER1',
  configurationVersion = '1',
  species = 'pine',
  heightIn = 65,
  shelfCount = 5,
  depthIn = 14,
  spanIn = 44,
  withPrograms = false,
  pilot = false,
  unresolvedConditions = [
    'FLOOR_SLOPE_RECORDED',
    'WALL_BOW_RECORDED',
    'ORDERED_SIZE_ADJUSTMENT_NOT_ESTABLISHED',
  ],
} = {}) {
  const across = Math.ceil(depthIn / 5.5);
  const boardsPerShelf = Math.ceil(across / 2);
  const shelfParentQty = boardsPerShelf * shelfCount;
  const shelfElevations = [12, 24, 36, 45, 65].slice(0, shelfCount);
  const features = pilot
    ? shelfElevations.flatMap((xIn, index) => [
        {
          featureId: 'ALCOVE-L-SPOT-' + String(index + 1).padStart(2, '0'),
          targetRole: 'LEFT_UPRIGHT',
          kind: 'SPOT_ON_LOCATION',
          xIn,
          partRelativeXIn: xIn,
          reference: 'FROM_BASE',
          acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
          toolDiameterIn: 0.1875,
          basis: 'DERIVED_FROM_SHELF_ELEVATION',
        },
        {
          featureId: 'ALCOVE-R-SPOT-' + String(index + 1).padStart(2, '0'),
          targetRole: 'RIGHT_UPRIGHT',
          kind: 'SPOT_ON_LOCATION',
          xIn,
          partRelativeXIn: xIn,
          reference: 'FROM_BASE',
          acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
          toolDiameterIn: 0.1875,
          basis: 'DERIVED_FROM_SHELF_ELEVATION',
        },
      ])
    : [];

  const payload = alcoveInsertJobPayload({
    configurationId,
    configurationVersion,
    materialDemand: {
      species,
      form: 'board',
      nominalT: 1,
      nominalW: 6,
      grade: 'select',
    },
    boardRequirements: [
      {
        requirementId: 'ALCOVE-UPRIGHT-PARENTS',
        role: 'UPRIGHTS',
        stockLengthIn: 72,
        keptLengthIn: heightIn,
        qty: 4,
        requiredOps: ['CROSSCUT'],
        carriesSpotDemand: true,
      },
      {
        requirementId: 'ALCOVE-SHELF-PARENTS',
        role: 'SHELVES',
        stockLengthIn: 96,
        keptLengthIn: spanIn,
        qty: shelfParentQty,
        requiredOps: ['CROSSCUT'],
        carriesSpotDemand: false,
      },
    ],
    componentPrograms: withPrograms
      ? alcoveComponentPrograms({ heightIn, depthIn, spanIn, shelfCount })
      : [],
    hardwareDemand: {
      storeSku: 'STB-ZERO-HW-ALCOVE-PACK-001',
      qty: 1,
    },
    spotDemand: {
      enabled: pilot,
      mode: 'SPOT_ON_LOCATION',
      toolDiameterIn: 0.1875,
      source: 'SHELF_ELEVATIONS',
      features,
    },
    unresolvedConditions,
    materialSource: 'STORE_ZERO',
  });
  const demandSignature = await alcoveInsertDemandSignature(payload);
  return buildAlcoveInsertRequest({
    requestId,
    projectId,
    candidateRevisionId,
    attemptId,
    attemptNumber,
    sentAt: new Date().toISOString(),
    demandSignature,
    payload,
  });
}

export async function postOffering(body, headers) {
  return postJson(STORE_PATHS.offering, body, headers);
}

export async function postJob(body, headers) {
  return postJson(STORE_PATHS.job, body, headers);
}

export function parseJson(response) {
  return JSON.parse(response.body);
}
