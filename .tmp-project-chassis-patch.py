from pathlib import Path
import re

ROOT = Path('apps/stb')

def read(rel):
    return (ROOT / rel).read_text()

def write(rel, text):
    (ROOT / rel).write_text(text)

def replace_once(text, old, new, label):
    count = text.count(old)
    assert count == 1, f'{label}: expected 1 anchor, found {count}'
    return text.replace(old, new, 1)

# ── contracts: one project/workstream vocabulary and route shape ─────────────
p = 'shared/contracts.mjs'
s = read(p)
s = replace_once(s, "export const ACTOR_ORDER = Object.freeze(['new', 'returning', 'professional']);\n\nexport const COPY", """export const ACTOR_ORDER = Object.freeze(['new', 'returning', 'professional']);

export const WORKSTREAMS = Object.freeze({
  dimensional: Object.freeze({ id: 'dimensional', badge: 'D', label: 'DIMENSIONAL', machine: 'D-001' }),
  sheet: Object.freeze({ id: 'sheet', badge: 'S', label: 'SHEET', machine: 'S-001' }),
});

export const PROJECT_WORKSTREAMS = Object.freeze({
  'alcove-shelf-blanks': Object.freeze(['dimensional']),
  'classic-picnic-table-fixture': Object.freeze(['dimensional']),
  S001_CENTERED_ARCHED_SHEET_V0: Object.freeze(['sheet']),
});

export function workstreamsForClass(classId) {
  return [...(PROJECT_WORKSTREAMS[classId] ?? [])];
}

export const COPY""", 'contracts workstream constants')
s = replace_once(s, "  beginHeading: 'Begin your project',", "  beginHeading: 'Projects',", 'begin heading')
s = replace_once(s, "  startOwn: 'START YOUR OWN PROJECT',\n  ownHint: 'Bring what you already have.',\n  resumeHeading: 'Resume saved project',\n  emptySaved: 'No saved projects.',", """  startOwn: 'START YOUR OWN PROJECT',
  ownHint: 'Bring what you already have.',
  resumeHeading: 'Your projects',
  emptySaved: 'No saved projects yet.',
  projectsIntro: 'Open a project or start another. Every project enters the same way.',
  startAnotherProject: '+ START ANOTHER PROJECT',
  workstreamsHeading: 'Project workstreams',
  workstreamsIntro: 'Choose the workstream you are working on. Work that is not required stays visible.',
  workstreamRequired: 'REQUIRED',
  workstreamNotRequired: 'NOT REQUIRED',
  workstreamNotAssigned: 'NOT ASSIGNED',
  openDimensionalWork: 'OPEN DIMENSIONAL WORK',
  openSheetWork: 'OPEN SHEET WORK',
  openProjectDefinition: 'OPEN PROJECT DEFINITION',
  backToProjects: 'Back to projects',
  backToWorkstreams: 'Back to workstreams',""", 'project copy')
s = replace_once(s, "Object.freeze({ id: 'begin', label: 'Begin', route: ROUTES.begin, implemented: true }),", "Object.freeze({ id: 'begin', label: 'Projects', route: ROUTES.begin, implemented: true }),", 'primary projects label')
s = replace_once(s, "export const PROJECT_VIEWS = Object.freeze(['hub', 'questions', 'store', 'confirm', 'result', 'record']);", "export const PROJECT_VIEWS = Object.freeze(['hub', 'workspace', 'questions', 'store', 'confirm', 'result', 'record']);", 'project views')
s = replace_once(s, """  const child = params.get('child');
  return {
    ...screen,
    localRecordId: params.get('id'),
    view,
    child: child && INTAKE_CARDS.some((card) => card.id === child) ? child : null,
  };
}

export function projectHref(localRecordId, view, child) {
  const params = new URLSearchParams({
    id: localRecordId,
    view,
  });
  if (child) {
    params.set('child', child);
  }
  return `${ROUTES.project}?${params.toString()}`;
}
""", """  const child = params.get('child');
  const workstreamParam = params.get('workstream');
  const workstream = Object.prototype.hasOwnProperty.call(WORKSTREAMS, workstreamParam)
    ? workstreamParam
    : null;
  return {
    ...screen,
    localRecordId: params.get('id'),
    view,
    workstream,
    child: child && INTAKE_CARDS.some((card) => card.id === child) ? child : null,
  };
}

export function projectHref(localRecordId, view, child, workstream) {
  const params = new URLSearchParams({
    id: localRecordId,
    view,
  });
  if (child) {
    params.set('child', child);
  }
  if (workstream && Object.prototype.hasOwnProperty.call(WORKSTREAMS, workstream)) {
    params.set('workstream', workstream);
  }
  return `${ROUTES.project}?${params.toString()}`;
}
""", 'project route parsing')
write(p, s)

# ── selectors: derive workstreams for all old and new project records ─────────
p = 'browser/data/selectors.mjs'
s = read(p)
s = "import { workstreamsForClass } from '/shared/contracts.mjs';\n" + s
s = replace_once(s, """export async function projectIndex(localRecordId) {
  return getProject(localRecordId);
}
""", """function withWorkstreams(project) {
  if (!project) {
    return null;
  }
  const workstreams = Array.isArray(project.workstreams)
    ? [...project.workstreams]
    : workstreamsForClass(project.classId);
  return { ...project, workstreams };
}

export async function projectIndex(localRecordId) {
  return withWorkstreams(await getProject(localRecordId));
}
""", 'selector projectIndex')
s = replace_once(s, """      classVersion: project.classVersion,
      imported: project.imported === true,""", """      classVersion: project.classVersion,
      workstreams: Array.isArray(project.workstreams)
        ? [...project.workstreams]
        : workstreamsForClass(project.classId),
      imported: project.imported === true,""", 'selector saved workstreams')
write(p, s)

# ── class routing: all projects stop at hub, then enter their old workspace ───
p = 'browser/domain/classes.mjs'
s = read(p)
s = replace_once(s, """export function destinationView(entryMode) {
  return entryMode === 'mapped' ? 'questions' : 'hub';
}
""", """export function destinationView() {
  return 'hub';
}

export function projectWorkView(entryMode) {
  return entryMode === 'mapped' ? 'questions' : 'workspace';
}
""", 'class destination')
write(p, s)

# ── panels: project index + common workstream gate ───────────────────────────
p = 'browser/ui/panels.mjs'
s = read(p)
s = replace_once(s, """  OWN_ENTRY,
} from '/shared/contracts.mjs';""", """  OWN_ENTRY,
  WORKSTREAMS,
} from '/shared/contracts.mjs';""", 'panels imports')
start = s.index('function resumeSection(')
end = s.index('\nfunction mappedSection', start)
new_resume = r'''function workstreamSummary(project) {
  const streams = new Set(project.workstreams ?? []);
  if (streams.size === 0) return 'NOT ASSIGNED';
  return [...streams]
    .map((id) => WORKSTREAMS[id]?.label ?? id.toUpperCase())
    .join(' + ');
}

function workstreamBadge(project, id) {
  const stream = WORKSTREAMS[id];
  const required = (project.workstreams ?? []).includes(id);
  return el('span', {
    className: required ? 'project-stream active' : 'project-stream',
    attrs: {
      'data-project-stream': id,
      'data-required': required ? 'true' : 'false',
      title: `${stream.label} · ${required ? COPY.workstreamRequired : COPY.workstreamNotRequired}`,
    },
    text: required ? `${stream.badge} ✓` : `${stream.badge} —`,
  });
}

function resumeSection(saved) {
  const empty = saved.length === 0;
  const list = empty
    ? [el('p', { className: 'empty-saved', attrs: { 'data-empty-saved': 'true' }, text: COPY.emptySaved })]
    : saved.map((project) =>
        el('button', {
          className: 'resume-item project-row',
          attrs: {
            type: 'button',
            'data-action': 'resume-project',
            'data-local-record-id': project.localRecordId,
          },
        }, [
          el('span', { className: 'project-row-main' }, [
            el('strong', { text: project.title ?? 'Untitled project' }),
            el('span', { className: 'project-row-meta', text: workstreamSummary(project) }),
          ]),
          el('span', { className: 'project-row-streams', attrs: { 'aria-label': 'Required workstreams' } }, [
            workstreamBadge(project, 'dimensional'),
            workstreamBadge(project, 'sheet'),
          ]),
        ]),
      );
  return el(
    'section',
    {
      className: 'saved-projects',
      attrs: { 'data-project-list': 'true' },
    },
    [el('h2', { text: COPY.resumeHeading }), el('p', { className: 'hint', text: COPY.projectsIntro }), ...list],
  );
}
'''
s = s[:start] + new_resume + s[end:]
s = replace_once(s, """export function page1Main({
  actor,
  saved,
  current,
  mappedOpen,
  pendingSwitch,""", """export function page1Main({
  actor,
  saved,
  current,
  mappedOpen,
  startProjectOpen,
  pendingSwitch,""", 'page1 args')
s = replace_once(s, """  const resume = resumeSection(saved, actorId);
  const mapped = mappedSection(mappedOpen);
  const own = ownSection();
  const starts = actorId === 'returning' ? [resume, mapped, own] : [mapped, own, resume];""", """  const resume = resumeSection(saved);
  const startOpen = saved.length === 0 || startProjectOpen;
  const mapped = mappedSection(mappedOpen);
  const own = ownSection();
  const startAnother = el('section', { className: 'start-card start-another-card' }, [
    el('button', {
      attrs: {
        type: 'button',
        'data-action': 'toggle-start-project',
        'aria-expanded': startOpen ? 'true' : 'false',
      },
      text: COPY.startAnotherProject,
    }),
  ]);
  const starts = [resume, startAnother, ...(startOpen ? [mapped, own] : [])];""", 'page1 standard order')
# Insert common gate before existing projectHandoffMain.
insert_anchor = 'export function projectHandoffMain({ project, view }) {'
assert s.count(insert_anchor) == 1
work_gate = r'''function workstreamCard(project, id) {
  const stream = WORKSTREAMS[id];
  const assigned = project.workstreams ?? [];
  const known = assigned.length > 0;
  const required = assigned.includes(id);
  const state = required
    ? COPY.workstreamRequired
    : known
      ? COPY.workstreamNotRequired
      : COPY.workstreamNotAssigned;
  const openLabel = id === 'dimensional' ? COPY.openDimensionalWork : COPY.openSheetWork;
  return el('article', {
    className: required ? 'workstream-card required' : 'workstream-card',
    attrs: {
      'data-workstream-card': id,
      'data-required': required ? 'true' : 'false',
      'data-machine': stream.machine,
    },
  }, [
    el('div', { className: 'workstream-card-head' }, [
      el('strong', { text: `${stream.label} · ${stream.machine}` }),
      el('span', { className: required ? 'workstream-state required' : 'workstream-state', text: state }),
    ]),
    required
      ? el('button', {
          attrs: {
            type: 'button',
            'data-action': 'open-workstream',
            'data-workstream': id,
          },
          text: openLabel,
        })
      : null,
  ]);
}

export function projectWorkstreamsMain({ project }) {
  const hasAssignment = (project.workstreams ?? []).length > 0;
  return el('main', {
    className: 'screen screen-workstreams',
    attrs: {
      'data-screen': 'workstreams',
      'data-local-record-id': project.localRecordId,
      'data-project-id': project.projectId,
      'data-class-id': project.classId ?? '',
    },
  }, [
    heading(COPY.workstreamsHeading),
    el('p', { className: 'project-name', text: project.title ?? 'Untitled project' }),
    el('p', { className: 'handoff-status', text: COPY.workstreamsIntro }),
    el('div', { className: 'workstream-grid', attrs: { 'data-workstream-grid': 'true' } }, [
      workstreamCard(project, 'dimensional'),
      workstreamCard(project, 'sheet'),
    ]),
    !hasAssignment
      ? el('section', { className: 'start-card unassigned-project' }, [
          el('p', { className: 'hint', text: 'This project has not established a machine workstream yet. Define the project first.' }),
          el('button', {
            attrs: { type: 'button', 'data-action': 'open-project-definition' },
            text: COPY.openProjectDefinition,
          }),
        ])
      : null,
    el('button', {
      attrs: { type: 'button', 'data-action': 'back-to-begin' },
      text: COPY.backToProjects,
    }),
  ]);
}

'''
s = s.replace(insert_anchor, work_gate + insert_anchor, 1)
s = replace_once(s, """  actor,
  view,
  child,
  evidence,""", """  actor,
  view,
  child,
  workstream,
  evidence,""", 'page2 workstream arg')
s = replace_once(s, """        'data-child': child ?? '',
        'data-actor-order': actorId,""", """        'data-child': child ?? '',
        'data-workstream': workstream ?? '',
        'data-actor-order': actorId,""", 'page2 data workstream')
s = replace_once(s, """      isQuestions
        ? el('p', { className: 'handoff-status', text: COPY.questionsStatus })
        : el('p', { className: 'page2-prompt', text: COPY.page2Prompt }),""", """      isQuestions
        ? el('p', { className: 'handoff-status', text: COPY.questionsStatus })
        : el('p', { className: 'page2-prompt', text: COPY.page2Prompt }),
      workstream && WORKSTREAMS[workstream]
        ? el('p', {
            className: 'workstream-context',
            attrs: { 'data-workstream-context': workstream },
            text: `${WORKSTREAMS[workstream].label} · ${WORKSTREAMS[workstream].machine}`,
          })
        : null,""", 'page2 context')
s = replace_once(s, """      el('button', {
        attrs: { type: 'button', 'data-action': 'back-to-begin' },
        text: COPY.back,
      }),""", """      el('div', { className: 'actions project-navigation' }, [
        el('button', {
          attrs: { type: 'button', 'data-action': 'back-to-workstreams' },
          text: COPY.backToWorkstreams,
        }),
        el('button', {
          attrs: { type: 'button', 'data-action': 'back-to-begin' },
          text: COPY.backToProjects,
        }),
      ]),""", 'page2 project nav')
write(p, s)

# ── shell: stop every project at the gate, preserve old work behind it ─────────
p = 'browser/ui/shell.mjs'
s = read(p)
s = replace_once(s, "import { destinationView } from '/domain/classes.mjs';", "import { destinationView, projectWorkView } from '/domain/classes.mjs';", 'shell class imports')
s = replace_once(s, "import { page1Main, page2Main, page5Main, projectMissingMain } from '/ui/panels.mjs';", "import { page1Main, page2Main, page5Main, projectMissingMain, projectWorkstreamsMain } from '/ui/panels.mjs';", 'shell panel imports')
s = replace_once(s, "let mappedOpen = false;\nlet pendingSwitch", "let mappedOpen = false;\nlet startProjectOpen = false;\nlet pendingSwitch", 'shell start state')
s = replace_once(s, """  if (screen.name === 'landing') {
    mappedOpen = false;
    pendingSwitch = null;""", """  if (screen.name === 'landing') {
    mappedOpen = false;
    startProjectOpen = false;
    pendingSwitch = null;""", 'landing reset')
s = replace_once(s, """        current,
        mappedOpen,
        pendingSwitch,""", """        current,
        mappedOpen,
        startProjectOpen,
        pendingSwitch,""", 'page1 shell args')
s = replace_once(s, """    if (!project) {
      content = wrapShell(actor, projectMissingMain(), 'begin');
    } else {
      await recoverStoreOnOpen(project.localRecordId);""", """    if (!project) {
      content = wrapShell(actor, projectMissingMain(), 'begin');
    } else if (screen.view === 'hub') {
      content = wrapShell(
        actor,
        projectWorkstreamsMain({ project }),
        'hub',
        { project, view: 'hub' },
      );
    } else {
      await recoverStoreOnOpen(project.localRecordId);""", 'shell hub gate')
s = replace_once(s, """            view: screen.view,
            child: screen.child,
            evidence,""", """            view: screen.view,
            child: screen.child,
            workstream: screen.workstream,
            evidence,""", 'shell page2 workstream')
# Better page titles for the two chassis levels.
s = replace_once(s, """      ? `${COPY.beginHeading} — Scan-to-Build`
      : screen.name === 'project' && screen.view === 'store'""", """      ? `${COPY.beginHeading} — Scan-to-Build`
      : screen.name === 'project' && screen.view === 'hub'
        ? `${COPY.workstreamsHeading} — Scan-to-Build`
      : screen.name === 'project' && screen.view === 'store'""", 'shell title hub')
s = replace_once(s, """    if (action === 'expand-mapped') {
      mappedOpen = true;
      render();
      return;
    }""", """    if (action === 'toggle-start-project') {
      startProjectOpen = !startProjectOpen;
      if (!startProjectOpen) {
        mappedOpen = false;
      }
      render();
      return;
    }
    if (action === 'expand-mapped') {
      mappedOpen = true;
      render();
      return;
    }""", 'start another action')
s = replace_once(s, """    if (action === 'open-child') {
      const screen = screenFromLocation(window.location);
      navigate(projectHref(screen.localRecordId, screen.view, button.getAttribute('data-child')));
      return;
    }
    if (action === 'back-to-hub') {
      const screen = screenFromLocation(window.location);
      const view = screen.view === 'questions' ? 'questions' : 'hub';
      navigate(projectHref(screen.localRecordId, view));
      return;
    }""", """    if (action === 'open-workstream') {
      const screen = screenFromLocation(window.location);
      const workstream = button.getAttribute('data-workstream');
      if (!screen.localRecordId || !workstream) {
        return;
      }
      projectIndex(screen.localRecordId).then((project) => {
        if (!project || !(project.workstreams ?? []).includes(workstream)) {
          return;
        }
        navigate(projectHref(project.localRecordId, projectWorkView(project.entryMode), null, workstream));
      });
      return;
    }
    if (action === 'open-project-definition') {
      const screen = screenFromLocation(window.location);
      if (screen.localRecordId) {
        navigate(projectHref(screen.localRecordId, 'workspace'));
      }
      return;
    }
    if (action === 'back-to-workstreams') {
      const screen = screenFromLocation(window.location);
      if (screen.localRecordId) {
        navigate(projectHref(screen.localRecordId, 'hub'));
      }
      return;
    }
    if (action === 'open-child') {
      const screen = screenFromLocation(window.location);
      navigate(projectHref(screen.localRecordId, screen.view, button.getAttribute('data-child'), screen.workstream));
      return;
    }
    if (action === 'back-to-hub') {
      const screen = screenFromLocation(window.location);
      const view = screen.view === 'questions'
        ? 'questions'
        : screen.view === 'workspace'
          ? 'workspace'
          : 'hub';
      navigate(projectHref(screen.localRecordId, view, null, screen.workstream));
      return;
    }""", 'workstream actions')
write(p, s)

# ── styles: plain list and plain two-card gate ────────────────────────────────
p = 'browser/styles.css'
s = read(p)
style_anchor = ".current-project {\n  font-weight: 650;\n}\n\n.intake-grid {"
style_new = r'''.current-project {
  font-weight: 650;
}

.project-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  text-align: left;
  margin-top: 0.55rem;
  padding: 0.75rem;
}

.project-row-main,
.project-row-streams {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.project-row-main {
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
}

.project-row-meta {
  color: #555;
  font-size: 0.82rem;
  font-weight: 500;
}

.project-stream,
.workstream-state {
  border: 1px solid #aaa;
  border-radius: 999px;
  padding: 0.15rem 0.45rem;
  font-size: 0.75rem;
  font-weight: 650;
  white-space: nowrap;
}

.project-stream.active,
.workstream-state.required {
  border-color: #2a2a2a;
  background: #f3f3f0;
}

.workstream-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}

.workstream-card {
  border: 1px solid #aaa;
  background: #f7f7f4;
  padding: 0.9rem;
}

.workstream-card.required {
  border-color: #2a2a2a;
  background: #fff;
}

.workstream-card-head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.workstream-card button,
.unassigned-project button {
  width: 100%;
  font-weight: 650;
}

.workstream-context {
  font-weight: 650;
  margin: 0.5rem 0 1rem;
}

.project-navigation {
  margin-top: 1rem;
}

@media (max-width: 34rem) {
  .project-row,
  .workstream-card-head {
    align-items: flex-start;
    flex-direction: column;
  }
}

.intake-grid {'''
s = replace_once(s, style_anchor, style_new, 'styles chassis')
write(p, s)

# ── unit tests: make the contract explicit ───────────────────────────────────
p = 'test/unit/entry.test.mjs'
s = read(p)
s = replace_once(s, """  PRIMARY_PAGES,
  ROUTES,""", """  PRIMARY_PAGES,
  ROUTES,
  WORKSTREAMS,
  workstreamsForClass,""", 'unit test imports')
s = s.replace("assert.equal(COPY.beginHeading, 'Begin your project');", "assert.equal(COPY.beginHeading, 'Projects');")
s = s.replace("assert.equal(PRIMARY_PAGES[0].label, 'Begin');", "assert.equal(PRIMARY_PAGES[0].label, 'Projects');")
route_test_anchor = """test('Page 6 and Page 7 are existing project views, not new pathnames', () => {"""
route_test = r'''test('project workstreams use one project route and independent D/S indicators', () => {
  assert.equal(WORKSTREAMS.dimensional.machine, 'D-001');
  assert.equal(WORKSTREAMS.sheet.machine, 'S-001');
  assert.deepEqual(workstreamsForClass('alcove-shelf-blanks'), ['dimensional']);
  assert.deepEqual(workstreamsForClass('classic-picnic-table-fixture'), ['dimensional']);
  assert.deepEqual(workstreamsForClass('S001_CENTERED_ARCHED_SHEET_V0'), ['sheet']);
  assert.deepEqual(workstreamsForClass('unknown-class'), []);

  const sheet = screenFromLocation({
    pathname: '/project',
    search: '?id=local-1&view=questions&workstream=sheet',
  });
  assert.equal(sheet.view, 'questions');
  assert.equal(sheet.workstream, 'sheet');
  assert.equal(
    projectHref('local-1', 'questions', null, 'sheet'),
    '/project?id=local-1&view=questions&workstream=sheet',
  );
  const workspace = screenFromLocation({
    pathname: '/project',
    search: '?id=local-1&view=workspace',
  });
  assert.equal(workspace.view, 'workspace');
});

'''
assert s.count(route_test_anchor) == 1
s = s.replace(route_test_anchor, route_test + route_test_anchor, 1)
write(p, s)

# ── browser tests: cross the new common gate, don't bypass it ────────────────
# Most browser/vertical tests create an empty own project. Insert one standard gate click.
for test_path in list((ROOT / 'test/browser').glob('*.mjs')) + list((ROOT / 'test/vertical').glob('*.mjs')):
    text = test_path.read_text()
    old = "await page.getByRole('button', { name: COPY.startOwn }).click();"
    if old in text:
        text = text.replace(old, old + "\n  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();")
    test_path.write_text(text)

# Shared vertical helper has a deeper indentation but the same semantic line; normalize its inserted indentation.
helper = ROOT / 'test/vertical/helpers.mjs'
if helper.exists():
    text = helper.read_text().replace("\n  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();\n  await expect(page.locator('[data-page=", "\n  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();\n  await expect(page.locator('[data-page=")
    helper.write_text(text)

# Mapped configurator tests now cross the dimensional workstream gate.
for rel in ['test/browser/configurator.spec.mjs', 'test/browser/picnic-configurator.spec.mjs']:
    text = read(rel)
    needle = ").click();\n  await expect(page.locator('[data-screen=\"questions\"]')).toBeVisible();"
    # Use the last mapped project label click immediately before questions.
    idx = text.find("await expect(page.locator('[data-screen=\"questions\"]')).toBeVisible();")
    if idx != -1:
        before = text[:idx]
        if "COPY.openDimensionalWork" not in before[-400:]:
            text = text[:idx] + "await page.getByRole('button', { name: COPY.openDimensionalWork }).click();\n  " + text[idx:]
    write(rel, text)

# Page-1 tests intentionally assert the gate itself. Apply focused edits rather than generic old expectations.
p = 'test/browser/page1.spec.mjs'
s = read(p)
# Remove duplicate own-gate clicks from generic transform; this file will test both levels explicitly.
s = s.replace("await page.getByRole('button', { name: COPY.startOwn }).click();\n  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();", "await page.getByRole('button', { name: COPY.startOwn }).click();")
s = s.replace("await expect(page.getByRole('heading', { name: COPY.hubHeading })).toBeVisible();\n  await expect(page.getByText(COPY.page2Prompt, { exact: true })).toBeVisible();", "await expect(page.getByRole('heading', { name: COPY.workstreamsHeading })).toBeVisible();\n  await expect(page.getByRole('button', { name: COPY.openProjectDefinition })).toBeVisible();")
# Mapped starts stop at hub, then D-001 opens their prior questions view.
s = s.replace("await page.getByRole('button', { name: CLASS_REFERENCES[0].label }).click();\n  await expect(page.locator('[data-screen=\"questions\"]')).toBeVisible();", "await page.getByRole('button', { name: CLASS_REFERENCES[0].label }).click();\n  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  await expect(page.locator('[data-workstream-card=\"dimensional\"][data-required=\"true\"]')).toBeVisible();\n  await expect(page.locator('[data-workstream-card=\"sheet\"][data-required=\"false\"]')).toBeVisible();\n  await page.getByRole('button', { name: COPY.openDimensionalWork }).click();\n  await expect(page.locator('[data-screen=\"questions\"]')).toBeVisible();")
s = s.replace("await page.getByRole('button', { name: picnic.label }).click();\n\n  await expect(page.locator('[data-screen=\"questions\"]')).toBeVisible();", "await page.getByRole('button', { name: picnic.label }).click();\n  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  await page.getByRole('button', { name: COPY.openDimensionalWork }).click();\n\n  await expect(page.locator('[data-screen=\"questions\"]')).toBeVisible();")
# Switch-keep mapped creation also stops at hub.
s = s.replace("await page.getByRole('button', { name: COPY.keepAndStart }).click();\n  await expect(page.locator('[data-screen=\"questions\"]')).toBeVisible();", "await page.getByRole('button', { name: COPY.keepAndStart }).click();\n  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();")
# Keyboard test stops at the workstream gate.
s = s.replace("await expect(page.locator('[data-screen=\"hub\"]')).toBeVisible();\n  await expect(page.locator('#screen-heading')).toBeFocused();", "await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  await expect(page.locator('#screen-heading')).toBeFocused();")
write(p, s)

# Assertions after own creation in other tests should see workspace after the inserted definition click.
for test_path in list((ROOT / 'test/browser').glob('*.mjs')) + list((ROOT / 'test/vertical').glob('*.mjs')):
    text = test_path.read_text()
    text = text.replace("[data-screen=\"hub\"]", "[data-screen=\"workspace\"]")
    test_path.write_text(text)
# Restore page1's workstream-hub assertions that are intentionally different.
p = ROOT / 'test/browser/page1.spec.mjs'
s = p.read_text()
s = s.replace("[data-screen=\"workspace\"]", "[data-screen=\"hub\"]")
s = s.replace("await expect(page.locator('[data-screen=\"hub\"]')).toBeVisible();\n  await expect(page.getByRole('heading', { name: COPY.workstreamsHeading }))", "await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  await expect(page.getByRole('heading', { name: COPY.workstreamsHeading }))")
s = s.replace("await expect(page.locator('[data-screen=\"hub\"]')).toBeVisible();\n  await expect(page.locator('[data-workstream-card", "await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  await expect(page.locator('[data-workstream-card")
s = s.replace("await expect(page.locator('[data-screen=\"hub\"]')).toBeVisible();\n  await page.getByRole('button', { name: COPY.openDimensionalWork })", "await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  await page.getByRole('button', { name: COPY.openDimensionalWork })")
s = s.replace("await expect(page.locator('[data-screen=\"hub\"]')).toBeVisible();\n  const saved", "await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  const saved")
s = s.replace("await expect(page.locator('[data-screen=\"hub\"]')).toBeVisible();\n  const first", "await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  const first")
s = s.replace("await expect(page.locator('[data-screen=\"hub\"]')).toBeVisible();\n  await expect(page.locator('#screen-heading'))", "await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  await expect(page.locator('#screen-heading'))")
s = s.replace("await expect(page.locator('[data-screen=\"hub\"]')).toBeVisible();\n  const resumed", "await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  const resumed")
s = s.replace("await expect(page.locator('[data-screen=\"hub\"]')).toBeVisible();\n  const afterReload", "await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();\n  const afterReload")
p.write_text(s)

# Page1 now has project-row indicators and start-another behavior once a project exists.
s = read('test/browser/page1.spec.mjs')
extra_anchor = "test('P1 keyboard can start own project from Begin', async ({ page }) => {"
extra_test = r'''test('P1 saved project list is the common first door with D/S indicators and start-another control', async ({ page }) => {
  await openBegin(page);
  await page.getByRole('button', { name: COPY.chooseMapped }).click();
  await page.getByRole('button', { name: CLASS_REFERENCES[0].label }).click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.backToProjects }).click();
  await expect(page.locator('[data-project-list="true"]')).toBeVisible();
  const row = page.locator('.project-row').first();
  await expect(row.locator('[data-project-stream="dimensional"][data-required="true"]')).toBeVisible();
  await expect(row.locator('[data-project-stream="sheet"][data-required="false"]')).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.startAnotherProject })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.startOwn })).toHaveCount(0);
  await page.getByRole('button', { name: COPY.startAnotherProject }).click();
  await expect(page.getByRole('button', { name: COPY.startOwn })).toBeVisible();
});

'''
assert s.count(extra_anchor) == 1
s = s.replace(extra_anchor, extra_test + extra_anchor, 1)
write('test/browser/page1.spec.mjs', s)

# Sanity guards: no database migration, no Store/machine source touched.
for rel in ['shared/contracts.mjs','browser/data/selectors.mjs','browser/domain/classes.mjs','browser/ui/panels.mjs','browser/ui/shell.mjs','browser/styles.css']:
    assert (ROOT / rel).exists()

print('project chassis patch applied')
