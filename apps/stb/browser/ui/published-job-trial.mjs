const TRIAL_PATH = '/api/published-job';
const TRIAL_IDS = new Set(['rect-stencil', 'arched-opening']);

function answerText(body) {
  if (!body?.ready) {
    return `This Store trial is not mounted here (${body?.code ?? 'STORE_UNAVAILABLE'}). No Store answer was invented.`;
  }
  const estimate = body.estimate;
  const materialText = estimate?.Q != null ? ` Material-only reference: $${Number(estimate.Q).toFixed(2)}; process cost remains ${estimate.processQ_status ?? 'unresolved'}.` : '';
  return `${body.label}: Store ${body.status}.${materialText} This is a Store answer only — no order, machine program, Cycle Start, or physical fabrication is authorized.`;
}

async function runTrial(root, id) {
  const message = root.querySelector('[data-published-message="true"]');
  if (!message) return;
  message.textContent = 'Asking the exact published Store candidate…';
  try {
    const response = await fetch(TRIAL_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: id }),
    });
    const body = await response.json().catch(() => null);
    message.textContent = answerText(body);
  } catch {
    message.textContent = 'The published-job Store trial could not be reached. No Store answer was invented.';
  }
}

function decorate(root) {
  for (const id of TRIAL_IDS) {
    const button = root.querySelector(`[data-published-start="${id}"]`);
    if (!button || button.dataset.publishedTrialReady === 'true') continue;
    button.dataset.publishedTrialReady = 'true';
    button.textContent = 'ASK STORE ABOUT THIS SHAPE';
  }
}

export function startPublishedJobTrialLayer(root) {
  if (!root || root.dataset.publishedJobTrialLayer === 'true') return;
  root.dataset.publishedJobTrialLayer = 'true';

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-published-start]');
    if (!button || !root.contains(button)) return;
    const id = button.getAttribute('data-published-start');
    if (!TRIAL_IDS.has(id)) return;
    runTrial(root, id);
  });

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
