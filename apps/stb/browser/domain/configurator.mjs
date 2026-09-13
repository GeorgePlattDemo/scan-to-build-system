import { ALCOVE_CLASS_ID, normalizeAlcoveConfiguration } from '/shared/alcove-rule.mjs';
import { RepositoryError, getProject } from '/data/repository.mjs';
import { commitCandidateChange, successorCandidatePayload } from '/domain/candidate.mjs';

function requireString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RepositoryError('invalid-argument', `${name} is required`);
  }
  return value;
}

export async function applyMappedConfiguration(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const expectedHead = requireString('expectedHead', input.expectedHead);
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  const project = await getProject(localRecordId);
  if (!project) {
    throw new RepositoryError('not-found', 'Project does not exist');
  }
  if (project.entryMode !== 'mapped' || project.classId !== ALCOVE_CLASS_ID) {
    throw new RepositoryError('invalid-argument', 'This configurator applies only to the mapped alcove shelf-blank class');
  }
  const basis = input.basis ?? 'manual-entry';
  const configuration = normalizeAlcoveConfiguration(input.configuration ?? {}, { basis });
  return commitCandidateChange({
    localRecordId,
    expectedHead,
    actionId,
    createdAt,
    eventType: 'class-configuration-applied',
    eventPayload: {
      classId: project.classId,
      classVersion: project.classVersion,
      basis,
      authority: false,
      commercial: false,
      physical: false,
    },
    buildPayload(previous) {
      return successorCandidatePayload(previous, {
        configuration,
        unresolved: true,
      });
    },
  });
}
