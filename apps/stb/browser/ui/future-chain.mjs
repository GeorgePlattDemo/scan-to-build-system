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

function decorate(root) {
  const screen = root.querySelector('[data-screen="result"]');
  if (!screen || screen.querySelector('[data-future-chain="true"]')) return;
  const anchor = screen.querySelector('[data-narrative="authority-map"]')
    ?? screen.querySelector('.result-retained')
    ?? screen.querySelector('.screen-heading');
  if (anchor) anchor.before(buildChain());
}

export function startFutureChainLayer(root) {
  if (!root || root.dataset.futureChainLayer === 'true') return;
  root.dataset.futureChainLayer = 'true';
  addStyle();
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      decorate(root);
    });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  schedule();
}
