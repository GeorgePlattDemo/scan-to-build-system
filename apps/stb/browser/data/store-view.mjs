import { STORE_SCOPES } from '/shared/contracts.mjs';
import { presentStoreAnswer } from '/shared/store-present.mjs';
import { currentProjection, currentStoreAnswer, listStoreRequests } from '/data/selectors.mjs';

export async function loadStorePresentation(localRecordId, options = {}) {
  const projection = await currentProjection(localRecordId);
  const scope = options.scope ?? STORE_SCOPES.BOARD_SQUARE_V1;
  const applicability = await currentStoreAnswer(localRecordId, {
    candidateRevisionId: options.candidateRevisionId,
    scope,
  });
  return presentStoreAnswer(applicability, {
    unapplied: options.unapplied === true,
    projectionValid: projection?.payload?.valid === true,
    candidateRevisionId: options.candidateRevisionId ?? applicability.candidateRevisionId ?? null,
  });
}

export async function loadStoreHistory(localRecordId, currentCandidateRevisionId, options = {}) {
  const scope = options.scope ?? STORE_SCOPES.BOARD_SQUARE_V1;
  const requests = await listStoreRequests(localRecordId);
  const seen = new Set();
  const history = [];
  for (const request of [...requests].reverse()) {
    const revisionId = request.payload?.candidateRevisionId;
    if (!revisionId || revisionId === currentCandidateRevisionId || seen.has(revisionId)) {
      continue;
    }
    seen.add(revisionId);
    const applicability = await currentStoreAnswer(localRecordId, {
      candidateRevisionId: revisionId,
      scope,
    });
    if (!applicability?.request) {
      continue;
    }
    history.push(
      presentStoreAnswer(applicability, {
        candidateRevisionId: revisionId,
        projectionValid: true,
      }),
    );
  }
  return history;
}

export { presentStoreAnswer };
