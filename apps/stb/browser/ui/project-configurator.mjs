import { getClassConfigurator } from '/shared/class-config.mjs';
import { ALCOVE_CLASS_ID, ALCOVE_USER1_BASELINE } from '/shared/alcove-rule.mjs';
import { PICNIC_CLASS_ID } from '/shared/picnic-rule.mjs';
import { applyMappedConfiguration } from '/domain/configurator.mjs';
import { currentCandidate, currentProjection, projectIndex } from '/data/selectors.mjs';
import { renderProjectProjection } from '/ui/project-renderer.mjs';

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
  if (document.getElementById('stb-project-configurator-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-project-configurator-style';
  style.textContent = `
    .project-configurator{margin:12px 0 18px;border:2px solid #cbb28d;border-radius:14px;padding:16px;background:#fffdf9}
    .project-configurator h2{margin:0 0 5px;font-size:20px}
    .project-configurator .config-lead{margin:0 0 14px;color:#5f584f;line-height:1.5}
    .config-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
    .config-field{display:grid;gap:4px;border:1px solid #e3ded7;border-radius:10px;padding:10px;background:#fff}
    .config-field label{font-size:12px;font-weight:650}
    .config-field input{font:inherit;padding:8px;border:1px solid #cfc8bf;border-radius:7px;background:inherit;color:inherit}
    .config-field small{font-size:11px;color:#6b645c;line-height:1.35}
    .config-unit{font-size:11px;color:#7a7168}
    .config-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
    .config-actions button{padding:9px 12px}
    .config-engine{margin-top:14px;border-top:1px solid #ded7ce;padding-top:14px}
    .config-engine-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}
    .config-engine-card{border:1px solid #e3ded7;border-radius:10px;padding:10px;background:#fff}
    .config-engine-card h3{font-size:12px;margin:0 0 5px;letter-spacing:.04em}
    .config-engine-card p{margin:3px 0;font-size:12px;line-height:1.4}
    .config-parts{margin:7px 0 0;padding-left:20px;max-height:260px;overflow:auto}
    .config-parts li{margin:4px 0;font-size:12px}
    .project-renderer{margin-top:12px;border:1px solid #e3ded7;border-radius:10px;padding:12px;background:#fff}
    .project-renderer h3{font-size:12px;margin:0 0 8px;letter-spacing:.05em}
    .project-orthographic-svg{width:100%;height:auto;display:block;max-height:420px}
    .config-unresolved{margin:8px 0 0;padding-left:20px}
    .config-unresolved li{font-size:12px;margin:3px 0}
    .config-fixture{border-left:4px solid #a98255;padding-left:10px;margin:10px 0;color:#5f584f}
    .alcove-configurator{padding:0;overflow:hidden;border:1px solid #d9c3a2;border-radius:12px;background:#fff}
    .alcove-configurator .alcove-head{padding:20px 22px 8px}
    .alcove-configurator .alcove-head h2{font-size:23px;margin:0}
    .alcove-cfg{display:grid;grid-template-columns:minmax(0,1fr) 235px;gap:16px;padding:0 22px 10px}
    .alcove-drawing{min-width:0;background:#f2ece2;border-radius:9px;overflow:hidden}
    .alcove-drawing svg{width:100%;display:block}
    .alcove-controls{min-width:0}
    .alcove-control-line{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;font-size:13px}
    .alcove-control-line b{font-weight:600}
    .alcove-control-value{font-size:11px;color:#8a8580}
    .alcove-slider{width:100%;margin:0 0 10px;accent-color:#7a4f22}
    .alcove-heights{margin-bottom:10px}
    .alcove-height-row{display:flex;align-items:center;gap:6px;margin-bottom:3px}
    .alcove-height-row span{font-size:10.5px;color:#8a8580}
    .alcove-height-row .height-index{width:12px}
    .alcove-height-row input{flex:1;min-width:0;font:inherit;font-size:12px;padding:3px 6px;border:1px solid #e3ded7;border-radius:5px;background:#fff;color:#1c1917}
    .alcove-format{font-size:10px;padding:2px 7px}
    .alcove-species{display:grid;grid-template-columns:1fr 1fr;gap:4px}
    .alcove-species button{display:flex;align-items:center;gap:7px;padding:6px 7px;font-size:11px}
    .alcove-species button.on{border-color:#7a4f22;background:#f6efe4}
    .alcove-species .dot{width:15px;height:15px;border-radius:50%;border:1px solid rgba(0,0,0,.2);flex:none}
    .alcove-summary{margin:4px 22px 0;background:#f6efe4;border:1px solid #d9c3a2;border-radius:10px;padding:16px 18px}
    .alcove-summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px;font-size:13px}
    .alcove-summary-label{margin:0 0 6px;font-size:10.5px;font-weight:600;letter-spacing:.06em;color:#7a4f22}
    .alcove-price-row{border-top:1px solid #d9c3a2;padding-top:12px;display:flex;justify-content:space-between;align-items:baseline;gap:12px}
    .alcove-price{margin:0;font-size:24px;font-weight:600;line-height:1;color:#7a4f22}
    .alcove-how{margin:14px 22px 0;font-size:12.5px}
    .alcove-how summary{cursor:pointer;font-weight:600;padding:8px 0}
    .alcove-review-action{padding:14px 22px 20px}
    .alcove-reference-note{margin:8px 0 0;color:#5f584f;font-size:12px}
    .alcove-hidden{display:none}
    @media(prefers-color-scheme:dark){
      .project-configurator{background:#211d17;border-color:#715a3c}
      .config-field,.config-engine-card,.project-renderer{background:#181613;border-color:#3c352c}
      .project-configurator .config-lead,.config-field small,.config-unit,.config-fixture{color:#c8c0b5}
      .config-field input{border-color:#4b4339}
      .alcove-configurator{background:#1e1c16;border-color:#4d4130}
      .alcove-drawing{background:#262015}.alcove-height-row input{background:#181613;color:#f2efe8;border-color:#3c352c}
      .alcove-species button.on,.alcove-summary{background:#262015;border-color:#4d4130}.alcove-summary-label,.alcove-price{color:#e0ad74}
    }
    @media(max-width:760px){.alcove-cfg,.alcove-summary-grid{grid-template-columns:1fr}}
  `;
  document.head.append(style);
}

function currentRaw(candidate, key) {
  return candidate?.payload?.configuration?.inputs?.[key]?.raw ?? '';
}

function currentOr(candidate, key, fallback) {
  const value = currentRaw(candidate, key);
  return value === '' ? String(fallback) : value;
}

function fieldNode(candidate, field) {
  const id = `config-${field.key}`;
  return node('div', { className: 'config-field' }, [
    node('label', { text: field.label, attrs: { for: id } }),
    node('input', {
      attrs: {
        id,
        type: 'text',
        inputmode: field.inputMode ?? 'text',
        autocomplete: 'off',
        value: currentRaw(candidate, field.key),
        'data-config-field': field.key,
      },
    }),
    node('span', { className: 'config-unit', text: field.unit ?? '' }),
    node('small', { text: field.help ?? '' }),
  ]);
}

function dimensionText(part) {
  if (part?.length?.canonical && part?.depth?.canonical && part?.thickness?.canonical) {
    return `${part.length.canonical} × ${part.depth.canonical} × ${part.thickness.canonical} in`;
  }
  if (part?.length?.canonical && part?.profile?.width?.canonical && part?.profile?.thickness?.canonical) {
    return `${part.length.canonical} in long · profile ${part.profile.width.canonical} × ${part.profile.thickness.canonical} in`;
  }
  return part?.length?.canonical ? `${part.length.canonical} in` : 'dimensions unresolved';
}

function alcoveSummary(payload) {
  const span = payload.derived?.span?.canonical ?? '—';
  const parts = payload.parts ?? [];
  const materialPreference = payload.inputs?.materialPreference?.canonical ?? 'unresolved';
  const shelfHeights = payload.inputs?.shelfHeights?.canonical ?? [];
  return [
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: 'HOW THE NUMBER WAS CALCULATED' }),
      node('p', { text: 'Nominal interior span = opening width − left support − right support' }),
      payload.valid ? node('p', { text: `${payload.inputs.openingWidth.canonical} − ${payload.inputs.leftSupport.canonical} − ${payload.inputs.rightSupport.canonical} = ${span} in` }) : null,
      node('p', { text: payload.valid ? `Derived span before ordering adjustment: ${span} in` : `Stopped: ${payload.unresolvedReason ?? 'incomplete input'}` }),
      node('p', { className: 'hint', text: `Rule: ${payload.ruleVersion ?? 'unidentified'}` }),
    ]),
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: 'USER 1 CONFIGURATION' }),
      node('p', { text: `Shelf heights: ${shelfHeights.length ? shelfHeights.join(', ') + ' in' : 'unresolved'}` }),
      node('p', { text: `Material preference: ${materialPreference}` }),
      node('p', { className: 'hint', text: 'These are holder configuration values. Store material identity is still a separate answer.' }),
    ]),
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: 'PARTS' }),
      parts.length > 0
        ? node('ul', { className: 'config-parts' }, parts.map((part) =>
            node('li', { text: `${part.label}: ${dimensionText(part)} · ${part.quantity} ${part.quantityUnit}` }),
          ))
        : node('p', { className: 'hint', text: 'No current shelf blank occurrences.' }),
    ]),
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: 'MATERIAL / OPERATIONS' }),
      node('p', { text: payload.materialDemand ? `${payload.materialDemand.quantity} ${payload.materialDemand.quantityUnit} candidate blanks; preference ${materialPreference}; Store identity still unresolved.` : 'Material demand not available until geometry is complete.' }),
      node('p', { text: payload.operationRequirements?.sequence?.length ? `Reference sequence: ${payload.operationRequirements.sequence.join(' → ')}` : 'No reference operation sequence yet.' }),
      node('p', { className: 'hint', text: 'Reference operations are not an application-issued process plan or machine instruction.' }),
    ]),
  ];
}

function picnicSummary(payload) {
  const parts = payload.parts ?? [];
  const demand = payload.materialDemand;
  const derived = payload.derived ?? {};
  return [
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: 'HOW THE NUMBER WAS CALCULATED' }),
      node('p', { text: payload.valid ? `Product length: ${payload.input?.productLength?.canonical ?? '—'} in` : `Stopped: ${payload.unresolvedReason ?? 'incomplete input'}` }),
      node('p', { text: derived.longitudinalMemberLength ? `Longitudinal member = L − 12 = ${derived.longitudinalMemberLength.canonical} in` : 'Longitudinal relation unavailable.' }),
      node('p', { text: derived.framePositions ? `End frames at ${derived.framePositions.a.canonical} in and ${derived.framePositions.b.canonical} in.` : 'Frame placement unavailable.' }),
      node('p', { text: derived.legLength ? `Fixture leg length remains ${derived.legLength.canonical} in.` : 'Fixture leg geometry unavailable.' }),
      node('p', { className: 'hint', text: `Fixture: ${payload.fixtureId ?? 'unidentified'} · Rule: ${payload.ruleVersion ?? 'unidentified'}` }),
    ]),
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: `PARTS · ${parts.length}` }),
      parts.length > 0
        ? node('ul', { className: 'config-parts' }, parts.map((part) =>
            node('li', { attrs: { 'data-config-part': part.occurrenceId ?? '' }, text: `${part.label}: ${dimensionText(part)} · ${part.operationNeeds?.join(', ') ?? 'operation unresolved'}` }),
          ))
        : node('p', { className: 'hint', text: 'No current fixture occurrences.' }),
    ]),
    node('article', { className: 'config-engine-card' }, [
      node('h3', { text: 'DEMAND / REQUIREMENTS' }),
      node('p', { text: demand ? `Synthetic dimensional demand: ${demand.totalInches} in total (${demand.totalFeet.toFixed(2)} ft) across ${parts.length} occurrences.` : 'Demand unavailable until the fixture input is valid.' }),
      node('p', { text: payload.operationRequirements?.required?.length ? `Application requirements: ${payload.operationRequirements.required.join(' · ')}` : 'Operation requirements unavailable.' }),
      node('p', { className: 'hint', text: 'No Store neutral sequence, engineering approval, hardware suitability, governed make path, or production release is claimed.' }),
    ]),
  ];
}

function engineSummary(projection) {
  const payload = projection?.payload ?? null;
  if (!payload) {
    return node('section', { className: 'config-engine', attrs: { 'data-config-engine': 'empty' } }, [
      node('h3', { text: 'ENGINE RESULT' }),
      node('p', { className: 'hint', text: 'Apply the bounded inputs to create the first derived revision.' }),
    ]);
  }
  const cards = payload.classId === ALCOVE_CLASS_ID
    ? alcoveSummary(payload)
    : payload.classId === PICNIC_CLASS_ID
      ? picnicSummary(payload)
      : [node('p', { className: 'hint', text: 'No registered summary for this class.' })];
  const unresolved = payload.unresolvedConditions ?? [];
  return node('section', { className: 'config-engine', attrs: { 'data-config-engine': payload.valid ? 'valid' : 'unresolved', 'data-config-class': payload.classId ?? '' } }, [
    node('div', { className: 'config-engine-grid' }, cards),
    unresolved.length > 0
      ? node('div', {}, [
          node('h3', { text: 'STILL UNRESOLVED' }),
          node('ul', { className: 'config-unresolved' }, unresolved.map((item) => node('li', { text: item }))),
        ])
      : null,
    renderProjectProjection(projection),
  ]);
}

function hiddenConfigField(key, value) {
  return node('input', { className: 'alcove-hidden', attrs: { type: 'hidden', value, 'data-config-field': key } });
}

function parseHeightList(text) {
  return String(text ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}

function heightSeed(candidate) {
  const current = currentRaw(candidate, 'shelfHeights');
  if (current) return parseHeightList(current);
  return ALCOVE_USER1_BASELINE.shelfHeightsIn.map(String);
}

function materialKey(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return ['pine', 'poplar', 'cherry', 'oak'].includes(normalized) ? normalized : 'pine';
}

const ALCOVE_SPECIES = Object.freeze({
  pine: Object.freeze({ label: 'Pine', color: '#C9A227' }),
  poplar: Object.freeze({ label: 'Poplar', color: '#9FA678' }),
  cherry: Object.freeze({ label: 'Cherry', color: '#A6522C' }),
  oak: Object.freeze({ label: 'Oak', color: '#C4A06A' }),
});

function formatAlcoveHeight(value, fractions) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? '');
  if (!fractions) return String(number);
  const whole = Math.floor(number);
  let numerator = Math.round((number - whole) * 16);
  if (numerator === 0) return String(whole);
  if (numerator === 16) return String(whole + 1);
  let denominator = 16;
  while (numerator % 2 === 0) {
    numerator /= 2;
    denominator /= 2;
  }
  return whole > 0 ? `${whole} ${numerator}/${denominator}` : `${numerator}/${denominator}`;
}

function parseAlcoveHeight(text) {
  const value = String(text ?? '').trim();
  let match = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (match) return Number(match[1]) + Number(match[2]) / Number(match[3]);
  match = value.match(/^(\d+)\/(\d+)$/);
  if (match) return Number(match[1]) / Number(match[2]);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function alcoveHeights(panel) {
  return [...panel.querySelectorAll('[data-alcove-height-index]')]
    .sort((a, b) => Number(a.dataset.alcoveHeightIndex) - Number(b.dataset.alcoveHeightIndex))
    .map((input) => parseAlcoveHeight(input.value))
    .filter((value) => Number.isFinite(value));
}

function setAlcoveHeightField(panel) {
  const hidden = panel.querySelector('[data-config-field="shelfHeights"]');
  if (hidden) hidden.value = alcoveHeights(panel).join(', ');
}

function renderAlcoveHeightRows(panel, desiredCount = null) {
  const holder = panel.querySelector('[data-alcove-heights]');
  if (!holder) return;
  const fractions = panel.dataset.alcoveFractions !== 'false';
  const existing = alcoveHeights(panel);
  const stored = parseHeightList(panel.querySelector('[data-config-field="shelfHeights"]')?.value ?? '').map(parseAlcoveHeight).filter(Number.isFinite);
  const defaults = ALCOVE_USER1_BASELINE.shelfHeightsIn;
  const count = desiredCount ?? Number(panel.querySelector('[data-config-field="shelfCount"]')?.value ?? 5);
  const values = [];
  for (let index = 0; index < count; index += 1) {
    values.push(existing[index] ?? stored[index] ?? defaults[index] ?? Math.min(94, 12 * (index + 1)));
  }
  holder.replaceChildren();
  for (let index = count - 1; index >= 0; index -= 1) {
    holder.append(node('div', { className: 'alcove-height-row' }, [
      node('span', { className: 'height-index', text: String(index + 1) }),
      node('input', { attrs: { type: 'text', value: formatAlcoveHeight(values[index], fractions), 'data-alcove-height-index': index, autocomplete: 'off' } }),
      node('span', { text: 'in' }),
    ]));
  }
  setAlcoveHeightField(panel);
}

function drawAlcove(panel) {
  const svg = panel.querySelector('[data-alcove-drawing]');
  if (!svg) return;
  const count = Number(panel.querySelector('[data-config-field="shelfCount"]')?.value ?? 5);
  const depth = Number(panel.querySelector('[data-config-field="blankDepth"]')?.value ?? 14);
  const material = materialKey(panel.querySelector('[data-config-field="materialPreference"]')?.value ?? 'Pine');
  const color = ALCOVE_SPECIES[material].color;
  const heights = alcoveHeights(panel).slice(0, count).sort((a, b) => a - b);
  const px = 1.74;
  const floor = 190;
  const ceiling = floor - 94.5 * px;
  const x0 = 118;
  const x1 = x0 + 45.5 * px;
  const mantel = floor - 45 * px;
  const mantelThickness = 6;
  const top = floor - (heights.at(-1) ?? 65) * px;
  let markup = `<rect width="300" height="210" fill="#f2ece2"/><rect y="${ceiling}" width="300" height="${floor - ceiling}" fill="#f7f2e9"/>`;
  markup += `<rect y="${floor}" width="300" height="20" fill="#d9c7a8"/><line x1="0" y1="${ceiling}" x2="300" y2="${ceiling}" stroke="#c9bca8"/>`;
  markup += `<rect x="30" y="${mantel + mantelThickness}" width="80" height="${floor - mantel - mantelThickness}" fill="#e6ddd0"/><rect x="41" y="${mantel + mantelThickness + 8}" width="58" height="${floor - mantel - mantelThickness - 8}" fill="#dbd0c0"/><rect x="54" y="${floor - 42}" width="34" height="36" fill="#241d17"/>`;
  markup += `<rect x="24" y="${mantel}" width="92" height="${mantelThickness}" fill="#b0824a"/><rect x="24" y="${mantel}" width="92" height="2" fill="#c99a5e"/>`;
  markup += `<line x1="${x0}" y1="${mantel}" x2="${x0}" y2="${ceiling}" stroke="#8f8371" stroke-width="1.4"/><line x1="${x1}" y1="${floor}" x2="${x1}" y2="${ceiling}" stroke="#8f8371" stroke-width="1.4"/>`;
  markup += `<line x1="116" y1="${mantel}" x2="${x1}" y2="${mantel}" stroke="#b0824a" stroke-dasharray="4 4"/><text x="${x1 + 4}" y="${mantel - 3}" font-size="8.5" fill="#b0824a" font-family="ui-sans-serif,sans-serif">mantel 45</text>`;
  markup += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${floor - top}" fill="${color}" opacity=".16"/><rect x="${x0}" y="${top}" width="3.5" height="${floor - top}" fill="${color}"/><rect x="${x1 - 3.5}" y="${top}" width="3.5" height="${floor - top}" fill="${color}"/>`;
  for (const height of heights) {
    const y = floor - height * px;
    markup += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${0.75 * px}" fill="${color}"/><text x="${x1 + 4}" y="${y + 3}" font-size="8" fill="#8f8371" font-family="ui-sans-serif,sans-serif">${formatAlcoveHeight(height, panel.dataset.alcoveFractions !== 'false')}</text>`;
  }
  const across = Math.ceil(depth / 5.5);
  markup += `<text x="${(x0 + x1) / 2}" y="${ceiling + 13}" font-size="10" fill="#2f6f9e" text-anchor="middle" font-family="ui-sans-serif,sans-serif">45½ in</text>`;
  markup += `<text x="${(x0 + x1) / 2}" y="${floor + 14}" font-size="9.5" fill="#8f8371" text-anchor="middle" font-family="ui-sans-serif,sans-serif">${depth} in deep · ${across} across</text>`;
  svg.innerHTML = markup;
}

function updateAlcovePanel(panel, projection = null) {
  const count = Number(panel.querySelector('[data-config-field="shelfCount"]')?.value ?? 5);
  const depth = Number(panel.querySelector('[data-config-field="blankDepth"]')?.value ?? 14);
  const materialKeyValue = materialKey(panel.querySelector('[data-config-field="materialPreference"]')?.value ?? 'Pine');
  const material = ALCOVE_SPECIES[materialKeyValue];
  panel.querySelector('[data-alcove-count-value]').textContent = `${count} shelves`;
  panel.querySelector('[data-alcove-depth-value]').textContent = `${depth} in`;
  panel.querySelector('[data-alcove-current]').textContent = `${material.label} · ${count} shelves · ${depth} in deep`;
  panel.querySelector('[data-alcove-material]').textContent = `${count} candidate shelf blanks · Store quantity/SKU unresolved`;
  panel.querySelectorAll('[data-alcove-species]').forEach((button) => button.classList.toggle('on', button.dataset.alcoveSpecies === materialKeyValue));
  const span = projection?.payload?.derived?.span?.canonical ?? '44';
  panel.querySelector('[data-alcove-span]').textContent = `${span} in nominal interior span`;
  drawAlcove(panel);
}

function buildAlcovePanel(descriptor, candidate, projection, status = '') {
  const count = currentOr(candidate, 'shelfCount', ALCOVE_USER1_BASELINE.shelfCount);
  const depth = currentOr(candidate, 'blankDepth', ALCOVE_USER1_BASELINE.shelfDepthIn);
  const material = currentOr(candidate, 'materialPreference', ALCOVE_USER1_BASELINE.materialPreference);
  const shelfHeights = currentRaw(candidate, 'shelfHeights') || ALCOVE_USER1_BASELINE.shelfHeightsIn.join(', ');
  const panel = node('section', {
    className: 'project-configurator alcove-configurator',
    attrs: {
      'data-project-configurator': descriptor.classId,
      'data-config-revision': candidate?.id ?? '',
      'data-user1-alcove': 'true',
    },
  }, [
    hiddenConfigField('openingWidth', currentOr(candidate, 'openingWidth', ALCOVE_USER1_BASELINE.openingWidthIn)),
    hiddenConfigField('leftSupport', currentOr(candidate, 'leftSupport', ALCOVE_USER1_BASELINE.sideThicknessIn)),
    hiddenConfigField('rightSupport', currentOr(candidate, 'rightSupport', ALCOVE_USER1_BASELINE.sideThicknessIn)),
    hiddenConfigField('blankThickness', currentOr(candidate, 'blankThickness', ALCOVE_USER1_BASELINE.shelfThicknessIn)),
    hiddenConfigField('shelfHeights', shelfHeights),
    hiddenConfigField('materialPreference', material),
    node('div', { className: 'alcove-head' }, [node('h2', { text: 'Make it yours' })]),
    node('div', { className: 'alcove-cfg' }, [
      node('div', { className: 'alcove-drawing' }, [node('svg', { attrs: { viewBox: '0 0 300 210', 'data-alcove-drawing': 'true', role: 'img', 'aria-label': 'User 1 alcove configuration drawing' } })]),
      node('div', { className: 'alcove-controls' }, [
        node('div', { className: 'alcove-control-line' }, [node('b', { text: 'Shelves' }), node('span', { className: 'alcove-control-value', attrs: { 'data-alcove-count-value': 'true' }, text: `${count} shelves` })]),
        node('input', { className: 'alcove-slider', attrs: { type: 'range', min: 2, max: 7, step: 1, value: count, 'data-config-field': 'shelfCount', 'aria-label': 'Shelves' } }),
        node('div', { className: 'alcove-control-line' }, [node('b', { text: 'Depth' }), node('span', { className: 'alcove-control-value', attrs: { 'data-alcove-depth-value': 'true' }, text: `${depth} in` })]),
        node('input', { className: 'alcove-slider', attrs: { type: 'range', min: 8, max: 16, step: 1, value: depth, 'data-config-field': 'blankDepth', 'aria-label': 'Depth' } }),
        node('div', { className: 'alcove-control-line' }, [node('b', { text: 'Heights' }), node('button', { className: 'alcove-format', text: 'fractions', attrs: { type: 'button', 'data-alcove-action': 'format' } })]),
        node('div', { className: 'alcove-heights', attrs: { 'data-alcove-heights': 'true' } }),
        node('p', { text: 'Material', attrs: { style: 'margin:0 0 6px;font-weight:600' } }),
        node('div', { className: 'alcove-species' }, Object.entries(ALCOVE_SPECIES).map(([key, species]) =>
          node('button', { attrs: { type: 'button', 'data-alcove-species': key } }, [
            node('span', { className: 'dot', attrs: { style: `background:${species.color}` } }),
            document.createTextNode(species.label),
          ]),
        )),
      ]),
    ]),
    node('div', { className: 'alcove-summary' }, [
      node('div', { className: 'alcove-summary-grid' }, [
        node('div', {}, [node('p', { className: 'alcove-summary-label', text: 'CURRENT CONFIGURATION' }), node('p', { attrs: { 'data-alcove-current': 'true', style: 'margin:0' } })]),
        node('div', {}, [node('p', { className: 'alcove-summary-label', text: 'MATERIAL REQUIRED' }), node('p', { attrs: { 'data-alcove-material': 'true', style: 'margin:0' } })]),
      ]),
      node('div', { className: 'alcove-price-row' }, [
        node('div', {}, [node('p', { className: 'alcove-summary-label', text: 'CALCULATED PRICE' }), node('p', { className: 'hint', text: 'Store answer not connected for this full Alcove configuration.' })]),
        node('p', { className: 'alcove-price', text: 'UNRESOLVED' }),
      ]),
    ]),
    node('details', { className: 'alcove-how' }, [
      node('summary', { text: 'HOW WAS THIS FIGURED?' }),
      node('p', { attrs: { 'data-alcove-span': 'true' }, text: '44 in nominal interior span' }),
      node('p', { className: 'alcove-reference-note', text: 'User 1 baseline: 45½ in measured opening, ¾ in side members, 14 in depth, five shelves at 12 / 24 / 36 / 45 / 65 in, Pine preference. No ordered-size reduction is applied on this page.' }),
      node('p', { className: 'alcove-reference-note', text: 'The recovered Store Zero economic model is preserved as reference evidence, but the current application protocol does not yet admit a live Store price for this complete Alcove configuration. The application therefore says UNRESOLVED rather than inventing one.' }),
      engineSummary(projection),
    ]),
    status ? node('p', { className: 'save-line', attrs: { 'data-config-status': 'true', style: 'margin:10px 22px 0' }, text: status }) : null,
    node('div', { className: 'alcove-review-action' }, [node('button', { text: 'REVIEW AND CONFIRM', attrs: { type: 'button', 'data-config-action': 'review' } })]),
  ]);
  panel.dataset.alcoveFractions = 'true';
  renderAlcoveHeightRows(panel, Number(count));
  updateAlcovePanel(panel, projection);
  return panel;
}

function buildPanel(descriptor, candidate, projection, status = '') {
  if (descriptor.classId === ALCOVE_CLASS_ID) {
    return buildAlcovePanel(descriptor, candidate, projection, status);
  }
  return node('section', {
    className: 'project-configurator',
    attrs: {
      'data-project-configurator': descriptor.classId,
      'data-config-revision': candidate?.id ?? '',
    },
  }, [
    node('p', { className: 'narrative-kicker', text: descriptor.kicker }),
    node('h2', { text: descriptor.title }),
    node('p', { className: 'config-lead', text: descriptor.lead }),
    node('div', { className: 'config-grid' }, descriptor.fields.map((field) => fieldNode(candidate, field))),
    node('div', { className: 'config-actions' }, [
      node('button', { text: 'APPLY TO CANDIDATE', attrs: { type: 'button', 'data-config-action': 'apply' } }),
      ...descriptor.examples.map((example) =>
        node('button', {
          text: example.label,
          attrs: { type: 'button', 'data-config-action': 'example', 'data-config-example': example.id },
        }),
      ),
    ]),
    descriptor.exampleNote ? node('p', { className: 'config-fixture', text: descriptor.exampleNote }) : null,
    status ? node('p', { className: 'save-line', attrs: { 'data-config-status': 'true' }, text: status }) : null,
    engineSummary(projection),
  ]);
}

function readConfiguration(panel, descriptor) {
  if (descriptor.classId === ALCOVE_CLASS_ID) {
    setAlcoveHeightField(panel);
  }
  const configuration = {};
  for (const field of descriptor.fields) {
    configuration[field.key] = panel.querySelector(`[data-config-field="${field.key}"]`)?.value ?? '';
  }
  return configuration;
}

let inFlight = false;
const statusByProject = new Map();
let renderToken = 0;

async function renderIntoScreen(root) {
  const token = ++renderToken;
  const screen = root.querySelector('[data-screen="questions"][data-class-id]');
  if (!screen) return;
  if (screen.querySelector('[data-project-configurator]')) return;
  const classId = screen.getAttribute('data-class-id');
  const descriptor = getClassConfigurator(classId);
  if (!descriptor) return;
  const localRecordId = screen.getAttribute('data-local-record-id');
  if (!localRecordId) return;
  const candidate = await currentCandidate(localRecordId);
  const projection = await currentProjection(localRecordId);
  if (token !== renderToken || !root.contains(screen)) return;
  const staleStatus = screen.querySelector('.handoff-status');
  if (staleStatus) {
    staleStatus.textContent = descriptor.classId === ALCOVE_CLASS_ID
      ? 'User 1 baseline is carried forward here. Configure the bounded project; ordering, Store support, and production permission remain separate answers.'
      : 'These inputs produce a proposed definition. Store support and production permission require their own answers.';
  }
  const panel = buildPanel(descriptor, candidate, projection, statusByProject.get(localRecordId) ?? '');
  const firstPane = screen.querySelector('.source-pane');
  (firstPane ?? screen.querySelector('.screen-heading'))?.before(panel);
}

async function apply(root, panel, descriptor, basis, configuration, { navigateToReview = false } = {}) {
  if (inFlight) return;
  const screen = panel.closest('[data-screen="questions"]');
  const localRecordId = screen?.getAttribute('data-local-record-id');
  if (!localRecordId) return;
  const project = await projectIndex(localRecordId);
  if (!project) return;
  inFlight = true;
  statusByProject.set(localRecordId, 'Applying candidate revision…');
  let succeeded = false;
  try {
    await applyMappedConfiguration({
      localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      basis,
      configuration,
    });
    statusByProject.set(localRecordId, basis === 'manual-entry' ? 'Candidate revision applied.' : 'Declared reference/software fixture applied as an explicit choice.');
    succeeded = true;
  } catch (error) {
    statusByProject.set(localRecordId, `Could not apply candidate: ${error.message}`);
  } finally {
    inFlight = false;
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  if (succeeded && navigateToReview) {
    setTimeout(() => {
      const reviewLink = root.querySelector('[data-nav-page="confirm"]');
      if (reviewLink instanceof HTMLElement) reviewLink.click();
    }, 0);
  }
}

export function startProjectConfigurator(root) {
  if (!root || root.dataset.projectConfigurator === 'true') return;
  root.dataset.projectConfigurator = 'true';
  installStyle();

  root.addEventListener('input', (event) => {
    const panel = event.target.closest('[data-user1-alcove="true"]');
    if (!panel || !root.contains(panel)) return;
    if (event.target.matches('[data-config-field="shelfCount"]')) {
      renderAlcoveHeightRows(panel, Number(event.target.value));
    }
    if (event.target.matches('[data-config-field="shelfCount"], [data-config-field="blankDepth"]')) {
      updateAlcovePanel(panel);
    }
  });

  root.addEventListener('change', (event) => {
    const panel = event.target.closest('[data-user1-alcove="true"]');
    if (!panel || !root.contains(panel)) return;
    const heightInput = event.target.closest('[data-alcove-height-index]');
    if (!heightInput) return;
    const parsed = parseAlcoveHeight(heightInput.value);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 94.5) {
      renderAlcoveHeightRows(panel);
      updateAlcovePanel(panel);
      return;
    }
    setAlcoveHeightField(panel);
    heightInput.value = formatAlcoveHeight(parsed, panel.dataset.alcoveFractions !== 'false');
    updateAlcovePanel(panel);
  });

  root.addEventListener('click', (event) => {
    const materialButton = event.target.closest('[data-alcove-species]');
    if (materialButton && root.contains(materialButton)) {
      const panel = materialButton.closest('[data-user1-alcove="true"]');
      const hidden = panel?.querySelector('[data-config-field="materialPreference"]');
      const species = ALCOVE_SPECIES[materialButton.dataset.alcoveSpecies];
      if (hidden && species) {
        hidden.value = species.label;
        updateAlcovePanel(panel);
      }
      return;
    }
    const formatButton = event.target.closest('[data-alcove-action="format"]');
    if (formatButton && root.contains(formatButton)) {
      const panel = formatButton.closest('[data-user1-alcove="true"]');
      if (!panel) return;
      panel.dataset.alcoveFractions = panel.dataset.alcoveFractions === 'false' ? 'true' : 'false';
      formatButton.textContent = panel.dataset.alcoveFractions === 'false' ? 'decimals' : 'fractions';
      renderAlcoveHeightRows(panel);
      updateAlcovePanel(panel);
      return;
    }
    const button = event.target.closest('[data-config-action]');
    if (!button || !root.contains(button)) return;
    const panel = button.closest('[data-project-configurator]');
    if (!panel) return;
    const classId = panel.getAttribute('data-project-configurator');
    const descriptor = getClassConfigurator(classId);
    if (!descriptor) return;
    const action = button.getAttribute('data-config-action');
    if (action === 'apply') {
      apply(root, panel, descriptor, 'manual-entry', readConfiguration(panel, descriptor));
      return;
    }
    if (action === 'review') {
      apply(root, panel, descriptor, 'manual-entry', readConfiguration(panel, descriptor), { navigateToReview: true });
      return;
    }
    if (action === 'example') {
      const exampleId = button.getAttribute('data-config-example');
      const example = descriptor.examples.find((entry) => entry.id === exampleId);
      if (!example) return;
      apply(root, panel, descriptor, example.basis, example.configuration);
    }
  });
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      renderIntoScreen(root);
    });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  schedule();
}
