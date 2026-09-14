import {
  ALCOVE_BACK_MATERIALS,
  ALCOVE_BACK_TYPES,
  ALCOVE_USER1_BASELINE,
} from '/shared/alcove-rule.mjs';
import { currentCandidate } from '/data/selectors.mjs';

const STEP_32 = 1 / 32;
const SPECIES = Object.freeze(['Pine', 'Poplar', 'Cherry', 'Oak']);

function node(tag, { className, text, attrs } = {}, children = []) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) {
        element.setAttribute(name, String(value));
        if (name === 'value' && 'value' in element) element.value = value;
      }
    }
  }
  for (const child of children) if (child) element.append(child);
  return element;
}

function installStyle() {
  if (document.getElementById('stb-alcove-back-controls-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-alcove-back-controls-style';
  style.textContent = `
    .alcove-exact-row{display:grid;grid-template-columns:1fr 76px;gap:7px;align-items:center;margin:-5px 0 10px}
    .alcove-exact-row label{font-size:10.5px;color:#8a8580}
    .alcove-exact-row input{width:100%;font:inherit;font-size:11.5px;padding:4px 6px;border:1px solid #e3ded7;border-radius:5px;background:#fff;color:#1c1917}
    .alcove-back{margin-top:12px;padding-top:12px;border-top:1px solid #e3ded7}
    .alcove-back-title{margin:0 0 7px;font-size:13px;font-weight:600}
    .alcove-back-options{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:9px}
    .alcove-back-options button,.alcove-back-materials button{font-size:10.5px;padding:5px 6px;text-align:center}
    .alcove-back-options button.on,.alcove-back-materials button.on{border-color:#7a4f22;background:#f6efe4}
    .alcove-back-materials{display:grid;grid-template-columns:1fr;gap:4px;margin:6px 0 9px}
    .alcove-back-sub{font-size:10.5px;color:#8a8580;margin:0 0 4px}
    .alcove-back select{width:100%;font:inherit;font-size:11.5px;padding:5px 6px;border:1px solid #e3ded7;border-radius:5px;background:#fff;color:#1c1917;margin-bottom:9px}
    .alcove-back-setback{margin-top:7px}
    .alcove-back-summary,.alcove-back-demand{margin:5px 0 0;font-size:11px;color:#57534e}
    @media(prefers-color-scheme:dark){
      .alcove-exact-row input,.alcove-back select{background:#181613;color:#f2efe8;border-color:#3c352c}
      .alcove-back{border-color:#3c352c}.alcove-back-options button.on,.alcove-back-materials button.on{background:#262015;border-color:#4d4130}
      .alcove-back-summary,.alcove-back-demand{color:#c8c0b5}
    }
  `;
  document.head.append(style);
}

function rawCandidate(candidate, key) {
  return candidate?.payload?.configuration?.inputs?.[key]?.raw ?? '';
}

function hiddenField(panel, key, value = '') {
  let input = panel.querySelector(`[data-config-field="${key}"]`);
  if (!input) {
    input = node('input', { attrs: { type: 'hidden', 'data-config-field': key, value } });
    panel.prepend(input);
  }
  return input;
}

function normalizedText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function backTypeKey(value) {
  const text = normalizedText(value);
  return Object.entries(ALCOVE_BACK_TYPES).find(([key, label]) => text === key || text === label.toLowerCase())?.[0] ?? 'none';
}

function backMaterialKey(value) {
  const text = normalizedText(value);
  return Object.entries(ALCOVE_BACK_MATERIALS).find(([key, label]) => text === key || text === label.toLowerCase())?.[0] ?? 'match';
}

function unicodeFractionValue(character) {
  return ({ '⅛': 1 / 8, '¼': 1 / 4, '⅜': 3 / 8, '½': 1 / 2, '⅝': 5 / 8, '¾': 3 / 4, '⅞': 7 / 8 })[character] ?? null;
}

function parseInches(text) {
  const value = String(text ?? '').trim();
  if (!value) return null;
  const unicode = value.match(/^(\d+)?\s*([⅛¼⅜½⅝¾⅞])$/);
  if (unicode) {
    return Number(unicode[1] ?? 0) + unicodeFractionValue(unicode[2]);
  }
  let match = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (match) {
    const denominator = Number(match[3]);
    if (!(denominator > 0)) return null;
    return Number(match[1]) + Number(match[2]) / denominator;
  }
  match = value.match(/^(\d+)\/(\d+)$/);
  if (match) {
    const denominator = Number(match[2]);
    if (!(denominator > 0)) return null;
    return Number(match[1]) / denominator;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function round32(value) {
  return Math.round(value * 32) / 32;
}

function decimalText(value) {
  return String(Number(Number(value).toFixed(5)));
}

function fraction32(value) {
  const rounded = round32(Number(value));
  if (!Number.isFinite(rounded)) return '';
  const whole = Math.floor(rounded);
  let numerator = Math.round((rounded - whole) * 32);
  if (numerator === 0) return String(whole);
  if (numerator === 32) return String(whole + 1);
  let denominator = 32;
  while (numerator % 2 === 0) {
    numerator /= 2;
    denominator /= 2;
  }
  return whole > 0 ? `${whole} ${numerator}/${denominator}` : `${numerator}/${denominator}`;
}

function dimensionText(panel, value) {
  return panel.dataset.alcoveFractions === 'false' ? decimalText(value) : fraction32(value);
}

function setDepthFromExact(panel) {
  const exact = panel.querySelector('[data-alcove-depth-exact]');
  const slider = panel.querySelector('[data-config-field="blankDepth"]');
  if (!exact || !slider) return;
  const parsed = parseInches(exact.value);
  if (!Number.isFinite(parsed)) {
    exact.value = dimensionText(panel, Number(slider.value));
    return;
  }
  const bounded = Math.min(Number(slider.max), Math.max(Number(slider.min), round32(parsed)));
  slider.value = decimalText(bounded);
  exact.value = dimensionText(panel, bounded);
  slider.dispatchEvent(new Event('input', { bubbles: true }));
  slider.dispatchEvent(new Event('change', { bubbles: true }));
}

function setSetbackFromExact(panel) {
  const exact = panel.querySelector('[data-alcove-back-setback-exact]');
  const slider = panel.querySelector('[data-alcove-back-setback-slider]');
  const hidden = hiddenField(panel, 'backSetback');
  if (!exact || !slider) return;
  const parsed = parseInches(exact.value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    const fallback = Number(hidden.value || ALCOVE_USER1_BASELINE.recessedBackSetbackIn);
    exact.value = dimensionText(panel, fallback);
    return;
  }
  const rounded = round32(parsed);
  if (rounded > Number(slider.max)) slider.max = String(Math.ceil(rounded * 2) / 2);
  slider.value = decimalText(rounded);
  hidden.value = decimalText(rounded);
  exact.value = dimensionText(panel, rounded);
  render(panel);
}

function currentBackLabel(panel) {
  const type = backTypeKey(hiddenField(panel, 'backType').value);
  if (type === 'none') return 'Back: None';
  const material = backMaterialKey(hiddenField(panel, 'backMaterial').value);
  const materialLabel = ALCOVE_BACK_MATERIALS[material];
  const veneer = hiddenField(panel, 'veneerSpecies').value;
  if (type === 'flush') {
    return `Back: Flush · ${materialLabel}${material === 'veneer' && veneer ? ` (${veneer})` : ''}`;
  }
  const setback = Number(hiddenField(panel, 'backSetback').value || ALCOVE_USER1_BASELINE.recessedBackSetbackIn);
  return `Back: Recessed · ${materialLabel}${material === 'veneer' && veneer ? ` (${veneer})` : ''} · set back ${dimensionText(panel, setback)} in`;
}

function render(panel) {
  const type = backTypeKey(hiddenField(panel, 'backType').value);
  const material = backMaterialKey(hiddenField(panel, 'backMaterial').value);
  panel.querySelectorAll('[data-alcove-back-type]').forEach((button) => button.classList.toggle('on', button.dataset.alcoveBackType === type));
  panel.querySelectorAll('[data-alcove-back-material]').forEach((button) => button.classList.toggle('on', button.dataset.alcoveBackMaterial === material));

  const materialBlock = panel.querySelector('[data-alcove-back-material-block]');
  const veneerBlock = panel.querySelector('[data-alcove-veneer-block]');
  const setbackBlock = panel.querySelector('[data-alcove-back-setback-block]');
  if (materialBlock) materialBlock.hidden = type === 'none';
  if (veneerBlock) veneerBlock.hidden = type === 'none' || material !== 'veneer';
  if (setbackBlock) setbackBlock.hidden = type !== 'recessed';

  const depthSlider = panel.querySelector('[data-config-field="blankDepth"]');
  const depthExact = panel.querySelector('[data-alcove-depth-exact]');
  if (depthSlider && depthExact) depthExact.value = dimensionText(panel, Number(depthSlider.value));

  const setbackSlider = panel.querySelector('[data-alcove-back-setback-slider]');
  const setbackExact = panel.querySelector('[data-alcove-back-setback-exact]');
  const setbackValue = Number(hiddenField(panel, 'backSetback').value || ALCOVE_USER1_BASELINE.recessedBackSetbackIn);
  if (setbackSlider && setbackExact) {
    if (setbackValue > Number(setbackSlider.max)) setbackSlider.max = String(Math.ceil(setbackValue * 2) / 2);
    setbackSlider.value = decimalText(setbackValue);
    setbackExact.value = dimensionText(panel, setbackValue);
  }

  const veneerSelect = panel.querySelector('[data-alcove-veneer-species]');
  if (veneerSelect) veneerSelect.value = hiddenField(panel, 'veneerSpecies').value || panel.querySelector('[data-config-field="materialPreference"]')?.value || 'Pine';

  const summary = panel.querySelector('[data-alcove-back-summary]');
  if (summary) summary.textContent = currentBackLabel(panel);
  const demand = panel.querySelector('[data-alcove-back-demand]');
  if (demand) {
    demand.textContent = type === 'none'
      ? 'No back panel requested.'
      : type === 'recessed'
        ? 'Back panel + recessed feature requested. Store material, machine time, and price remain unresolved.'
        : 'Back panel requested. Store material, machine time, and price remain unresolved.';
  }
}

async function decoratePanel(panel) {
  if (panel.dataset.alcoveBackControls === 'true') return;
  panel.dataset.alcoveBackControls = 'true';

  const screen = panel.closest('[data-screen="questions"]');
  const localRecordId = screen?.getAttribute('data-local-record-id');
  const candidate = localRecordId ? await currentCandidate(localRecordId) : null;
  if (!document.contains(panel)) return;

  const backType = rawCandidate(candidate, 'backType') || ALCOVE_USER1_BASELINE.backType;
  const typeKey = backTypeKey(backType);
  const backMaterial = rawCandidate(candidate, 'backMaterial') || (typeKey === 'none' ? '' : ALCOVE_BACK_MATERIALS.match);
  const veneerSpecies = rawCandidate(candidate, 'veneerSpecies') || '';
  const backSetback = rawCandidate(candidate, 'backSetback') || (typeKey === 'recessed' ? String(ALCOVE_USER1_BASELINE.recessedBackSetbackIn) : '');

  hiddenField(panel, 'backType', backType).value = backType;
  hiddenField(panel, 'backMaterial', backMaterial).value = backMaterial;
  hiddenField(panel, 'veneerSpecies', veneerSpecies).value = veneerSpecies;
  hiddenField(panel, 'backSetback', backSetback).value = backSetback;

  const depthSlider = panel.querySelector('[data-config-field="blankDepth"]');
  if (depthSlider) {
    depthSlider.step = String(STEP_32);
    depthSlider.insertAdjacentElement('afterend', node('div', { className: 'alcove-exact-row' }, [
      node('label', { text: 'Exact depth', attrs: { for: 'alcove-depth-exact' } }),
      node('input', { attrs: { id: 'alcove-depth-exact', type: 'text', inputmode: 'text', 'data-alcove-depth-exact': 'true', autocomplete: 'off' } }),
    ]));
  }

  const species = panel.querySelector('.alcove-species');
  if (species) {
    species.insertAdjacentElement('afterend', node('section', { className: 'alcove-back', attrs: { 'data-alcove-back': 'true' } }, [
      node('p', { className: 'alcove-back-title', text: 'Back' }),
      node('div', { className: 'alcove-back-options' }, Object.entries(ALCOVE_BACK_TYPES).map(([key, label]) =>
        node('button', { text: label, attrs: { type: 'button', 'data-alcove-back-type': key } }),
      )),
      node('div', { attrs: { 'data-alcove-back-material-block': 'true' } }, [
        node('p', { className: 'alcove-back-sub', text: 'Back material' }),
        node('div', { className: 'alcove-back-materials' }, Object.entries(ALCOVE_BACK_MATERIALS).map(([key, label]) =>
          node('button', { text: label, attrs: { type: 'button', 'data-alcove-back-material': key } }),
        )),
      ]),
      node('div', { attrs: { 'data-alcove-veneer-block': 'true' } }, [
        node('p', { className: 'alcove-back-sub', text: 'Veneer species' }),
        node('select', { attrs: { 'data-alcove-veneer-species': 'true', 'aria-label': 'Veneer species' } }, SPECIES.map((label) => node('option', { text: label, attrs: { value: label } }))),
      ]),
      node('div', { className: 'alcove-back-setback', attrs: { 'data-alcove-back-setback-block': 'true' } }, [
        node('div', { className: 'alcove-control-line' }, [node('b', { text: 'Set back' }), node('span', { className: 'alcove-control-value', text: '1/32 in increments' })]),
        node('input', { className: 'alcove-slider', attrs: { type: 'range', min: 0, max: 1, step: STEP_32, value: ALCOVE_USER1_BASELINE.recessedBackSetbackIn, 'data-alcove-back-setback-slider': 'true', 'aria-label': 'Back set back' } }),
        node('div', { className: 'alcove-exact-row' }, [
          node('label', { text: 'Exact set back', attrs: { for: 'alcove-back-setback-exact' } }),
          node('input', { attrs: { id: 'alcove-back-setback-exact', type: 'text', inputmode: 'text', 'data-alcove-back-setback-exact': 'true', autocomplete: 'off' } }),
        ]),
      ]),
    ]));
  }

  const current = panel.querySelector('[data-alcove-current]');
  if (current && !panel.querySelector('[data-alcove-back-summary]')) {
    current.insertAdjacentElement('afterend', node('p', { className: 'alcove-back-summary', attrs: { 'data-alcove-back-summary': 'true' } }));
  }
  const material = panel.querySelector('[data-alcove-material]');
  if (material && !panel.querySelector('[data-alcove-back-demand]')) {
    material.insertAdjacentElement('afterend', node('p', { className: 'alcove-back-demand', attrs: { 'data-alcove-back-demand': 'true' } }));
  }

  render(panel);
}

function scheduleDecorate(root) {
  root.querySelectorAll('[data-user1-alcove="true"]').forEach((panel) => decoratePanel(panel));
}

export function startAlcoveBackControls(root) {
  if (!root || root.dataset.alcoveBackControls === 'true') return;
  root.dataset.alcoveBackControls = 'true';
  installStyle();

  root.addEventListener('input', (event) => {
    const panel = event.target.closest('[data-user1-alcove="true"]');
    if (!panel || !root.contains(panel)) return;
    if (event.target.matches('[data-config-field="blankDepth"]')) {
      const exact = panel.querySelector('[data-alcove-depth-exact]');
      if (exact) exact.value = dimensionText(panel, Number(event.target.value));
    }
    if (event.target.matches('[data-alcove-back-setback-slider]')) {
      hiddenField(panel, 'backSetback').value = decimalText(round32(Number(event.target.value)));
      render(panel);
    }
  });

  root.addEventListener('change', (event) => {
    const panel = event.target.closest('[data-user1-alcove="true"]');
    if (!panel || !root.contains(panel)) return;
    if (event.target.matches('[data-alcove-depth-exact]')) {
      setDepthFromExact(panel);
      return;
    }
    if (event.target.matches('[data-alcove-back-setback-exact]')) {
      setSetbackFromExact(panel);
      return;
    }
    if (event.target.matches('[data-alcove-veneer-species]')) {
      hiddenField(panel, 'veneerSpecies').value = event.target.value;
      render(panel);
    }
  });

  root.addEventListener('click', (event) => {
    const panel = event.target.closest('[data-user1-alcove="true"]');
    if (!panel || !root.contains(panel)) return;

    const typeButton = event.target.closest('[data-alcove-back-type]');
    if (typeButton) {
      const type = typeButton.dataset.alcoveBackType;
      hiddenField(panel, 'backType').value = ALCOVE_BACK_TYPES[type];
      if (type === 'none') {
        hiddenField(panel, 'backMaterial').value = '';
        hiddenField(panel, 'veneerSpecies').value = '';
        hiddenField(panel, 'backSetback').value = '';
      } else {
        if (!hiddenField(panel, 'backMaterial').value) hiddenField(panel, 'backMaterial').value = ALCOVE_BACK_MATERIALS.match;
        if (type === 'flush') hiddenField(panel, 'backSetback').value = '';
        if (type === 'recessed' && !hiddenField(panel, 'backSetback').value) hiddenField(panel, 'backSetback').value = String(ALCOVE_USER1_BASELINE.recessedBackSetbackIn);
      }
      render(panel);
      return;
    }

    const materialButton = event.target.closest('[data-alcove-back-material]');
    if (materialButton) {
      const material = materialButton.dataset.alcoveBackMaterial;
      hiddenField(panel, 'backMaterial').value = ALCOVE_BACK_MATERIALS[material];
      if (material === 'veneer') {
        const currentSpecies = panel.querySelector('[data-config-field="materialPreference"]')?.value || 'Pine';
        if (!hiddenField(panel, 'veneerSpecies').value) hiddenField(panel, 'veneerSpecies').value = currentSpecies;
      } else {
        hiddenField(panel, 'veneerSpecies').value = '';
      }
      render(panel);
      return;
    }

    if (event.target.closest('[data-alcove-action="format"]')) {
      queueMicrotask(() => render(panel));
    }
  });

  const observer = new MutationObserver(() => queueMicrotask(() => scheduleDecorate(root)));
  observer.observe(root, { childList: true, subtree: true });
  scheduleDecorate(root);
}
