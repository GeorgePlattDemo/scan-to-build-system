import { expect, test } from '@playwright/test';

import { ACTORS, COPY, FIXED_ORIGIN, PRIMARY_PAGES, ROUTES } from '../../shared/contracts.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

async function domainInventory(page) {
  return page.evaluate(async () => {
    if (typeof indexedDB.databases !== 'function') {
      return { supported: false, databasePresent: false, projects: 0, records: 0 };
    }
    const names = await indexedDB.databases();
    const present = names.some((entry) => entry.name === 'stb-app-v1');
    if (!present) {
      return { supported: true, databasePresent: false, projects: 0, records: 0 };
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('stb-app-v1');
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        request.transaction.abort();
      };
      request.onsuccess = () => {
        const database = request.result;
        const namesNow = [...database.objectStoreNames];
        const read = namesNow.includes('projects') && namesNow.includes('records')
          ? database.transaction(['projects', 'records'], 'readonly')
          : null;
        const finish = (projects, records) => {
          database.close();
          resolve({
            supported: true,
            databasePresent: true,
            projects,
            records,
          });
        };
        if (!read) {
          finish(0, 0);
          return;
        }
        const projectsReq = read.objectStore('projects').getAll();
        const recordsReq = read.objectStore('records').getAll();
        read.oncomplete = () => {
          finish((projectsReq.result ?? []).length, (recordsReq.result ?? []).length);
        };
        read.onabort = () => {
          database.close();
          reject(read.error);
        };
      };
    });
  });
}

async function viewSession(page) {
  return page.evaluate(async () => {
    const view = await import('/ui/view-state.mjs');
    return view.readViewSession();
  });
}

async function beginSnapshot(page) {
  return page.evaluate(() => {
    const shell = document.querySelector('[data-shell]');
    const nav = [...document.querySelectorAll('.primary-nav a, .primary-nav span')].map(
      (node) => node.textContent,
    );
    return {
      url: window.location.pathname,
      screen: shell?.getAttribute('data-screen') ?? null,
      shell: shell?.getAttribute('data-shell') ?? null,
      actor: shell?.getAttribute('data-actor') ?? null,
      heading: document.getElementById('screen-heading')?.textContent ?? null,
      nav,
    };
  });
}

async function goActorToBegin(page, actorId) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS[actorId].label }).click();
  await expect(page.locator('[data-screen="orientation"]')).toBeVisible();
  await expect(page.locator('[data-actor]')).toHaveAttribute('data-actor', actorId);
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.locator('[data-screen="begin"]')).toBeVisible();
}

async function savedProjectSnapshot(page, localRecordId) {
  const project = requireOk(await repoCall(page, 'project', { localRecordId }), 'project');
  const head = requireOk(await repoCall(page, 'head', { localRecordId }), 'head');
  const note = requireOk(
    await repoCall(page, 'record', { localRecordId, kind: 'note', id: 'note-saved' }),
    'note',
  );
  const event = requireOk(
    await repoCall(page, 'record', { localRecordId, kind: 'event', id: 'event-saved' }),
    'event',
  );
  const inventory = await domainInventory(page);
  return { project, head, note, event, inventory };
}

async function seedSavedProject(page) {
  const localRecordId = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  const createdAt = '2026-09-10T22:45:00.000Z';
  requireOk(
    await repoCall(page, 'commit', {
      localRecordId,
      projectId,
      expectedHead: null,
      nextHead: 'H0',
      createdAt,
      actionId: 'action-saved',
      records: [
        {
          localRecordId,
          projectId,
          kind: 'note',
          id: 'note-saved',
          createdAt,
          payload: { origin: 'inert-saved-project' },
        },
      ],
      event: {
        localRecordId,
        projectId,
        kind: 'event',
        id: 'event-saved',
        createdAt,
        payload: { type: 'inert-test' },
      },
    }),
    'seed saved project',
  );
  return savedProjectSnapshot(page, localRecordId);
}

test('B1-01 exact locked landing copy and three actor doors', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: COPY.title })).toBeVisible();
  await expect(page.getByText(COPY.tagline, { exact: true })).toBeVisible();
  await expect(page.locator('#landing-sequence li')).toHaveText([...COPY.sequence]);
  await expect(page.getByText(COPY.service, { exact: true })).toBeVisible();
  await expect(page.locator('[data-reference-demonstration]')).toHaveText(COPY.referenceDemonstration);
  await expect(page.getByRole('heading', { level: 2, name: COPY.howStarting })).toBeVisible();
  await expect(page.locator('.actor-choice')).toHaveText([
    ACTORS.new.label,
    ACTORS.returning.label,
    ACTORS.professional.label,
  ]);
  await expect(page.getByRole('button', { name: ACTORS.new.label })).toHaveCount(1);
  await expect(page.getByRole('button', { name: ACTORS.returning.label })).toHaveCount(1);
  await expect(page.getByRole('button', { name: ACTORS.professional.label })).toHaveCount(1);
  await expect(page.getByText(COPY.invariant, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /pick a board/i })).toHaveCount(0);
  await expect(page.getByText(/sign up|log in|create account|password/i)).toHaveCount(0);
  expect((await domainInventory(page)).projects).toBe(0);
});

test('B1-02 NEW USER orientation then common Begin, Back, no project', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await expect(page).toHaveURL(`${FIXED_ORIGIN}${ROUTES.startNew}`);
  await expect(page.locator('[data-screen="orientation"][data-actor="new"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: ACTORS.new.heading })).toBeVisible();
  await expect(page.getByText(ACTORS.new.body, { exact: true })).toBeVisible();
  await expect(page.locator('[data-actor="returning"]')).toHaveCount(0);
  await expect(page.locator('[data-actor="professional"]')).toHaveCount(0);
  await page.getByRole('button', { name: COPY.back }).click();
  await expect(page.locator('[data-screen="landing"]')).toBeVisible();
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page).toHaveURL(`${FIXED_ORIGIN}${ROUTES.begin}`);
  await expect(page.locator('[data-shell="common"][data-screen="begin"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  expect((await domainInventory(page)).projects).toBe(0);
});

test('B1-03 RETURNING USER orientation reaches the same Begin without a saved project', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.returning.label }).click();
  await expect(page.locator('[data-screen="orientation"][data-actor="returning"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: ACTORS.returning.heading })).toBeVisible();
  await expect(page.getByText(ACTORS.new.body)).toHaveCount(0);
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.locator('[data-shell="common"][data-screen="begin"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  expect((await viewSession(page)).actorId).toBe('returning');
  expect((await domainInventory(page)).projects).toBe(0);
  expect((await domainInventory(page)).records).toBe(0);
});

test('B1-04 PROFESSIONAL orientation reaches the same Begin without authority', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.professional.label }).click();
  await expect(page.locator('[data-screen="orientation"][data-actor="professional"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: ACTORS.professional.heading })).toBeVisible();
  await expect(page.getByText(ACTORS.professional.body, { exact: true })).toBeVisible();
  await expect(page.getByText(/credential|licensed|authorization granted/i)).toHaveCount(0);
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.locator('[data-shell="common"][data-screen="begin"]')).toBeVisible();
  expect((await domainInventory(page)).projects).toBe(0);
});

test('B1-05 three independent actor routes converge on one Begin shell', async ({ page }) => {
  const snapshots = [];
  for (const actorId of ['new', 'returning', 'professional']) {
    await goActorToBegin(page, actorId);
    snapshots.push({
      actorId,
      ...(await beginSnapshot(page)),
      inventory: await domainInventory(page),
      session: await viewSession(page),
    });
  }
  expect(new Set(snapshots.map((item) => item.url))).toEqual(new Set([ROUTES.begin]));
  expect(new Set(snapshots.map((item) => item.screen))).toEqual(new Set(['begin']));
  expect(new Set(snapshots.map((item) => item.shell))).toEqual(new Set(['common']));
  expect(new Set(snapshots.map((item) => item.heading))).toEqual(new Set([COPY.beginHeading]));
  expect(snapshots.map((item) => item.actor)).toEqual(['new', 'returning', 'professional']);
  for (const snapshot of snapshots) {
    expect(snapshot.nav).toEqual(
      PRIMARY_PAGES.map((page) =>
        page.implemented ? page.label : `${page.label} (${COPY.notYetImplemented})`,
      ),
    );
    expect(snapshot.inventory.projects).toBe(0);
    expect(snapshot.session.actorId).toBe(snapshot.actorId);
  }
});

test('B1-06 actor context is session/view state, not domain truth', async ({ page }) => {
  await goActorToBegin(page, 'professional');
  const session = await viewSession(page);
  const inventory = await domainInventory(page);
  expect(session.actorId).toBe('professional');
  expect(inventory.databasePresent).toBe(false);
  expect(inventory.projects).toBe(0);
  expect(inventory.records).toBe(0);
  await expect(page.locator('[data-actor="professional"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
});

test('B1-A02 same saved project is unchanged under all three actor priorities', async ({
  page,
}) => {
  await page.goto('/');
  const seeded = await seedSavedProject(page);
  expect(seeded.project.localRecordId).toBeTruthy();
  expect(seeded.project.projectId).toBeTruthy();
  expect(seeded.head).toBe('H0');
  expect(seeded.inventory.projects).toBe(1);
  expect(seeded.inventory.records).toBeGreaterThan(0);

  const afterActors = [];
  for (const actorId of ['new', 'returning', 'professional']) {
    await goActorToBegin(page, actorId);
    const snapshot = await beginSnapshot(page);
    const current = await savedProjectSnapshot(page, seeded.project.localRecordId);
    const session = await viewSession(page);
    expect(snapshot.url).toBe(ROUTES.begin);
    expect(snapshot.shell).toBe('common');
    expect(snapshot.screen).toBe('begin');
    expect(snapshot.heading).toBe(COPY.beginHeading);
    expect(snapshot.actor).toBe(actorId);
    expect(session.actorId).toBe(actorId);
    expect(current.project.localRecordId).toBe(seeded.project.localRecordId);
    expect(current.project.projectId).toBe(seeded.project.projectId);
    expect(current.head).toBe(seeded.head);
    expect(current.project.currentHead).toBe(seeded.project.currentHead);
    expect(current.project.eventSequence).toBe(seeded.project.eventSequence);
    expect(current.project.createdAt).toBe(seeded.project.createdAt);
    expect(current.note).toEqual(seeded.note);
    expect(current.event).toEqual(seeded.event);
    expect(current.inventory.projects).toBe(1);
    expect(current.inventory.records).toBe(seeded.inventory.records);
    afterActors.push({ actorId, snapshot, current, session });
  }

  expect(afterActors.map((entry) => entry.session.actorId)).toEqual([
    'new',
    'returning',
    'professional',
  ]);
  expect(new Set(afterActors.map((entry) => entry.current.project.localRecordId)).size).toBe(1);
  expect(new Set(afterActors.map((entry) => entry.current.project.projectId)).size).toBe(1);
  expect(new Set(afterActors.map((entry) => entry.current.head)).size).toBe(1);
});

test('B1-07 browser history, reload, and direct routes do not create projects', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await expect(page).toHaveURL(new RegExp(`${ROUTES.startNew}$`));
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page).toHaveURL(new RegExp(`${ROUTES.begin}$`));
  await page.goBack();
  await expect(page.locator('[data-screen="orientation"][data-actor="new"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-screen="landing"]')).toBeVisible();
  await page.goForward();
  await expect(page.locator('[data-screen="orientation"][data-actor="new"]')).toBeVisible();
  await page.goForward();
  await expect(page.locator('[data-screen="begin"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-shell="common"][data-screen="begin"]')).toBeVisible();
  expect((await viewSession(page)).actorId).toBe('new');
  await page.goto(ROUTES.startProfessional);
  await expect(page.locator('[data-screen="orientation"][data-actor="professional"]')).toBeVisible();
  await page.goto(ROUTES.begin);
  await expect(page.locator('[data-screen="begin"]')).toBeVisible();
  expect((await domainInventory(page)).projects).toBe(0);
});

test('B1-08 keyboard-only actor selection, account choice, Back, reselect, and My Projects', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: ACTORS.new.label })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-screen="orientation"][data-actor="new"]')).toBeVisible();
  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-orientation-account]')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  for (let index = 0; index < 7; index += 1) {
    await page.keyboard.press('Tab');
  }
  await expect(page.getByRole('button', { name: COPY.next })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: COPY.back })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-screen="landing"]')).toBeVisible();
  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: ACTORS.returning.label })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-screen="orientation"][data-actor="returning"]')).toBeVisible();
  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-orientation-account]')).toBeFocused();
  for (let index = 0; index < 7; index += 1) {
    await page.keyboard.press('Tab');
  }
  await expect(page.getByRole('button', { name: COPY.next })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-screen="begin"]')).toBeVisible();
  await expect(page.locator('#screen-heading')).toBeFocused();
  await expect(page.locator('#screen-heading')).toHaveCSS('outline-style', 'solid');
  expect((await domainInventory(page)).projects).toBe(0);
});

test('B1-09 narrow viewport keeps landing, orientation, and Begin readable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: COPY.title })).toBeVisible();
  await expect(page.locator('#landing-sequence li')).toHaveCount(7);
  const landingOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(landingOverflow).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: ACTORS.professional.label }).click();
  await expect(page.getByRole('heading', { name: ACTORS.professional.heading })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.next })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.back })).toBeVisible();
  const orientationOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(orientationOverflow).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Application pages' })).toBeVisible();
  const beginOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(beginOverflow).toBeLessThanOrEqual(1);
});
