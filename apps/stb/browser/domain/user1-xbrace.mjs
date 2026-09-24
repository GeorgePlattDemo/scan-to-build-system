import { RepositoryError, getProject, getRecord } from '/data/repository.mjs';
import { commitCandidateChange, successorCandidatePayload } from '/domain/candidate.mjs';
import {
  USER1_XBRACE_CONFIGURATION_KIND,
  evaluateUser1XBraceConfiguration,
  normalizeUser1XBraceConfiguration,
} from '/shared/user1-xbrace-rule.mjs';

function requireString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RepositoryError('invalid-argument', `${name} is required`);
  }
  return value;
}

async function requireOwnProject(localRecordId) {
  const project = await getProject(localRecordId);
  if (!project) {
    throw new RepositoryError('not-found', 'Project does not exist');
  }
  if (project.entryMode !== 'own' || project.classId != null) {
    throw new RepositoryError('invalid-argument', 'Job 1 X-brace configuration is an own-entry project definition');
  }
  return project;
}

export async function applyUser1XBraceConfiguration(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const expectedHead = requireString('expectedHead', input.expectedHead);
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  await requireOwnProject(localRecordId);

  const configuration = normalizeUser1XBraceConfiguration(
    { partLengthIn: input.partLengthIn },
    { basis: input.basis ?? 'customer-configure' },
  );
  const evaluation = evaluateUser1XBraceConfiguration(configuration);
  if (!evaluation.valid) {
    throw new RepositoryError('invalid-argument', evaluation.unresolvedReason);
  }
  const current = await getRecord(localRecordId, 'candidate', expectedHead);
  const currentConfiguration = current?.payload?.configuration ?? null;
  if (
    currentConfiguration?.kind === USER1_XBRACE_CONFIGURATION_KIND
    && Number(currentConfiguration.partLengthIn) === evaluation.input.partLengthIn.value
  ) {
    return { status: 'noop', localRecordId, candidateRevisionId: expectedHead };
  }

  return commitCandidateChange({
    localRecordId,
    expectedHead,
    actionId,
    createdAt,
    eventType: 'user1-xbrace-configuration-applied',
    eventPayload: {
      configurationKind: USER1_XBRACE_CONFIGURATION_KIND,
      configurationVersion: evaluation.configurationVersion,
      partLengthIn: evaluation.input.partLengthIn.value,
      authority: false,
      commercial: false,
      physical: false,
    },
    buildPayload(previous) {
      return successorCandidatePayload(previous, {
        configuration,
        unresolved: true,
        parts: null,
        dimensions: null,
        material: null,
      });
    },
  });
}

export async function clearUser1XBraceConfiguration(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const expectedHead = requireString('expectedHead', input.expectedHead);
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  await requireOwnProject(localRecordId);
  const current = await getRecord(localRecordId, 'candidate', expectedHead);
  if (current?.payload?.configuration?.kind !== USER1_XBRACE_CONFIGURATION_KIND) {
    return { status: 'noop', localRecordId, candidateRevisionId: expectedHead };
  }

  return commitCandidateChange({
    localRecordId,
    expectedHead,
    actionId,
    createdAt,
    eventType: 'user1-xbrace-configuration-cleared',
    eventPayload: {
      configurationKind: USER1_XBRACE_CONFIGURATION_KIND,
      authority: false,
      commercial: false,
      physical: false,
    },
    buildPayload(previous) {
      return successorCandidatePayload(previous, {
        configuration: null,
        activeOccurrenceIds: [],
        definitionRevisionIds: [],
        definitionRevisionId: null,
        unresolved: true,
        parts: null,
        dimensions: null,
        material: null,
      });
    },
  });
}
