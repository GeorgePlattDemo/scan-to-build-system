import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  COPY,
  PUBLISHED_BOARD_SKU,
  STORE_PIN,
  STORE_PROTOCOL_VERSION,
  WRAPPER_BUILD_ID,
} from '../../shared/contracts.mjs';
import { APP_DIAGNOSTICS } from '../../shared/store-wire.mjs';
import { formatReturnedAmount, presentStoreAnswer } from '../../shared/store-present.mjs';

const APP_ROOT = fileURLToPath(new URL('../..', import.meta.url));

function envelope(extra = {}) {
  return {
    protocolVersion: STORE_PROTOCOL_VERSION,
    wrapperBuildId: WRAPPER_BUILD_ID,
    storePin: STORE_PIN,
    requestId: 'req-1',
    responseId: 'resp-1',
    attemptId: 'att-1',
    attemptNumber: 1,
    candidateRevisionId: 'cand-45',
    wrapperRespondedAt: '2026-09-11T00:00:02.000Z',
    rawOffering: {
      storeSku: PUBLISHED_BOARD_SKU,
      description: '2x4 x 72 in SPF construction',
      species: 'spf',
      grade: 'construction',
      form: 'board',
      nominalT: 2,
      nominalW: 4,
      actualT: 1.5,
      actualW: 3.5,
      stockL_in: 72,
      uom: 'ea',
      offered: true,
      catalogClock: '2026-09-10',
    },
    rawEvaluation: {
      status: 'SUPPORTABLE',
      lines: [
        {
          storeSku: PUBLISHED_BOARD_SKU,
          stock: {
            status: 'ON_HAND_SUFFICIENT',
            fixtureDeclaredOnHand: 84,
            available: 84,
            qtyNeeded: 1,
            asOf: '2026-09-10',
            supplierPath: 'SPECIAL_ORDER_REPRESENTED',
          },
          price: {
            status: 'STORE_ZERO_SELLING_PRICE',
            sellingPrice: 3.13,
            asOf: '2026-09-10',
          },
          capability: {
            status: 'SUPPORTABLE',
            envelope: { envelope: 'D001-STAGE2-ENVELOPE-0.2', reasons: [] },
          },
        },
      ],
    },
    rawEstimate: {
      status: 'BUDGETARY_ESTIMATE',
      totals: { material: 3.13, cell_recovery: 50.81, hardware: 0, Q: 53.94 },
      cycle: { model: 'STB-D001-CYCLE-MODEL-S2-0.1', T_job_min: 9.486, measured: false },
      engine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
    },
    attributedBasis: {
      pricingEngine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
      cycleModel: { id: 'STB-D001-CYCLE-MODEL-S2-0.1', measured: false, commissioned: false },
      envelope: { id: 'D001-STAGE2-ENVELOPE-0.2', measured: false, commissioned: false },
      sourceClock: '2026-09-10',
      measured: false,
      commissioned: false,
      budgetaryEstimateIsNotAQuote: true,
    },
    ...extra,
  };
}

function applicabilityFrom(env, extra = {}) {
  return {
    status: 'current',
    current: true,
    historical: false,
    candidateRevisionId: 'cand-45',
    request: {
      id: 'req-1',
      payload: {
        candidateRevisionId: 'cand-45',
        payload: { line: { lineId: 'occ-1', storeSku: PUBLISHED_BOARD_SKU } },
      },
    },
    attempt: { id: 'att-1', payload: { attemptNumber: 1 } },
    response: {
      id: env.responseId ?? 'resp-1',
      payload: {
        validation: { ok: true },
        receivedAt: '2026-09-11T00:00:03.000Z',
        wrapperEnvelope: env,
      },
    },
    ...extra,
  };
}

test('current SUPPORTABLE presentation copies Store Q and never computes it', () => {
  const view = presentStoreAnswer(applicabilityFrom(envelope()));
  assert.equal(view.kind, 'store');
  assert.equal(view.current, true);
  assert.equal(view.historical, false);
  assert.equal(view.dispositionEnum, 'SUPPORTABLE');
  assert.equal(view.dispositionPlain, COPY.storeSupportable);
  assert.equal(view.offering.storeSku, PUBLISHED_BOARD_SKU);
  assert.equal(view.offering.actualW, 3.5);
  assert.equal(view.stock.status, 'ON_HAND_SUFFICIENT');
  assert.equal(view.q, 53.94);
  assert.equal(view.qDisplay, '$53.94');
  assert.equal(view.estimate.materialDisplay, '$3.13');
  assert.equal(view.estimate.minutesDisplay, '9.486 min');
  assert.equal(view.basis.pricingEngineVersion, '0.2.2');
  assert.equal(view.basis.cycleModelId, 'STB-D001-CYCLE-MODEL-S2-0.1');
  assert.equal(view.basis.envelopeId, 'D001-STAGE2-ENVELOPE-0.2');
  assert.equal(view.basis.measured, false);
  assert.equal(view.sourceAsOf, '2026-09-10');
  assert.equal(view.receivedAt, '2026-09-11T00:00:03.000Z');
  assert.notEqual(view.sourceAsOf, view.receivedAt);
});

test('missing Q is never displayed as zero', () => {
  const env = envelope({
    rawEstimate: null,
    estimateError: { code: 'ESTIMATE_FAILED' },
  });
  const view = presentStoreAnswer(applicabilityFrom(env));
  assert.equal(view.dispositionEnum, 'SUPPORTABLE');
  assert.equal(view.q, null);
  assert.equal(view.qDisplay, null);
  assert.notEqual(view.qDisplay, '$0.00');
  assert.equal(view.estimate.available, false);
});

test('returned Q is copied even when it disagrees with material plus recovery', () => {
  const env = envelope({
    rawEstimate: {
      status: 'BUDGETARY_ESTIMATE',
      totals: { material: 3.13, cell_recovery: 50.81, Q: 99 },
      cycle: { model: 'STB-D001-CYCLE-MODEL-S2-0.1', T_job_min: 9.486 },
      engine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
    },
  });
  const view = presentStoreAnswer(applicabilityFrom(env));
  assert.equal(view.q, 99);
  assert.equal(view.qDisplay, '$99.00');
  assert.notEqual(view.q, 3.13 + 50.81);
});

test('REFUSED retains exact raw reason suffixes', () => {
  const env = envelope({
    rawEvaluation: {
      status: 'REFUSED',
      lines: [
        {
          capability: {
            status: 'REFUSED',
            missing: ['OP_NOT_ON_OFFERING:RIP'],
            envelope: { reasons: ['OP_NOT_ON_OFFERING:RIP'] },
          },
          stock: { status: 'ON_HAND_SUFFICIENT' },
          price: { status: 'STORE_ZERO_SELLING_PRICE', sellingPrice: 3.13 },
        },
      ],
    },
    rawEstimate: null,
  });
  const view = presentStoreAnswer(applicabilityFrom(env, { current: true }));
  assert.equal(view.dispositionEnum, 'REFUSED');
  assert.deepEqual(view.reasons, ['OP_NOT_ON_OFFERING:RIP']);
  assert.equal(view.q, null);
});

test('UNAVAILABLE stock state is not relabeled as a job enum', () => {
  const env = envelope({
    rawEvaluation: {
      status: 'UNAVAILABLE',
      lines: [
        {
          stock: { status: 'ON_HAND_SHORT', available: 3, qtyNeeded: 10 },
          capability: { status: 'SUPPORTABLE' },
          price: { sellingPrice: 3.13 },
        },
      ],
    },
    rawEstimate: null,
  });
  const view = presentStoreAnswer(applicabilityFrom(env));
  assert.equal(view.dispositionEnum, 'UNAVAILABLE');
  assert.equal(view.stock.status, 'ON_HAND_SHORT');
  assert.notEqual(view.dispositionEnum, 'ON_HAND_SHORT');
  assert.equal(view.q, null);
});

test('UNRESOLVED missing price never becomes a successful Q', () => {
  const env = envelope({
    rawEvaluation: {
      status: 'UNRESOLVED',
      lines: [
        {
          price: { status: 'UNRESOLVED', reason: 'MISSING_PRICE' },
          capability: { status: 'SUPPORTABLE' },
          stock: { status: 'ON_HAND_SUFFICIENT' },
        },
      ],
    },
    rawEstimate: null,
  });
  const view = presentStoreAnswer(applicabilityFrom(env));
  assert.equal(view.dispositionEnum, 'UNRESOLVED');
  assert.deepEqual(view.reasons, ['MISSING_PRICE']);
  assert.equal(view.qDisplay, null);
});

test('Alcove partial Store answer preserves both material lines and never invents Q', () => {
  const env = envelope({
    rawOffering: null,
    rawEvaluation: {
      status: 'UNRESOLVED',
      unresolvedConditions: ['ALCOVE_COMPONENT_PROGRAMS_REQUIRED'],
      lines: [
        {
          requirementId: 'ALCOVE-UPRIGHT-PARENTS',
          role: 'UPRIGHTS',
          status: 'SUPPORTABLE',
          storeSku: 'STB-ZERO-PINE-1X6-72-001',
          qty: 4,
          demandedStockLengthIn: 72,
          keptLengthIn: 65,
          requiredOps: ['CROSSCUT'],
          stock: { status: 'ON_HAND_SUFFICIENT', available: 27, qtyNeeded: 4 },
          price: { status: 'STORE_ZERO_SELLING_PRICE', sellingPrice: 6.94 },
          capability: { status: 'SUPPORTABLE' },
          extension: 27.76,
        },
        {
          requirementId: 'ALCOVE-SHELF-PARENTS',
          role: 'SHELVES',
          status: 'SUPPORTABLE',
          storeSku: 'STB-ZERO-PINE-1X6-96-001',
          qty: 10,
          demandedStockLengthIn: 96,
          keptLengthIn: 44,
          requiredOps: ['CROSSCUT'],
          stock: { status: 'ON_HAND_SUFFICIENT', available: 43, qtyNeeded: 10 },
          price: { status: 'STORE_ZERO_SELLING_PRICE', sellingPrice: 24.51 },
          capability: { status: 'SUPPORTABLE' },
          extension: 245.10,
        },
      ],
    },
    rawEstimate: {
      status: 'PARTIAL_BUDGETARY_ESTIMATE',
      complete: false,
      totals: {
        material: 272.86,
        hardware: 18,
        machine_service: null,
        Q: null,
      },
      unresolvedConditions: ['ALCOVE_COMPONENT_PROGRAMS_REQUIRED'],
    },
  });
  const view = presentStoreAnswer(applicabilityFrom(env));
  assert.equal(view.dispositionEnum, 'UNRESOLVED');
  assert.equal(view.lines.length, 2);
  assert.deepEqual(
    view.lines.map((line) => [line.role, line.storeSku, line.qty, line.extensionDisplay]),
    [
      ['UPRIGHTS', 'STB-ZERO-PINE-1X6-72-001', 4, '$27.76'],
      ['SHELVES', 'STB-ZERO-PINE-1X6-96-001', 10, '$245.10'],
    ],
  );
  assert.equal(view.estimate.materialDisplay, '$272.86');
  assert.equal(view.estimate.hardwareDisplay, '$18.00');
  assert.equal(view.q, null);
  assert.equal(view.qDisplay, null);
  assert.ok(view.reasons.includes('ALCOVE_COMPONENT_PROGRAMS_REQUIRED'));
});

test('transport and adapter diagnostics are not Store job enums', () => {
  const transport = presentStoreAnswer({
    status: APP_DIAGNOSTICS.APP_TRANSPORT_ERROR,
    current: false,
    historical: true,
    diagnostic: APP_DIAGNOSTICS.APP_TRANSPORT_ERROR,
    candidateRevisionId: 'cand-45',
    request: { id: 'req-1' },
    attempt: { id: 'att-1' },
  });
  assert.equal(transport.kind, 'transport');
  assert.equal(transport.headline, COPY.storeTransport);
  assert.equal(transport.dispositionEnum, null);
  assert.equal(transport.retryable, true);

  const adapter = presentStoreAnswer({
    status: APP_DIAGNOSTICS.APP_ADAPTER_ERROR,
    current: false,
    historical: true,
    diagnostic: APP_DIAGNOSTICS.APP_ADAPTER_ERROR,
    candidateRevisionId: 'cand-45',
  });
  assert.equal(adapter.kind, 'adapter');
  assert.equal(adapter.headline, COPY.storeAdapter);
  assert.notEqual(adapter.dispositionEnum, 'UNAVAILABLE');
  assert.notEqual(adapter.dispositionEnum, 'UNRESOLVED');
  assert.notEqual(adapter.dispositionEnum, 'REFUSED');
});

test('pending and interrupted use frozen ordinary language', () => {
  const pending = presentStoreAnswer({
    status: 'pending',
    current: false,
    historical: false,
    candidateRevisionId: 'cand-46',
    request: { id: 'req-46' },
    attempt: { id: 'att-46' },
  });
  assert.equal(pending.kind, 'pending');
  assert.equal(pending.pending, true);
  assert.equal(pending.current, false);
  assert.equal(pending.headline, COPY.storePending);
  assert.equal(pending.q, null);

  const interrupted = presentStoreAnswer({
    status: APP_DIAGNOSTICS.APP_ATTEMPT_INTERRUPTED,
    current: false,
    historical: true,
    diagnostic: APP_DIAGNOSTICS.APP_ATTEMPT_INTERRUPTED,
    candidateRevisionId: 'cand-45',
  });
  assert.equal(interrupted.kind, 'interrupted');
  assert.equal(interrupted.headline, COPY.storeInterrupted);
  assert.equal(interrupted.retryable, true);
  assert.equal(interrupted.current, false);
});

test('historical usable answers are labeled historical and keep Q inspectable', () => {
  const view = presentStoreAnswer(
    applicabilityFrom(envelope(), {
      status: 'historical',
      current: false,
      historical: true,
    }),
  );
  assert.equal(view.current, false);
  assert.equal(view.historical, true);
  assert.equal(view.headline, COPY.storeHistorical);
  assert.equal(view.q, 53.94);
});

test('incomplete Board does not appear asked', () => {
  const view = presentStoreAnswer(
    { status: 'none', current: false, historical: false },
    { projectionValid: false },
  );
  assert.equal(view.kind, 'incomplete');
  assert.equal(view.headline, COPY.storeIncomplete);
  assert.equal(view.current, false);
});

test('formatReturnedAmount only formats finite numbers', () => {
  assert.equal(formatReturnedAmount(53.94), '$53.94');
  assert.equal(formatReturnedAmount(0), '$0.00');
  assert.equal(formatReturnedAmount(null), null);
  assert.equal(formatReturnedAmount(undefined), null);
  assert.equal(formatReturnedAmount(Number.NaN), null);
});

test('presenter source does not add material and recovery', () => {
  const source = fs.readFileSync(path.join(APP_ROOT, 'shared/store-present.mjs'), 'utf8');
  assert.equal(/\bmaterial\s*\+/.test(source), false);
  assert.equal(/cell_recovery\s*\+/.test(source), false);
  assert.equal(/sellingPrice\s*\*/.test(source), false);
});
