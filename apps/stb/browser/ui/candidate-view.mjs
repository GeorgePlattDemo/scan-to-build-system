import { COPY } from '/shared/contracts.mjs';

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const { className, attrs, text } = options;
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) {
        node.setAttribute(name, value);
      }
    }
  }
  for (const child of children) {
    if (child) {
      node.append(child);
    }
  }
  return node;
}

function svgEl(name, attrs = {}, text = null) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) {
      node.setAttribute(key, value);
    }
  }
  if (text != null) {
    node.textContent = text;
  }
  return node;
}

function identityAttrs(projection, view) {
  const payload = projection.payload;
  return {
    'data-view': view,
    'data-projection-id': projection.id,
    'data-occurrence-id': payload.occurrenceId ?? '',
    'data-definition-revision-id': payload.definitionRevisionId ?? '',
    'data-finished-length': payload.geometry?.lengthCanonical ?? '',
    'data-valid': payload.valid ? 'true' : 'false',
    'data-store-request-complete': payload.request?.complete ? 'true' : 'false',
  };
}

export function renderPartSummary(projection, { selectedOccurrenceId } = {}) {
  if (!projection) {
    return el('p', {
      className: 'hint',
      attrs: { 'data-part-summary': 'empty' },
      text: COPY.boardNoValidPart,
    });
  }
  const payload = projection.payload;
  const selected = Boolean(payload.occurrenceId && payload.occurrenceId === selectedOccurrenceId);
  const lengthLabel = payload.summary.finishedLength ?? 'unresolved';
  return el(
    'article',
    {
      className: selected ? 'part-summary selected' : 'part-summary',
      attrs: {
        ...identityAttrs(projection, 'summary'),
        'data-part-summary': 'true',
        'data-action': payload.occurrenceId ? 'select-occurrence' : null,
        'data-selected': selected ? 'true' : 'false',
      },
    },
    [
      el('h3', { text: payload.summary.title }),
      el('p', {
        attrs: { 'data-summary-length': payload.summary.finishedLength ?? '' },
        text: payload.valid
          ? `Required finished length: ${payload.summary.finishedLength}`
          : `Finished length: ${lengthLabel}. ${COPY.boardUnresolved}`,
      }),
      el('p', { text: `Quantity: ${payload.summary.quantity}` }),
      el('p', { text: `Required operation: ${payload.summary.operation}` }),
      el('p', { text: `Cut: ${payload.summary.cut}` }),
      el('p', {
        className: 'hint',
        attrs: { 'data-summary-provenance': 'true' },
        text: payload.summary.provenance,
      }),
      payload.occurrenceId
        ? el('p', {
            className: 'identity-line',
            attrs: { 'data-occurrence-inspector': 'true' },
            text: `occurrence ${payload.occurrenceId}`,
          })
        : null,
      payload.definitionRevisionId
        ? el('p', {
            className: 'identity-line',
            attrs: { 'data-definition-inspector': 'true' },
            text: `definition ${payload.definitionRevisionId}`,
          })
        : null,
    ],
  );
}

export function renderBoardSchematic(projection, { selectedOccurrenceId } = {}) {
  if (!projection) {
    return el('p', {
      className: 'hint',
      attrs: { 'data-part-schematic': 'empty' },
      text: COPY.boardNoValidPart,
    });
  }
  const payload = projection.payload;
  const selected = Boolean(payload.occurrenceId && payload.occurrenceId === selectedOccurrenceId);
  const label = payload.geometry.lengthCanonical
    ? `${payload.geometry.lengthCanonical} in`
    : 'unresolved';
  const svg = svgEl('svg', {
    viewBox: '0 0 320 90',
    role: 'img',
    'aria-label': payload.valid
      ? `Finished board ${label}, not to scale`
      : 'Board requirement unresolved, not to scale',
    'data-part-schematic': 'true',
    ...identityAttrs(projection, 'schematic'),
  });
  svg.append(
    svgEl('rect', {
      x: '24',
      y: '28',
      width: '272',
      height: '22',
      fill: payload.valid ? '#d6d3cd' : 'none',
      stroke: '#171717',
      'stroke-dasharray': payload.valid ? 'none' : '6 4',
    }),
    svgEl(
      'text',
      {
        x: '160',
        y: '44',
        'text-anchor': 'middle',
        'font-size': '14',
        fill: '#171717',
      },
      label,
    ),
    svgEl(
      'text',
      {
        x: '160',
        y: '74',
        'text-anchor': 'middle',
        'font-size': '11',
        fill: '#444',
      },
      COPY.boardNotToScale,
    ),
  );
  return el(
    'div',
    {
      className: selected ? 'board-schematic selected' : 'board-schematic',
      attrs: {
        ...identityAttrs(projection, 'schematic'),
        'data-action': payload.occurrenceId ? 'select-occurrence' : null,
        'data-selected': selected ? 'true' : 'false',
      },
    },
    [svg],
  );
}

export function renderSharedCandidateView(projection, options = {}) {
  if (!projection) {
    return el('section', { className: 'candidate-view', attrs: { 'data-candidate-view': 'empty' } }, [
      el('p', { className: 'hint', text: COPY.boardBlank }),
    ]);
  }
  const payload = projection.payload;
  return el(
    'section',
    {
      className: 'candidate-view',
      attrs: {
        ...identityAttrs(projection, 'shared'),
        'data-candidate-view': 'true',
      },
    },
    [renderBoardSchematic(projection, options), renderPartSummary(projection, options)],
  );
}
