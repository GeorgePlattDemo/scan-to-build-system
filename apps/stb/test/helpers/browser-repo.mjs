export async function repoCall(page, op, payload = null) {
  return page.evaluate(async ({ op, payload }) => {
    const repo = await import('/data/repository.mjs');
    const selectors = await import('/data/selectors.mjs');
    const app = await import('/app.mjs');
    const candidate = await import('/domain/candidate.mjs');
    const evidence = await import('/domain/evidence.mjs');
    const observation = await import('/domain/observation.mjs');
    const board = await import('/domain/board.mjs');
    const derive = await import('/domain/derive.mjs');

    const wrap = async (fn) => {
      try {
        const value = await fn();
        return { ok: true, value };
      } catch (error) {
        return {
          ok: false,
          code: error.code ?? error.name ?? null,
          message: error.message,
        };
      }
    };

    const bytesToArray = (value) => {
      if (!value || !value.bytes) {
        return value;
      }
      return { ...value, bytes: [...value.bytes] };
    };

    const withBlobBytes = (input) => ({
      ...input,
      blobs: (input.blobs ?? []).map((blob) => ({
        ...blob,
        bytes: Uint8Array.from(blob.bytes),
      })),
    });

    switch (op) {
      case 'describe':
        return wrap(() => selectors.databaseShape());
      case 'prepareBlob':
        return wrap(async () => {
          const prepared = await repo.prepareBlob({
            bytes: Uint8Array.from(payload.bytes),
            type: payload.type,
          });
          return {
            sha256: prepared.sha256,
            size: prepared.size,
            type: prepared.type,
            bytes: [...prepared.bytes],
          };
        });
      case 'prepareRecord':
        return wrap(() => repo.prepareRecord(payload));
      case 'commit':
        return wrap(() => repo.commitPreparedChange(withBlobBytes(payload)));
      case 'save':
        return wrap(() => app.savePreparedChange(withBlobBytes(payload)));
      case 'listSaved':
        return wrap(() => selectors.listSavedProjects());
      case 'createProject':
        return wrap(() => candidate.createProject(payload));
      case 'prepareTyped':
        return wrap(async () => {
          const prepared = await evidence.prepareTypedOriginal(payload);
          return {
            ...prepared,
            blob: {
              ...prepared.blob,
              bytes: [...prepared.blob.bytes],
            },
          };
        });
      case 'prepareFile':
        return wrap(async () => {
          const prepared = await evidence.prepareFileOriginal({
            ...payload,
            bytes: Uint8Array.from(payload.bytes),
          });
          return {
            ...prepared,
            blob: {
              ...prepared.blob,
              bytes: [...prepared.blob.bytes],
            },
          };
        });
      case 'attachEvidence':
        return wrap(() =>
          evidence.attachPreparedEvidence({
            ...payload,
            prepared: {
              ...payload.prepared,
              blob: {
                ...payload.prepared.blob,
                bytes: Uint8Array.from(payload.prepared.blob.bytes),
              },
            },
          }),
        );
      case 'listEvidence':
        return wrap(() => selectors.listProjectEvidence(payload.localRecordId));
      case 'listObservations':
        return wrap(() => selectors.listProjectObservations(payload.localRecordId));
      case 'interpretMeasurement':
        return wrap(async () => observation.interpretMeasurement(payload));
      case 'interpretTakeoff':
        return wrap(async () => observation.interpretTakeoffRow(payload));
      case 'recordObservation':
        return wrap(() => observation.recordEnteredObservation(payload));
      case 'mapObservation':
        return wrap(() => observation.mapObservationToInput(payload));
      case 'correctObservation':
        return wrap(() => observation.correctObservation(payload));
      case 'detachEvidence':
        return wrap(() => observation.detachActiveEvidence(payload));
      case 'listRecords':
        return wrap(() => selectors.listProjectRecords(payload.localRecordId, payload.kind));
      case 'currentCandidate':
        return wrap(() => selectors.currentCandidate(payload.localRecordId));
      case 'currentProjection':
        return wrap(() => selectors.currentProjection(payload.localRecordId));
      case 'applyBoardLength':
        return wrap(() => board.applyBoardFinishedLength(payload));
      case 'applyCut001':
        return wrap(() => board.applyCut001DocumentaryReference(payload));
      case 'retireBoardOccurrence':
        return wrap(() => board.retireBoardOccurrence(payload));
      case 'evaluateBoard':
        return wrap(async () => {
          const { evaluateBoardRequirement } = await import('/shared/board-rule.mjs');
          return evaluateBoardRequirement(payload);
        });
      case 'lastFinishedLengthMapping':
        return wrap(() => derive.lastFinishedLengthMapping(payload.mappings));
      case 'head':
        return wrap(() => selectors.projectHead(payload.localRecordId));
      case 'project':
        return wrap(() => selectors.projectIndex(payload.localRecordId));
      case 'record':
        return wrap(() =>
          selectors.recordSnapshot(payload.localRecordId, payload.kind, payload.id),
        );
      case 'blob':
        return wrap(async () => bytesToArray(await selectors.blobCustody(payload.sha256)));
      case 'putDraft':
        return wrap(() => repo.putDraft(payload));
      case 'getDraft':
        return wrap(() => selectors.unappliedDraft(payload.localRecordId, payload.draftId));
      case 'inspectSource':
        return wrap(async () => bytesToArray(await app.inspectSource(payload.sha256)));
      case 'inspectAttempt':
        return wrap(() => app.inspectAttempt(payload.localRecordId, payload.attemptId));
      case 'inspectUnapplied':
        return wrap(() => app.inspectUnapplied(payload.localRecordId, payload.draftId));
      case 'append':
        return wrap(() => repo.commitPreparedAppend(payload));
      case 'issueStore': {
        const storeClient = await import('/integration/store-client.mjs');
        return wrap(() => storeClient.issueStoreQuestion(payload));
      }
      case 'retryStore': {
        const storeClient = await import('/integration/store-client.mjs');
        return wrap(() => storeClient.retryStoreAttempt(payload));
      }
      case 'recoverStore': {
        const storeClient = await import('/integration/store-client.mjs');
        return wrap(() => storeClient.recoverInterruptedAttempts(payload.localRecordId));
      }
      case 'currentStore':
        return wrap(() => selectors.currentStoreAnswer(payload.localRecordId, payload));
      case 'recordReview': {
        const review = await import('/domain/review.mjs');
        return wrap(() => review.recordDefinitionReview(payload));
      }
      case 'acknowledgeUnresolved': {
        const review = await import('/domain/review.mjs');
        return wrap(() => review.acknowledgeUnresolvedDefinition(payload));
      }
      case 'listReviews': {
        const review = await import('/domain/review.mjs');
        return wrap(() => review.listReviewRecords(payload.localRecordId));
      }
      case 'assembleReview': {
        const review = await import('/domain/review.mjs');
        return wrap(() => review.assembleReviewSnapshot(payload.localRecordId, payload));
      }
      case 'loadReviewPresentation': {
        const reviewView = await import('/data/review-view.mjs');
        return wrap(() => reviewView.loadReviewPresentation(payload.localRecordId, payload));
      }
      case 'listAllRecords':
        return wrap(() => repo.listAllRecords(payload.localRecordId));
      case 'snapshot':
        return wrap(async () => {
          const snapshot = await repo.readConsistentProjectSnapshot(payload.localRecordId, {
            testYield: payload.testYield
              ? async (info) => {
                  window.__snapshotYield = info;
                }
              : undefined,
          });
          if (!snapshot) {
            return null;
          }
          const blobs = {};
          for (const [sha256, blob] of Object.entries(snapshot.blobs ?? {})) {
            blobs[sha256] = {
              sha256,
              size: blob.size,
              type: blob.type,
              bytes: [...blob.bytes],
            };
          }
          return {
            project: snapshot.project,
            records: snapshot.records,
            blobs,
            missingEvidence: snapshot.missingEvidence,
            namedHead: snapshot.namedHead,
          };
        });
      case 'exportArchive': {
        const archive = await import('/data/archive.mjs');
        return wrap(async () => {
          const result = await archive.exportOwnerArchive(payload.localRecordId, {
            archiveId: payload.archiveId,
            exportedAt: payload.exportedAt,
            testYield: payload.hold
              ? async (info) => {
                  window.__exportHold = info;
                  while (window.__exportHold) {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                  }
                }
              : undefined,
          });
          if (result.bytes) {
            return { ...result, bytes: [...result.bytes] };
          }
          return result;
        });
      }
      case 'releaseExportHold':
        return wrap(async () => {
          window.__exportHold = null;
          return { released: true };
        });
      case 'importArchive': {
        const archive = await import('/data/archive.mjs');
        return wrap(() =>
          archive.importOwnerArchive(payload.raw, {
            serializedBytes: payload.serializedBytes,
            separateCopy: payload.separateCopy === true,
            createdAt: payload.createdAt,
          }),
        );
      }
      case 'importNamespace':
        return wrap(() =>
          repo.importProjectNamespace({
            ...payload,
            blobs: Object.fromEntries(
              Object.entries(payload.blobs ?? {}).map(([sha256, blob]) => [
                sha256,
                {
                  ...blob,
                  bytes: Uint8Array.from(blob.bytes),
                },
              ]),
            ),
          }),
        );
      case 'close':
        return wrap(() => repo.closeDatabase());
      case 'overwriteBlob':
        return wrap(async () => {
          await repo.closeDatabase();
          return new Promise((resolve, reject) => {
            const request = indexedDB.open('stb-app-v1', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const database = request.result;
              const transaction = database.transaction('blobs', 'readwrite');
              transaction.oncomplete = () => {
                database.close();
                resolve({ overwritten: true });
              };
              transaction.onabort = () => {
                database.close();
                reject(transaction.error);
              };
              transaction.objectStore('blobs').put({
                sha256: payload.sha256,
                size: payload.size,
                type: payload.type,
                bytes: new Blob([Uint8Array.from(payload.bytes)], { type: payload.type }),
              });
            };
          });
        });
      case 'deleteBlob':
        return wrap(async () => {
          await repo.closeDatabase();
          return new Promise((resolve, reject) => {
            const request = indexedDB.open('stb-app-v1', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const database = request.result;
              const transaction = database.transaction('blobs', 'readwrite');
              transaction.oncomplete = () => {
                database.close();
                resolve({ deleted: true });
              };
              transaction.onabort = () => {
                database.close();
                reject(transaction.error);
              };
              transaction.objectStore('blobs').delete(payload.sha256);
            };
          });
        });
      case 'bumpSchema':
        return wrap(async () => {
          await repo.closeDatabase();
          return new Promise((resolve, reject) => {
            const request = indexedDB.open('stb-app-v1', 2);
            request.onupgradeneeded = () => {};
            request.onsuccess = () => {
              request.result.close();
              resolve({ name: 'stb-app-v1', version: 2 });
            };
            request.onerror = () => reject(request.error);
          });
        });
      case 'databaseNames':
        return wrap(async () => {
          if (typeof indexedDB.databases !== 'function') {
            return { supported: false };
          }
          const databases = await indexedDB.databases();
          return {
            supported: true,
            databases: databases.map((entry) => ({
              name: entry.name,
              version: entry.version,
            })),
          };
        });
      default:
        return { ok: false, code: 'invalid-argument', message: `unknown op ${op}` };
    }
  }, { op, payload });
}

export function requireOk(result, label) {
  if (!result.ok) {
    throw new Error(`${label} failed: ${result.code} ${result.message}`);
  }
  return result.value;
}
