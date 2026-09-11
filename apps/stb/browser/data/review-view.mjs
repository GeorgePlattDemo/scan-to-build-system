import { COPY } from '/shared/contracts.mjs';
import { listProjectRecords } from '/data/selectors.mjs';
import {
  assembleReviewSnapshot,
  listReviewRecords,
  reviewMatchesCurrent,
} from '/domain/review.mjs';

function sortEvents(records) {
  return [...records].sort((left, right) => {
    if (left.createdAt === right.createdAt) {
      return left.id < right.id ? -1 : 1;
    }
    return left.createdAt < right.createdAt ? -1 : 1;
  });
}

function eventLabel(record) {
  const type = record.payload?.type ?? record.kind;
  switch (type) {
    case 'project-created':
      return 'Project created';
    case 'evidence-attached':
      return 'Evidence retained';
    case 'evidence-detached':
      return 'Evidence removed from the candidate';
    case 'observation-recorded':
      return 'Observation recorded';
    case 'observation-mapped':
      return 'Observation mapped into the candidate';
    case 'observation-corrected':
      return 'Observation corrected';
    case 'board-requirement-applied':
      return 'Board finished length applied';
    case 'board-cut001-referenced':
      return 'CUT-001 documentary reference applied';
    case 'board-occurrence-retired':
      return 'Board occurrence retired';
    case 'attempt-enqueued':
      return 'Store evaluation requested';
    case 'attempt-terminal':
      return record.payload?.diagnostic
        ? `Store attempt ended (${record.payload.diagnostic})`
        : 'Store answer retained';
    case 'DefinitionReviewRecorded':
      return 'Definition review recorded';
    case 'UnresolvedDefinitionAcknowledged':
      return 'Unresolved definition acknowledged';
    default:
      return type;
  }
}

function suppliedLines(assembled) {
  const lines = [];
  for (const evidence of assembled.evidence ?? []) {
    const name = evidence.payload?.originalFilename ?? evidence.payload?.role ?? evidence.id;
    lines.push({
      id: evidence.id,
      text: `${name} (${evidence.payload?.declaredMime ?? evidence.payload?.displayType ?? 'source'})`,
    });
  }
  for (const observation of assembled.observations ?? []) {
    const payload = observation.payload ?? {};
    if (payload.kind === 'typed-need') {
      lines.push({
        id: observation.id,
        text: payload.rawText ?? 'Typed original',
      });
    } else if (payload.kind === 'measurement' || payload.role) {
      const raw = payload.rawText ?? '';
      const unit = payload.declaredUnit ?? '';
      const role = payload.role ?? payload.kind ?? 'observation';
      lines.push({
        id: observation.id,
        text: unit ? `${role}: ${raw} ${unit}` : `${role}: ${raw}`,
      });
    }
  }
  if (lines.length === 0) {
    lines.push({ id: 'none', text: 'No source or typed original is attached yet.' });
  }
  return lines;
}

function choseLines(assembled) {
  const mappings = assembled.candidate?.payload?.mappings ?? [];
  const accepted = mappings.filter((entry) => entry.status === 'accepted');
  if (accepted.length === 0) {
    return [{ id: 'none', text: 'No mapping has been accepted into the candidate.' }];
  }
  return accepted.map((entry) => {
    const observation = (assembled.observations ?? []).find(
      (record) => record.id === entry.observationId,
    );
    const method = observation?.payload?.method ?? 'entered';
    const documentary = observation?.payload?.documentaryReference;
    const methodLabel =
      method === 'documentary-reference' && documentary?.id
        ? `${documentary.id} documentary reference`
        : 'manual choice';
    return {
      id: `${entry.observationId}:${entry.inputKey}`,
      text: `${entry.inputKey} from ${methodLabel}`,
    };
  });
}

function partsLines(assembled) {
  const projection = assembled.projection;
  if (!projection) {
    return [{ id: 'none', text: 'No part has been derived yet.' }];
  }
  if (projection.payload?.valid !== true) {
    return [
      {
        id: 'unresolved',
        text: projection.payload?.unresolvedReason
          ? `Board requirement unresolved (${projection.payload.unresolvedReason}).`
          : 'Board requirement is unresolved.',
      },
    ];
  }
  const length = projection.payload.finishedLength?.canonical ?? null;
  const occurrenceId = projection.payload.occurrenceId;
  const definitionRevisionId = projection.payload.definitionRevisionId;
  return [
    {
      id: occurrenceId ?? 'part',
      text: length
        ? `One desired finished board, ${length} in, 1 ea, square CROSSCUT.`
        : 'One desired finished board.',
      occurrenceId,
      definitionRevisionId,
    },
  ];
}

function buildTrace(assembled) {
  const storeStatus = assembled.store?.current
    ? 'actual'
    : assembled.store?.historical
      ? 'historical'
      : assembled.store?.status === 'pending'
        ? 'pending'
        : 'unavailable';
  const documentary = assembled.documentaryReference;
  return [
    {
      id: 'need',
      label: 'Need / evidence',
      status: (assembled.evidence?.length ?? 0) > 0 || (assembled.observations?.length ?? 0) > 0
        ? 'actual'
        : 'unavailable',
    },
    {
      id: 'candidate',
      label: 'Candidate',
      status: assembled.candidate ? 'actual' : 'unavailable',
    },
    {
      id: 'parts',
      label: 'Parts / requirements',
      status: assembled.projection?.payload?.valid === true ? 'actual' : 'unavailable',
    },
    {
      id: 'store',
      label: 'Store evaluation',
      status: storeStatus,
    },
    {
      id: 'neutral-work',
      label: 'Neutral work',
      status: 'unavailable',
    },
    {
      id: 'lowering',
      label: 'Local lowering',
      status: 'unavailable',
    },
    {
      id: 'outcome',
      label: 'Physical outcome',
      status: 'unavailable',
    },
    {
      id: 'cut001',
      label: 'CUT-001 documentary reference',
      status: documentary?.id === 'CUT-001' ? 'reference' : 'unavailable',
      pin: documentary?.pin ?? null,
    },
  ];
}

export async function loadReviewPresentation(localRecordId, { unapplied = false } = {}) {
  const assembled = await assembleReviewSnapshot(localRecordId, { unapplied });
  if (!assembled) {
    return null;
  }
  const reviews = await listReviewRecords(localRecordId);
  const matching = reviews.filter((record) => reviewMatchesCurrent(record, assembled));
  const currentReview = matching.at(-1) ?? null;
  const historicalReviews = reviews.filter((record) => record.id !== currentReview?.id);
  const events = sortEvents(await listProjectRecords(localRecordId, 'event'));
  return {
    ...assembled,
    reviews,
    currentReview,
    historicalReviews,
    events: events.map((record) => ({
      id: record.id,
      createdAt: record.createdAt,
      type: record.payload?.type ?? null,
      label: eventLabel(record),
      reviewId: record.payload?.reviewId ?? null,
      candidateRevisionId: record.payload?.candidateRevisionId ?? null,
      diagnostic: record.payload?.diagnostic ?? null,
      physical: false,
    })),
    supplied: suppliedLines(assembled),
    chose: choseLines(assembled),
    parts: partsLines(assembled),
    trace: buildTrace(assembled),
    copy: {
      heading: COPY.reviewHeading,
      resultHeading: COPY.resultHeading,
      retained: COPY.resultRetained,
    },
  };
}

export { eventLabel };
