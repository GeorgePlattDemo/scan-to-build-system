import { FIXED_ORIGIN } from '/shared/contracts.mjs';
import { sha256Hex } from '/shared/canonical.mjs';
import { commitPreparedChange, getDraft } from '/data/repository.mjs';
import { attemptInspection, blobCustody } from '/data/selectors.mjs';
import { startShell } from '/ui/shell.mjs';

function setStatus(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

function probeIndexedDb() {
  return new Promise((resolve) => {
    if (typeof indexedDB !== 'object' || indexedDB === null) {
      resolve('unavailable');
      return;
    }
    const request = indexedDB.open('stb-capability-probe');
    request.onerror = () => resolve('unavailable');
    request.onsuccess = () => {
      request.result.close();
      indexedDB.deleteDatabase('stb-capability-probe');
      resolve('available');
    };
  });
}

export async function savePreparedChange(input) {
  setStatus('save-status', 'Saving…');
  try {
    const result = await commitPreparedChange(input);
    if (result.status === 'committed' || result.status === 'idempotent') {
      setStatus('save-status', 'Saved on this device');
      return result;
    }
    setStatus('save-status', 'Save failed');
    return result;
  } catch (error) {
    setStatus('save-status', 'Save failed');
    throw error;
  }
}

export async function inspectSource(sha256) {
  const custody = await blobCustody(sha256);
  if (custody.status === 'retained') {
    setStatus('source-status', 'Original retained');
  } else {
    setStatus('source-status', 'Original source unavailable');
  }
  return custody;
}

export async function inspectAttempt(localRecordId, attemptId) {
  const inspection = await attemptInspection(localRecordId, attemptId);
  if (inspection.status === 'interrupted') {
    setStatus('attempt-status', 'Interrupted historical attempt');
  } else if (inspection.status === 'historical') {
    setStatus('attempt-status', 'Historical attempt');
  } else {
    setStatus('attempt-status', 'Attempt unavailable');
  }
  return inspection;
}

export async function inspectUnapplied(localRecordId, draftId) {
  const draft = await getDraft(localRecordId, draftId);
  setStatus('unapplied-status', draft ? 'Unapplied changes' : 'none');
  return draft;
}

const root = document.getElementById('app');
if (root) {
  startShell(root);
}

setStatus('origin-status', window.location.origin === FIXED_ORIGIN ? FIXED_ORIGIN : window.location.origin);
setStatus(
  'storage-origin-status',
  window.location.origin === FIXED_ORIGIN
    ? `Product origin ${FIXED_ORIGIN}`
    : `This origin (${window.location.origin}) is not ${FIXED_ORIGIN}. Local records for the product origin are not visible here. They were not deleted.`,
);
setStatus('blob-status', typeof Blob === 'function' ? 'available' : 'unavailable');

probeIndexedDb().then((status) => setStatus('indexeddb-status', status));

sha256Hex(new TextEncoder().encode('stb-build0-capability'))
  .then((hex) => setStatus('sha256-status', hex))
  .catch(() => setStatus('sha256-status', 'unavailable'));
