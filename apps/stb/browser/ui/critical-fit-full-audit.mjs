const ALCOVE_CLASS_ID = 'alcove-shelf-blanks';

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const { className, attrs, text } = options;
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null && value !== false) {
        node.setAttribute(name, value === true ? 'true' : String(value));
      }
    }
  }
  for (const child of children) if (child) node.append(child);
  return node;
}

function ensureStyle() {
  if (document.getElementById('stb-critical-fit-audit-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-critical-fit-audit-style';
  style.textContent = `
    .critical-fit-audit{margin:18px 0;border:1px solid var(--border,#ddd);border-radius:12px;padding:16px;background:var(--surface,#fff)}
    .critical-fit-audit h2{margin:0 0 4px;font-size:18px}
    .critical-fit-audit .audit-lead{margin:0 0 12px;color:var(--text2,#625c55)}
    .critical-fit-audit .audit-warning{margin:0 0 14px;padding:10px 11px;border:1px solid var(--border,#ddd);border-radius:8px;background:var(--rail,#f7f5f2);font-size:12px}
    .critical-fit-audit .audit-form{padding:11px 0;border-top:1px solid var(--border,#ddd)}
    .critical-fit-audit .audit-form:first-of-type{border-top:0}
    .critical-fit-audit .audit-form-head{display:flex;gap:9px;align-items:baseline;flex-wrap:wrap;margin-bottom:6px}
    .critical-fit-audit .audit-code{font:700 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--accent,#7a4f22)}
    .critical-fit-audit .audit-form h3{margin:0;font-size:14px}
    .critical-fit-audit .audit-status{font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text2,#625c55)}
    .critical-fit-audit .audit-grid{display:grid;grid-template-columns:minmax(150px,.42fr) minmax(0,1fr);gap:4px 14px;font-size:12px}
    .critical-fit-audit .audit-grid dt{color:var(--text2,#625c55)}
    .critical-fit-audit .audit-grid dd{margin:0;overflow-wrap:anywhere}
    .critical-fit-audit .audit-note{margin:7px 0 0;font-size:12px;color:var(--text2,#625c55)}
    .critical-fit-audit .audit-raw{margin-top:8px}
    .critical-fit-audit .audit-raw summary{cursor:pointer;font-size:12px;font-weight:650}
    .critical-fit-audit pre{white-space:pre-wrap;overflow:auto;font-size:10.5px;border:1px solid var(--border,#ddd);border-radius:8px;padding:9px;background:var(--rail,#f7f5f2)}
    @media(max-width:700px){.critical-fit-audit .audit-grid{grid-template-columns:1fr}.critical-fit-audit .audit-grid dt{font-weight:650;margin-top:5px}}
  `;
  document.head.append(style);
}

function textValue(value, fallback = 'NOT RETURNED') {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

function kv(rows) {
  const children = [];
  for (const [label, value] of rows) {
    children.push(el('dt', { text: label }));
    children.push(el('dd', { text: textValue(value) }));
  }
  return el('dl', { className: 'audit-grid' }, children);
}

function form({ code, title, status, rows = [], note, raw }) {
  const children = [
    el('div', { className: 'audit-form-head' }, [
      el('span', { className: 'audit-code', text: code }),
      el('h3', { text: title }),
      el('span', { className: 'audit-status', text: status }),
    ]),
  ];
  if (rows.length) children.push(kv(rows));
  if (note) children.push(el('p', { className: 'audit-note', text: note }));
  if (raw !== undefined) {
    let rawText;
    try {
      rawText = JSON.stringify(raw, null, 2);
    } catch {
      rawText = String(raw);
    }
    children.push(
      el('details', { className: 'audit-raw' }, [
        el('summary', { text: 'View exact retained basis' }),
        el('pre', { text: rawText }),
      ]),
    );
  }
  return el('section', { className: 'audit-form', attrs: { 'data-audit-form': code } }, children);
}

function storeRows(view = {}) {
  const basis = view.basis ?? {};
  const offering = view.offering ?? {};
  const capability = view.capability ?? {};
  return [
    ['Disposition', view.dispositionEnum ?? view.headline],
    ['Store SKU', offering.storeSku],
    ['Request ID', view.requestId],
    ['Attempt ID', view.attemptId],
    ['Response ID', view.responseId],
    ['Store pin', basis.storePin],
    ['Capability envelope', capability.envelopeId ?? basis.envelopeId],
    ['Evidence measured', basis.measured === true ? 'true' : 'false'],
    ['Commissioned', basis.commissioned === true ? 'true' : 'false'],
    ['Reason codes', (view.reasons ?? []).join(', ') || 'NONE RETURNED'],
  ];
}

function priceRows(view = {}) {
  const basis = view.basis ?? {};
  const estimate = view.estimate ?? {};
  return [
    ['Budgetary Q', view.qDisplay],
    ['Material', estimate.materialDisplay],
    ['Modeled recovery', estimate.recoveryDisplay],
    ['Modeled cycle', estimate.minutesDisplay],
    ['Pricing engine', basis.pricingEngineId],
    ['Pricing engine version', basis.pricingEngineVersion],
    ['Cycle model', basis.cycleModelId],
  ];
}

export function renderCriticalFitFullAudit({ project, presentation }) {
  if (project?.classId !== ALCOVE_CLASS_ID) return null;
  ensureStyle();

  const snapshot = presentation?.snapshot ?? {};
  const currentReview = presentation?.currentReview ?? null;
  const storeView = presentation?.storeView ?? {};
  const events = presentation?.events ?? [];

  const forms = [
    form({
      code: 'STB-F00',
      title: 'Actor / Account Context',
      status: 'PARTIAL — TRANSACTION ACCOUNT NOT IMPLEMENTED',
      rows: [
        ['Entry mode', project.entryMode],
        ['Project ID', project.projectId],
        ['Local record ID', project.localRecordId],
        ['Transaction account', 'NOT IMPLEMENTED IN ACCEPTED APP'],
      ],
      note: 'The current app preserves actor/entry context. It does not yet create the account authority required for offer acceptance, order creation, or payment.',
    }),
    form({
      code: 'STB-F01',
      title: 'Intent / Source Evidence',
      status: 'CURRENT UPSTREAM RECORD — NOT REWRITTEN HERE',
      rows: [
        ['Project title', project.title],
        ['Project identity', project.projectId],
        ['Evidence custody', 'Retained by existing application record model'],
      ],
      note: 'This audit layer does not duplicate or reinterpret the original source. Existing evidence, observations, corrections, and provenance remain controlling upstream.',
    }),
    form({
      code: 'STB-F02',
      title: 'Confirmed Project Definition',
      status: currentReview ? 'CURRENT REVIEW-BOUND DEFINITION' : 'NOT REACHED — NO CURRENT REVIEW',
      rows: [
        ['Class', project.classId],
        ['Candidate revision', snapshot.candidateRevisionId],
        ['Projection ID', snapshot.projectionId],
        ['Review record', currentReview?.id],
        ['Review type', currentReview?.payload?.type],
        ['Review digest', snapshot.reviewDigest ?? currentReview?.payload?.reviewDigest],
      ],
      note: 'Definition confirmation does not create an order, payment, production release, machine readiness, or physical outcome.',
    }),
    form({
      code: 'STB-F03',
      title: 'WorkPacket',
      status: 'PARTIAL — CURRENT PROJECTION EXISTS; F03 FORM NOT YET ISSUED',
      rows: [
        ['Candidate revision', snapshot.candidateRevisionId],
        ['Projection ID', snapshot.projectionId],
        ['Standard WorkPacket form', 'NOT YET IMPLEMENTED IN ACCEPTED APP'],
      ],
      note: 'Historical WorkPacket examples remain donors. This reader does not promote a donor packet into a current authoritative WorkPacket.',
    }),
    form({
      code: 'STB-F04',
      title: 'Store Evaluation',
      status: storeView.dispositionEnum ? `CURRENT — ${storeView.dispositionEnum}` : 'NOT REACHED — NO STORE ANSWER',
      rows: storeRows(storeView),
      note: 'Store supportability is preserved as a separate authority. SUPPORTABLE does not mean purchased, released, machine-ready, or fabricated.',
      raw: storeView.rawResponse,
    }),
    form({
      code: 'STB-F05',
      title: 'Price Basis / Budgetary Q',
      status: storeView.qDisplay ? 'CURRENT LEGACY REFERENCE ECONOMICS — MIGRATION REQUIRED' : 'UNRESOLVED — NO BUDGETARY Q',
      rows: priceRows(storeView),
      note: 'The accepted D-001 estimator is shown exactly as returned. The new completion standard supersedes unexplained placeholder setup assumptions; this audit does not relabel the legacy recovery model as compliant with the new standard.',
      raw: storeView.rawRequest,
    }),
    form({
      code: 'STB-F06',
      title: 'Reference Offer',
      status: 'NOT IMPLEMENTED / NOT REACHED',
      rows: [['Reason', 'Accepted app currently stops before commerce']],
      note: 'A Store answer and budgetary Q are not silently promoted into an offer.',
    }),
    form({
      code: 'STB-F07',
      title: 'Order / Acceptance',
      status: 'NOT IMPLEMENTED / NOT REACHED',
      rows: [['Order ID', 'NONE'], ['Acceptance event', 'NONE']],
      note: 'No anonymous or implied acceptance is inferred from configuration, Store evaluation, or Review.',
    }),
    form({
      code: 'STB-F08',
      title: 'Payment Zero Demonstration Receipt',
      status: 'NOT IMPLEMENTED / NOT REACHED',
      rows: [['Payment record', 'NONE'], ['Funds status', 'NONE']],
      note: 'No live or simulated payment is invented for this historical/current Critical Fit record.',
    }),
    form({
      code: 'STB-F09',
      title: 'Production Release',
      status: 'NOT IMPLEMENTED / NOT REACHED',
      rows: [['Release record', 'NONE'], ['Authority created', 'NONE']],
      note: 'Paid, Store-supported, or reviewed would still not equal production release.',
    }),
    form({
      code: 'STB-F10',
      title: 'Operations Packet',
      status: 'NOT IMPLEMENTED AS STANDARD FORM',
      rows: [['Operations packet', 'NONE'], ['Controller output', 'NONE']],
      note: 'STORE-JOB-001 remains a closeout/operations donor. This view does not pretend that donor is an issued packet for this runtime record.',
    }),
    form({
      code: 'STB-F11',
      title: 'Machine Admission / Local Readiness',
      status: 'NOT REACHED — PHYSICAL EXECUTION ABSENT',
      rows: [['Machine admission', 'NONE'], ['Local readiness', 'NONE'], ['Cycle Start', 'NONE']],
      note: 'Machine-local authority remains downstream and local. This application does not issue remote Cycle Start.',
    }),
    form({
      code: 'STB-F12',
      title: 'Operation Outcomes',
      status: 'NOT REACHED — NO PHYSICAL OR SIMULATED JOB OUTCOME ATTACHED',
      rows: [['Execution outcome', 'ABSENT'], ['Measured machine result', 'ABSENT']],
      note: 'A documentary or historical simulation is not rewritten as execution of this project revision.',
    }),
    form({
      code: 'STB-F13',
      title: 'Inspection',
      status: 'NOT REACHED — NO EXECUTION TO INSPECT',
      rows: [['Inspection record', 'NONE'], ['Measured part result', 'NONE']],
    }),
    form({
      code: 'STB-F14',
      title: 'Fulfillment / Custody',
      status: 'NOT REACHED — NO PHYSICAL PACKAGE',
      rows: [
        ['Allocated', 'NO EVENT'],
        ['Picked', 'NO EVENT'],
        ['Consumed', 'NO EVENT'],
        ['Staged', 'NO EVENT'],
        ['Fulfilled / custody transferred', 'NO EVENT'],
      ],
      note: 'The audit preserves the existing distinction that staged does not mean fulfilled and that material states are not interchangeable.',
    }),
    form({
      code: 'STB-F15',
      title: 'Owner Record / Completion Reconciliation',
      status: 'PARTIAL — APPLICATION RESULT RETAINED; COMPLETION FORMS NOT YET IMPLEMENTED',
      rows: [
        ['Current review', currentReview?.id],
        ['Application events retained', events.length],
        ['Physical outcome', 'ABSENT'],
        ['Pickup / custody', 'ABSENT'],
      ],
      note: 'The Owner Record keeps what actually happened and leaves later stages missing. It does not fill missing commercial or physical history with narrative.',
    }),
  ];

  return el(
    'section',
    {
      className: 'critical-fit-audit',
      attrs: {
        'data-critical-fit-full-audit': 'true',
        'data-audit-depth': 'FULL_AUDIT',
        'aria-label': 'Critical Fit full audit package',
      },
    },
    [
      el('h2', { text: 'Critical Fit · Full Audit Package' }),
      el('p', {
        className: 'audit-lead',
        text: 'One unabridged reader view of the existing project lineage. This layer adds visibility only; it does not create commerce, production authority, machine authority, or physical history.',
      }),
      el('p', {
        className: 'audit-warning',
        text: 'Preservation rule: existing screens, routes, calculations, records, statuses, controls, and refusal behavior remain controlling. A missing downstream form stays visibly missing instead of being synthesized.',
      }),
      ...forms,
    ],
  );
}
