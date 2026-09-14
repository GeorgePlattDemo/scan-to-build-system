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

function fulfillmentStroke(part) {
  return part?.fulfillment === 'holder-supplied'
    ? { 'stroke-dasharray': '6 4', opacity: 0.62, 'data-holder-supplied': part.role ?? 'holder-supplied' }
    : {};
}

function picnicOrthographic(render) {
  const width = 760;
  const height = 490;
  const svg = svgNode('svg', {
    viewBox: `0 0 ${width} ${height}`,
    role: 'img',
    'aria-label': 'Picnic Table candidate top and end orthographic views',
    class: 'project-orthographic-svg',
  });
  const parts = render.parts ?? [];
  const productLength = Number(render.productLength) || 72;
  const overallWidth = Number(render.overallWidth) || 60;
  const frameA = Number(render.frameA) || 8;
  const frameB = Number(render.frameB) || productLength - 8;

  const topX = 48;
  const topY = 44;
  const topW = 650;
  const topH = 230;
  const xScale = topW / productLength;
  const xAt = (value) => topX + value * xScale;

  svg.append(svgNode('text', { x: topX, y: 24, 'font-size': 13, 'font-weight': 650 }, `TOP VIEW · ${render.tableForm ?? 'picnic candidate'} · L = ${render.productLength} in`));
  svg.append(svgNode('rect', { x: topX, y: topY, width: topW, height: topH, fill: 'none', stroke: 'currentColor', 'stroke-width': 1, 'stroke-dasharray': '4 4' }));

  const tabletop = parts.filter((part) => part.family === 'tabletop-member');
  tabletop.forEach((part, index) => {
    const memberY = topY + 58 + index * 22;
    svg.append(svgNode('rect', {
      x: xAt(6), y: memberY, width: Math.max(20, (productLength - 12) * xScale), height: 14,
      fill: 'none', stroke: 'currentColor', 'stroke-width': 1.2,
      'data-render-occurrence': part.occurrenceId,
      ...fulfillmentStroke(part),
    }));
  });

  const seats = parts.filter((part) => part.family === 'seat-member');
  seats.forEach((part, index) => {
    const memberY = index === 0 ? topY + 22 : topY + topH - 36;
    svg.append(svgNode('rect', {
      x: xAt(6), y: memberY, width: Math.max(20, (productLength - 12) * xScale), height: 14,
      fill: 'none', stroke: 'currentColor', 'stroke-width': 1.2,
      'data-render-occurrence': part.occurrenceId,
      ...fulfillmentStroke(part),
    }));
  });

  const transverse = parts.filter((part) => part.family.includes('transverse'));
  transverse.forEach((part, index) => {
    const frameX = index % 2 === 0 ? xAt(frameA) : xAt(frameB);
    const inset = index < 2 ? 54 : 18;
    svg.append(svgNode('rect', {
      x: frameX - 5, y: topY + inset, width: 10, height: topH - inset * 2,
      fill: 'none', stroke: 'currentColor', 'stroke-width': 1,
      'data-render-occurrence': part.occurrenceId,
      ...fulfillmentStroke(part),
    }));
  });

  svg.append(svgNode('line', { x1: topX, y1: topY + topH + 20, x2: topX + topW, y2: topY + topH + 20, stroke: 'currentColor' }));
  svg.append(svgNode('text', { x: topX + topW / 2, y: topY + topH + 15, 'text-anchor': 'middle', 'font-size': 11 }, `${render.productLength} in candidate length`));

  const legParts = parts.filter((part) => part.family === 'end-frame-leg');
  const endBaseY = 424;
  const centers = [190, 560];
  ['end-a', 'end-b'].forEach((end, endIndex) => {
    const cx = centers[endIndex];
    svg.append(svgNode('text', { x: cx, y: 330, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 650 }, `${end === 'end-a' ? 'END A' : 'END B'} ELEVATION`));
    const endLegs = legParts.filter((part) => part.placement?.end === end);
    endLegs.forEach((part) => {
      const left = part.placement?.side === 'left';
      const x1 = cx + (left ? -38 : 38);
      const y1 = 350;
      const x2 = cx + (left ? -82 : 82);
      const y2 = endBaseY;
      svg.append(svgNode('line', {
        x1, y1, x2, y2, stroke: 'currentColor', 'stroke-width': 8, 'stroke-linecap': 'round',
        'data-render-occurrence': part.occurrenceId,
      }));
      const hx = (x1 + x2) / 2;
      const hy = (y1 + y2) / 2;
      svg.append(svgNode('circle', {
        cx: hx, cy: hy, r: 4, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5,
        'data-feature-marker': `${part.occurrenceId}:fixture-hole-1`,
      }));
    });
    svg.append(svgNode('line', { x1: cx - 110, y1: 350, x2: cx + 110, y2: 350, stroke: 'currentColor', 'stroke-width': 8, 'stroke-linecap': 'round' }));
    svg.append(svgNode('line', { x1: cx - 130, y1: 390, x2: cx - 40, y2: 390, stroke: 'currentColor', 'stroke-width': 7, 'stroke-linecap': 'round' }));
    svg.append(svgNode('line', { x1: cx + 40, y1: 390, x2: cx + 130, y2: 390, stroke: 'currentColor', 'stroke-width': 7, 'stroke-linecap': 'round' }));
  });
  const holderSuppliedCount = parts.filter((part) => part.fulfillment === 'holder-supplied').length;
  if (holderSuppliedCount > 0) {
    svg.append(svgNode('line', { x1: 48, y1: 458, x2: 92, y2: 458, stroke: 'currentColor', 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: 0.62 }));
    svg.append(svgNode('text', { x: 101, y: 462, 'font-size': 11 }, 'dashed = holder-supplied member retained in the candidate'));
  }
  svg.append(svgNode('text', { x: width / 2, y: 482, 'text-anchor': 'middle', 'font-size': 11 }, render.note ?? 'Software-fixture orthographic proof only.'));
  return svg;
}

export function renderProjectProjection(projection) {
  const payload = projection?.payload ?? null;
  const render = payload?.render ?? null;
  const section = node('section', {
    className: 'project-renderer',
    attrs: { 'data-project-renderer': 'true', 'data-render-kind': render?.kind ?? 'none', 'data-render-projection': render?.projection ?? 'none' },
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
  if (render?.projection === 'picnic-fixture-orthographic') {
    section.append(picnicOrthographic(render));
    section.append(node('p', {
      className: 'hint',
      text: 'Top and end views are generated from the current synthetic candidate fixture. Holder-supplied members remain visible when scope is frames only. This is not a construction drawing, engineering analysis, Store commitment, or fabrication release.',
    }));
    return section;
  }
  if (payload.classId === 'classic-picnic-table-fixture' && payload.input?.tableForm?.id === 'separate-benches') {
    section.append(node('p', {
      className: 'unresolved',
      text: 'Separate benches is the recorded form choice. No geometry is drawn because that form does not yet have an admitted bounded geometry source.',
    }));
    return section;
  }
  section.append(node('p', { className: 'hint', text: 'This projection has no registered renderer yet.' }));
  return section;
}
