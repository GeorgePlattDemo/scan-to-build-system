import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BOUNDARY,
  DEFINITION_CONTRACT_VERSION,
  DISPOSITION,
  OWNER,
  PHYSICAL_RELEASE_ISSUABLE,
  STATUS,
  blockingForBoundary,
  freezeLedger,
  freezeResponsibility,
  holderQuestions,
  physicalReleaseReadiness,
  storeSubmissionReadiness,
} from '../../shared/definition-contract.mjs';

const STORE_PIN = 'b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d';

function row(overrides = {}) {
  return {
    id: 'project.width',
    title: 'Project width',
    status: STATUS.CONFIRMED,
    owner: OWNER.USER,
    blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
    value: 46.25,
    basis: 'manual-entry',
    ...overrides,
  };
}

function classifiedLedger(overrides = {}) {
  return {
    disposition: DISPOSITION.CLASSIFIED,
    classId: 'test-class',
    classVersion: '0.1',
    definitionKind: null,
    ruleVersion: '0.1',
    candidateRevisionId: 'REV-001',
    storeQueryContract: {
      repository: 'GeorgePlattDemo/scan-to-build-store',
      pin: STORE_PIN,
      requestType: 'TEST_QUERY_V1',
    },
    responsibilities: [row()],
    ...overrides,
  };
}

test('definition-contract vocabulary is closed and physical release is not issuable', () => {
  assert.equal(DEFINITION_CONTRACT_VERSION, 'STB-DEFINITION-CONTRACT-0.1');
  assert.equal(PHYSICAL_RELEASE_ISSUABLE, false);
  assert.deepEqual(Object.values(STATUS), [
    'CANDIDATE',
    'CONFIRMED',
    'DERIVED',
    'UNRESOLVED',
    'DEFERRED',
    'NOT_REQUIRED',
  ]);
  assert.deepEqual(Object.values(OWNER), [
    'USER',
    'PROJECT',
    'RULE',
    'STORE',
    'QUALIFIED_PERSON',
    'GOVERNED',
  ]);
  assert.equal(Object.values(OWNER).includes('MACHINE'), false);
  assert.deepEqual(Object.values(BOUNDARY), [
    'DEFINITION',
    'STORE_SUBMISSION',
    'PHYSICAL_RELEASE',
  ]);
});

test('status and owner remain orthogonal', () => {
  assert.throws(
    () => freezeResponsibility(row({ status: 'STORE_OWNED' })),
    /unknown status/,
  );
  assert.throws(
    () => freezeResponsibility(row({ owner: 'UNRESOLVED' })),
    /unknown owner/,
  );
});

test('DERIVED requires derivation and non-DERIVED forbids it', () => {
  assert.throws(
    () => freezeResponsibility(row({
      status: STATUS.DERIVED,
      owner: OWNER.RULE,
      basis: 'rule',
      derivation: null,
    })),
    /derivation/,
  );
  const derived = freezeResponsibility(row({
    status: STATUS.DERIVED,
    owner: OWNER.RULE,
    basis: 'alcove-span-rule',
    derivation: {
      rule: 'openingWidth - leftSupport - rightSupport',
      inputs: ['openingWidth', 'leftSupport', 'rightSupport'],
    },
  }));
  assert.equal(derived.status, STATUS.DERIVED);
  assert.throws(
    () => freezeResponsibility(row({
      derivation: { rule: 'not allowed', inputs: ['x'] },
    })),
    /allowed only/,
  );
});

test('freezeResponsibility copies and deeply freezes nested data without freezing caller-owned input', () => {
  const callerValue = { module: { width: 46.25 }, tags: ['source'] };
  const callerBasis = { kind: 'source', source: { id: 'PLAN-001' } };
  const frozen = freezeResponsibility(row({ value: callerValue, basis: callerBasis }));

  assert.equal(Object.isFrozen(frozen), true);
  assert.equal(Object.isFrozen(frozen.value), true);
  assert.equal(Object.isFrozen(frozen.value.module), true);
  assert.equal(Object.isFrozen(frozen.value.tags), true);
  assert.equal(Object.isFrozen(frozen.basis), true);
  assert.equal(Object.isFrozen(callerValue), false);
  assert.equal(Object.isFrozen(callerValue.module), false);
  assert.equal(Object.isFrozen(callerBasis), false);

  callerValue.module.width = 99;
  callerBasis.source.id = 'CHANGED';
  assert.equal(frozen.value.module.width, 46.25);
  assert.equal(frozen.basis.source.id, 'PLAN-001');
});

test('malformed vocabulary, basis, blocks, and duplicate responsibility IDs fail closed', () => {
  assert.throws(
    () => freezeResponsibility(row({ blocks: ['NOT_A_BOUNDARY'] })),
    /unknown boundary/,
  );
  assert.throws(
    () => freezeResponsibility(row({
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.DEFINITION],
    })),
    /duplicate boundary/,
  );
  assert.throws(() => freezeResponsibility(row({ basis: {} })), /basis/);
  assert.throws(
    () => freezeLedger(classifiedLedger({ responsibilities: [row(), row()] })),
    /duplicate responsibility id/,
  );
  assert.throws(
    () => freezeLedger(classifiedLedger({ responsibilities: [] })),
    /at least one responsibility/,
  );
});

test('classified Board-style ledger may use definition identity with null class identity', () => {
  const ledger = freezeLedger(classifiedLedger({
    classId: null,
    classVersion: null,
    definitionKind: 'board.square.v1',
    ruleVersion: '0.1',
  }));
  assert.equal(ledger.disposition, DISPOSITION.CLASSIFIED);
  assert.equal(ledger.classId, null);
  assert.equal(ledger.classVersion, null);
  assert.equal(ledger.definitionKind, 'board.square.v1');
});

test('null class identity alone does not determine disposition', () => {
  const unclassified = freezeLedger({
    disposition: DISPOSITION.UNCLASSIFIED,
    classId: null,
    classVersion: null,
    definitionKind: null,
    ruleVersion: null,
    candidateRevisionId: null,
    storeQueryContract: null,
    responsibilities: [],
  });
  assert.equal(unclassified.disposition, DISPOSITION.UNCLASSIFIED);

  const classifiedBoard = freezeLedger(classifiedLedger({
    classId: null,
    classVersion: null,
    definitionKind: 'board.square.v1',
  }));
  assert.equal(classifiedBoard.disposition, DISPOSITION.CLASSIFIED);
});

test('Store-owned unresolved is a Store question, not a Store-submission blocker', () => {
  const ledger = classifiedLedger({
    responsibilities: [
      row(),
      row({
        id: 'material.sku',
        title: 'Store material SKU',
        status: STATUS.UNRESOLVED,
        owner: OWNER.STORE,
        blocks: [BOUNDARY.STORE_SUBMISSION],
        value: null,
        basis: null,
      }),
    ],
  });
  assert.equal(blockingForBoundary(ledger, BOUNDARY.STORE_SUBMISSION).length, 0);
  assert.deepEqual(storeSubmissionReadiness(ledger), {
    ready: true,
    reason: null,
    blockingIds: [],
  });
});

test('Store-owned unresolved does not clear a DEFINITION blocker', () => {
  const ledger = classifiedLedger({
    responsibilities: [
      row({
        id: 'store-owned-definition-gap',
        title: 'Store-owned definition gap',
        status: STATUS.UNRESOLVED,
        owner: OWNER.STORE,
        blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
        value: null,
        basis: null,
      }),
    ],
  });
  assert.deepEqual(
    blockingForBoundary(ledger, BOUNDARY.DEFINITION).map((item) => item.id),
    ['store-owned-definition-gap'],
  );
  assert.equal(storeSubmissionReadiness(ledger).ready, false);
  assert.equal(storeSubmissionReadiness(ledger).reason, 'DEFINITION_BLOCKED');
});

test('QUALIFIED_PERSON and GOVERNED blockers are not ignored at Store submission', () => {
  for (const owner of [OWNER.QUALIFIED_PERSON, OWNER.GOVERNED]) {
    const ledger = classifiedLedger({
      responsibilities: [
        row(),
        row({
          id: `blocked.${owner}`,
          title: 'Explicit Store-submission blocker',
          status: STATUS.DEFERRED,
          owner,
          blocks: [BOUNDARY.STORE_SUBMISSION],
          value: null,
          basis: null,
        }),
      ],
    });
    assert.equal(storeSubmissionReadiness(ledger).ready, false, owner);
    assert.equal(storeSubmissionReadiness(ledger).reason, 'STORE_SUBMISSION_BLOCKED', owner);
  }
});

test('qualified-person deferral blocking only physical release does not block Store submission', () => {
  const ledger = classifiedLedger({
    responsibilities: [
      row(),
      row({
        id: 'engineering.structural',
        title: 'Structural adequacy',
        status: STATUS.DEFERRED,
        owner: OWNER.QUALIFIED_PERSON,
        blocks: [BOUNDARY.PHYSICAL_RELEASE],
        value: null,
        basis: null,
        condition: 'STRUCTURAL_SPAN_NOT_EVALUATED',
      }),
    ],
  });
  assert.equal(blockingForBoundary(ledger, BOUNDARY.DEFINITION).length, 0);
  assert.equal(storeSubmissionReadiness(ledger).ready, true);
  assert.deepEqual(physicalReleaseReadiness(ledger), {
    ready: false,
    reason: 'PRODUCTION_AUTHORIZATION_NOT_ISSUABLE',
  });
});

test('holderQuestions returns only blocking USER candidate/unresolved rows in boundary order', () => {
  const ledger = classifiedLedger({
    responsibilities: [
      row({
        id: 'later',
        title: 'Later holder answer',
        status: STATUS.UNRESOLVED,
        blocks: [BOUNDARY.STORE_SUBMISSION],
        value: null,
        basis: null,
      }),
      row({
        id: 'first',
        title: 'Definition holder answer',
        status: STATUS.CANDIDATE,
        blocks: [BOUNDARY.DEFINITION],
        value: null,
        basis: 'source-observation',
      }),
      row({
        id: 'store',
        title: 'Store answer',
        status: STATUS.UNRESOLVED,
        owner: OWNER.STORE,
        blocks: [BOUNDARY.STORE_SUBMISSION],
        value: null,
        basis: null,
      }),
      row({
        id: 'inactive',
        title: 'Not required',
        status: STATUS.NOT_REQUIRED,
        owner: OWNER.USER,
        blocks: [],
        value: null,
        basis: null,
      }),
    ],
  });
  assert.deepEqual(holderQuestions(ledger).map((item) => item.id), ['first', 'later']);
});

test('Store submission requires classified disposition, revision, and bounded Store query identity', () => {
  assert.equal(
    storeSubmissionReadiness(classifiedLedger({ candidateRevisionId: null })).reason,
    'CANDIDATE_REVISION_REQUIRED',
  );
  assert.throws(
    () => freezeLedger(classifiedLedger({ storeQueryContract: {} })),
    /repository/,
  );
  assert.throws(
    () => freezeLedger(classifiedLedger({
      storeQueryContract: {
        repository: 'GeorgePlattDemo/scan-to-build-store',
        pin: 'not-a-commit',
        requestType: 'TEST_QUERY_V1',
      },
    })),
    /40-character commit identity/,
  );
  assert.throws(
    () => freezeLedger(classifiedLedger({
      storeQueryContract: {
        repository: 'GeorgePlattDemo/scan-to-build-store',
        pin: STORE_PIN,
      },
    })),
    /bounded query identity/,
  );

  const unclassified = {
    disposition: DISPOSITION.UNCLASSIFIED,
    classId: 'future-unbundled-class',
    classVersion: null,
    definitionKind: null,
    ruleVersion: null,
    candidateRevisionId: 'REV-X',
    storeQueryContract: null,
    responsibilities: [],
  };
  assert.equal(storeSubmissionReadiness(unclassified).ready, false);
  assert.equal(storeSubmissionReadiness(unclassified).reason, 'UNCLASSIFIED');
});

test('physical release remains unconditionally unavailable', () => {
  const fakeAuthority = classifiedLedger({
    responsibilities: [
      row({
        id: 'fake.authority',
        title: 'Authority-like input',
        status: STATUS.CONFIRMED,
        owner: OWNER.GOVERNED,
        blocks: [],
        value: true,
        basis: 'synthetic-test-only',
      }),
    ],
  });
  assert.deepEqual(physicalReleaseReadiness(fakeAuthority), {
    ready: false,
    reason: 'PRODUCTION_AUTHORIZATION_NOT_ISSUABLE',
  });
});
