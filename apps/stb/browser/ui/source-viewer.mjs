import { COPY, PDFJS } from '/shared/contracts.mjs';

let pdfjsLib = null;
const liveUrls = new Set();

function revokeAll() {
  for (const url of liveUrls) {
    URL.revokeObjectURL(url);
  }
  liveUrls.clear();
}

function paragraph(text, attrs = {}) {
  const node = document.createElement('p');
  node.textContent = text;
  for (const [name, value] of Object.entries(attrs)) {
    node.setAttribute(name, value);
  }
  return node;
}

async function pdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import(PDFJS.libraryPath);
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS.workerPath;
  }
  return pdfjsLib;
}

function renderImage(container, { bytes, mime, filename, evidenceId }) {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  liveUrls.add(url);
  const img = document.createElement('img');
  img.className = 'source-image';
  img.alt = filename ? `Retained source: ${filename}` : 'Retained source image';
  img.setAttribute('data-evidence-id', evidenceId);
  return new Promise((resolve) => {
    const finish = () => resolve();
    img.addEventListener('load', finish, { once: true });
    img.addEventListener(
      'error',
      () => {
        img.replaceWith(paragraph(COPY.imageUnreadable, { 'data-source-status': 'unreadable' }));
        finish();
      },
      { once: true },
    );
    img.src = url;
    container.append(img);
  });
}

async function renderPdf(container, { bytes, evidenceId }) {
  const lib = await pdfjs();
  const data = bytes instanceof Uint8Array ? bytes.slice() : new Uint8Array(bytes);
  let pdf;
  try {
    pdf = await lib.getDocument({
      data,
      isEvalSupported: false,
      disableAutoFetch: true,
      disableStream: true,
      disableRange: true,
      stopAtErrors: true,
      isOffscreenCanvasSupported: false,
    }).promise;
  } catch (error) {
    const password = error && (error.name === 'PasswordException' || error.code === lib.PasswordResponses?.NEED_PASSWORD);
    container.append(
      paragraph(password ? COPY.pdfPassword : COPY.pdfUnreadable, {
        'data-source-status': password ? 'password' : 'unreadable',
        'data-evidence-id': evidenceId,
      }),
    );
    return;
  }

  const toolbar = document.createElement('div');
  toolbar.className = 'pdf-toolbar';
  const pageLabel = document.createElement('span');
  pageLabel.setAttribute('data-pdf-page', 'true');
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = 'Previous page';
  prev.setAttribute('data-action', 'pdf-prev');
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next page';
  next.setAttribute('data-action', 'pdf-next');
  const zoomOut = document.createElement('button');
  zoomOut.type = 'button';
  zoomOut.textContent = 'Zoom out';
  zoomOut.setAttribute('data-action', 'pdf-zoom-out');
  const zoomIn = document.createElement('button');
  zoomIn.type = 'button';
  zoomIn.textContent = 'Zoom in';
  zoomIn.setAttribute('data-action', 'pdf-zoom-in');
  toolbar.append(prev, next, zoomOut, zoomIn, pageLabel);
  const canvas = document.createElement('canvas');
  canvas.className = 'pdf-canvas';
  canvas.setAttribute('data-evidence-id', evidenceId);
  canvas.setAttribute('data-pdf-viewer', 'true');
  container.append(toolbar, canvas);

  const state = { page: 1, scale: 1.25, pdf };
  async function draw() {
    const page = await state.pdf.getPage(state.page);
    const viewport = page.getViewport({ scale: state.scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({
      canvasContext: canvas.getContext('2d', { alpha: false }),
      viewport,
      annotationMode: lib.AnnotationMode?.DISABLE ?? 0,
    }).promise;
    pageLabel.textContent = `Page ${state.page} of ${state.pdf.numPages}`;
    pageLabel.setAttribute('data-pdf-page-number', String(state.page));
    canvas.setAttribute('data-pdf-page-number', String(state.page));
  }

  toolbar.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.getAttribute('data-action');
    if (action === 'pdf-prev' && state.page > 1) {
      state.page -= 1;
      draw();
    }
    if (action === 'pdf-next' && state.page < state.pdf.numPages) {
      state.page += 1;
      draw();
    }
    if (action === 'pdf-zoom-out') {
      state.scale = Math.max(0.5, state.scale - 0.25);
      draw();
    }
    if (action === 'pdf-zoom-in') {
      state.scale = Math.min(3, state.scale + 0.25);
      draw();
    }
  });
  try {
    await draw();
  } catch {
    canvas.replaceWith(
      paragraph(COPY.pdfUnreadable, {
        'data-source-status': 'unreadable',
        'data-evidence-id': evidenceId,
      }),
    );
  }
}

function renderText(container, { bytes, evidenceId }) {
  const pre = document.createElement('pre');
  pre.className = 'source-text';
  pre.setAttribute('data-evidence-id', evidenceId);
  pre.textContent = new TextDecoder().decode(bytes);
  container.append(pre);
}

function renderOpaque(container, { filename, evidenceId, declaredMime }) {
  container.append(
    paragraph(COPY.opaqueKept, {
      'data-source-status': 'opaque',
      'data-evidence-id': evidenceId,
    }),
    paragraph(
      `${filename ?? 'Attached file'} (${declaredMime ?? 'unknown type'}) is retained. It is not interpreted.`,
    ),
  );
}

export async function renderSourceView(container, source) {
  revokeAll();
  container.replaceChildren();
  container.append(
    paragraph(COPY.sourceNotCandidate),
    paragraph(COPY.viewingCreatesNoObservation, { 'data-view-no-observation': 'true' }),
  );
  if (!source || source.status !== 'retained') {
    container.append(
      paragraph(source?.message ?? COPY.sourceUnavailable, {
        'data-source-status': source?.reason ?? 'unavailable',
      }),
    );
    return;
  }
  const view = {
    bytes: source.bytes,
    mime: source.type,
    filename: source.filename ?? null,
    evidenceId: source.evidenceId,
    declaredMime: source.declaredMime ?? source.type,
  };
  if (source.displayType === 'image-jpeg' || source.displayType === 'image-png') {
    await renderImage(container, view);
    return;
  }
  if (source.displayType === 'pdf') {
    await renderPdf(container, view);
    return;
  }
  if (source.displayType === 'text') {
    renderText(container, view);
    return;
  }
  renderOpaque(container, view);
}
