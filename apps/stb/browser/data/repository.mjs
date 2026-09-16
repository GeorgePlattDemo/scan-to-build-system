import {
  DATABASE_NAME,
  MAX_SOURCE_BYTES,
  OBJECT_STORES,
  SCHEMA_VERSION,
} from '/shared/contracts.mjs';
import { canonicalEqual, canonicalize, sha256Hex } from '/shared/canonical.mjs';

export class RepositoryError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
  }
}

const ACTION_KIND = 'action';

let openPromise = null;
let schemaBlock = null;

function requestAsPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => {
      reject(
        transaction.error ??
          new RepositoryError('transaction-aborted', 'IndexedDB transaction aborted'),
      );
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

function unsupportedSchemaError(detail) {
  return new RepositoryError(
    'unsupported-schema',
    `Unsupported stb-app-v1 schema (${detail}). Writes are stopped. The database was not reset.`,
  );
}

function createSchema(database) {
  const records = database.createObjectStore('records', {
    keyPath: ['localRecordId', 'kind', 'id'],
  });
  records.createIndex('byActionId', ['localRecordId', 'actionId'], { unique: true });
  records.createIndex('byParent', ['localRecordId', 'parentKind', 'parentId']);
  records.createIndex('byRequestAttempt', ['localRecordId', 'requestId', 'attemptId']);
  database.createObjectStore('projects', { keyPath: 'localRecordId' });
  database.createObjectStore('blobs', { keyPath: 'sha256' });
  database.createObjectStore('drafts', { keyPath: ['localRecordId', 'draftId'] });
}

function openDatabaseOnce() {
  return new Promise((resolve, reject) => {
    let request;
    try {
      request = indexedDB.open(DATABASE_NAME, SCHEMA_VERSION);
    } catch (error) {
      reject(error);
      return;
    }

    request.onupgradeneeded = (event) => {
      if (event.oldVersion === 0) {
        createSchema(request.result);
        return;
      }
      request.transaction.abort();
    };

    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        openPromise = null;
      };
      resolve(database);
    };

    request.onerror = () => {
      const error = request.error;
      if (error && error.name === 'VersionError') {
        schemaBlock = unsupportedSchemaError(`IndexedDB version newer than ${SCHEMA_VERSION}`);
        reject(schemaBlock);
        return;
      }
      reject(error);
    };

    request.onblocked = () => {
      reject(new RepositoryError('database-blocked', 'stb-app-v1 open is blocked'));
    };
  });
}

export async function openDatabase() {
  if (schemaBlock) {
    throw schemaBlock;
  }
  if (!openPromise) {
    openPromise = openDatabaseOnce().catch((error) => {
      openPromise = null;
      throw error;
    });
  }
  return openPromise;
}

export async function closeDatabase() {
  const pending = openPromise;
  openPromise = null;
  if (!pending) {
    return;
  }
  try {
    const database = await pending;
    database.close();
  } catch {
    // ignore a failed open so callers can continue
  }
}

export async function describeDatabase() {
  const database = await openDatabase();
  return {
    name: database.name,
    version: database.version,
    stores: [...database.objectStoreNames].sort(),
  };
}


function requireString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RepositoryError('invalid-argument', `${name} is required`);
  }
  return value;
}

function toUint8Array(bytes) {
  if (bytes instanceof Uint8Array) {
    return bytes;
  }
  if (bytes instanceof ArrayBuffer) {
    return new Uint8Array(bytes);
  }
  if (Array.isArray(bytes)) {
    return Uint8Array.from(bytes);
  }
  throw new RepositoryError('invalid-argument', 'blob bytes must be a byte array');
}

export async function prepareBlob({ bytes, type }) {
  const view = toUint8Array(bytes);
  if (view.byteLength > MAX_SOURCE_BYTES) {
    throw new RepositoryError(
      'source-too-large',
      `Original source exceeds ${MAX_SOURCE_BYTES} bytes`,
    );
  }
  const sha256 = await sha256Hex(view);
  return {
    sha256,
    size: view.byteLength,
    type: requireString('type', type),
    bytes: view.slice(),
  };
}

export function prepareRecord(input) {
  const record = {
    schemaVersion: SCHEMA_VERSION,
    localRecordId: requireString('localRecordId', input.localRecordId),
    projectId: requireString('projectId', input.projectId),
    kind: requireString('kind', input.kind),
    id: requireString('id', input.id),
    createdAt: requireString('createdAt', input.createdAt),
    payload: input.payload === undefined ? {} : input.payload,
  };
  for (const optional of ['parentKind', 'parentId', 'requestId', 'attemptId']) {
    if (input[optional] !== undefined) {
      record[optional] = requireString(optional, input[optional]);
    }
  }
  canonicalize(record);
  return record;
}

async function verifyPreparedBlob(blob) {
  const view = toUint8Array(blob.bytes);
  if (view.byteLength !== blob.size) {
    throw new RepositoryError('hash-mismatch', 'Prepared blob size does not match bytes');
  }
  const digest = await sha256Hex(view);
  if (digest !== blob.sha256) {
    throw new RepositoryError('hash-mismatch', 'Prepared blob SHA-256 does not match bytes');
  }
  if (view.byteLength > MAX_SOURCE_BYTES) {
    throw new RepositoryError(
      'source-too-large',
      `Original source exceeds ${MAX_SOURCE_BYTES} bytes`,
    );
  }
  return {
    sha256: blob.sha256,
    size: blob.size,
    type: requireString('type', blob.type),
    bytes: view.slice(),
  };
}

function actionRecord({ localRecordId, projectId, actionId, expectedHead, nextHead, createdAt, eventId }) {
  return prepareRecord({
    localRecordId,
    projectId,
    kind: ACTION_KIND,
    id: actionId,
    createdAt,
    payload: {
      expectedHead,
      resultingHead: nextHead,
      eventId: eventId ?? null,
    },
  });
}

function withActionId(record, actionId) {
  return { ...record, actionId };
}

export async function getProject(localRecordId) {
  const database = await openDatabase();
  const transaction = database.transaction('projects', 'readonly');
  return (await requestAsPromise(transaction.objectStore('projects').get(localRecordId))) ?? null;
}

export async function listProjects() {
  if (typeof indexedDB.databases === 'function') {
    const names = await indexedDB.databases();
    if (!names.some((entry) => entry.name === DATABASE_NAME)) {
      return [];
    }
  }
  const database = await openDatabase();
  const transaction = database.transaction('projects', 'readonly');
  return requestAsPromise(transaction.objectStore('projects').getAll());
}



export async function getRecord(localRecordId, kind, id) {
  const database = await openDatabase();
  const transaction = database.transaction('records', 'readonly');
  return (
    (await requestAsPromise(
      transaction.objectStore('records').get([localRecordId, kind, id]),
    )) ?? null
  );
}

export async function listRecords(localRecordId, kind) {
  const database = await openDatabase();
  const transaction = database.transaction('records', 'readonly');
  const range = IDBKeyRange.bound(
    [localRecordId, kind, ''],
    [localRecordId, kind, '\uffff'],
  );
  return requestAsPromise(transaction.objectStore('records').getAll(range));
}


export async function getBlob(sha256) {
  const database = await openDatabase();
  const transaction = database.transaction('blobs', 'readonly');
  const stored = await requestAsPromise(transaction.objectStore('blobs').get(sha256));
  if (!stored) {
    return null;
  }
  try {
    if (!stored.bytes || typeof stored.bytes.arrayBuffer !== 'function') {
      return {
        sha256: stored.sha256,
        size: stored.size,
        type: stored.type,
        bytes: null,
        digestMatches: false,
        readError: true,
      };
    }
    const buffer = await stored.bytes.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const digest = await sha256Hex(bytes);
    return {
      sha256: stored.sha256,
      size: stored.size,
      type: stored.type,
      bytes,
      digestMatches: digest === stored.sha256 && bytes.byteLength === stored.size,
    };
  } catch {
    return {
      sha256: stored.sha256,
      size: stored.size,
      type: stored.type,
      bytes: null,
      digestMatches: false,
      readError: true,
    };
  }
}

export async function getRecordsByRequestAttempt(localRecordId, requestId, attemptId) {
  const database = await openDatabase();
  const transaction = database.transaction('records', 'readonly');
  return requestAsPromise(
    transaction
      .objectStore('records')
      .index('byRequestAttempt')
      .getAll([localRecordId, requestId, attemptId]),
  );
}

export async function putDraft(input) {
  if (schemaBlock) {
    throw schemaBlock;
  }
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const draftId = requireString('draftId', input.draftId);
  const createdAt = requireString('createdAt', input.createdAt);
  const draft = {
    localRecordId,
    draftId,
    expectedHead: input.expectedHead === undefined ? null : input.expectedHead,
    payload: input.payload === undefined ? {} : input.payload,
    createdAt,
    updatedAt: input.updatedAt === undefined ? createdAt : requireString('updatedAt', input.updatedAt),
  };
  canonicalize(draft);
  const database = await openDatabase();
  const transaction = database.transaction('drafts', 'readwrite');
  transaction.objectStore('drafts').put(draft);
  await transactionDone(transaction);
  return draft;
}

export async function getDraft(localRecordId, draftId) {
  const database = await openDatabase();
  const transaction = database.transaction('drafts', 'readonly');
  return (
    (await requestAsPromise(
      transaction.objectStore('drafts').get([localRecordId, draftId]),
    )) ?? null
  );
}


async function putImmutableRecord(store, record) {
  const existing = await requestAsPromise(
    store.get([record.localRecordId, record.kind, record.id]),
  );
  if (!existing) {
    store.put(record);
    return 'inserted';
  }
  if (!canonicalEqual(existing, record)) {
    throw new RepositoryError(
      'immutable-conflict',
      `Immutable record ${record.kind}/${record.id} already exists with different content`,
    );
  }
  return 'idempotent';
}

async function putBlob(store, blob) {
  const existing = await requestAsPromise(store.get(blob.sha256));
  if (!existing) {
    store.put({
      sha256: blob.sha256,
      size: blob.size,
      type: blob.type,
      bytes: new Blob([blob.bytes], { type: blob.type }),
    });
    return 'inserted';
  }
  if (existing.size !== blob.size || existing.type !== blob.type) {
    throw new RepositoryError(
      'immutable-conflict',
      `Blob ${blob.sha256} already exists with different metadata`,
    );
  }
  return 'idempotent';
}

export async function commitPreparedChange(input) {
  if (schemaBlock) {
    throw schemaBlock;
  }

  const localRecordId = requireString('localRecordId', input.localRecordId);
  const projectId = requireString('projectId', input.projectId);
  const nextHead = requireString('nextHead', input.nextHead);
  const createdAt = requireString('createdAt', input.createdAt);
  const expectedHead = input.expectedHead === null ? null : requireString('expectedHead', input.expectedHead);
  const actionId = input.actionId === undefined ? null : requireString('actionId', input.actionId);
  const testFault = input.testFault ?? null;

  if (expectedHead === nextHead) {
    throw new RepositoryError('invalid-argument', 'nextHead must differ from expectedHead');
  }

  const records = (input.records ?? []).map((record) => prepareRecord(record));
  for (const record of records) {
    if (record.localRecordId !== localRecordId || record.projectId !== projectId) {
      throw new RepositoryError(
        'invalid-argument',
        'Prepared records must match commit namespace and projectId',
      );
    }
    if (record.kind === ACTION_KIND) {
      throw new RepositoryError(
        'invalid-argument',
        'Action receipts are created by the repository, not supplied as domain records',
      );
    }
  }

  let event = null;
  if (input.event) {
    event = prepareRecord(input.event);
    if (event.localRecordId !== localRecordId || event.projectId !== projectId) {
      throw new RepositoryError(
        'invalid-argument',
        'Prepared event must match commit namespace and projectId',
      );
    }
  }

  const blobs = await Promise.all((input.blobs ?? []).map((blob) => verifyPreparedBlob(blob)));

  const database = await openDatabase();
  const presentStores = new Set(database.objectStoreNames);
  if (!OBJECT_STORES.every((name) => presentStores.has(name))) {
    schemaBlock = unsupportedSchemaError('missing required object stores');
    throw schemaBlock;
  }

  const transaction = database.transaction(['projects', 'records', 'blobs'], 'readwrite');
  const projectStore = transaction.objectStore('projects');
  const recordStore = transaction.objectStore('records');
  const blobStore = transaction.objectStore('blobs');

  try {
    if (actionId) {
      const existingAction = await requestAsPromise(
        recordStore.index('byActionId').get([localRecordId, actionId]),
      );
      if (existingAction) {
        await transactionDone(transaction);
        return {
          status: 'idempotent',
          head: existingAction.payload.resultingHead,
          actionId,
        };
      }
    }

    const project = await requestAsPromise(projectStore.get(localRecordId));
    const currentHead = project ? project.currentHead : null;
    if (currentHead !== expectedHead) {
      throw new RepositoryError(
        'head-conflict',
        `Expected head ${String(expectedHead)} but found ${String(currentHead)}`,
      );
    }
    if (project && project.projectId !== projectId) {
      throw new RepositoryError(
        'invalid-argument',
        'localRecordId is already bound to a different projectId',
      );
    }

    for (const blob of blobs) {
      await putBlob(blobStore, blob);
    }
    for (const record of records) {
      await putImmutableRecord(recordStore, record);
    }
    if (event) {
      await putImmutableRecord(recordStore, event);
    }

    if (testFault === 'abort-after-writes') {
      transaction.abort();
      throw new RepositoryError(
        'injected-abort',
        'Injected transaction abort after writes began, before completion',
      );
    }

    const eventSequence = project ? project.eventSequence + 1 : 1;
    if (actionId) {
      await putImmutableRecord(
        recordStore,
        withActionId(
          actionRecord({
            localRecordId,
            projectId,
            actionId,
            expectedHead,
            nextHead,
            createdAt,
            eventId: event ? event.id : null,
          }),
          actionId,
        ),
      );
    }

    if (testFault === 'abort-before-head') {
      transaction.abort();
      throw new RepositoryError(
        'injected-abort',
        'Injected transaction abort after prepared writes, before head advancement',
      );
    }

    projectStore.put({
      schemaVersion: SCHEMA_VERSION,
      localRecordId,
      projectId,
      currentHead: nextHead,
      eventSequence,
      createdAt: project ? project.createdAt : createdAt,
      updatedAt: createdAt,
      title: project ? project.title : (input.index?.title ?? null),
      entryMode: project ? project.entryMode : (input.index?.entryMode ?? null),
      classId: project ? project.classId : (input.index?.classId ?? null),
      classVersion: project ? project.classVersion : (input.index?.classVersion ?? null),
      ...((project?.ownerAccountId ?? input.index?.ownerAccountId)
        ? { ownerAccountId: project?.ownerAccountId ?? input.index.ownerAccountId }
        : {}),
      ...(project?.imported === true
        ? {
            imported: true,
            importOrigin: project.importOrigin ?? 'owner-archive',
            importArchiveId: project.importArchiveId ?? null,
            unknownClass: project.unknownClass === true,
          }
        : {}),
    });

    await transactionDone(transaction);
    return {
      status: 'committed',
      head: nextHead,
      eventSequence,
      actionId,
    };
  } catch (error) {
    try {
      transaction.abort();
    } catch {
      // already aborted or completed
    }
    try {
      await transactionDone(transaction);
    } catch {
      // expected when the transaction aborted
    }
    if (error instanceof RepositoryError) {
      throw error;
    }
    throw new RepositoryError('transaction-aborted', error.message ?? String(error));
  }
}

export async function commitPreparedAppend(input) {
  if (schemaBlock) {
    throw schemaBlock;
  }

  const localRecordId = requireString('localRecordId', input.localRecordId);
  const projectId = requireString('projectId', input.projectId);
  const createdAt = requireString('createdAt', input.createdAt);
  const expectedHead =
    input.expectedHead === undefined || input.expectedHead === null
      ? null
      : requireString('expectedHead', input.expectedHead);
  const actionId = input.actionId === undefined ? null : requireString('actionId', input.actionId);
  const testFault = input.testFault ?? null;

  const records = (input.records ?? []).map((record) => prepareRecord(record));
  for (const record of records) {
    if (record.localRecordId !== localRecordId || record.projectId !== projectId) {
      throw new RepositoryError(
        'invalid-argument',
        'Prepared records must match commit namespace and projectId',
      );
    }
    if (record.kind === ACTION_KIND) {
      throw new RepositoryError(
        'invalid-argument',
        'Action receipts are created by the repository, not supplied as domain records',
      );
    }
  }

  let event = null;
  if (input.event) {
    event = prepareRecord(input.event);
    if (event.localRecordId !== localRecordId || event.projectId !== projectId) {
      throw new RepositoryError(
        'invalid-argument',
        'Prepared event must match commit namespace and projectId',
      );
    }
  }

  const database = await openDatabase();
  const presentStores = new Set(database.objectStoreNames);
  if (!OBJECT_STORES.every((name) => presentStores.has(name))) {
    schemaBlock = unsupportedSchemaError('missing required object stores');
    throw schemaBlock;
  }

  const transaction = database.transaction(['projects', 'records'], 'readwrite');
  const projectStore = transaction.objectStore('projects');
  const recordStore = transaction.objectStore('records');

  try {
    if (actionId) {
      const existingAction = await requestAsPromise(
        recordStore.index('byActionId').get([localRecordId, actionId]),
      );
      if (existingAction) {
        await transactionDone(transaction);
        return {
          status: 'idempotent',
          head: existingAction.payload.resultingHead,
          actionId,
        };
      }
    }

    const project = await requestAsPromise(projectStore.get(localRecordId));
    if (!project) {
      throw new RepositoryError('not-found', 'Cannot append Store history without a project');
    }
    if (project.projectId !== projectId) {
      throw new RepositoryError(
        'invalid-argument',
        'localRecordId is already bound to a different projectId',
      );
    }
    if (expectedHead !== null && project.currentHead !== expectedHead) {
      throw new RepositoryError(
        'head-conflict',
        `Expected head ${String(expectedHead)} but found ${String(project.currentHead)}`,
      );
    }

    for (const record of records) {
      await putImmutableRecord(recordStore, record);
    }
    if (event) {
      await putImmutableRecord(recordStore, event);
    }

    if (testFault === 'abort-after-writes') {
      transaction.abort();
      throw new RepositoryError(
        'injected-abort',
        'Injected transaction abort after writes began, before completion',
      );
    }

    const eventSequence = project.eventSequence + 1;
    if (actionId) {
      await putImmutableRecord(
        recordStore,
        withActionId(
          actionRecord({
            localRecordId,
            projectId,
            actionId,
            expectedHead: project.currentHead,
            nextHead: project.currentHead,
            createdAt,
            eventId: event ? event.id : null,
          }),
          actionId,
        ),
      );
    }

    projectStore.put({
      ...project,
      eventSequence,
      updatedAt: createdAt,
    });

    await transactionDone(transaction);
    return {
      status: 'appended',
      head: project.currentHead,
      eventSequence,
      actionId,
    };
  } catch (error) {
    try {
      transaction.abort();
    } catch {
      // already aborted or completed
    }
    try {
      await transactionDone(transaction);
    } catch {
      // expected when the transaction aborted
    }
    if (error instanceof RepositoryError) {
      throw error;
    }
    throw new RepositoryError('transaction-aborted', error.message ?? String(error));
  }
}

function recordsRange(localRecordId) {
  return IDBKeyRange.bound(
    [localRecordId, '', ''],
    [localRecordId, '\uffff', '\uffff'],
  );
}

async function readBlobBytes(stored) {
  if (!stored) {
    return null;
  }
  if (stored.bytes instanceof Uint8Array) {
    return stored.bytes;
  }
  if (stored.bytes && typeof stored.bytes.arrayBuffer === 'function') {
    const buffer = await stored.bytes.arrayBuffer();
    return new Uint8Array(buffer);
  }
  return null;
}

function evidenceHashes(records) {
  const hashes = [];
  for (const record of records) {
    if (record.kind === 'evidence' && typeof record.payload?.sha256 === 'string') {
      hashes.push(record.payload.sha256);
    }
  }
  return [...new Set(hashes)].sort();
}

function stampImportedRecord(record, localRecordId) {
  const stamped = {
    schemaVersion: record.schemaVersion ?? SCHEMA_VERSION,
    localRecordId,
    projectId: record.projectId,
    kind: record.kind,
    id: record.id,
    createdAt: record.createdAt,
    payload: record.payload === undefined ? {} : record.payload,
    imported: true,
  };
  for (const optional of ['parentKind', 'parentId', 'requestId', 'attemptId', 'actionId']) {
    if (record[optional] !== undefined) {
      stamped[optional] = record[optional];
    }
  }
  canonicalize(stamped);
  return stamped;
}

export async function listAllRecords(localRecordId) {
  const database = await openDatabase();
  const transaction = database.transaction('records', 'readonly');
  return requestAsPromise(transaction.objectStore('records').getAll(recordsRange(localRecordId)));
}

export async function readConsistentProjectSnapshot(localRecordId, { testYield } = {}) {
  const database = await openDatabase();
  const transaction = database.transaction(['projects', 'records', 'blobs'], 'readonly');
  const projectStore = transaction.objectStore('projects');
  const recordStore = transaction.objectStore('records');
  const blobStore = transaction.objectStore('blobs');
  const project = await requestAsPromise(projectStore.get(localRecordId));
  if (!project) {
    await transactionDone(transaction);
    return null;
  }
  const records = await requestAsPromise(recordStore.getAll(recordsRange(localRecordId)));
  const hashes = evidenceHashes(records);
  const storedBlobs = [];
  for (const sha256 of hashes) {
    storedBlobs.push(await requestAsPromise(blobStore.get(sha256)));
  }
  await transactionDone(transaction);
  if (typeof testYield === 'function') {
    await testYield({
      localRecordId,
      projectId: project.projectId,
      currentHead: project.currentHead,
    });
  }
  const blobs = {};
  const missingEvidence = [];
  for (let index = 0; index < hashes.length; index += 1) {
    const sha256 = hashes[index];
    const stored = storedBlobs[index];
    if (!stored) {
      missingEvidence.push(sha256);
      continue;
    }
    try {
      const bytes = await readBlobBytes(stored);
      if (!bytes) {
        missingEvidence.push(sha256);
        continue;
      }
      const digest = await sha256Hex(bytes);
      if (digest !== sha256 || bytes.byteLength !== stored.size) {
        missingEvidence.push(sha256);
        continue;
      }
      blobs[sha256] = {
        sha256,
        size: bytes.byteLength,
        type: stored.type ?? 'application/octet-stream',
        bytes,
      };
    } catch {
      missingEvidence.push(sha256);
    }
  }
  return {
    project,
    records,
    blobs,
    missingEvidence,
    namedHead: project.currentHead,
  };
}

export async function importProjectNamespace(input) {
  if (schemaBlock) {
    throw schemaBlock;
  }
  const archiveId = requireString('archiveId', input.archiveId);
  const createdAt = requireString('createdAt', input.createdAt);
  const sourceProject = input.project;
  if (!sourceProject || typeof sourceProject.projectId !== 'string' || sourceProject.projectId.length === 0) {
    throw new RepositoryError('invalid-argument', 'Import requires project.projectId');
  }
  const records = input.records ?? [];
  const blobs = Object.values(input.blobs ?? {});
  const separateCopy = input.separateCopy === true;
  const unknownClass = input.unknownClass === true;
  const testFault = input.testFault ?? null;

  const database = await openDatabase();
  const presentStores = new Set(database.objectStoreNames);
  if (!OBJECT_STORES.every((name) => presentStores.has(name))) {
    schemaBlock = unsupportedSchemaError('missing required object stores');
    throw schemaBlock;
  }

  const transaction = database.transaction(['projects', 'records', 'blobs'], 'readwrite');
  const projectStore = transaction.objectStore('projects');
  const recordStore = transaction.objectStore('records');
  const blobStore = transaction.objectStore('blobs');

  try {
    const existingProjects = await requestAsPromise(projectStore.getAll());
    const byArchive = existingProjects.find((entry) => entry.importArchiveId === archiveId);
    if (byArchive) {
      await transactionDone(transaction);
      return {
        status: 'idempotent',
        localRecordId: byArchive.localRecordId,
        projectId: byArchive.projectId,
        unknownClass: byArchive.unknownClass === true,
      };
    }
    const collisions = existingProjects.filter((entry) => entry.projectId === sourceProject.projectId);
    if (collisions.length > 0 && !separateCopy) {
      await transactionDone(transaction);
      return {
        status: 'collision',
        existing: collisions[0],
        matches: collisions,
        projectId: sourceProject.projectId,
      };
    }

    const localRecordId = crypto.randomUUID();
    const stampedRecords = records.map((record) => stampImportedRecord(record, localRecordId));
    for (const blob of blobs) {
      await putBlob(blobStore, {
        sha256: blob.sha256,
        size: blob.size,
        type: blob.type ?? 'application/octet-stream',
        bytes: blob.bytes,
      });
    }
    for (const record of stampedRecords) {
      await putImmutableRecord(recordStore, record);
    }

    if (testFault === 'abort-after-writes') {
      transaction.abort();
      throw new RepositoryError(
        'injected-abort',
        'Injected transaction abort after writes began, before completion',
      );
    }

    projectStore.put({
      schemaVersion: SCHEMA_VERSION,
      localRecordId,
      projectId: sourceProject.projectId,
      currentHead: sourceProject.currentHead ?? null,
      eventSequence: sourceProject.eventSequence ?? 0,
      createdAt: sourceProject.createdAt ?? createdAt,
      updatedAt: createdAt,
      title: sourceProject.title ?? null,
      entryMode: sourceProject.entryMode ?? null,
      classId: sourceProject.classId ?? null,
      classVersion: sourceProject.classVersion ?? null,
      ...(sourceProject.ownerAccountId ? { ownerAccountId: sourceProject.ownerAccountId } : {}),
      imported: true,
      importOrigin: 'owner-archive',
      importArchiveId: archiveId,
      unknownClass,
    });

    await transactionDone(transaction);
    return {
      status: 'imported',
      localRecordId,
      projectId: sourceProject.projectId,
      unknownClass,
      recordCount: stampedRecords.length,
      blobCount: blobs.length,
    };
  } catch (error) {
    try {
      transaction.abort();
    } catch {
      // already aborted or completed
    }
    try {
      await transactionDone(transaction);
    } catch {
      // expected when the transaction aborted
    }
    if (error instanceof RepositoryError) {
      throw error;
    }
    throw new RepositoryError('transaction-aborted', error.message ?? String(error));
  }
}

