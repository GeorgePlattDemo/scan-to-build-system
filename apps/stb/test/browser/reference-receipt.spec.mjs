import { expect, test } from '@playwright/test';

export async function receiptScenario() {
  const repo = await import('/data/repository.mjs');
  const receipt = await import('/domain/reference-receipt.mjs');
  const rule = await import('/shared/alcove-rule.mjs');
  const archive = await import('/data/archive.mjs');
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const localRecordId = crypto.randomUUID(), projectId = crypto.randomUUID(), candidateRevisionId = crypto.randomUUID();
  const choices = { edge: 'ascut', bore: 'class', hw: 'none', label: 'std', finish: 'none', excess: 'take', pack: 'loose', handoff: 'pickup', who: 'me', stock: 'ask' };
  const createdAt = new Date().toISOString();
  await repo.commitPreparedChange({ localRecordId, projectId, expectedHead: null, nextHead: candidateRevisionId,
    createdAt, index: { classId: rule.ALCOVE_CLASS_ID, entryMode: 'mapped' },
    records: [{ localRecordId, projectId, kind: 'candidate', id: candidateRevisionId, createdAt,
      payload: { configuration: rule.normalizeAlcoveConfiguration(rule.ALCOVE_REFERENCE_EXAMPLE) } }] });
  const args = { localRecordId, candidateRevisionId, choices };
  const first = await receipt.saveReferenceRequest(args);
  assert((await receipt.saveReferenceRequest(args)).id === first.id, 'Repeated send duplicated the request');
  await receipt.saveReferenceMaterialChoice({ ...args, requestId: first.id, choice: 'wait' });
  await repo.closeDatabase();
  assert((await receipt.referenceReceipts(localRecordId)).length === 2, 'Receipt lost on database reopen');
  const amended = await receipt.saveReferenceRequest({ ...args, choices: { ...choices, pack: 'box' } });
  assert(amended.payload.previousReceiptId === first.id, 'Amendment lost its prior receipt');
  assert((await repo.getRecord(localRecordId, 'reference-exchange', first.id)).payload.choices.pack === 'loose', 'Prior receipt was overwritten');
  let refused = false;
  try { await receipt.saveReferenceMaterialChoice({ ...args, requestId: first.id, choice: 'review' }); } catch { refused = true; }
  assert(refused, 'Earlier request was allowed to receive a current material decision');
  refused = false;
  try { await receipt.saveReferenceRequest({ ...args, choices: { ...choices, finish: 'stain' } }); } catch { refused = true; }
  assert(refused, 'Unavailable service was saved');
  refused = false;
  try { await receipt.saveReferenceRequest({ ...args, candidateRevisionId: 'stale' }); } catch { refused = true; }
  assert(refused, 'Stale revision was saved');
  const exported = await archive.exportOwnerArchive(localRecordId);
  assert(exported.status === 'ready', 'Existing archive export failed');
  const records = exported.document.records.filter(record => record.kind === 'reference-exchange');
  assert(records.length === 3, 'Export did not retain all receipts');
  assert(records.every(record => record.payload.authority === false && record.payload.physical === false && record.payload.commercial === false), 'Reference record acquired authority');
  assert((await repo.getProject(localRecordId)).currentHead === candidateRevisionId, 'Receipt changed the candidate head');
  const imported = await archive.importOwnerArchive(exported.json, { separateCopy: true });
  assert(imported.localRecordId, 'Receipt archive could not be imported');
  assert((await receipt.referenceReceipts(imported.localRecordId)).length === 3, 'Imported history lost receipts');
  refused = false;
  try { await receipt.saveReferenceRequest({ ...args, localRecordId: imported.localRecordId }); } catch { refused = true; }
  assert(refused, 'Imported reference history was treated as an active request');
  return { localRecordId, receiptId: amended.id, retained: records.length };
}

test('reference receipts retain amendments, survive reopening, and travel in the owner archive', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(receiptScenario);
  expect(result.retained).toBe(3);
  await page.reload();
  const ids = await page.evaluate(async (localRecordId) => {
    const { referenceReceipts } = await import('/domain/reference-receipt.mjs');
    return (await referenceReceipts(localRecordId)).map(record => record.id);
  }, result.localRecordId);
  expect(ids).toContain(result.receiptId);
});
