import { expect, test } from '@playwright/test';

import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

const S001_CLASS_ID = 'S001_CENTERED_ARCHED_SHEET_V0';
const STORE_PIN = '4402abeb6b0299a5b6db2eec85ed04c3b0236bcc';

async function createS001Project(page) {
  await page.goto('/');
  const created = requireOk(await repoCall(page, 'createProject', {
    actionId: crypto.randomUUID(),
    createdAt: '2026-09-13T21:30:00.000Z',
    entryMode: 'mapped',
    classId: S001_CLASS_ID,
    actorId: 'new',
  }));
  const configured = await page.evaluate(async ({ localRecordId, expectedHead }) => {
    const configurator = await import('/domain/configurator.mjs');
    return configurator.applyMappedConfiguration({
      localRecordId,
      expectedHead,
      actionId: crypto.randomUUID(),
      createdAt: '2026-09-13T21:31:00.000Z',
      basis: 'canonical-test',
      configuration: {
        openingWidthIn: '36',
        straightHeightIn: '24',
        riseIn: '12',
      },
    });
  }, { localRecordId: created.localRecordId, expectedHead: created.currentHead });
  return { localRecordId: created.localRecordId, configured };
}

async function installPublishedProjectTransport(page) {
  await page.evaluate(async (storePin) => {
    const client = await import('/integration/published-project-client.mjs');
    client.setPublishedProjectTransport(async (_url, init) => {
      const request = JSON.parse(init.body);
      const body = {
        kind: 'published-job-store-answer',
        ready: true,
        jobId: 'arched-opening',
        label: 'Centered arched cutout in 1/2 in ply',
        machineFamily: 'S001',
        requestType: 'SHEET_MODE2_ARCHED_APERTURE_V0',
        storeSku: 'STB-ZERO-PLY-050-48X96-001',
        storePin,
        inputs: request.inputs,
        status: 'SUPPORTABLE',
        evidenceClass: 'REFERENCE',
        physicalStatus: 'NOT_CLAIMED',
        commissioned: false,
        envelope: 'S001-MODE2-ARCHED-APERTURE-V0',
        reasons: [],
        unresolved: [],
        workField: {
          id: 'S001-CENTER-WORK-FIELD-V0',
          placement: 'CENTERED_ON_PARENT',
          horizontalAxis: 'PARENT_LONG_AXIS',
          verticalAxis: 'PARENT_SHORT_AXIS',
          horizontalSpan_in: 48,
          verticalSpan_in: 36,
          containment: 'WHOLE_PROFILE',
          parentContainsField: true,
          profileInsideField: true,
          parentMargins_in: { left: 24, right: 24, bottom: 6, top: 6 },
          profileMarginsWithinField_in: { left: 6, right: 6, bottom: 0, top: 0 },
        },
        curve: {
          kind: 'CIRCULAR_SEGMENT',
          chord_in: 36,
          rise_in: 12,
          radius_in: 19.5,
          derivedRadius_in: 19.5,
        },
        retention: {
          class: 'STENCIL_TABS',
          requestedTabCount: 4,
          plannedTabCount: 5,
          tabPolicyId: 'S001-STENCIL-TAB-POLICY-V0',
          physicalRetentionStatus: 'NOT_MEASURED',
          secondarySeparation: 'OPERATOR_OR_LATER — not claimed automated',
        },
        estimate: {
          status: 'BUDGETARY_MATERIAL_ONLY',
          material: 26.55,
          processQ: null,
          processQ_status: 'UNRESOLVED',
          Q: 26.55,
          Q_basis: 'MATERIAL_FIXTURE_ONLY',
          modeledTimeMin: null,
          note: 'Budgetary material fixture only. Process time and fabrication Q are unresolved. Not a commercial quote.',
        },
        operationalRequirements: {
          labeling: {
            required: true,
            timing: 'WHEN_PART_OR_PACKAGE_LEAVES_PRIMARY_CELL_STREAM',
            authorityEffect: false,
          },
          sheetDrillingThisRound: false,
          tabRemovalSelective: true,
        },
        completionPreview: {
          version: 'STB-COMPLETION-PREVIEW-0.1',
          eligible: true,
          machineFamily: 'S001',
          secondarySelectionRequired: true,
          physicalExecutionAuthority: false,
          operatorMayPromote: false,
        },
        physicalExecutionAuthorized: false,
        controllerOutputProduced: false,
      };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  }, STORE_PIN);
}

test('canonical S-001 project carries exact Store identity through unresolved Review and owner archive', async ({ page }) => {
  const { localRecordId, configured } = await createS001Project(page);
  expect(configured.project.classId).toBe(S001_CLASS_ID);
  expect(configured.projection.payload.geometry.workField.sheetOffsets).toEqual({
    leftIn: 24,
    rightIn: 24,
    bottomIn: 6,
    topIn: 6,
  });
  expect(configured.projection.payload.unresolvedConditions).toEqual([]);

  await installPublishedProjectTransport(page);
  const issued = await page.evaluate(async (id) => {
    const client = await import('/integration/published-project-client.mjs');
    return client.issuePublishedProjectQuestion({ localRecordId: id });
  }, localRecordId);
  expect(issued.status).toBe('current');

  const requests = requireOk(await repoCall(page, 'listRecords', { localRecordId, kind: 'request' }));
  const attempts = requireOk(await repoCall(page, 'listRecords', { localRecordId, kind: 'attempt' }));
  const responses = requireOk(await repoCall(page, 'listRecords', { localRecordId, kind: 'response' }));
  expect(requests).toHaveLength(1);
  expect(attempts).toHaveLength(1);
  expect(responses).toHaveLength(1);
  expect(requests[0].payload.scope).toBe('SHEET_MODE2_ARCHED_APERTURE_V0');
  expect(requests[0].payload.expectedStorePin).toBe(STORE_PIN);
  expect(responses[0].payload.storePin).toBe(STORE_PIN);
  expect(responses[0].payload.publishedJobAnswer.workField.parentMargins_in).toEqual({
    left: 24, right: 24, bottom: 6, top: 6,
  });
  expect(responses[0].payload.publishedJobAnswer.curve.radius_in).toBe(19.5);
  expect(responses[0].payload.publishedJobAnswer.retention.plannedTabCount).toBe(5);
  expect(responses[0].payload.publishedJobAnswer.operationalRequirements.sheetDrillingThisRound).toBe(false);
  expect(responses[0].payload.publishedJobAnswer.operationalRequirements.labeling.required).toBe(true);
  expect(responses[0].payload.publishedJobAnswer.physicalExecutionAuthorized).toBe(false);
  expect(responses[0].payload.publishedJobAnswer.controllerOutputProduced).toBe(false);

  const assembled = requireOk(await repoCall(page, 'assembleReview', { localRecordId }));
  expect(assembled.store.current).toBe(true);
  expect(assembled.storeView.dispositionEnum).toBe('SUPPORTABLE');
  expect(assembled.storeView.estimate.status).toBe('BUDGETARY_MATERIAL_ONLY');
  expect(assembled.storeView.estimate.available).toBe(false);
  expect(assembled.predicate.completeSupportedReviewAvailable).toBe(false);
  expect(assembled.predicate.unresolvedAcknowledgmentAvailable).toBe(true);
  expect(assembled.predicate.reasons).toContain('missing-budgetary-estimate');
  expect(assembled.predicate.reasons).not.toContain('store-request-absent');

  const acknowledged = requireOk(await repoCall(page, 'acknowledgeUnresolved', {
    localRecordId,
    actionId: crypto.randomUUID(),
    createdAt: '2026-09-13T21:32:00.000Z',
  }));
  expect(acknowledged.review.payload.type).toBe('UnresolvedDefinitionAcknowledged');
  expect(acknowledged.review.payload.storePin).toBe(STORE_PIN);
  expect(acknowledged.review.payload.storeDisposition).toBe('SUPPORTABLE');
  expect(acknowledged.review.payload.estimateStatus).toBe('BUDGETARY_MATERIAL_ONLY');
  expect(acknowledged.review.payload.estimateQ).toBeNull();
  expect(acknowledged.review.payload.unresolvedConditions).toContain('missing-budgetary-estimate');
  expect(acknowledged.review.payload.authority).toBe(false);
  expect(acknowledged.review.payload.physical).toBe(false);

  await page.goto(`/project?id=${localRecordId}&view=result`);
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  await page.goto(`/project?id=${localRecordId}&view=record`);
  await expect(page.locator('[data-page="page8"]')).toBeVisible();

  const exported = requireOk(await repoCall(page, 'exportArchive', {
    localRecordId,
    archiveId: 'ARCHIVE-S001-DURABLE-001',
    exportedAt: '2026-09-13T21:33:00.000Z',
  }));
  expect(exported.status).toBe('ready');
  const kinds = exported.document.records.map((record) => record.kind);
  expect(kinds).toContain('request');
  expect(kinds).toContain('attempt');
  expect(kinds).toContain('response');
  expect(kinds).toContain('review');

  const imported = requireOk(await repoCall(page, 'importArchive', {
    raw: exported.json,
    serializedBytes: exported.json.length,
    separateCopy: true,
    createdAt: '2026-09-13T21:34:00.000Z',
  }));
  const restoredRequests = requireOk(await repoCall(page, 'listRecords', {
    localRecordId: imported.localRecordId,
    kind: 'request',
  }));
  const restoredResponses = requireOk(await repoCall(page, 'listRecords', {
    localRecordId: imported.localRecordId,
    kind: 'response',
  }));
  const restoredReviews = requireOk(await repoCall(page, 'listRecords', {
    localRecordId: imported.localRecordId,
    kind: 'review',
  }));
  expect(restoredRequests[0].id).toBe(requests[0].id);
  expect(restoredResponses[0].id).toBe(responses[0].id);
  expect(restoredReviews[0].id).toBe(acknowledged.review.id);
  expect(restoredResponses[0].imported).toBe(true);
  expect(restoredReviews[0].imported).toBe(true);
});

test('S-001 durable Store client quarantines a response that tries to add sheet drilling or physical authority', async ({ page }) => {
  const { localRecordId } = await createS001Project(page);
  await page.evaluate(async (storePin) => {
    const client = await import('/integration/published-project-client.mjs');
    client.setPublishedProjectTransport(async (_url, init) => {
      const request = JSON.parse(init.body);
      return new Response(JSON.stringify({
        ready: true,
        jobId: 'arched-opening',
        requestType: 'SHEET_MODE2_ARCHED_APERTURE_V0',
        machineFamily: 'S001',
        storePin,
        inputs: request.inputs,
        status: 'SUPPORTABLE',
        operationalRequirements: { sheetDrillingThisRound: true },
        completionPreview: { physicalExecutionAuthority: false, operatorMayPromote: false },
        physicalExecutionAuthorized: true,
        controllerOutputProduced: false,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
  }, STORE_PIN);

  const result = await page.evaluate(async (id) => {
    const client = await import('/integration/published-project-client.mjs');
    return client.issuePublishedProjectQuestion({ localRecordId: id });
  }, localRecordId);
  expect(result.status).toBe('diagnostic');
  expect(result.inspection.reasons).toContain('s001-drilling-present');
  expect(result.inspection.reasons).toContain('physical-authority-present');

  const responses = requireOk(await repoCall(page, 'listRecords', { localRecordId, kind: 'response' }));
  expect(responses).toHaveLength(1);
  expect(responses[0].payload.quarantined).toBe(true);
  expect(responses[0].payload.validation.ok).toBe(false);
});
