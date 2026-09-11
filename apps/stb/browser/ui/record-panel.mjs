import { COPY } from '/shared/contracts.mjs';
import { renderStorePanel } from '/ui/store-panel.mjs';

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
      if (value !== undefined && value !== null && value !== false) {
        node.setAttribute(name, value === true ? 'true' : String(value));
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

function heading(text) {
  return el('h1', {
    className: 'screen-heading',
    attrs: { id: 'screen-heading', tabindex: '-1' },
    text,
  });
}

function sourceLine(source) {
  return el('li', {
    attrs: {
      'data-record-source': source.id,
      'data-source-retained': String(source.retained === true),
    },
    text: source.retained
      ? `${source.filename} (${source.mime ?? 'source'}) retained`
      : `${source.filename}: ${COPY.recordMissingBytes}`,
  });
}

function reviewLine(record, currentId) {
  const current = record.id === currentId;
  return el('li', {
    attrs: {
      'data-record-review': record.id,
      'data-review-current': String(current),
      'data-review-imported': String(record.imported === true),
    },
    text: `${record.payload?.type ?? 'review'} (${record.id})${current ? ' — current' : ' — historical'}`,
  });
}

export function page8Main({ project, presentation, status }) {
  const currentReview = presentation?.currentReview ?? null;
  const historical = presentation?.historicalReviews ?? [];
  const events = presentation?.events ?? [];
  const sources = presentation?.sources ?? [];
  const imported = presentation?.imported === true;
  const unknownClass = presentation?.unknownClass === true;
  const storeImported = presentation?.currentStoreImported === true;
  const storeCurrent = presentation?.store?.current === true;
  return el(
    'main',
    {
      className: 'screen screen-page8',
      attrs: {
        'data-screen': 'record',
        'data-page': 'page8',
        'data-entry-mode': project.entryMode,
        'data-local-record-id': project.localRecordId,
        'data-project-id': project.projectId,
        'data-current-head': project.currentHead ?? '',
        'data-imported': String(imported),
        'data-unknown-class': String(unknownClass),
        'data-store-current': String(storeCurrent),
        'data-store-imported': String(storeImported),
        'data-review-current': String(Boolean(currentReview)),
        'data-event-count': String(events.length),
      },
    },
    [
      heading(COPY.recordHeading),
      el('p', { className: 'project-name', text: project.title ?? 'Untitled project' }),
      el('p', {
        className: 'hint',
        attrs: { 'data-record-local': 'true' },
        text: COPY.recordLocalOnly,
      }),
      el('p', {
        className: 'hint',
        attrs: { 'data-record-owner': 'true' },
        text: COPY.recordOwnerArchive,
      }),
      unknownClass
        ? el('p', {
            className: 'hint',
            attrs: { 'data-unknown-class-note': 'true' },
            text: COPY.recordUnknownClass,
          })
        : null,
      imported
        ? el('p', {
            className: 'hint',
            attrs: { 'data-imported-note': 'true' },
            text: COPY.recordNotCurrent,
          })
        : null,
      status
        ? el('p', {
            className: 'save-line',
            attrs: { 'data-page-status': status, 'data-record-status': 'true' },
            text: status,
          })
        : null,
      el(
        'section',
        { className: 'record-section', attrs: { 'data-record-identity': 'true' } },
        [
          el('h2', { text: 'Project identity' }),
          el('p', { text: `Project ${project.projectId}` }),
          el('p', { text: `Local namespace ${project.localRecordId}` }),
          el('p', {
            attrs: { 'data-named-head': project.currentHead ?? '' },
            text: `Current candidate revision ${project.currentHead ?? 'none'}`,
          }),
        ],
      ),
      el(
        'section',
        { className: 'record-section', attrs: { 'data-record-current-vs-historical': 'true' } },
        [
          el('h2', { text: COPY.recordCurrentVsHistorical }),
          el('p', {
            attrs: { 'data-store-applicability': storeCurrent ? 'current' : 'historical' },
            text: storeImported
              ? COPY.recordHistoricalStore
              : storeCurrent
                ? 'The displayed Store answer applies to this exact current revision.'
                : 'No current Store answer applies to this revision.',
          }),
          el('p', {
            attrs: { 'data-review-applicability': currentReview ? 'current' : 'historical' },
            text: currentReview
              ? `Current review ${currentReview.payload?.type} (${currentReview.id}).`
              : COPY.recordHistoricalReview,
          }),
        ],
      ),
      el(
        'section',
        { className: 'record-section', attrs: { 'data-record-sources': 'true' } },
        [
          el('h2', { text: COPY.recordSources }),
          sources.length === 0
            ? el('p', { className: 'hint', text: 'No original source is attached.' })
            : el('ul', { className: 'record-list' }, sources.map(sourceLine)),
        ],
      ),
      el(
        'section',
        { className: 'record-section', attrs: { 'data-record-store': 'true' } },
        [
          el('h2', { text: 'Store evaluation history' }),
          renderStorePanel(presentation?.storeView, { mode: 'compact' }),
          storeImported
            ? el('p', { className: 'hint', text: COPY.recordHistoricalStore })
            : null,
        ],
      ),
      el(
        'section',
        { className: 'record-section', attrs: { 'data-record-reviews': 'true' } },
        [
          el('h2', { text: 'Review history' }),
          !currentReview && historical.length === 0
            ? el('p', { className: 'hint', text: COPY.reviewNone })
            : el(
                'ul',
                { className: 'record-list' },
                [
                  ...(currentReview ? [reviewLine(currentReview, currentReview.id)] : []),
                  ...historical.map((record) => reviewLine(record, currentReview?.id)),
                ],
              ),
        ],
      ),
      el(
        'section',
        {
          className: 'record-section',
          attrs: { 'data-record-history': 'true', 'data-event-count': String(events.length) },
        },
        [
          el('h2', { text: COPY.recordHistory }),
          el('p', {
            className: 'hint',
            attrs: { 'data-history-retained': String(events.length) },
            text: `${events.length} retained events. Pagination does not delete history.`,
          }),
          el(
            'ol',
            { className: 'record-history-list' },
            events.map((event) =>
              el('li', {
                attrs: { 'data-record-event': event.id, 'data-event-type': event.type ?? '' },
                text: `${event.label} (${event.id})`,
              }),
            ),
          ),
        ],
      ),
      el('div', { className: 'actions record-actions' }, [
        el('button', {
          className: 'record-export',
          attrs: { type: 'button', 'data-action': 'export-record' },
          text: COPY.recordExport,
        }),
        el('button', {
          attrs: { type: 'button', 'data-action': 'import-archive' },
          text: COPY.recordImport,
        }),
        el('button', {
          attrs: { type: 'button', 'data-action': 'resume-from-record' },
          text: COPY.recordResume,
        }),
      ]),
      el('input', {
        attrs: {
          type: 'file',
          accept: '.stb.json,application/json',
          'data-archive-input': 'true',
          hidden: 'true',
        },
      }),
      el('button', {
        attrs: { type: 'button', 'data-action': 'back-to-hub' },
        text: COPY.back,
      }),
    ],
  );
}
