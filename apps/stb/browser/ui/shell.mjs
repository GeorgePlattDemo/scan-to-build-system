import {
  ACTOR_ORDER,
  ACTORS,
  COPY,
  PRIMARY_PAGES,
  PROJECT_SCOPED_PAGES,
  ROUTES,
  projectHref,
  screenFromLocation,
} from '/shared/contracts.mjs';
import { createProject } from '/domain/candidate.mjs';
import { destinationView } from '/domain/classes.mjs';
import {
  attachPreparedEvidence,
  prepareFileOriginal,
  prepareTypedOriginal,
} from '/domain/evidence.mjs';
import {
  correctObservation,
  detachActiveEvidence,
  mapObservationToInput,
  recordEnteredObservation,
} from '/domain/observation.mjs';
import {
  applyBoardFinishedLength,
  applyCut001DocumentaryReference,
} from '/domain/board.mjs';
import {
  applyUser1XBraceConfiguration,
  clearUser1XBraceConfiguration,
} from '/domain/user1-xbrace.mjs';
import {
  blobCustody,
  currentCandidate,
  currentProjection,
  listProjectEvidence,
  listProjectObservations,
  listSavedProjects,
  projectIndex,
} from '/data/selectors.mjs';
import { page1Main, page2Main, page5Main, projectMissingMain } from '/ui/panels.mjs';
import { page6Main, page7Main, applyUnappliedReviewLock } from '/ui/review-panel.mjs';
import { page8Main } from '/ui/record-panel.mjs';
import { renderSourceView } from '/ui/source-viewer.mjs';
import { loadStoreHistory, loadStorePresentation } from '/data/store-view.mjs';
import { loadReviewPresentation } from '/data/review-view.mjs';
import { loadRecordPresentation } from '/data/record-view.mjs';
import {
  recoverStoreOnOpen,
  retryCurrentStore,
  scheduleProjectStoreQuestion,
} from '/integration/store-coordinator.mjs';
import {
  acknowledgeUnresolvedDefinition,
  recordDefinitionReview,
} from '/domain/review.mjs';
import {
  exportOwnerArchive,
  importOwnerArchive,
  requestArchiveDownload,
} from '/data/archive.mjs';
import {
  clearSessionActor,
  currentActor,
  currentProjectId,
  readViewSession,
  setCurrentProject,
  setSessionActor,
} from '/ui/view-state.mjs';

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
      if (value !== undefined && value !== null) {
        node.setAttribute(name, value);
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

function heading(text) {
  return el('h1', {
    className: 'screen-heading',
    attrs: { id: 'screen-heading', tabindex: '-1' },
    text,
  });
}

function landingScreen() {
  return el(
    'main',
    {
      className: 'screen screen-landing',
      attrs: {
        'data-screen': 'landing',
        'data-shell': 'entry',
        'data-actor': 'none',
      },
    },
    [
      heading(COPY.title),
      el('p', { className: 'tagline', text: COPY.tagline }),
      el(
        'ol',
        { className: 'landing-sequence', attrs: { id: 'landing-sequence' } },
        COPY.sequence.map((item) => el('li', { text: item })),
      ),
      el('p', { className: 'service-statement', text: COPY.service }),
      el('p', {
        className: 'reference-demonstration',
        attrs: { 'data-reference-demonstration': 'true' },
        text: COPY.referenceDemonstration,
      }),
      el('h2', { text: COPY.howStarting }),
      el(
        'div',
        { className: 'actor-choices', attrs: { role: 'group', 'aria-label': COPY.howStarting } },
        ACTOR_ORDER.map((id) =>
          el('button', {
            className: 'actor-choice',
            attrs: {
              type: 'button',
              'data-action': 'choose-actor',
              'data-actor': id,
            },
            text: ACTORS[id].label,
          }),
        ),
      ),
    ],
  );
}

function orientationScreen(actor) {
  return el(
    'main',
    {
      className: 'screen screen-orientation',
      attrs: {
        'data-screen': 'orientation',
        'data-shell': 'entry',
        'data-actor': actor.id,
      },
    },
    [
      el('p', { className: 'orientation-actor', text: actor.label }),
      heading(actor.heading),
      actor.body ? el('p', { className: 'orientation-body', text: actor.body }) : null,
      el('div', { className: 'actions' }, [
        el('button', {
          className: 'action-next',
          attrs: { type: 'button', 'data-action': 'next' },
          text: COPY.next,
        }),
        el('button', {
          className: 'action-back',
          attrs: { type: 'button', 'data-action': 'back' },
          text: COPY.back,
        }),
      ]),
    ],
  );
}

function primaryNav({ project, view, screenName } = {}) {
  return el(
    'nav',
    { className: 'primary-nav', attrs: { 'aria-label': 'Application pages' } },
    PRIMARY_PAGES.map((page) => {
      if (PROJECT_SCOPED_PAGES.includes(page.id) && page.implemented) {
        if (!project) {
          return el('span', {
            className: 'nav-pending',
            attrs: { 'aria-disabled': 'true', 'data-nav-page': page.id },
            text: page.label,
          });
        }
        const current = view === page.id;
        return el('a', {
          className: current ? 'nav-current' : 'nav-link',
          attrs: {
            href: projectHref(project.localRecordId, page.id),
            'data-nav-page': page.id,
            ...(current ? { 'aria-current': 'page' } : {}),
          },
          text: page.label,
        });
      }
      if (page.implemented) {
        const current = page.id === 'begin' && screenName === 'begin';
        return el('a', {
          className: current ? 'nav-current' : 'nav-link',
          attrs: {
            href: page.route,
            'data-nav-page': page.id,
            ...(current ? { 'aria-current': 'page' } : {}),
          },
          text: page.label,
        });
      }
      return el('span', {
        className: 'nav-pending',
        attrs: { 'aria-disabled': 'true', 'data-nav-page': page.id },
        text: `${page.label} (${COPY.notYetImplemented})`,
      });
    }),
  );
}

function wrapShell(actor, inner, screenName, navContext = {}) {
  const attrs = {
    'data-shell': 'common',
    'data-actor': actor ? actor.id : 'none',
  };
  if (screenName) {
    attrs['data-screen'] = screenName;
  }
  return el(
    'div',
    {
      className: 'app-shell',
      attrs,
    },
    [primaryNav({ ...navContext, screenName }), inner],
  );
}


function unknownScreen() {
  return el(
    'main',
    {
      className: 'screen',
      attrs: { 'data-screen': 'unknown', 'data-shell': 'entry', 'data-actor': 'none' },
    },
    [heading(COPY.title)],
  );
}

let mappedOpen = false;
let pendingSwitch = null;
let pendingCollision = null;
let importStatus = null;
let createInFlight = null;
let attachInFlight = null;
let observationInFlight = null;
let viewingId = null;
let pageStatus = null;
let typedText = '';
let takeoffText = '';
let measurementBuffer = { raw: '', unit: '', role: '' };
let takeoffBuffer = { label: '', quantity: '', unit: '', dimensions: '', material: '' };
let boardBuffer = { raw: '', unit: 'in' };
let boardDirty = false;
let user1Buffer = { raw: '' };
let user1Dirty = false;
let lastBoardCommitSignature = null;
let selectedOccurrenceId = null;
let pendingReviewActionId = null;
let correctingId = null;
let lastCommitSignature = null;
let renderSeq = 0;

function resolveActor(screen) {
  if (screen.name === 'orientation') {
    return screen.actor;
  }
  return currentActor();
}

function definitionDirty() {
  return boardDirty || user1Dirty;
}

function followStoreWork(root, scheduled) {
  if (scheduled?.done && typeof scheduled.done.finally === 'function') {
    scheduled.done.finally(() => {
      renderInto(root);
    });
  }
}

async function renderInto(root) {
  const seq = ++renderSeq;
  const screen = screenFromLocation(window.location);
  if (screen.name === 'orientation' && screen.actor) {
    setSessionActor(screen.actor.id);
  }
  if (screen.name === 'landing') {
    clearSessionActor();
  }

  const actor = resolveActor(screen);
  let content;
  if (screen.name === 'landing') {
    mappedOpen = false;
    pendingSwitch = null;
    content = landingScreen();
  } else if (screen.name === 'orientation' && screen.actor) {
    content = orientationScreen(screen.actor);
  } else if (screen.name === 'begin') {
    const saved = await listSavedProjects();
    if (seq !== renderSeq) {
      return;
    }
    const currentId = currentProjectId();
    const current = saved.find((project) => project.localRecordId === currentId) ?? null;
    content = wrapShell(
      actor,
      page1Main({
        actor,
        saved,
        current,
        mappedOpen,
        pendingSwitch,
        pendingCollision,
        importStatus,
      }),
      'begin',
      { project: current, view: null },
    );
  } else if (screen.name === 'project') {
    const project = screen.localRecordId ? await projectIndex(screen.localRecordId) : null;
    if (seq !== renderSeq) {
      return;
    }
    if (!project) {
      content = wrapShell(actor, projectMissingMain(), 'begin');
    } else {
      await recoverStoreOnOpen(project.localRecordId);
      if (seq !== renderSeq) {
        return;
      }
      let scheduled = { status: 'skipped' };
      try {
        scheduled = await scheduleProjectStoreQuestion(project.localRecordId, {
          unapplied: definitionDirty(),
        });
      } catch (error) {
        pageStatus = `Save failed: ${error.message}`;
        scheduled = { status: 'error', error };
      }
      if (seq !== renderSeq) {
        return;
      }
      followStoreWork(root, scheduled);
      const storeView = await loadStorePresentation(project.localRecordId, {
        unapplied: definitionDirty(),
        candidateRevisionId: project.currentHead,
      });
      const storeHistory =
        screen.view === 'store'
          ? await loadStoreHistory(project.localRecordId, project.currentHead)
          : [];
      const evidence = await listProjectEvidence(project.localRecordId);
      const observations = await listProjectObservations(project.localRecordId);
      const candidate = await currentCandidate(project.localRecordId);
      const projection = await currentProjection(project.localRecordId);
      const reviewPresentation = await loadReviewPresentation(project.localRecordId, {
        unapplied: definitionDirty(),
      });
      if (seq !== renderSeq) {
        return;
      }
      const navContext = { project, view: screen.view };
      if (screen.view === 'store') {
        content = wrapShell(
          actor,
          page5Main({
            project,
            storeView,
            storeHistory,
          }),
          'store',
          navContext,
        );
      } else if (screen.view === 'confirm') {
        content = wrapShell(
          actor,
          page6Main({
            project,
            presentation: reviewPresentation,
            selectedOccurrenceId,
          }),
          'confirm',
          navContext,
        );
      } else if (screen.view === 'result') {
        content = wrapShell(
          actor,
          page7Main({
            project,
            presentation: reviewPresentation,
          }),
          'result',
          navContext,
        );
      } else if (screen.view === 'record') {
        const recordPresentation = await loadRecordPresentation(project.localRecordId, {
          unapplied: definitionDirty(),
        });
        if (seq !== renderSeq) {
          return;
        }
        content = wrapShell(
          actor,
          page8Main({
            project,
            presentation: recordPresentation,
            status: pageStatus,
          }),
          'record',
          navContext,
        );
      } else {
        content = wrapShell(
          actor,
          page2Main({
            project,
            actor,
            view: screen.view,
            child: screen.child,
            evidence,
            observations,
            candidate,
            projection,
            viewingId,
            status: pageStatus,
            typedText,
            takeoffText,
            measurementBuffer,
            takeoffBuffer,
            boardBuffer,
            user1Buffer,
            correctingId,
            selectedOccurrenceId,
            storeView,
            reviewPresentation,
          }),
          null,
          navContext,
        );
      }
    }
  } else {
    content = unknownScreen();
  }

  if (seq !== renderSeq) {
    return;
  }
  root.replaceChildren(content);
  if (screen.name === 'project' && viewingId) {
    const viewHost = root.querySelector('[data-source-view]');
    const evidence = await (async () => {
      const projectId = screen.localRecordId;
      const records = projectId ? await listProjectEvidence(projectId) : [];
      return records.find((record) => record.id === viewingId) ?? null;
    })();
    if (viewHost && evidence) {
      const custody = evidence.payload.sha256
        ? await blobCustody(evidence.payload.sha256)
        : { status: 'unavailable', reason: 'missing' };
      await renderSourceView(viewHost, {
        ...custody,
        filename: evidence.payload.originalFilename,
        displayType: evidence.payload.displayType,
        declaredMime: evidence.payload.declaredMime,
        evidenceId: evidence.id,
      });
    }
  }
  const title = document.getElementById('screen-heading');
  document.title =
    screen.name === 'begin'
      ? `${COPY.beginHeading} — Scan-to-Build`
      : screen.name === 'project' && screen.view === 'store'
        ? `${COPY.storeAskHeading} — Scan-to-Build`
        : screen.name === 'project' && screen.view === 'confirm'
          ? `${COPY.reviewHeading} — Scan-to-Build`
          : screen.name === 'project' && screen.view === 'result'
            ? `${COPY.resultHeading} — Scan-to-Build`
            : screen.name === 'project' && screen.view === 'record'
              ? `${COPY.recordHeading} — Scan-to-Build`
            : screen.name === 'project'
              ? `${COPY.beginHeading} — Scan-to-Build`
          : screen.name === 'orientation' && screen.actor
            ? `${screen.actor.label} — Scan-to-Build`
            : 'Scan-to-Build';
  const focusTarget = pendingCollision
    ? root.querySelector('[data-action="collision-open-existing"]')
    : pendingSwitch
    ? root.querySelector('[data-action="switch-keep"]')
    : title;
  if (focusTarget) {
    focusTarget.focus();
  }
}

export function navigate(path, { replace = false } = {}) {
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({ path }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

async function completeCreate(intent) {
  if (!createInFlight) {
    createInFlight = createProject({
      actionId: intent.actionId,
      entryMode: intent.entryMode,
      classId: intent.classId,
      createdAt: new Date().toISOString(),
      actorId: readViewSession().actorId,
    });
  }
  try {
    const created = await createInFlight;
    setCurrentProject(created.localRecordId);
    pendingSwitch = null;
    mappedOpen = false;
    navigate(projectHref(created.localRecordId, destinationView(created.entryMode)));
  } finally {
    createInFlight = null;
  }
}

function requestCreate(intent) {
  if (createInFlight) {
    return createInFlight;
  }
  const currentId = currentProjectId();
  if (currentId && !intent.confirmed) {
    pendingSwitch = { ...intent, actionId: crypto.randomUUID() };
    return { needsRender: true };
  }
  return completeCreate({
    ...intent,
    actionId: intent.actionId ?? crypto.randomUUID(),
    confirmed: true,
  });
}

function fileInput(root) {
  return root.querySelector('[data-file-input]');
}

async function attachFile(root, { accept, role }) {
  const input = fileInput(root);
  if (!input) {
    return;
  }
  input.accept = accept;
  input.dataset.role = role;
  input.value = '';
  input.click();
}

async function commitTyped(root, field, role) {
  const screen = screenFromLocation(window.location);
  const text = root.querySelector(`[data-field="${field}"]`)?.value ?? '';
  if (!text.trim() || !screen.localRecordId || attachInFlight || observationInFlight) {
    return;
  }
  const project = await projectIndex(screen.localRecordId);
  if (!project) {
    return;
  }
  if (role === 'typed-need') {
    observationInFlight = recordEnteredObservation({
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      rawText: text,
      unit: null,
      role: null,
      kind: 'typed-need',
      mapTo: null,
      method: 'entered',
    });
    try {
      await observationInFlight;
      typedText = '';
      pageStatus = COPY.unclassifiedKept;
      renderInto(root);
    } catch (error) {
      pageStatus = `Save failed: ${error.message}`;
      renderInto(root);
    } finally {
      observationInFlight = null;
    }
    return;
  }
  const prepared = await prepareTypedOriginal({
    text,
    role: 'takeoff-text',
  });
  attachInFlight = attachPreparedEvidence({
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    prepared,
  });
  try {
    const attached = await attachInFlight;
    viewingId = attached.evidenceId;
    pageStatus = COPY.originalRetained;
    takeoffText = '';
    renderInto(root);
  } catch (error) {
    pageStatus = `Save failed: ${error.message}`;
    renderInto(root);
  } finally {
    attachInFlight = null;
  }
}

function viewerSourceLocation(root, evidenceId) {
  if (!evidenceId) {
    return null;
  }
  const location = { evidenceId };
  const pageAttr = root.querySelector('[data-pdf-page-number]')?.getAttribute('data-pdf-page-number');
  if (pageAttr != null && pageAttr !== '') {
    const page = Number(pageAttr);
    if (Number.isInteger(page) && page > 0) {
      location.page = page;
    }
  }
  return location;
}

function measurementSignature() {
  return `${measurementBuffer.raw}|${measurementBuffer.unit}|${measurementBuffer.role}|${correctingId ?? ''}`;
}

function takeoffSignature() {
  return `${takeoffBuffer.label}|${takeoffBuffer.quantity}|${takeoffBuffer.unit}|${takeoffBuffer.dimensions}|${takeoffBuffer.material}`;
}

function markUnapplied(root, name, dirty) {
  const note = root.querySelector(`[data-unapplied="${name}"]`);
  if (note) {
    if (dirty) {
      note.removeAttribute('hidden');
    } else {
      note.setAttribute('hidden', 'true');
    }
  }
}

function discardBuffers() {
  measurementBuffer = { raw: '', unit: '', role: '' };
  takeoffBuffer = { label: '', quantity: '', unit: '', dimensions: '', material: '' };
  boardBuffer = { raw: '', unit: 'in' };
  boardDirty = false;
  user1Buffer = { raw: '' };
  user1Dirty = false;
  typedText = '';
  takeoffText = '';
  correctingId = null;
}

async function commitMeasurement(root) {
  const screen = screenFromLocation(window.location);
  if (!screen.localRecordId || observationInFlight) {
    return;
  }
  measurementBuffer = {
    raw: root.querySelector('[data-field="measurement-raw"]')?.value ?? measurementBuffer.raw,
    unit: root.querySelector('[data-field="measurement-unit"]')?.value ?? measurementBuffer.unit,
    role: root.querySelector('[data-field="measurement-role"]')?.value ?? measurementBuffer.role,
  };
  if (!measurementBuffer.raw.trim() && !measurementBuffer.unit.trim() && !measurementBuffer.role.trim()) {
    return;
  }
  const signature = measurementSignature();
  if (signature === lastCommitSignature) {
    return;
  }
  const project = await projectIndex(screen.localRecordId);
  if (!project) {
    return;
  }
  const location = viewerSourceLocation(root, viewingId);
  observationInFlight = correctingId
    ? correctObservation({
        localRecordId: project.localRecordId,
        expectedHead: project.currentHead,
        actionId: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        observationId: correctingId,
        rawText: measurementBuffer.raw,
        unit: measurementBuffer.unit,
        role: measurementBuffer.role,
        kind: 'measurement',
        method: 'entered',
      })
    : recordEnteredObservation({
        localRecordId: project.localRecordId,
        expectedHead: project.currentHead,
        actionId: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        rawText: measurementBuffer.raw,
        unit: measurementBuffer.unit,
        role: measurementBuffer.role,
        kind: 'measurement',
        method: 'entered',
        ...(viewingId ? { evidenceId: viewingId } : {}),
        ...(location ? { sourceLocation: location } : {}),
      });
  try {
    const result = await observationInFlight;
    lastCommitSignature = signature;
    measurementBuffer = { raw: '', unit: '', role: '' };
    correctingId = null;
    if (result.observation?.payload?.unresolvedReason === 'missing-unit') {
      pageStatus = COPY.missingUnit;
    } else if (result.observation?.payload?.unresolvedReason === 'unsupported-unit') {
      pageStatus = COPY.unsupportedUnit;
    } else if (result.observation?.payload?.unresolvedReason) {
      pageStatus = COPY.invalidNumber;
    } else {
      pageStatus = COPY.originalRetained;
    }
    renderInto(root);
  } catch (error) {
    pageStatus = `Save failed: ${error.message}`;
    renderInto(root);
  } finally {
    observationInFlight = null;
  }
}

async function commitTakeoffRow(root) {
  const screen = screenFromLocation(window.location);
  if (!screen.localRecordId || observationInFlight) {
    return;
  }
  takeoffBuffer = {
    label: root.querySelector('[data-field="takeoff-label"]')?.value ?? takeoffBuffer.label,
    quantity: root.querySelector('[data-field="takeoff-quantity"]')?.value ?? takeoffBuffer.quantity,
    unit: root.querySelector('[data-field="takeoff-unit"]')?.value ?? takeoffBuffer.unit,
    dimensions: root.querySelector('[data-field="takeoff-dimensions"]')?.value ?? takeoffBuffer.dimensions,
    material: root.querySelector('[data-field="takeoff-material"]')?.value ?? takeoffBuffer.material,
  };
  if (!takeoffBuffer.label.trim() && !takeoffBuffer.quantity.trim() && !takeoffBuffer.unit.trim()) {
    return;
  }
  const signature = takeoffSignature();
  if (signature === lastCommitSignature) {
    return;
  }
  const project = await projectIndex(screen.localRecordId);
  if (!project) {
    return;
  }
  observationInFlight = recordEnteredObservation({
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    kind: 'takeoff-row',
    takeoff: { ...takeoffBuffer },
    method: 'entered',
  });
  try {
    await observationInFlight;
    lastCommitSignature = signature;
    takeoffBuffer = { label: '', quantity: '', unit: '', dimensions: '', material: '' };
    pageStatus = COPY.originalRetained;
    renderInto(root);
  } catch (error) {
    pageStatus = `Save failed: ${error.message}`;
    renderInto(root);
  } finally {
    observationInFlight = null;
  }
}

function boardSignature() {
  return `${boardBuffer.raw}|${boardBuffer.unit}`;
}

function readBoardBuffer(root) {
  boardBuffer = {
    raw: root.querySelector('[data-field="board-length"]')?.value ?? boardBuffer.raw,
    unit: root.querySelector('[data-field="board-unit"]')?.value ?? boardBuffer.unit,
  };
}

function boardStatusFromProjection(projection) {
  if (!projection) {
    return COPY.boardBlank;
  }
  if (projection.payload.valid) {
    return `Finished length ${projection.payload.summary.finishedLength} is in use.`;
  }
  if (
    projection.payload.unresolvedReason === 'blank'
    || projection.payload.unresolvedReason === 'missing-finished-length'
  ) {
    return COPY.boardBlank;
  }
  return COPY.boardUnresolved;
}

async function commitBoardLength(root, { fromBlur = false } = {}) {
  const screen = screenFromLocation(window.location);
  if (!screen.localRecordId || observationInFlight) {
    return;
  }
  readBoardBuffer(root);
  const signature = boardSignature();
  if (fromBlur && !boardDirty) {
    return;
  }
  if (signature === lastBoardCommitSignature) {
    return;
  }
  const project = await projectIndex(screen.localRecordId);
  if (!project) {
    return;
  }
  observationInFlight = applyBoardFinishedLength({
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    rawText: boardBuffer.raw,
    unit: boardBuffer.unit,
    method: 'entered',
  });
  try {
    const result = await observationInFlight;
    lastBoardCommitSignature = signature;
    boardDirty = false;
    selectedOccurrenceId = result.occurrenceId ?? selectedOccurrenceId;
    pageStatus = boardStatusFromProjection(result.projection);
    renderInto(root);
  } catch (error) {
    pageStatus = `Save failed: ${error.message}`;
    renderInto(root);
  } finally {
    observationInFlight = null;
  }
}

async function commitCut001(root) {
  const screen = screenFromLocation(window.location);
  if (!screen.localRecordId || observationInFlight) {
    return;
  }
  const project = await projectIndex(screen.localRecordId);
  if (!project) {
    return;
  }
  observationInFlight = applyCut001DocumentaryReference({
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  try {
    const result = await observationInFlight;
    boardBuffer = { raw: '60.000', unit: 'in' };
    lastBoardCommitSignature = boardSignature();
    boardDirty = false;
    selectedOccurrenceId = result.occurrenceId ?? selectedOccurrenceId;
    pageStatus = boardStatusFromProjection(result.projection);
    renderInto(root);
  } catch (error) {
    pageStatus = `Save failed: ${error.message}`;
    renderInto(root);
  } finally {
    observationInFlight = null;
  }
}

function readUser1Buffer(root, fallback = null) {
  const field = root.querySelector('[data-field="user1-part-length"]');
  const raw = field?.value ?? user1Buffer.raw ?? (fallback == null ? '' : String(fallback));
  user1Buffer = { raw: String(raw) };
  return user1Buffer;
}

async function commitUser1XBrace(root, { partLengthIn = null } = {}) {
  const screen = screenFromLocation(window.location);
  if (!screen.localRecordId || observationInFlight) {
    return;
  }
  if (partLengthIn == null) {
    readUser1Buffer(root);
  } else {
    user1Buffer = { raw: String(partLengthIn) };
  }
  const parsed = Number(user1Buffer.raw);
  if (!Number.isFinite(parsed)) {
    pageStatus = 'Job 1 part length must be a number from 16 to 18 in.';
    renderInto(root);
    return;
  }
  const project = await projectIndex(screen.localRecordId);
  if (!project) {
    return;
  }
  observationInFlight = applyUser1XBraceConfiguration({
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    partLengthIn: parsed,
    basis: 'customer-configure',
  });
  try {
    await observationInFlight;
    user1Dirty = false;
    boardDirty = false;
    pageStatus = `Job 1 definition updated for ${parsed} in parts. A fresh Store answer is required for this revision.`;
    renderInto(root);
  } catch (error) {
    pageStatus = `Save failed: ${error.message}`;
    renderInto(root);
  } finally {
    observationInFlight = null;
  }
}

async function clearUser1XBrace(root) {
  const screen = screenFromLocation(window.location);
  if (!screen.localRecordId || observationInFlight) {
    return;
  }
  const project = await projectIndex(screen.localRecordId);
  if (!project) {
    return;
  }
  observationInFlight = clearUser1XBraceConfiguration({
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  try {
    await observationInFlight;
    user1Buffer = { raw: '' };
    user1Dirty = false;
    pageStatus = 'Job 1 bench definition cleared. Generic Board input is active.';
    renderInto(root);
  } catch (error) {
    pageStatus = `Save failed: ${error.message}`;
    renderInto(root);
  } finally {
    observationInFlight = null;
  }
}

function archiveInput(root) {
  return root.querySelector('[data-archive-input]');
}

function applyImportResult(root, result, { raw, serializedBytes } = {}) {
  if (!result || result.status === 'failed') {
    importStatus = COPY.recordImportFailed;
    pageStatus = COPY.recordImportFailed;
    pendingCollision = null;
    renderInto(root);
    return;
  }
  if (result.status === 'collision') {
    pendingCollision = { ...result, raw, serializedBytes };
    importStatus = COPY.recordCollision;
    pageStatus = COPY.recordCollision;
    if (screenFromLocation(window.location).name !== 'begin') {
      navigate(ROUTES.begin);
      return;
    }
    renderInto(root);
    return;
  }
  pendingCollision = null;
  const localRecordId = result.localRecordId;
  setCurrentProject(localRecordId);
  importStatus =
    result.status === 'idempotent' ? COPY.recordIdempotent : COPY.recordImportOk;
  pageStatus = importStatus;
  navigate(projectHref(localRecordId, 'record'));
}

async function importArchiveText(root, raw, { serializedBytes, separateCopy = false } = {}) {
  if (attachInFlight) {
    return;
  }
  attachInFlight = importOwnerArchive(raw, {
    serializedBytes,
    separateCopy,
    createdAt: new Date().toISOString(),
  });
  try {
    const result = await attachInFlight;
    applyImportResult(root, result, { raw, serializedBytes });
  } catch (error) {
    importStatus = COPY.recordImportFailed;
    pageStatus = COPY.recordImportFailed;
    renderInto(root);
  } finally {
    attachInFlight = null;
  }
}

async function exportCurrentRecord(root) {
  const screen = screenFromLocation(window.location);
  if (!screen.localRecordId || attachInFlight) {
    return;
  }
  attachInFlight = exportOwnerArchive(screen.localRecordId);
  try {
    const result = await attachInFlight;
    if (result.status !== 'ready') {
      pageStatus = COPY.recordExportFailed;
      renderInto(root);
      return;
    }
    requestArchiveDownload({
      json: result.json,
      filename: result.filename,
      mime: result.mime,
    });
    pageStatus = result.incomplete ? COPY.recordIncompleteExport : COPY.recordExportReady;
    renderInto(root);
  } catch (error) {
    pageStatus = COPY.recordExportFailed;
    renderInto(root);
  } finally {
    attachInFlight = null;
  }
}

export function startShell(root) {
  const render = () => renderInto(root);

  root.addEventListener('change', async (event) => {
    if (event.target?.getAttribute?.('data-field') === 'user1-part-length') {
      readUser1Buffer(root);
      user1Dirty = true;
      markUnapplied(root, 'user1', true);
      markUnapplied(root, 'store', true);
      applyUnappliedReviewLock(root);
      await commitUser1XBrace(root);
      return;
    }
    const archive = event.target.closest('[data-archive-input]');
    if (archive && archive.files && archive.files.length > 0) {
      const file = archive.files[0];
      archive.value = '';
      await importArchiveText(root, await file.text(), { serializedBytes: file.size });
      return;
    }
    const input = event.target.closest('[data-file-input]');
    if (!input || !input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    const screen = screenFromLocation(window.location);
    if (!screen.localRecordId || attachInFlight) {
      return;
    }
    const project = await projectIndex(screen.localRecordId);
    if (!project) {
      return;
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const prepared = await prepareFileOriginal({
        bytes,
        type: file.type || 'application/octet-stream',
        filename: file.name,
        role: input.dataset.role || 'source-file',
      });
      attachInFlight = attachPreparedEvidence({
        localRecordId: project.localRecordId,
        expectedHead: project.currentHead,
        actionId: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        prepared,
      });
      const attached = await attachInFlight;
      viewingId = attached.evidenceId;
      pageStatus = COPY.originalRetained;
    } catch (error) {
      pageStatus = `Save failed: ${error.message}`;
    } finally {
      attachInFlight = null;
      input.value = '';
      render();
    }
  });

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || !root.contains(button)) {
      return;
    }
    const action = button.getAttribute('data-action');
    if (action === 'choose-actor') {
      const actor = ACTORS[button.getAttribute('data-actor')];
      if (!actor) {
        return;
      }
      setSessionActor(actor.id);
      navigate(actor.route);
      return;
    }
    if (action === 'back') {
      clearSessionActor();
      navigate(ROUTES.landing);
      return;
    }
    if (action === 'next') {
      navigate(ROUTES.begin);
      return;
    }
    if (action === 'expand-mapped') {
      mappedOpen = true;
      render();
      return;
    }
    if (action === 'choose-mapped') {
      const result = requestCreate({
        entryMode: 'mapped',
        classId: button.getAttribute('data-class-id'),
      });
      if (result && result.needsRender) {
        render();
      }
      return;
    }
    if (action === 'start-own') {
      const result = requestCreate({ entryMode: 'own' });
      if (result && result.needsRender) {
        render();
      }
      return;
    }
    if (action === 'switch-keep' && pendingSwitch) {
      completeCreate({ ...pendingSwitch, confirmed: true });
      return;
    }
    if (action === 'switch-cancel') {
      pendingSwitch = null;
      render();
      return;
    }
    if (action === 'resume-project') {
      const localRecordId = button.getAttribute('data-local-record-id');
      setCurrentProject(localRecordId);
      listSavedProjects().then((saved) => {
        const project = saved.find((entry) => entry.localRecordId === localRecordId);
        if (!project) {
          render();
          return;
        }
        navigate(projectHref(localRecordId, destinationView(project.entryMode)));
      });
      return;
    }
    if (action === 'back-to-begin') {
      navigate(ROUTES.begin);
      return;
    }
    if (action === 'open-child') {
      const screen = screenFromLocation(window.location);
      navigate(projectHref(screen.localRecordId, screen.view, button.getAttribute('data-child')));
      return;
    }
    if (action === 'back-to-hub') {
      const screen = screenFromLocation(window.location);
      const view = screen.view === 'questions' ? 'questions' : 'hub';
      navigate(projectHref(screen.localRecordId, view));
      return;
    }
    if (action === 'open-store') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId) {
        return;
      }
      navigate(projectHref(screen.localRecordId, 'store'));
      return;
    }
    if (action === 'open-confirm') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId) {
        return;
      }
      navigate(projectHref(screen.localRecordId, 'confirm'));
      return;
    }
    if (action === 'open-result') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId) {
        return;
      }
      navigate(projectHref(screen.localRecordId, 'result'));
      return;
    }
    if (action === 'export-record') {
      exportCurrentRecord(root);
      return;
    }
    if (action === 'import-archive') {
      archiveInput(root)?.click();
      return;
    }
    if (action === 'resume-from-record') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId) {
        return;
      }
      projectIndex(screen.localRecordId).then((project) => {
        if (!project) {
          return;
        }
        navigate(projectHref(project.localRecordId, destinationView(project.entryMode)));
      });
      return;
    }
    if (action === 'collision-open-existing' && pendingCollision?.existing) {
      const existing = pendingCollision.existing;
      pendingCollision = null;
      setCurrentProject(existing.localRecordId);
      importStatus = COPY.recordIdempotent;
      navigate(projectHref(existing.localRecordId, 'record'));
      return;
    }
    if (action === 'collision-import-copy' && pendingCollision) {
      const raw = pendingCollision.raw;
      const serializedBytes = pendingCollision.serializedBytes;
      if (raw) {
        importArchiveText(root, raw, { serializedBytes, separateCopy: true });
        return;
      }
      archiveInput(root)?.click();
      return;
    }
    if (action === 'confirm-definition' || action === 'acknowledge-unresolved') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId || observationInFlight) {
        return;
      }
      if (!pendingReviewActionId) {
        pendingReviewActionId = crypto.randomUUID();
      }
      const actionId = pendingReviewActionId;
      const submit =
        action === 'confirm-definition'
          ? recordDefinitionReview
          : acknowledgeUnresolvedDefinition;
      observationInFlight = submit({
        localRecordId: screen.localRecordId,
        actionId,
        createdAt: new Date().toISOString(),
        unapplied: definitionDirty(),
      });
      observationInFlight
        .then(() => {
          navigate(projectHref(screen.localRecordId, 'result'));
        })
        .catch((error) => {
          pageStatus = `Save failed: ${error.message}`;
          render();
        })
        .finally(() => {
          observationInFlight = null;
          pendingReviewActionId = null;
        });
      return;
    }
    if (action === 'retry-store') {
      const screen = screenFromLocation(window.location);
      const requestId = button.getAttribute('data-request-id');
      if (!screen.localRecordId || !requestId || observationInFlight) {
        return;
      }
      observationInFlight = retryCurrentStore(screen.localRecordId, requestId);
      observationInFlight
        .then((result) => {
          followStoreWork(root, result);
          render();
        })
        .catch((error) => {
          pageStatus = `Save failed: ${error.message}`;
          render();
        })
        .finally(() => {
          observationInFlight = null;
        });
      return;
    }
    if (action === 'view-source') {
      viewingId = button.getAttribute('data-evidence-id');
      render();
      return;
    }
    if (action === 'attach-image') {
      attachFile(root, { accept: 'image/jpeg,image/png,.jpg,.jpeg,.png', role: 'source-file' });
      return;
    }
    if (action === 'attach-pdf') {
      attachFile(root, { accept: 'application/pdf,.pdf', role: 'source-file' });
      return;
    }
    if (action === 'attach-opaque') {
      attachFile(root, { accept: '*/*', role: 'opaque-source' });
      return;
    }
    if (action === 'submit-typed') {
      commitTyped(root, 'typed-need', 'typed-need');
      return;
    }
    if (action === 'submit-takeoff') {
      commitTyped(root, 'takeoff-raw', 'takeoff');
      return;
    }
    if (action === 'submit-measurement' || action === 'apply-correction') {
      commitMeasurement(root);
      return;
    }
    if (action === 'submit-takeoff-row') {
      commitTakeoffRow(root);
      return;
    }
    if (action === 'start-user1-xbrace') {
      commitUser1XBrace(root, { partLengthIn: 16 });
      return;
    }
    if (action === 'apply-user1-xbrace') {
      commitUser1XBrace(root);
      return;
    }
    if (action === 'clear-user1-xbrace') {
      clearUser1XBrace(root);
      return;
    }
    if (action === 'apply-board-length') {
      commitBoardLength(root);
      return;
    }
    if (action === 'apply-cut001') {
      commitCut001(root);
      return;
    }
    if (action === 'select-occurrence') {
      selectedOccurrenceId = button.getAttribute('data-occurrence-id') || null;
      render();
      return;
    }
    if (action === 'map-observation') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId || observationInFlight) {
        return;
      }
      projectIndex(screen.localRecordId).then((project) => {
        if (!project) {
          return;
        }
        observationInFlight = mapObservationToInput({
          localRecordId: project.localRecordId,
          expectedHead: project.currentHead,
          actionId: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          observationId: button.getAttribute('data-observation-id'),
          inputKey: button.getAttribute('data-input-key'),
        });
        observationInFlight
          .then((result) => {
            pageStatus = result.status === 'noop' ? COPY.mappedAccepted : COPY.mappedAccepted;
            render();
          })
          .catch((error) => {
            pageStatus = `Save failed: ${error.message}`;
            render();
          })
          .finally(() => {
            observationInFlight = null;
          });
      });
      return;
    }
    if (action === 'correct-observation') {
      const observationId = button.getAttribute('data-observation-id');
      const kind = button.getAttribute('data-observation-kind');
      correctingId = observationId;
      listProjectObservations(screenFromLocation(window.location).localRecordId).then((records) => {
        const record = records.find((entry) => entry.id === observationId);
        if (record && kind === 'takeoff-row') {
          takeoffBuffer = {
            label: record.payload.takeoff?.label ?? record.payload.role ?? '',
            quantity: record.payload.takeoff?.quantityRaw ?? '',
            unit: record.payload.declaredUnit ?? '',
            dimensions: record.payload.takeoff?.dimensions ?? '',
            material: record.payload.takeoff?.material ?? '',
          };
          navigate(
            projectHref(
              screenFromLocation(window.location).localRecordId,
              screenFromLocation(window.location).view,
              'takeoff',
            ),
          );
          return;
        }
        if (record) {
          measurementBuffer = {
            raw: record.payload.rawText ?? '',
            unit: record.payload.declaredUnit ?? '',
            role: record.payload.role ?? '',
          };
        }
        const screen = screenFromLocation(window.location);
        navigate(projectHref(screen.localRecordId, screen.view, 'measurements'));
      });
      return;
    }
    if (action === 'detach-evidence') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId || observationInFlight) {
        return;
      }
      projectIndex(screen.localRecordId).then((project) => {
        if (!project) {
          return;
        }
        observationInFlight = detachActiveEvidence({
          localRecordId: project.localRecordId,
          expectedHead: project.currentHead,
          actionId: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          evidenceId: button.getAttribute('data-evidence-id'),
        });
        observationInFlight
          .then(() => {
            pageStatus = COPY.detachKept;
            render();
          })
          .catch((error) => {
            pageStatus = `Save failed: ${error.message}`;
            render();
          })
          .finally(() => {
            observationInFlight = null;
          });
      });
    }
  });

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    if (form.matches('[data-measurement-form]')) {
      commitMeasurement(root);
    } else if (form.matches('[data-takeoff-form]')) {
      commitTakeoffRow(root);
    } else if (form.matches('[data-board-form]')) {
      commitBoardLength(root);
    }
  });

  root.addEventListener('input', (event) => {
    const field = event.target.getAttribute('data-field');
    if (!field) {
      return;
    }
    const value = event.target.value ?? '';
    if (field === 'typed-need') {
      typedText = value;
    } else if (field === 'takeoff-raw') {
      takeoffText = value;
    } else if (field === 'measurement-raw') {
      measurementBuffer.raw = value;
      markUnapplied(root, 'measurement', true);
    } else if (field === 'measurement-unit') {
      measurementBuffer.unit = value;
      markUnapplied(root, 'measurement', true);
    } else if (field === 'measurement-role') {
      measurementBuffer.role = value;
      markUnapplied(root, 'measurement', true);
    } else if (field === 'takeoff-label') {
      takeoffBuffer.label = value;
      markUnapplied(root, 'takeoff', true);
    } else if (field === 'takeoff-quantity') {
      takeoffBuffer.quantity = value;
      markUnapplied(root, 'takeoff', true);
    } else if (field === 'takeoff-unit') {
      takeoffBuffer.unit = value;
      markUnapplied(root, 'takeoff', true);
    } else if (field === 'takeoff-dimensions') {
      takeoffBuffer.dimensions = value;
      markUnapplied(root, 'takeoff', true);
    } else if (field === 'takeoff-material') {
      takeoffBuffer.material = value;
      markUnapplied(root, 'takeoff', true);
    } else if (field === 'board-length') {
      boardBuffer.raw = value;
      boardDirty = true;
      markUnapplied(root, 'board', true);
      markUnapplied(root, 'store', true);
      applyUnappliedReviewLock(root);
    } else if (field === 'board-unit') {
      boardBuffer.unit = value;
      boardDirty = true;
      markUnapplied(root, 'board', true);
      markUnapplied(root, 'store', true);
      applyUnappliedReviewLock(root);
    } else if (field === 'user1-part-length') {
      user1Buffer.raw = value;
      user1Dirty = true;
      markUnapplied(root, 'user1', true);
      markUnapplied(root, 'store', true);
      applyUnappliedReviewLock(root);
    }
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (
        measurementBuffer.raw
        || measurementBuffer.unit
        || measurementBuffer.role
        || takeoffBuffer.label
        || takeoffBuffer.quantity
        || boardBuffer.raw
        || boardDirty
        || user1Dirty
        || correctingId
      ) {
        event.preventDefault();
        discardBuffers();
        lastCommitSignature = null;
        lastBoardCommitSignature = null;
        pageStatus = null;
        render();
      }
      return;
    }
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }
    const field = event.target.getAttribute?.('data-field');
    if (!field) {
      return;
    }
    if (field.startsWith('measurement-')) {
      event.preventDefault();
      commitMeasurement(root);
      return;
    }
    if (field === 'user1-part-length') {
      event.preventDefault();
      commitUser1XBrace(root);
      return;
    }
    if (field.startsWith('board-')) {
      event.preventDefault();
      commitBoardLength(root);
      return;
    }
    if (field.startsWith('takeoff-') && field !== 'takeoff-raw') {
      event.preventDefault();
      commitTakeoffRow(root);
    }
  });

  root.addEventListener('focusout', (event) => {
    const field = event.target.getAttribute?.('data-field');
    if (field && field.startsWith('board-')) {
      const next = event.relatedTarget;
      if (next && root.contains(next)) {
        const nextField = next.getAttribute?.('data-field');
        if (nextField?.startsWith('board-')) {
          return;
        }
        const action = next.closest?.('[data-action]')?.getAttribute('data-action');
        if (action === 'apply-board-length' || action === 'apply-cut001') {
          return;
        }
      }
      commitBoardLength(root, { fromBlur: true });
      return;
    }
    if (!field || !field.startsWith('measurement-')) {
      return;
    }
    const next = event.relatedTarget;
    if (next && root.contains(next) && next.getAttribute?.('data-field')?.startsWith('measurement-')) {
      return;
    }
    if (lastCommitSignature && lastCommitSignature === measurementSignature()) {
      return;
    }
  });

  window.addEventListener('popstate', render);
  render();
}
