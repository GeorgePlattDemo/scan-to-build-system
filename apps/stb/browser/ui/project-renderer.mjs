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

function svgNode(tag, attrs = {}, text = null) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) element.setAttribute(name, String(value));
  }
  if (text !== null) element.textContent = text;
  return element;
}

function alcoveBlankStack(render) {
  const width = 680;
  const rowHeight = 42;
  const pad = 28;
  const count = Math.max(1, render.parts?.length ?? 0);
  const height = pad * 2 + count * rowHeight + 54;
  const svg = svgNode('svg', {
    viewBox: `0 0 ${width} ${height}`,
    role: 'img',
    'aria-label': 'Schematic shelf blank view',
    class: 'project-orthographic-svg',
  });
  const usableWidth = width - pad * 2;
  const opening = Number(render.openingWidth);
  const span = Number(render.derivedSpan);
  const ratio = Number.isFinite(opening) && opening > 0 && Number.isFinite(span) ? span / opening : 0.9;
  const blankWidth = Math.max(80, Math.min(usableWidth, usableWidth * ratio));
  const x = pad + (usableWidth - blankWidth) / 2;

  svg.append(svgNode('line', { x1: pad, y1: 24, x2: width - pad, y2: 24, stroke: 'currentColor', 'stroke-width': 1 }));
  svg.append(svgNode('text', { x: width / 2, y: 17, 'text-anchor': 'middle', 'font-size': 12 }, `opening ${render.openingWidth ?? '—'} in`));

  (render.parts ?? []).forEach((part, index) => {
    const y = 48 + index * rowHeight;
    svg.append(svgNode('rect', {
      x,
      y,
      width: blankWidth,
      height: 20,
      rx: 3,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.5,
      'data-render-occurrence': part.occurrenceId,
    }));
    svg.append(svgNode('text', { x: x + 8, y: y + 14, 'font-size': 11 }, `${part.label} · ${part.length} × ${part.depth} × ${part.thickness} in`));
  });
  svg.append(svgNode('text', { x: pad, y: height - 18, 'font-size': 11 }, render.note ?? 'Schematic view'));
  return svg;
}

export function renderProjectProjection(projection) {
  const payload = projection?.payload ?? null;
  const render = payload?.render ?? null;
  const section = node('section', {
    className: 'project-renderer',
    attrs: { 'data-project-renderer': 'true', 'data-render-kind': render?.kind ?? 'none' },
  });
  section.append(node('h3', { text: 'PROJECT VIEW' }));
  if (!payload) {
    section.append(node('p', { className: 'hint', text: 'No derived project view yet.' }));
    return section;
  }
  if (payload.valid !== true) {
    section.append(node('p', {
      className: 'unresolved',
      text: `No current geometry is drawn until the bounded inputs are complete${payload.unresolvedReason ? ` (${payload.unresolvedReason})` : ''}.`,
    }));
    return section;
  }
  if (render?.projection === 'schematic-blank-stack') {
    section.append(alcoveBlankStack(render));
    section.append(node('p', {
      className: 'hint',
      text: 'This is a derived inspection view. The stacked rows do not establish shelf elevations or installation dimensions.',
    }));
    return section;
  }
  section.append(node('p', { className: 'hint', text: 'This projection has no registered renderer yet.' }));
  return section;
}
