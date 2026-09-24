import { COPY } from '/shared/contracts.mjs';
import { renderStorePanel } from '/ui/store-panel.mjs';
import { renderSharedCandidateView } from '/ui/candidate-view.mjs';

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

function listSection(title, attr, items) {
  return el(
    'section',
    {
      className: 'review-section',
      attrs: { [attr]: 'true' },
    },
    [
      el('h2', { text: title }),
      el(
        'ul',
        { className: 'review-list' },
        items.map((item) =>
          el('li', {
            attrs: { 'data-review-item': item.id },
            text: item.text,
          }),
        ),
      ),
    ],
  );
}

export function renderReviewTrace(trace = []) {
  return el(
    'section',
    {
      className: 'review-trace',
      attrs: { 'data-review-trace': 'true' },
    },
    [
      el('h2', { text: 'Trace' }),
      el(
        'ol',
        { className: 'review-trace-list' },
        trace.map((step) =>
          el('li', {
            className: 'review-trace-step',
            attrs: {
              'data-trace-step': step.id,
              'data-trace-status': step.status,
            },
            text: step.pin
              ? `${step.label}: ${step.status} (${step.pin})`
              : `${step.label}: ${step.status}`,
          }),
        ),
      ),
    ],
  );
}

export function renderReviewActions(presentation, { mode = 'full' } = {}) {
  const predicate = presentation?.predicate ?? {};
  const unapplied = presentation?.unapplied === true;
  const children = [];
  if (unapplied) {
    children.push(
      el('p', {
        className: 'hint',
        attrs: { 'data-review-blocked': 'unapplied' },
        text: COPY.reviewBlockedUnapplied,
      }),
    );
  } else if (predicate.completeSupportedReviewAvailable) {
    children.push(
      el('button', {
        className: 'review-confirm',
        attrs: {
          type: 'button',
          'data-action': 'confirm-definition',
          'data-review-action': 'CONFIRM_DEFINITION',
        },
        text: COPY.reviewConfirm,
      }),
    );
  } else if (predicate.unresolvedAcknowledgmentAvailable) {
    children.push(
      el('button', {
        className: 'review-unresolved',
        attrs: {
          type: 'button',
          'data-action': 'acknowledge-unresolved',
          'data-review-action': 'ACKNOWLEDGE_UNRESOLVED',
        },
        text: COPY.reviewUnresolved,
      }),
    );
  }
  if (mode === 'inline') {
    children.push(
      el('button', {
        attrs: {
          type: 'button',
          'data-action': 'open-confirm',
        },
        text: COPY.reviewOpenPage,
      }),
    );
  }
  return el(
    'div',
    {
      className: mode === 'inline' ? 'review-actions review-actions-inline' : 'review-actions',
      attrs: {
        'data-review-actions': mode,
        'data-complete-supported': String(predicate.completeSupportedReviewAvailable === true),
        'data-unresolved-available': String(predicate.unresolvedAcknowledgmentAvailable === true),
      },
    },
    children,
  );
}

export function applyUnappliedReviewLock(root) {
  if (!root) {
    return;
  }
  for (const node of root.querySelectorAll('[data-review-actions]')) {
    node.setAttribute('data-complete-supported', 'false');
    node.setAttribute('data-unresolved-available', 'false');
    for (const button of node.querySelectorAll(
      '[data-action="confirm-definition"], [data-action="acknowledge-unresolved"]',
    )) {
      button.remove();
    }
    if (!node.querySelector('[data-review-blocked="unapplied"]')) {
      node.prepend(
        el('p', {
          className: 'hint',
          attrs: { 'data-review-blocked': 'unapplied' },
          text: COPY.reviewBlockedUnapplied,
        }),
      );
    }
  }
  for (const screen of root.querySelectorAll('[data-page="page6"], [data-page="page7"]')) {
    screen.setAttribute('data-complete-supported', 'false');
    screen.setAttribute('data-unresolved-available', 'false');
  }
}

function currentReviewLine(presentation) {
  const current = presentation.currentReview;
  if (!current) {
    return el('p', {
      className: 'hint',
      attrs: { 'data-review-current': 'false' },
      text: COPY.reviewNone,
    });
  }
  return el('p', {
    className: 'review-current',
    attrs: {
      'data-review-current': 'true',
      'data-review-id': current.id,
      'data-review-type': current.payload?.type ?? '',
      'data-review-digest': current.payload?.reviewDigest ?? '',
    },
    text: `${COPY.reviewCurrent} ${current.payload?.type} (${current.id})`,
  });
}

function historicalReviewList(presentation) {
  const historical = presentation.historicalReviews ?? [];
  if (historical.length === 0) {
    return null;
  }
  return el(
    'section',
    {
      className: 'review-history',
      attrs: { 'data-review-history': 'true' },
    },
    [
      el('h2', { text: COPY.reviewHistorical }),
      el(
        'ul',
        {},
        historical.map((record) =>
          el('li', {
            attrs: {
              'data-historical-review': record.id,
              'data-review-type': record.payload?.type ?? '',
            },
            text: `${record.payload?.type ?? 'review'} (${record.id})`,
          }),
        ),
      ),
    ],
  );
}

export function renderReviewSummary(presentation) {
  const unresolved = presentation.snapshot?.unresolvedConditions ?? [];
  return el('div', { className: 'review-summary', attrs: { 'data-review-summary': 'true' } }, [
    listSection(COPY.reviewYouSupplied, 'data-review-supplied', presentation.supplied ?? []),
    listSection(COPY.reviewYouChose, 'data-review-chose', presentation.chose ?? []),
    listSection(COPY.reviewPartsResulted, 'data-review-parts', presentation.parts ?? []),
    el(
      'section',
      {
        className: 'review-section',
        attrs: { 'data-review-store': 'true' },
      },
      [
        el('h2', { text: COPY.reviewStoreEvaluation }),
        renderStorePanel(presentation.storeView, { mode: 'compact' }),
      ],
    ),
    el(
      'section',
      {
        className: 'review-section',
        attrs: { 'data-review-unresolved': 'true' },
      },
      [
        el('h2', { text: COPY.reviewStillUnresolved }),
        unresolved.length === 0
          ? el('p', { className: 'hint', text: 'No unresolved conditions block a complete supported review.' })
          : el(
              'ul',
              { className: 'review-list' },
              unresolved.map((item) =>
                el('li', { attrs: { 'data-unresolved-condition': item }, text: item }),
              ),
            ),
      ],
    ),
    el(
      'section',
      {
        className: 'review-section',
        attrs: { 'data-review-meaning': 'true' },
      },
      [
        el('h2', { text: COPY.reviewMeaning }),
        el('p', { text: COPY.reviewMeaningBody }),
        el('p', { className: 'hint', text: COPY.reviewNoOrder }),
      ],
    ),
    currentReviewLine(presentation),
    historicalReviewList(presentation),
  ]);
}

export function renderInlineReview(presentation) {
  return el(
    'section',
    {
      className: 'review-inline',
      attrs: { 'data-review-inline': 'true' },
    },
    [renderReviewActions(presentation, { mode: 'inline' })],
  );
}

export function page6Main({ project, presentation, selectedOccurrenceId }) {
  const snapshot = presentation?.snapshot ?? {};
  return el(
    'main',
    {
      className: 'screen screen-page6',
      attrs: {
        'data-screen': 'confirm',
        'data-page': 'page6',
        'data-entry-mode': project.entryMode,
        'data-local-record-id': project.localRecordId,
        'data-project-id': project.projectId,
        'data-class-id': project.classId ?? '',
        'data-candidate-revision': snapshot.candidateRevisionId ?? '',
        'data-projection-id': snapshot.projectionId ?? '',
        'data-review-digest': snapshot.reviewDigest ?? '',
        'data-complete-supported': String(presentation?.predicate?.completeSupportedReviewAvailable === true),
        'data-unresolved-available': String(presentation?.predicate?.unresolvedAcknowledgmentAvailable === true),
      },
    },
    [
      heading(COPY.reviewHeading),
      el('p', { className: 'project-name', text: project.title ?? 'Untitled project' }),
      renderReviewSummary(presentation),
      renderSharedCandidateView(presentation?.projection, { selectedOccurrenceId }),
      renderReviewTrace(presentation?.trace),
      renderReviewActions(presentation, { mode: 'full' }),
      el('button', {
        attrs: { type: 'button', 'data-action': 'back-to-hub' },
        text: COPY.back,
      }),
    ],
  );
}

export function page7Main({ project, presentation }) {
  const current = presentation?.currentReview ?? null;
  const events = presentation?.events ?? [];
  const documentary = presentation?.documentaryReference ?? null;
  return el(
    'main',
    {
      className: 'screen screen-page7',
      attrs: {
        'data-screen': 'result',
        'data-page': 'page7',
        'data-entry-mode': project.entryMode,
        'data-local-record-id': project.localRecordId,
        'data-project-id': project.projectId,
        'data-physical-outcome': 'absent',
        'data-pickup': 'absent',
        'data-review-id': current?.id ?? '',
        'data-review-type': current?.payload?.type ?? '',
        'data-review-current': current ? 'true' : 'false',
      },
    },
    [
      heading(COPY.resultHeading),
      el('p', {
        className: 'result-retained',
        attrs: { 'data-result-retained': 'true' },
        text: COPY.resultRetained,
      }),
      el('p', {
        className: 'hint',
        attrs: { 'data-physical-absent': 'true', 'data-pickup-absent': 'true' },
        text: COPY.resultPhysicalAbsent,
      }),
      current
        ? el('p', {
            className: 'review-current',
            attrs: {
              'data-result-review': current.payload?.type ?? '',
              'data-review-digest': current.payload?.reviewDigest ?? '',
            },
            text: `${current.payload?.type} (${current.id})`,
          })
        : el('p', { className: 'hint', text: COPY.reviewNone }),
      el(
        'section',
        {
          className: 'review-section',
          attrs: { 'data-store-on-result': 'true' },
        },
        [
          el('h2', { text: COPY.reviewStoreEvaluation }),
          renderStorePanel(presentation?.storeView, { mode: 'compact' }),
        ],
      ),
      el(
        'section',
        {
          className: 'review-section',
          attrs: { 'data-result-events': 'true' },
        },
        [
          el('h2', { text: COPY.resultEvents }),
          events.length === 0
            ? el('p', { className: 'hint', text: 'No application events are recorded yet.' })
            : el(
                'ol',
                { className: 'result-event-list' },
                events.map((event) =>
                  el('li', {
                    attrs: {
                      'data-event-id': event.id,
                      'data-event-type': event.type ?? '',
                    },
                    text: `${event.label} (${event.createdAt})`,
                  }),
                ),
              ),
        ],
      ),
      el(
        'section',
        {
          className: 'review-section',
          attrs: { 'data-result-reference': 'true' },
        },
        [
          el('h2', { text: COPY.resultReference }),
          documentary?.id === 'CUT-001'
            ? el('p', {
                attrs: { 'data-cut001-reference': documentary.pin ?? 'true' },
                text: `CUT-001 documentary reference (${documentary.pin ?? 'unpinned'}). Documentary reference only. It did not run.`,
              })
            : el('p', {
                className: 'hint',
                attrs: { 'data-cut001-reference': 'absent' },
                text: 'No documentary execution reference is selected.',
              }),
          el('p', {
            className: 'hint',
            attrs: { 'data-simulation-execution': 'false' },
            text: 'A sourced simulation, if inspected, remains its original subject. It is not execution of this candidate.',
          }),
        ],
      ),
      el(
        'details',
        {
          className: 'result-future',
          attrs: { 'data-result-future': 'true' },
        },
        [
          el('summary', { text: COPY.resultFuture }),
          el('p', { text: COPY.resultFutureBody }),
        ],
      ),
      historicalReviewList(presentation ?? { historicalReviews: [] }),
      el('div', { className: 'actions' }, [
        el('button', {
          attrs: { type: 'button', 'data-action': 'open-confirm' },
          text: COPY.reviewOpenPage,
        }),
        el('button', {
          attrs: { type: 'button', 'data-action': 'back-to-hub' },
          text: COPY.back,
        }),
      ]),
    ],
  );
}
