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

function fact(label, value, attrs = {}) {
  const display = value === undefined || value === null || value === '' ? COPY.storeNotReturned : String(value);
  return el('p', { className: 'store-fact', attrs }, [
    el('span', { className: 'store-fact-label', text: `${label}: ` }),
    el('span', { className: 'store-fact-value', text: display }),
  ]);
}

function jsonBlock(value) {
  let text = '';
  try {
    text = JSON.stringify(value, null, 2);
  } catch {
    text = String(value);
  }
  return el('pre', { className: 'store-json', attrs: { tabindex: '0' }, text });
}

function retryControl(view) {
  if (!view.retryable) {
    return null;
  }
  return el('button', {
    className: 'store-retry',
    attrs: {
      type: 'button',
      'data-action': 'retry-store',
      'data-request-id': view.requestId ?? '',
    },
    text: COPY.storeRetry,
  });
}

function headlineBlock(view) {
  const children = [
    el('p', {
      className: 'store-headline',
      attrs: { 'data-store-headline': 'true' },
      text: view.headline,
    }),
  ];
  if (view.dispositionPlain) {
    children.push(
      el('p', {
        className: 'store-disposition-plain',
        attrs: { 'data-store-disposition-plain': 'true' },
        text: view.dispositionPlain,
      }),
    );
  }
  if (view.dispositionEnum) {
    children.push(
      el('p', {
        className: 'store-disposition-enum',
        attrs: { 'data-store-disposition': view.dispositionEnum },
        text: view.dispositionEnum,
      }),
    );
  }
  if (view.diagnostic) {
    children.push(
      el('p', {
        className: 'store-diagnostic',
        attrs: { 'data-store-diagnostic': view.diagnostic },
        text: view.diagnostic,
      }),
    );
  }
  children.push(
    el('p', {
      className: 'store-unapplied',
      attrs: {
        'data-store-unapplied': 'true',
        'data-unapplied': 'store',
        ...(view.unapplied ? {} : { hidden: 'true' }),
      },
      text: COPY.storeUnapplied,
    }),
  );
  if (view.reasons.length > 0) {
    children.push(
      el(
        'ul',
        { className: 'store-reasons', attrs: { 'data-store-reasons': 'true' } },
        view.reasons.map((reason) =>
          el('li', { attrs: { 'data-raw-reason': reason }, text: reason }),
        ),
      ),
    );
  }
  return children;
}

function compactEstimate(view) {
  if (view.qDisplay) {
    return el('p', {
      className: 'store-q',
      attrs: { 'data-store-q': view.qDisplay },
      text: `${COPY.storeBudgetary}: ${view.qDisplay}`,
    });
  }
  if (view.kind === 'store') {
    return el('p', {
      className: 'store-q-missing',
      attrs: { 'data-store-q': 'none' },
      text: COPY.storeNoQ,
    });
  }
  return null;
}

function materialLinesSection(view) {
  const lines = Array.isArray(view.lines) ? view.lines : [];
  if (lines.length <= 1) {
    return null;
  }
  return el(
    'section',
    {
      className: 'store-section',
      attrs: { 'data-store-section': 'material-lines', 'aria-labelledby': 'store-lines-heading' },
    },
    [
      el('h3', { attrs: { id: 'store-lines-heading' }, text: 'Store material lines' }),
      ...lines.map((line) =>
        el('article', {
          className: 'store-material-line',
          attrs: {
            'data-store-line': line.requirementId ?? '',
            'data-store-line-status': line.status ?? '',
          },
        }, [
          fact('Role', line.role),
          fact('Store SKU', line.storeSku),
          fact('Quantity', line.qty),
          fact('Demanded stock length', line.demandedStockLengthIn),
          fact('Kept length', line.keptLengthIn),
          fact('Required operations', line.requiredOps?.join(' · ')),
          fact('Stock status', line.stock?.status),
          fact('Available', line.stock?.available),
          fact('Price / ea', line.price?.sellingPriceDisplay),
          fact('Line extension', line.extensionDisplay),
          fact('Capability', line.capability?.status),
        ]),
      ),
    ],
  );
}

function offeringSection(view) {
  const offering = view.offering;
  return el(
    'section',
    {
      className: 'store-section',
      attrs: { 'data-store-section': 'offering', 'aria-labelledby': 'store-offering-heading' },
    },
    [
      el('h3', { attrs: { id: 'store-offering-heading' }, text: COPY.storeOfferingHeading }),
      offering
        ? el('div', {}, [
            fact('Store SKU', offering.storeSku, { 'data-store-sku': offering.storeSku ?? '' }),
            fact('Description', offering.description),
            fact('Species', offering.species),
            fact('Grade', offering.grade),
            fact('Form', offering.form),
            fact('Nominal T', offering.nominalT),
            fact('Nominal W', offering.nominalW),
            fact('Actual T', offering.actualT),
            fact('Actual W', offering.actualW, { 'data-store-actual-w': offering.actualW ?? '' }),
            fact('Stock length', offering.stockL_in),
            fact('UOM', offering.uom),
            fact(COPY.storeListed, offering.offered ? 'true' : 'false'),
            fact('Observation', offering.observationId),
          ])
        : el('p', { className: 'hint', text: COPY.storeNotReturned }),
    ],
  );
}

function stockSection(view) {
  const stock = view.stock;
  return el(
    'section',
    {
      className: 'store-section',
      attrs: { 'data-store-section': 'stock', 'aria-labelledby': 'store-stock-heading' },
    },
    [
      el('h3', { attrs: { id: 'store-stock-heading' }, text: COPY.storeStockHeading }),
      el('p', { className: 'hint', text: COPY.storeFixtureStock }),
      stock
        ? el('div', {}, [
            fact('Stock status', stock.status, { 'data-stock-status': stock.status ?? '' }),
            fact('Fixture-declared on hand', stock.fixtureDeclaredOnHand),
            fact('Requested quantity', stock.qtyNeeded),
            fact('Available', stock.available),
            fact('Reason', stock.reason),
            fact('Supplier path', stock.supplierPath),
            fact(COPY.storeSourceTime, stock.asOf, { 'data-stock-asof': stock.asOf ?? '' }),
          ])
        : el('p', { className: 'hint', text: COPY.storeNotReturned }),
    ],
  );
}

function capabilitySection(view) {
  const capability = view.capability;
  return el(
    'section',
    {
      className: 'store-section',
      attrs: { 'data-store-section': 'capability', 'aria-labelledby': 'store-capability-heading' },
    },
    [
      el('h3', { attrs: { id: 'store-capability-heading' }, text: COPY.storeCapabilityHeading }),
      view.dispositionEnum === 'SUPPORTABLE'
        ? el('p', { className: 'hint', text: COPY.storeNotApproved })
        : null,
      capability
        ? el('div', {}, [
            fact('Capability status', capability.status, {
              'data-capability-status': capability.status ?? '',
            }),
            fact('Reason', capability.reason),
            fact('Envelope', capability.envelopeId),
          ])
        : el('p', { className: 'hint', text: COPY.storeNotReturned }),
      view.reasons.length
        ? el(
            'ul',
            { className: 'store-reasons' },
            view.reasons.map((reason) =>
              el('li', { attrs: { 'data-raw-reason': reason }, text: reason }),
            ),
          )
        : null,
    ],
  );
}

function estimateSection(view) {
  const estimate = view.estimate;
  const qNode = view.qDisplay
    ? el('p', {
        className: 'store-q',
        attrs: { 'data-store-q': view.qDisplay },
        text: `${COPY.storeBudgetary}: ${view.qDisplay}`,
      })
    : el('p', {
        className: 'store-q-missing',
        attrs: { 'data-store-q': 'none' },
        text: estimate?.reason === 'ESTIMATE_FAILED' || estimate?.estimateError
          ? COPY.storeEstimateFailed
          : COPY.storeNoQ,
      });
  return el(
    'section',
    {
      className: 'store-section',
      attrs: { 'data-store-section': 'estimate', 'aria-labelledby': 'store-estimate-heading' },
    },
    [
      el('h3', { attrs: { id: 'store-estimate-heading' }, text: COPY.storeEstimateHeading }),
      el('p', { className: 'hint', text: COPY.storeNotQuote }),
      qNode,
      estimate?.materialDisplay
        ? fact(COPY.storeEstimatedMaterial, estimate.materialDisplay, { 'data-store-material': estimate.materialDisplay })
        : null,
      estimate?.recoveryDisplay
        ? fact(COPY.storeModeledRecovery, estimate.recoveryDisplay, {
            'data-store-recovery': estimate.recoveryDisplay,
          })
        : null,
      estimate?.minutesDisplay
        ? fact('Modeled cycle', estimate.minutesDisplay, {
            'data-store-minutes': estimate.minutesDisplay,
          })
        : null,
      el('p', { className: 'hint', text: COPY.storeModeledTime }),
    ],
  );
}

function basisSection(view) {
  const basis = view.basis ?? {};
  return el(
    'section',
    {
      className: 'store-section',
      attrs: { 'data-store-section': 'basis', 'aria-labelledby': 'store-basis-heading' },
    },
    [
      el('h3', { attrs: { id: 'store-basis-heading' }, text: COPY.storeBasisHeading }),
      el('p', {
        className: 'store-basis-line',
        attrs: { 'data-store-basis-line': 'true' },
        text: COPY.storeBasisLine,
      }),
      el('details', { className: 'store-details' }, [
        el('summary', { text: COPY.storeDetailHeading }),
        fact('Store pin', basis.storePin, { 'data-store-pin': basis.storePin ?? '' }),
        fact('Protocol', basis.protocolVersion),
        fact('Wrapper build', basis.wrapperBuildId),
        fact('requestId', view.requestId),
        fact('responseId', view.responseId),
        fact('attemptId', view.attemptId),
        fact('candidateRevisionId', view.candidateRevisionId),
        fact(COPY.storeSourceTime, view.sourceAsOf, { 'data-source-asof': view.sourceAsOf ?? '' }),
        fact(COPY.storeWrapperTime, view.wrapperRespondedAt),
        fact(COPY.storeReceivedTime, view.receivedAt, { 'data-received-at': view.receivedAt ?? '' }),
        fact('Pricing engine', basis.pricingEngineId, {
          'data-pricing-engine': basis.pricingEngineId ?? '',
        }),
        fact('Pricing engine version', basis.pricingEngineVersion, {
          'data-pricing-engine-version': basis.pricingEngineVersion ?? '',
        }),
        fact('Cycle model', basis.cycleModelId, { 'data-cycle-model': basis.cycleModelId ?? '' }),
        fact('Envelope', basis.envelopeId, { 'data-envelope-id': basis.envelopeId ?? '' }),
        fact('measured', basis.measured === true ? 'true' : 'false'),
        fact('commissioned', basis.commissioned === true ? 'true' : 'false'),
        fact('Observation', basis.observationId),
        el('h4', { text: 'Raw request' }),
        jsonBlock(view.rawRequest),
        el('h4', { text: 'Raw Store response' }),
        jsonBlock(view.rawResponse),
      ]),
    ],
  );
}

function compactBody(view) {
  return [
    ...headlineBlock(view),
    el('p', {
      className: 'hint store-reference-scope',
      attrs: { 'data-store-reference-scope': 'true' },
      text: COPY.storeReferenceScope,
    }),
    view.offering
      ? el('p', {
          className: 'store-compact-sku',
          attrs: { 'data-store-sku': view.offering.storeSku ?? '' },
          text: view.offering.storeSku ?? COPY.storeNotReturned,
        })
      : null,
    compactEstimate(view),
    retryControl(view),
    el('button', {
      className: 'store-inspect',
      attrs: { type: 'button', 'data-action': 'open-store' },
      text: COPY.storeInspect,
    }),
  ];
}

function plainStoreAnswer(view) {
  if (view.kind !== 'store' || view.current !== true) return null;
  if (view.dispositionEnum === 'SUPPORTABLE') {
    return el('p', {
      className: 'store-answer-lead',
      attrs: { 'data-store-answer-lead': 'true' },
      text: view.qDisplay
        ? `The Store can support this version. Budgetary estimate: ${view.qDisplay}.`
        : 'The Store can support this version. A complete budgetary estimate is not available.',
    });
  }
  if (view.dispositionEnum === 'REFUSED') {
    return el('p', {
      className: 'store-answer-lead',
      attrs: { 'data-store-answer-lead': 'true' },
      text: 'The Store says no to this version. The reasons are below.',
    });
  }
  if (view.dispositionEnum === 'UNRESOLVED') {
    return el('p', {
      className: 'store-answer-lead',
      attrs: { 'data-store-answer-lead': 'true' },
      text: 'The Store needs more information before it can finish this answer.',
    });
  }
  if (view.dispositionEnum === 'UNAVAILABLE') {
    return el('p', {
      className: 'store-answer-lead',
      attrs: { 'data-store-answer-lead': 'true' },
      text: 'The Store cannot cover this version from the represented stock.',
    });
  }
  return null;
}

function fullBody(view) {
  const showFacts = view.kind === 'store';
  return [
    plainStoreAnswer(view),
    el('p', { className: 'store-prompt', text: COPY.storeAskPrompt }),
    view.candidateRevisionId
      ? fact('Candidate revision', view.candidateRevisionId, {
          'data-store-revision': view.candidateRevisionId,
        })
      : null,
    ...headlineBlock(view),
    retryControl(view),
    showFacts ? materialLinesSection(view) : null,
    showFacts ? offeringSection(view) : null,
    showFacts ? stockSection(view) : null,
    showFacts ? capabilitySection(view) : null,
    showFacts ? estimateSection(view) : null,
    view.inspectable ? basisSection(view) : null,
  ];
}

export function renderStorePanel(view, { mode = 'full' } = {}) {
  const compact = mode === 'compact';
  return el(
    'section',
    {
      className: compact ? 'store-panel store-panel-compact' : 'store-panel store-panel-full',
      attrs: {
        'data-store-panel': mode,
        'data-store-kind': view.kind,
        'data-store-revision': view.candidateRevisionId ?? '',
        'data-current': view.current ? 'true' : 'false',
        'data-historical': view.historical ? 'true' : 'false',
        'data-pending': view.pending ? 'true' : 'false',
        'aria-label': compact ? 'Store answer' : COPY.storeAskHeading,
      },
    },
    [
      compact
        ? el('h3', { text: 'Store Zero' })
        : el('h1', {
            className: 'screen-heading',
            attrs: { id: 'screen-heading', tabindex: '-1' },
            text: COPY.storeAskHeading,
          }),
      ...(compact ? compactBody(view) : fullBody(view)),
    ],
  );
}
