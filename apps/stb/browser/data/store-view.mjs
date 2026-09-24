import {
  ALCOVE_INSERT_DEFINITION,
  BOARD_DEFINITION,
  STORE_SCOPES,
  USER_DEFINED_BOARD_DEFINITION,
} from '/shared/contracts.mjs';
import { presentStoreAnswer } from '/shared/store-present.mjs';
import { currentProjection, currentStoreAnswer, listStoreRequests } from '/data/selectors.mjs';

export function storeScopeForDefinitionKind(definitionKind) {
  if (definitionKind === USER_DEFINED_BOARD_DEFINITION.kind) {
    return STORE_SCOPES.USER_DEFINED_BOARD_V1;
  }
  if (definitionKind === ALCOVE_INSERT_DEFINITION.kind) {
    return STORE_SCOPES.ALCOVE_INSERT_V1;
  }
  if (definitionKind === BOARD_DEFINITION.kind || definitionKind == null) {
    return STORE_SCOPES.BOARD_SQUARE_V1;
  }
  return STORE_SCOPES.BOARD_SQUARE_V1;
}

export async function loadStorePresentation(localRecordId, options = {}) {
  const projection = await currentProjection(localRecordId);
  const scope =
    options.scope
    ?? storeScopeForDefinitionKind(projection?.payload?.definitionKind ?? null);
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
  const requests = await listStoreRequests(localRecordId);
  const seen = new Set();
  const history = [];
  for (const request of [...requests].reverse()) {
    const revisionId = request.payload?.candidateRevisionId;
    const scope =
      options.scope
      ?? request.payload?.scope
      ?? STORE_SCOPES.BOARD_SQUARE_V1;
    const key = `${revisionId ?? ''}:${scope}`;
    if (!revisionId || revisionId === currentCandidateRevisionId || seen.has(key)) {
      continue;
    }
    seen.add(key);
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
