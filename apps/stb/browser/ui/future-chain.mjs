import { referenceReceipts, saveReferenceRequest, saveReferenceMaterialChoice } from '/domain/reference-receipt.mjs';
import { projectIndex, recordSnapshot } from '/data/selectors.mjs';
import { ALCOVE_CLASS_ID, evaluateAlcoveConfiguration } from '/shared/alcove-rule.mjs';

function node(tag, { className, text, attrs } = {}, children = []) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) element.setAttribute(name, String(value));
    }
  }
  for (const child of children) if (child) element.append(child);
  return element;
}

const STEPS = Object.freeze([
  ['1 · You confirm.', 'One identified project version becomes the definition you are standing behind.'],
  ['2 · The Store answers.', 'Material, quantity, current offering, supportability, and Store basis are answered without silently changing the project.'],
  ['3 · You decide.', 'Accept a future offer, change the project, or stop. A Store answer by itself is not a commercial agreement.'],
  ['4 · Commercial conditions are resolved.', 'Offer, acceptance, payment evidence, allocation, and any expiry or amendment remain separate records. Commerce is not implemented in this build.'],
  ['5 · Production release decides whether work may enter production.', 'Release is its own authority. It is not machine readiness and it does not press Cycle Start.'],
  ['6 · The local cell does its part.', 'A commissioned cell may translate bounded machine-neutral work for its declared setup. Local readiness and Cycle Start stay local. Physical execution is not connected in this build.'],
  ['7 · Quality and fulfillment close the physical handoff.', 'Inspection, labeling, staging, ready notice, custody transfer, and pickup remain distinct. They are not offered in this build.'],
  ['8 · The owner record reconciles what actually happened.', 'The record follows the project and preserves missing or unresolved events instead of inventing them.'],
]);

const DOMAINS = Object.freeze([
  ['Definition', 'CONFIRMED → submitted/evaluated later'],
  ['Commercial', 'offer → acceptance / expiry / withdrawal'],
  ['Payment', 'pending → authorized → captured / failed / refunded'],
  ['Fulfillment', 'unallocated → allocated → released → queued → in process → inspected → staged → fulfilled'],
  ['Machine', 'job received → admitted → locally ready → locally authorized → Cycle Start → executing → complete / stopped / faulted'],
]);

function addStyle() {
  if (document.getElementById('stb-future-chain-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-future-chain-style';
  style.textContent = `
    .future-chain{border:1px solid #d8d1c7;border-radius:12px;padding:15px 16px;margin:14px 0;background:#fff}
    .future-chain h2{margin:0 0 5px;font-size:18px}
    .future-chain .future-status{margin:0 0 14px;font-size:12px;color:#7a7168;font-weight:650;letter-spacing:.04em;text-transform:uppercase}
    .future-steps{display:grid;gap:8px;margin:0 0 16px}
    .future-step{border-left:3px solid #d9c3a2;padding:6px 0 6px 11px}
    .future-step b{display:block;font-size:13px;margin-bottom:2px}
    .future-step span{display:block;font-size:12px;color:#625c55;line-height:1.45}
    .future-domains{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:7px}
    .future-domain{border:1px solid #e3ded7;border-radius:9px;padding:9px 10px;background:#fbfaf8}
    .future-domain b{display:block;font-size:11px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:3px}
    .future-domain span{display:block;font-size:11px;color:#625c55;line-height:1.4}
    .future-chain-note{margin:12px 0 0;font-size:12px;color:#625c55}
    @media (prefers-color-scheme: dark){
      .future-chain{background:#181613;border-color:#3c352c}
      .future-step span,.future-domain span,.future-chain-note{color:#c8c0b5}
      .future-domain{background:#201d18;border-color:#3c352c}
    }
  `;
  document.head.append(style);
}

function buildChain() {
  return node('section', { className: 'future-chain', attrs: { 'data-future-chain': 'true' } }, [
    node('h2', { text: 'What happens next — architecture, not a live order' }),
    node('p', { className: 'future-status', text: 'Only the current application record / Store evaluation / review behavior is implemented here' }),
    node('div', { className: 'future-steps' }, STEPS.map(([title, body]) =>
      node('div', { className: 'future-step' }, [
        node('b', { text: title }),
        node('span', { text: body }),
      ]),
    )),
    node('h3', { text: 'Linked domains, not one giant status' }),
    node('div', { className: 'future-domains' }, DOMAINS.map(([title, body]) =>
      node('div', { className: 'future-domain' }, [
        node('b', { text: title }),
        node('span', { text: body }),
      ]),
    )),
    node('p', {
      className: 'future-chain-note',
      text: 'These state names are narrative scaffolding for later implementation and research. They are not a final state machine, legal conclusion, payment integration, inventory commitment, production authorization, or machine-control interface.',
    }),
  ]);
}

function decorateFutureChain(root) {
  const screen = root.querySelector('[data-screen="result"]');
  if (!screen || screen.querySelector('[data-future-chain="true"]')) return;
  const anchor = screen.querySelector('[data-narrative="authority-map"]')
    ?? screen.querySelector('.result-retained')
    ?? screen.querySelector('.screen-heading');
  if (anchor) anchor.before(buildChain());
}

/*
TRANSACTION SCREEN GRAMMAR — FIXED SHELL
Project classes may change question count, wording, options, prices, and availability.
They do not change this screen grammar without an explicit UI-system revision:
1. One sheet = one transaction stage.
2. Header = no more than four compact identity/status cells.
3. Decision row = number / title + one-line help / choices / value or status.
4. Defaults stay visible; unavailable choices stay visible but disabled.
5. Running summary sits immediately above the boundary strip and action rail.
6. Boundary language stays short; detailed architecture lives elsewhere.
7. Primary action is first. Every later stage has Back.
8. Planned, completed, staged, ready, and custody states remain distinct.
9. Class-specific content is data. Authority boundaries are not class-specific.
*/

export const ORDER_SCREEN_GRAMMAR = Object.freeze({
  maxHeaderCells: 4,
  numberedDecisions: true,
  unavailableChoicesVisible: true,
  runningSummaryRequired: true,
  primaryActionFirst: true,
  backRequiredAfterEntry: true,
  plannedIsNotCompleted: true,
  custodyIsNotStaging: true,
});

const ALCOVE_DECISIONS = Object.freeze([
  ['edge', 'Edge condition', 'how the cut edges arrive', [
    ['ascut', 'As cut', 'included'],
    ['deburr', 'Deburred', 'yard price'],
    ['s150', 'Sanded 150', 'yard price'],
  ]],
  ['bore', 'Shelf-pin boring', 'beyond what the class declares', [
    ['class', 'Class default', 'included'],
    ['cols', 'Adjustable columns', 'yard price'],
    ['none', 'No bores', 'included'],
  ]],
  ['hw', 'Hardware pack', 'pins and fasteners', [
    ['none', 'No added pack', 'included'],
    ['yard', 'Yard-sourced pack', 'yard price'],
    ['mine', 'I supply my own', 'included'],
  ]],
  ['label', 'Labels', 'what travels with the parts', [
    ['std', 'Labels only', 'included'],
    ['sheet', '+ Assembly sheet', 'yard price'],
    ['qr', '+ QR to record', 'yard price'],
  ]],
  ['finish', 'Finishing', 'only if the yard declares it', [
    ['none', 'None — raw', 'included'],
    ['stain', 'Stain + clear', 'not offered', true],
  ]],
  ['excess', 'Offcuts', 'usable remnants and scrap', [
    ['take', 'I take them', 'included'],
    ['dispose', 'Disposal', 'yard price'],
    ['rack', 'Leave for remnant rack', 'yard decision'],
  ]],
  ['pack', 'Packaging', 'how it leaves the cart', [
    ['loose', 'Loose on cart', 'included'],
    ['band', 'Banded', 'yard price'],
    ['box', 'Boxed', 'yard price'],
  ]],
  ['handoff', 'Handoff', 'custody transfers here', [
    ['pickup', 'Pickup', 'included'],
    ['later', 'Pickup later', 'hold policy'],
    ['curb', 'Curbside', 'yard price'],
    ['door', 'Through the door', 'yard price'],
  ]],
  ['who', 'Who collects', 'named on the record', [
    ['me', 'Me', 'included'],
    ['agent', 'Named agent', 'included'],
    ['contractor', 'My contractor', 'included'],
  ]],
  ['stock', 'If something is out of stock', 'this shapes the yard response', [
    ['ask', 'Ask me first', 'included'],
    ['wait', 'Wait for stock', 'included'],
    ['refuse', 'No substitutes', 'included'],
  ]],
]);

const ALCOVE_DEFAULTS = Object.freeze({
  edge: 'ascut',
  bore: 'class',
  hw: 'none',
  label: 'std',
  finish: 'none',
  excess: 'take',
  pack: 'loose',
  handoff: 'pickup',
  who: 'me',
  stock: 'ask',
});

function addOrderStyle() {
  if (document.getElementById('stb-order-exchange-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-order-exchange-style';
  style.textContent = `
    .order-exchange{max-width:860px;margin:14px auto 18px;background:#fff;border:1px solid #e3ded7;border-radius:10px;padding:16px 18px 14px;color:#1c1917}
    .order-exchange h2{margin:0 0 1px;font-size:17px;letter-spacing:-.01em;text-transform:none;color:inherit}
    .order-exchange h3{margin:14px 0 7px;font-size:12px;letter-spacing:.04em;color:#7a4f22;text-transform:uppercase;font-weight:700}
    .order-exchange .oe-sub{margin:0 0 11px;font-size:11.5px;color:#57534e}
    .oe-tag{font-size:10.5px;font-weight:600;letter-spacing:.09em;color:#8a8580;margin:0 0 4px}
    .oe-hdr{display:flex;flex-wrap:wrap;border:1px solid #d9c3a2;border-radius:7px;overflow:hidden;margin-bottom:10px}
    .oe-hdr>div{flex:1;min-width:120px;padding:5px 9px;border-right:1px solid #e3ded7;background:#f4f2ef}
    .oe-hdr>div:last-child{border-right:0}.oe-hdr b{display:block;font-size:8.5px;letter-spacing:.07em;color:#8a8580}.oe-hdr span{font-size:11px;font-family:ui-monospace,Menlo,monospace}
    .oe-band{overflow-wrap:anywhere;border-radius:6px;padding:7px 10px;font-size:11px;margin-bottom:10px;line-height:1.45;background:#f4f2ef;border:1px solid #e3ded7;color:#57534e}
    .oe-band.warn{background:#fdf6e3;border-color:#d9c3a2;color:#8a6d1f}.oe-band.ok{background:#f6efe4;border-color:#d9c3a2;color:#7a4f22}
    .oe-row{display:flex;gap:10px;align-items:baseline;padding:7px 0;border-bottom:1px dotted #e3ded7}.oe-row:last-of-type{border-bottom:0}
    .oe-num{flex:none;width:17px;font-size:9.5px;font-weight:700;color:#8a8580}.oe-title{flex:none;width:150px;font-weight:600;font-size:12px}.oe-title i{display:block;font-style:normal;font-weight:400;font-size:10px;color:#8a8580;line-height:1.3}
    .oe-options{flex:1;display:flex;gap:4px;flex-wrap:wrap;min-width:0}.oe-value{flex:none;width:72px;text-align:right;font-size:10.5px;font-family:ui-monospace,Menlo,monospace;color:#8a8580}
    .oe-pill{font:inherit;font-size:11px;padding:3px 9px;border-radius:999px;cursor:pointer;border:1px solid #e3ded7;background:#faf9f7;color:#57534e;white-space:nowrap}.oe-pill:hover{border-color:#8a8580}.oe-pill.on{background:#f6efe4;border-color:#d9c3a2;color:#7a4f22;font-weight:600}.oe-pill:disabled{opacity:.45;cursor:not-allowed;text-decoration:line-through}
    .oe-total{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;background:#f6efe4;border:1px solid #d9c3a2;border-radius:8px;padding:10px 13px;margin:11px 0 10px}.oe-total .left{font-size:11px;color:#7a4f22;line-height:1.5}.oe-total .left b{color:#1c1917}.oe-total .big{font-size:20px;font-weight:600;color:#7a4f22;line-height:1;text-align:right}.oe-total .big i{display:block;font-style:normal;font-size:10px;font-weight:400;color:#57534e;margin-top:3px}
    .oe-boundary{font-size:10.5px;color:#8a8580;line-height:1.6;margin:0}.oe-boundary b{color:#57534e}.oe-boundary strong{color:#7a4f22}
    .oe-foot{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:11px;padding-top:10px;border-top:1px solid #e3ded7}.oe-foot button{font:inherit;font-size:12px;padding:7px 14px;border-radius:7px;cursor:pointer;border:1px solid #e3ded7;background:#faf9f7;color:#1c1917}.oe-foot button.go{background:#f6efe4;border-color:#d9c3a2;color:#7a4f22;font-weight:600}.oe-foot button:disabled{opacity:.4;cursor:not-allowed}.oe-fine{margin-left:auto;font-size:9.5px;color:#8a8580;text-align:right;line-height:1.4;white-space:pre-line}
    .oe-kv{display:flex;justify-content:space-between;gap:10px;font-size:11.5px;padding:4px 0;border-bottom:1px dotted #e3ded7}.oe-kv:last-child{border-bottom:0}.oe-kv span:first-child{color:#57534e}.oe-kv span:last-child{text-align:right}.oe-chip{display:inline-block;font-size:8px;font-weight:700;letter-spacing:.05em;padding:1px 5px;border-radius:3px;margin-right:5px;vertical-align:1px}.oe-chip.ok{background:#e8f0e0;color:#5d7f3f;border:1px solid #cddcbf}.oe-chip.wn{background:#fdf6e3;color:#8a6d1f;border:1px solid #d9c3a2}.oe-chip.no{background:#f7e6e1;color:#9a3f2f;border:1px solid #e8cabf}
    .oe-pick{display:block;width:100%;font:inherit;text-align:left;background:transparent;color:inherit;border:1px solid #e3ded7;border-radius:8px;padding:9px 11px;margin-bottom:6px;cursor:pointer}.oe-pick.on{border-color:#d9c3a2;background:#f6efe4}.oe-pick .head{display:flex;justify-content:space-between;gap:10px;font-size:12px;font-weight:600}.oe-pick .description{display:block;margin:3px 0 0;font-size:10.5px;color:#8a8580;line-height:1.4}
    .oe-tl{display:grid;grid-template-columns:13px 1fr auto auto;gap:0 9px;font-size:11.5px;align-items:baseline}.oe-tl>div{padding:3.5px 0;border-bottom:1px dotted #e3ded7}.oe-dot{color:#5d7f3f;font-weight:700}.oe-dot.open{color:#8a8580}.oe-dot.now{color:#7a4f22}.oe-who,.oe-when{color:#8a8580;font-size:10px;white-space:nowrap}.oe-when{font-family:ui-monospace,Menlo,monospace}
    @media(prefers-color-scheme:dark){.order-exchange{background:#1e1c16;border-color:#332f26;color:#f2efe8}.order-exchange .oe-sub,.oe-band,.oe-kv span:first-child,.oe-total .big i,.oe-boundary,.oe-pick .description,.oe-fine,.oe-who,.oe-when{color:#b4aea3}.oe-hdr>div,.oe-band{background:#191711;border-color:#332f26}.oe-total,.oe-pill.on,.oe-pick.on{background:#262015;border-color:#4d4130}.oe-pill,.oe-foot button{background:#16150f;color:#f2efe8;border-color:#332f26}.oe-total .left b{color:#f2efe8}.order-exchange h3{color:#e0ad74}}
    @media(max-width:700px){.oe-row{flex-wrap:wrap}.oe-title{width:auto;flex:1}.oe-value{width:auto}.oe-fine{width:100%;margin-left:0;text-align:left}.oe-total{flex-wrap:wrap}.oe-tl{grid-template-columns:13px minmax(0,1fr) auto auto}.oe-who,.oe-when{white-space:normal}.oe-hdr span{overflow-wrap:anywhere}}
  `;
  document.head.append(style);
}

function formatInches(value) {
  const whole = Math.floor(value);
  const frac = Number((value - whole).toFixed(3));
  const fractions = new Map([[0.125, '⅛'], [0.25, '¼'], [0.375, '⅜'], [0.5, '½'], [0.625, '⅝'], [0.75, '¾'], [0.875, '⅞']]);
  const suffix = fractions.get(frac);
  if (!suffix) return Number.isInteger(value) ? String(value) : String(value);
  return whole ? `${whole}${suffix}` : suffix;
}

function alcoveSummaryLine(project) {
  const result = project.referenceConfiguration;
  if (!result?.valid) return 'Configuration unresolved — review the project definition.';
  const inputs = result.inputs;
  return `${formatInches(inputs.openingWidth.value)}″ opening · ${inputs.shelfCount.value} shelves · ${formatInches(inputs.blankDepth.value)}″ deep · ${inputs.materialPreference.canonical} · ${formatInches(result.derived.span.value)}″ nominal span · back ${inputs.backType.display}`;
}

function header(items) {
  return node('div', { className: 'oe-hdr' }, items.slice(0, ORDER_SCREEN_GRAMMAR.maxHeaderCells).map(([label, value]) =>
    node('div', {}, [node('b', { text: label }), node('span', { text: value })]),
  ));
}

function stateFor(screen) {
  if (!screen.__stbOrderExchange) {
    screen.__stbOrderExchange = {
      stage: 'request',
      choices: { ...ALCOVE_DEFAULTS },
      stockChoice: null,
      receipt: null,
      history: [],
      busy: false,
      error: '',
    };
  }
  return screen.__stbOrderExchange;
}

function selectedOption(decision, state) {
  return decision[3].find((option) => option[0] === state.choices[decision[0]]) ?? null;
}

function renderRequest(host, project, state) {
  const answered = ALCOVE_DECISIONS.filter((decision) => state.choices[decision[0]]).length;
  const rows = ALCOVE_DECISIONS.map((decision, index) => {
    const selected = selectedOption(decision, state);
    return node('div', { className: 'oe-row' }, [
      node('span', { className: 'oe-num', text: String(index + 1).padStart(2, '0') }),
      node('span', { className: 'oe-title' }, [node('span', { text: decision[1] }), node('i', { text: decision[2] })]),
      node('span', { className: 'oe-options' }, decision[3].map((option) => node('button', {
        className: `oe-pill${state.choices[decision[0]] === option[0] ? ' on' : ''}`,
        text: option[1],
        attrs: {
          type: 'button',
          'aria-pressed': String(state.choices[decision[0]] === option[0]),
          'data-oe-choice': decision[0],
          'data-oe-value': option[0],
          ...(option[3] ? { disabled: 'true', title: option[2] } : {}),
        },
      }))),
      node('span', { className: 'oe-value', text: selected?.[2] ?? '' }),
    ]);
  });

  host.replaceChildren(
    node('p', { className: 'oe-tag', text: 'STB — ALCOVE INSERT · SUBMISSION & RESPONSE 0.1' }),
    node('h2', { text: 'Before we build it — ten questions' }),
    node('p', { className: 'oe-sub', text: `Identified revision · ${alcoveSummaryLine(project)}` }),
    header([
      ['VERSION', project.currentHead ?? 'current confirmed revision'],
      ['PROJECT', project.title ?? 'alcove insert'],
      ['NODE', 'store-zero'],
      ['THIS SHEET', 'REQUEST · not an order'],
    ]),
    node('div', { className: 'oe-band' }, [node('b', { text: 'Answer all ten, including the noes. ' }), node('span', { text: 'Defaults add nothing. Yard may adjust, add or revoke before acceptance — with a reason.' })]),
    ...rows,
    node('div', { className: 'oe-total' }, [
      node('div', { className: 'left' }, [
        node('span', { text: 'Fabrication ' }), node('b', { text: 'unresolved' }),
        node('span', { text: ' · extras ' }), node('b', { text: '$0 default' }),
        node('span', { text: ' · ' }), node('b', { text: 'YARD ≤2 business h · PICKUP 4 business h after READY' }),
      ]),
      node('div', { className: 'big' }, [node('span', { text: 'YARD PRICES' }), node('i', { text: `${answered} of ${ALCOVE_DECISIONS.length} answered` })]),
    ]),
    node('p', { className: 'oe-boundary' }, [
      node('strong', { text: '≠ ' }), node('span', { text: 'request is not order · ' }),
      node('strong', { text: '≠ ' }), node('span', { text: 'order is not payment · ' }),
      node('strong', { text: '≠ ' }), node('span', { text: 'payment is not allocation · ' }),
      node('strong', { text: '≠ ' }), node('span', { text: 'allocation is not release · ' }),
      node('strong', { text: '≠ ' }), node('b', { text: 'staged is not picked up' }),
    ]),
    node('div', { className: 'oe-foot' }, [
      node('button', { className: 'go', text: 'SEND TO THE YARD', attrs: { type: 'button', 'data-oe-action': 'send', ...(answered !== ALCOVE_DECISIONS.length ? { disabled: 'true' } : {}) } }),
      node('button', { text: 'Use all defaults', attrs: { type: 'button', 'data-oe-action': 'defaults' } }),
      node('button', { text: 'Back', attrs: { type: 'button', 'data-action': 'open-confirm' } }),
      node('span', { className: 'oe-fine', text: 'Reference walkthrough only. Nothing charged or reserved.\nSending saves a reference receipt in this browser. Unsent edits are not saved.' }),
    ]),
  );
}

function renderResponse(host, project, state) {
  host.replaceChildren(
    node('p', { className: 'oe-tag', text: 'STB — ALCOVE INSERT · YARD RESPONSE' }),
    node('h2', { text: 'The yard came back — reference scenario' }),
    node('p', { className: 'oe-sub', text: 'Reference scenario REF-SZ-001: requested material is unavailable. Your saved request remains unchanged.' }),
    header([
      ['RECEIPT', state.receipt?.id ?? 'not saved'],
      ['AGAINST', project.currentHead ?? 'current confirmed revision'],
      ['FROM', 'steward · store-zero'],
      ['STATUS', 'ADJUSTMENT REQUIRED'],
    ]),
    node('div', { className: 'oe-band ok' }, [node('b', { text: 'Definition unchanged. ' }), node('span', { text: 'The yard may price services, decline unavailable work, or return a material/timing question. It may not silently rewrite the confirmed geometry.' })]),
    ...ALCOVE_DECISIONS.map((decision) => {
      const selected = selectedOption(decision, state);
      return node('div', { className: 'oe-kv' }, [
        node('span', { text: decision[1] }),
        node('span', { text: selected ? `${selected[1]} · ${selected[2]}` : 'unresolved' }),
      ]);
    }),
    node('div', { className: 'oe-kv' }, [node('span', {}, [node('span', { className: 'oe-chip wn', text: 'PRICE' }), node('span', { text: 'Any paid extras' })]), node('span', { text: 'yard-priced before acceptance' })]),
    node('div', { className: 'oe-kv' }, [node('span', {}, [node('span', { className: 'oe-chip no', text: 'NOT OFFERED' }), node('span', { text: 'Stain + clear' })]), node('span', { text: 'capability not declared' })]),
    node('h3', { text: 'One thing only you can decide' }),
    node('button', { className: `oe-pick${state.stockChoice === 'wait' ? ' on' : ''}`, attrs: { type: 'button', 'aria-pressed': String(state.stockChoice === 'wait'), 'data-oe-stock': 'wait' } }, [
      node('span', { className: 'head' }, [node('span', { text: 'Wait for the requested material' }), node('span', { text: 'same definition' })]),
      node('span', { className: 'description', text: 'No substitute. Yard returns a later plan.' }),
    ]),
    node('button', { className: `oe-pick${state.stockChoice === 'review' ? ' on' : ''}`, attrs: { type: 'button', 'aria-pressed': String(state.stockChoice === 'review'), 'data-oe-stock': 'review' } }, [
      node('span', { className: 'head' }, [node('span', { text: 'Review a substitute' }), node('span', { text: 'new decision' })]),
      node('span', { className: 'description', text: 'Material identity changes only if you explicitly accept it.' }),
    ]),
    node('h3', { text: 'Timing' }),
    node('div', { className: 'oe-tl' }, [
      node('div', { className: 'oe-dot now', text: '●' }), node('div', { text: 'Yard response' }), node('div', { className: 'oe-who', text: 'yard' }), node('div', { className: 'oe-when', text: 'now' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Offer / terms' }), node('div', { className: 'oe-who', text: 'commercial' }), node('div', { className: 'oe-when', text: 'after answer' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Payment / allocation / release' }), node('div', { className: 'oe-who', text: 'separate' }), node('div', { className: 'oe-when', text: 'later' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Stage ≤2 business h after last required cycle' }), node('div', { className: 'oe-who', text: 'yard' }), node('div', { className: 'oe-when', text: 'target' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Pickup 4 business h after READY' }), node('div', { className: 'oe-who', text: 'holder' }), node('div', { className: 'oe-when', text: 'then hold policy' }),
    ]),
    node('div', { className: 'oe-total' }, [
      node('div', { className: 'left' }, [node('span', { text: 'Fabrication ' }), node('b', { text: 'unresolved' }), node('span', { text: ' · secondary services ' }), node('b', { text: 'not catalogued' })]),
      node('div', { className: 'big' }, [node('span', { text: state.stockChoice ? 'RESPONSE READY' : 'ONE ANSWER' }), node('i', { text: state.stockChoice ? 'yard may issue terms next' : 'material response required' })]),
    ]),
    node('p', { className: 'oe-boundary', text: 'Acceptance, settlement, allocation, production release, local readiness and Cycle Start remain separate records.' }),
    node('div', { className: 'oe-foot' }, [
      node('button', { className: 'go', text: 'CONTINUE TO TERMS', attrs: { type: 'button', 'data-oe-action': 'terms', ...(state.stockChoice ? {} : { disabled: 'true' }) } }),
      node('button', { text: 'Back', attrs: { type: 'button', 'data-oe-action': 'back-request' } }),
      node('span', { className: 'oe-fine', text: 'Reference process only.\nNo commercial order is created.' }),
    ]),
  );
}

function renderTerms(host, project, screen) {
  const reviewStatus = screen.dataset.reviewCurrent !== 'true' ? 'not recorded'
    : screen.dataset.reviewType === 'DefinitionReviewRecorded' ? 'confirmed'
      : screen.dataset.reviewType === 'UnresolvedDefinitionAcknowledged' ? 'unresolved acknowledged'
        : 'unresolved';
  host.replaceChildren(
    node('p', { className: 'oe-tag', text: 'STB — REFERENCE COMMERCIAL HANDOFF' }),
    node('h2', { text: 'Terms → settlement → queue' }),
    node('p', { className: 'oe-sub', text: 'Known sequence · not live commerce' }),
    header([
      ['VERSION', project.currentHead ?? 'current confirmed revision'],
      ['TERMS', 'reference only'],
      ['PRICE', 'not established'],
      ['AUTHORITY', 'no physical execution'],
    ]),
    node('div', { className: 'oe-tl' }, [
      node('div', { className: reviewStatus === 'not recorded' ? 'oe-dot open' : 'oe-dot now', text: reviewStatus === 'not recorded' ? '○' : '●' }), node('div', { text: 'Definition review' }), node('div', { className: 'oe-who', text: 'holder' }), node('div', { className: 'oe-when', text: reviewStatus }),
      node('div', { className: 'oe-dot now', text: '●' }), node('div', { text: 'Submission / yard response' }), node('div', { className: 'oe-who', text: 'yard' }), node('div', { className: 'oe-when', text: 'reference' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Offer accepted' }), node('div', { className: 'oe-who', text: 'holder' }), node('div', { className: 'oe-when', text: 'future' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Settlement evidence' }), node('div', { className: 'oe-who', text: 'commercial' }), node('div', { className: 'oe-when', text: 'future' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Material allocated' }), node('div', { className: 'oe-who', text: 'store' }), node('div', { className: 'oe-when', text: 'future' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Production released' }), node('div', { className: 'oe-who', text: 'release' }), node('div', { className: 'oe-when', text: 'future' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Queued / local readiness / Cycle Start' }), node('div', { className: 'oe-who', text: 'cell' }), node('div', { className: 'oe-when', text: 'future' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Inspect · label · stage' }), node('div', { className: 'oe-who', text: 'quality' }), node('div', { className: 'oe-when', text: '≤2 h target' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'READY notice → 4 h pickup window' }), node('div', { className: 'oe-who', text: 'fulfillment' }), node('div', { className: 'oe-when', text: 'future' }),
      node('div', { className: 'oe-dot open', text: '○' }), node('div', { text: 'Custody transfer → close' }), node('div', { className: 'oe-who', text: 'handoff' }), node('div', { className: 'oe-when', text: 'future' }),
    ]),
    node('div', { className: 'oe-band warn' }, [node('b', { text: 'Current Alcove truth: ' }), node('span', { text: `${alcoveSummaryLine(project)} No ordered-size reduction applied. Ordered-size adjustment, structure, installation and Store resolution remain unresolved.` })]),
    node('div', { className: 'oe-foot' }, [
      node('button', { text: 'Back', attrs: { type: 'button', 'data-oe-action': 'back-response' } }),
      node('button', { text: 'Review definition', attrs: { type: 'button', 'data-action': 'open-confirm' } }),
      node('span', { className: 'oe-fine', text: 'Shell fixed.\nClass content may change.' }),
    ]),
  );
}

function renderOrderExchange(host, project, screen) {
  const state = stateFor(screen);
  if (state.stage === 'response') renderResponse(host, project, state);
  else if (state.stage === 'terms') renderTerms(host, project, screen);
  else renderRequest(host, project, state);
  if (state.receipt) host.append(node('p', { className: 'oe-band', attrs: { 'data-reference-receipt': state.receipt.id },
    text: `Reference request receipt ${state.receipt.id} · saved ${state.receipt.createdAt}. This records your request, not payment or a commercial order.` }));
  if (state.history.length) host.append(node('details', { attrs: { 'data-reference-history': 'true' } }, [
    node('summary', { text: 'Saved receipts and changes' }),
    ...state.history.map(record => node('div', { className: 'oe-band' }, [
      node('b', { text: `${record.createdAt} · ${record.payload.type === 'ReferenceRequestSaved' ? 'Request receipt' : 'Material decision'}` }),
      node('p', { text: `Receipt: ${record.id} · revision: ${record.payload.candidateRevisionId}` }),
      node('p', { text: record.payload.reason }),
      node('p', { text: `Earlier record: ${record.payload.previousReceiptId ?? record.payload.previousDecisionId ?? record.payload.requestId ?? 'none'}` }),
      record.payload.choices ? node('p', { text: ALCOVE_DECISIONS.map(decision => {
        const selected = decision[3].find(option => option[0] === record.payload.choices[decision[0]]);
        return `${decision[1]}: ${selected?.[1] ?? 'unresolved'}`;
      }).join(' · ') }) : null,
    ])),
    node('p', { text: 'These records are retained with the project and included in its existing record export. Imported receipts remain historical.' }),
  ]));
  if (state.error) host.append(node('p', { className: 'oe-band warn', attrs: { role: 'alert' }, text: state.error }));
}

async function decorateOrderExchange(root) {
  const screen = root.querySelector('[data-screen="result"][data-local-record-id]');
  if (!screen || screen.querySelector('[data-order-exchange="alcove"]')) return;
  const localRecordId = screen.getAttribute('data-local-record-id');
  if (!localRecordId) return;
  const project = await projectIndex(localRecordId);
  if (!project || project.classId !== ALCOVE_CLASS_ID || !root.contains(screen)) return;
  const candidate = await recordSnapshot(localRecordId, 'candidate', project.currentHead);
  const history = await referenceReceipts(localRecordId);
  if (!root.contains(screen)) return;
  project.referenceConfiguration = candidate?.payload?.configuration
    ? evaluateAlcoveConfiguration(candidate.payload.configuration)
    : null;
  // Another observer callback may have completed while projectIndex was pending.
  if (screen.querySelector('[data-order-exchange="alcove"]')) return;
  const host = node('section', { className: 'order-exchange', attrs: { 'data-order-exchange': 'alcove' } });
  host.__stbProject = project;
  const state = stateFor(screen);
  state.history = history;
  const receipt = history.filter(record => record.payload.type === 'ReferenceRequestSaved').at(-1);
  if (!project.imported && receipt?.payload.candidateRevisionId === project.currentHead) {
    state.receipt = receipt;
    state.choices = { ...receipt.payload.choices };
    state.stockChoice = history.filter(record => record.payload.type === 'ReferenceMaterialChoiceSaved' && record.payload.requestId === receipt.id).at(-1)?.payload.choice ?? null;
    state.stage = 'response';
  }
  const anchor = screen.querySelector('[data-future-chain="true"]')
    ?? screen.querySelector('[data-narrative="authority-map"]')
    ?? screen.querySelector('.result-retained')
    ?? screen.querySelector('.screen-heading');
  if (anchor) anchor.before(host);
  renderOrderExchange(host, project, screen);
}

export function startFutureChainLayer(root) {
  if (!root || root.dataset.futureChainLayer === 'true') return;
  root.dataset.futureChainLayer = 'true';
  addStyle();
  addOrderStyle();

  root.addEventListener('click', async (event) => {
    const host = event.target.closest('[data-order-exchange="alcove"]');
    if (!host || !root.contains(host)) return;
    const screen = host.closest('[data-screen="result"]');
    const project = host.__stbProject;
    if (!screen || !project) return;
    const state = stateFor(screen);
    if (state.busy) return;
    state.error = '';

    const persist = async (save) => {
      state.busy = true;
      host.setAttribute('aria-busy', 'true');
      const pending = node('p', { attrs: { role: 'status' }, text: 'Saving the reference record…' });
      host.append(pending);
      try {
        const record = await save();
        state.history = await referenceReceipts(project.localRecordId);
        return record;
      } catch (error) {
        state.error = `Could not complete the reference-record save: ${error.message} Reopen the record to check what was retained before retrying.`;
        return null;
      } finally {
        state.busy = false;
        host.removeAttribute('aria-busy');
        pending.remove();
      }
    };

    const choice = event.target.closest('[data-oe-choice]');
    if (choice && !choice.disabled) {
      if (state.stage !== 'request') return;
      state.stockChoice = null;
      state.choices[choice.getAttribute('data-oe-choice')] = choice.getAttribute('data-oe-value');
      renderOrderExchange(host, project, screen);
      host.querySelector(`[data-oe-choice="${choice.getAttribute('data-oe-choice')}"][data-oe-value="${choice.getAttribute('data-oe-value')}"]`)?.focus();
      return;
    }

    const stock = event.target.closest('[data-oe-stock]');
    if (stock && !stock.disabled && state.stage === 'response') {
      const choice = stock.getAttribute('data-oe-stock');
      const saved = await persist(() => saveReferenceMaterialChoice({ localRecordId: project.localRecordId,
        candidateRevisionId: project.currentHead, requestId: state.receipt?.id, choice }));
      if (saved) state.stockChoice = choice;
      renderOrderExchange(host, project, screen);
      host.querySelector(`[data-oe-stock="${state.stockChoice}"]`)?.focus();
      return;
    }

    const control = event.target.closest('[data-oe-action]');
    if (!control || control.disabled) return;
    const action = control.getAttribute('data-oe-action');
    if (action === 'defaults' && state.stage === 'request') {
      state.choices = { ...ALCOVE_DEFAULTS };
      state.stockChoice = null;
    } else if (action === 'send' && state.stage === 'request') {
      if (!ALCOVE_DECISIONS.every((decision) => {
        const selected = selectedOption(decision, state);
        return selected && !selected[3];
      })) return;
      const saved = await persist(() => saveReferenceRequest({ localRecordId: project.localRecordId,
        candidateRevisionId: project.currentHead, choices: state.choices }));
      if (saved) {
        if (state.receipt?.id !== saved.id) state.stockChoice = null;
        state.receipt = saved;
        state.stage = 'response';
      }
    } else if (action === 'back-request' && state.stage === 'response') {
      state.stage = 'request';
    } else if (action === 'terms' && state.stage === 'response' && ['wait', 'review'].includes(state.stockChoice)) {
      state.stage = 'terms';
    } else if (action === 'back-response' && state.stage === 'terms') {
      state.stage = 'response';
    } else return;
    renderOrderExchange(host, project, screen);
    const focusTarget = action === 'defaults' ? host.querySelector('[data-oe-action="defaults"]') : host.querySelector('h2');
    if (focusTarget) {
      if (focusTarget.tagName === 'H2') focusTarget.tabIndex = -1;
      focusTarget.focus();
    }
  });

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      decorateFutureChain(root);
      void decorateOrderExchange(root).catch(() => {
        const screen = root.querySelector('[data-screen="result"]');
        if (screen && !screen.querySelector('[data-reference-load-error]')) screen.append(node('p', {
          attrs: { role: 'alert', 'data-reference-load-error': 'true' },
          text: 'Reference receipts could not be loaded. Reopen the project before continuing; existing records have not been replaced.',
        }));
      });
    });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  schedule();
}
