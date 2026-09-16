from pathlib import Path
import re

ROOT = Path('.')


def read(path):
    return (ROOT / path).read_text()


def write(path, text):
    (ROOT / path).write_text(text)


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one anchor, found {count}')
    return text.replace(old, new, 1)


def sub_once(text, pattern, replacement, label, flags=0):
    next_text, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}')
    return next_text

# ---------------------------------------------------------------------------
# contracts: explicit synthetic accounts, actor demo suggestions, account copy
# ---------------------------------------------------------------------------
path = 'apps/stb/shared/contracts.mjs'
text = read(path)
old = """export const CUSTOMER_ZERO = Object.freeze({
  accountId: 'ACCT-000001',
  fixture: true,
  label: 'CUSTOMER ZERO',
  name: 'Sarah Smith',
  addressLine1: '123 Alcove Lane',
  city: 'Greensboro',
  region: 'NC',
  country: 'US',
});
"""
new = """export const DEMO_ACCOUNTS = Object.freeze([
  Object.freeze({
    accountId: 'ACCT-000001',
    fixture: true,
    userNumber: 1,
    label: 'USER 1',
    name: 'Sarah Smith',
    addressLine1: '123 Alcove Lane',
    city: 'Greensboro',
    region: 'NC',
    country: 'US',
    tags: Object.freeze(['INDIVIDUAL']),
  }),
  Object.freeze({
    accountId: 'ACCT-000002',
    fixture: true,
    userNumber: 2,
    label: 'USER 2',
    name: 'Marcus Reed',
    addressLine1: '456 Maple Street',
    city: 'Greensboro',
    region: 'NC',
    country: 'US',
    tags: Object.freeze(['INDIVIDUAL', 'RETURNING']),
  }),
  Object.freeze({
    accountId: 'ACCT-000003',
    fixture: true,
    userNumber: 3,
    label: 'USER 3',
    name: 'Elena Torres',
    addressLine1: '789 Builder Way',
    city: 'Greensboro',
    region: 'NC',
    country: 'US',
    tags: Object.freeze(['PROFESSIONAL', 'CONTRACTOR']),
  }),
]);

export const CUSTOMER_ZERO = DEMO_ACCOUNTS[0];

// These are demonstration suggestions only. Door choice is not account identity.
export const ACTOR_DEMO_ACCOUNT_IDS = Object.freeze({
  new: 'ACCT-000001',
  returning: 'ACCT-000002',
  professional: 'ACCT-000003',
});
"""
text = replace_once(text, old, new, 'contracts account fixtures')
text = replace_once(text, "  next: 'NEXT',", "  next: 'OPEN MY PROJECTS',", 'contracts next label')
text = replace_once(
    text,
    "  accountHeading: 'Account',\n",
    """  accountHeading: 'Account',
  accountChooserHeading: 'Choose your account',
  accountChooserIntro: 'Your entry door sets context. Your account controls which private projects appear.',
  accountChooserLabel: 'Account',
  accountTags: 'Account tags',
  accountAddUser: 'ADD A NEW USER',
  activeAccount: 'ACTIVE ACCOUNT',
""",
    'contracts account copy',
)
write(path, text)

# ---------------------------------------------------------------------------
# repository: ownerAccountId is local project-index metadata, preserved on edit/import
# ---------------------------------------------------------------------------
path = 'apps/stb/browser/data/repository.mjs'
text = read(path)
old = """      classId: project ? project.classId : (input.index?.classId ?? null),
      classVersion: project ? project.classVersion : (input.index?.classVersion ?? null),
      ...(project?.imported === true
"""
new = """      classId: project ? project.classId : (input.index?.classId ?? null),
      classVersion: project ? project.classVersion : (input.index?.classVersion ?? null),
      ...((project?.ownerAccountId ?? input.index?.ownerAccountId)
        ? { ownerAccountId: project?.ownerAccountId ?? input.index.ownerAccountId }
        : {}),
      ...(project?.imported === true
"""
text = replace_once(text, old, new, 'repository project owner preservation')
old = """      classId: sourceProject.classId ?? null,
      classVersion: sourceProject.classVersion ?? null,
      imported: true,
"""
new = """      classId: sourceProject.classId ?? null,
      classVersion: sourceProject.classVersion ?? null,
      ...(sourceProject.ownerAccountId ? { ownerAccountId: sourceProject.ownerAccountId } : {}),
      imported: true,
"""
text = replace_once(text, old, new, 'repository imported owner preservation')
write(path, text)

# ---------------------------------------------------------------------------
# candidate: ownership is index metadata, not candidate/project-definition payload
# ---------------------------------------------------------------------------
path = 'apps/stb/browser/domain/candidate.mjs'
text = read(path)
text = replace_once(
    text,
    """  const entryMode = requireString('entryMode', input.entryMode);
  const actorId = input.actorId ?? null;
""",
    """  const entryMode = requireString('entryMode', input.entryMode);
  const actorId = input.actorId ?? null;
  const ownerAccountId = input.ownerAccountId == null
    ? null
    : requireString('ownerAccountId', input.ownerAccountId);
""",
    'candidate owner input',
)
text = replace_once(
    text,
    """        classVersion: classRef ? classRef.classVersion : null,
      },
      records: [
""",
    """        classVersion: classRef ? classRef.classVersion : null,
        ...(ownerAccountId ? { ownerAccountId } : {}),
      },
      records: [
""",
    'candidate owner index',
)
write(path, text)

# ---------------------------------------------------------------------------
# selectors: app may request one account's projects; omitted argument stays backwards compatible
# ---------------------------------------------------------------------------
path = 'apps/stb/browser/data/selectors.mjs'
text = read(path)
text = replace_once(
    text,
    """export async function listSavedProjects() {
  const projects = await listProjects();
  return [...projects]
""",
    """export async function listSavedProjects(ownerAccountId = undefined) {
  const projects = await listProjects();
  const visible = ownerAccountId === undefined
    ? projects
    : projects.filter((project) => (project.ownerAccountId ?? null) === ownerAccountId);
  return [...visible]
""",
    'selectors scoped project list',
)
write(path, text)

# ---------------------------------------------------------------------------
# shell: account registry + picker + account-scoped project rendering/creation
# ---------------------------------------------------------------------------
path = 'apps/stb/browser/ui/shell.mjs'
text = read(path)
text = replace_once(
    text,
    """  ACTOR_ORDER,
  ACTORS,
  CLASS_REFERENCES,
  COPY,
  CUSTOMER_ZERO,
  PROJECT_LIBRARY_SEED,
""",
    """  ACTOR_DEMO_ACCOUNT_IDS,
  ACTOR_ORDER,
  ACTORS,
  CLASS_REFERENCES,
  COPY,
  CUSTOMER_ZERO,
  DEMO_ACCOUNTS,
  PROJECT_LIBRARY_SEED,
""",
    'shell account imports',
)

storage_pattern = re.compile(
    r"const DEMO_ACCOUNT_KEY = 'stb-demo-account-v1';.*?function readAnonymousContributions\(\) \{",
    re.S,
)
storage_replacement = """const DEMO_ACCOUNT_KEY = 'stb-demo-account-v1'; // legacy compatibility
const DEMO_ACCOUNTS_KEY = 'stb-demo-accounts-v1';
const DEMO_ACTIVE_ACCOUNT_KEY = 'stb-demo-active-account-v1';
const DEMO_LIBRARY_KEY = 'stb-demo-library-v1';
const DEMO_COMMERCE_KEY = 'stb-demo-commerce-v1';

function readStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizedAccount(account) {
  if (!account || typeof account.accountId !== 'string' || !account.accountId) return null;
  return {
    ...account,
    tags: Array.isArray(account.tags) ? [...account.tags] : [],
  };
}

function readAccountRegistry() {
  const merged = new Map();
  for (const account of DEMO_ACCOUNTS) {
    merged.set(account.accountId, normalizedAccount(account));
  }
  const stored = readStoredJson(DEMO_ACCOUNTS_KEY, []);
  if (Array.isArray(stored)) {
    for (const account of stored) {
      const normalized = normalizedAccount(account);
      if (normalized) merged.set(normalized.accountId, normalized);
    }
  }
  const legacy = normalizedAccount(readStoredJson(DEMO_ACCOUNT_KEY, null));
  if (legacy) merged.set(legacy.accountId, legacy);
  return [...merged.values()].sort((left, right) => {
    const leftNumber = Number(left.userNumber ?? Number.MAX_SAFE_INTEGER);
    const rightNumber = Number(right.userNumber ?? Number.MAX_SAFE_INTEGER);
    if (leftNumber !== rightNumber) return leftNumber - rightNumber;
    return String(left.name).localeCompare(String(right.name));
  });
}

function persistAccountRegistry(accounts) {
  writeStoredJson(DEMO_ACCOUNTS_KEY, accounts.map((account) => normalizedAccount(account)));
}

function readActiveAccount() {
  const activeId = localStorage.getItem(DEMO_ACTIVE_ACCOUNT_KEY)
    ?? readStoredJson(DEMO_ACCOUNT_KEY, null)?.accountId
    ?? null;
  return activeId ? readAccountRegistry().find((account) => account.accountId === activeId) ?? null : null;
}

function saveActiveAccount(account) {
  const normalized = normalizedAccount(account);
  if (!normalized) return null;
  const accounts = readAccountRegistry();
  const index = accounts.findIndex((entry) => entry.accountId === normalized.accountId);
  if (index >= 0) accounts[index] = normalized;
  else accounts.push(normalized);
  persistAccountRegistry(accounts);
  localStorage.setItem(DEMO_ACTIVE_ACCOUNT_KEY, normalized.accountId);
  writeStoredJson(DEMO_ACCOUNT_KEY, normalized);
  return normalized;
}

function chooseAccount(accountId) {
  const account = readAccountRegistry().find((entry) => entry.accountId === accountId) ?? null;
  return account ? saveActiveAccount(account) : null;
}

function clearActiveAccount() {
  localStorage.removeItem(DEMO_ACTIVE_ACCOUNT_KEY);
  localStorage.removeItem(DEMO_ACCOUNT_KEY);
}

function accountLabel(account) {
  const user = account.userNumber ? `USER ${account.userNumber} · ` : '';
  const tags = (account.tags ?? []).join(' / ');
  return `${user}${account.name}${tags ? ` · ${tags}` : ''}`;
}

function createLocalDemoAccount(root, actorId = null) {
  const field = (name) => root.querySelector(`[data-account-field="${name}"]`)?.value?.trim() ?? '';
  const name = field('name');
  const addressLine1 = field('addressLine1');
  const city = field('city');
  const region = field('region');
  if (!name || !addressLine1 || !city || !region) {
    return null;
  }
  const accounts = readAccountRegistry();
  const nextUserNumber = Math.max(0, ...accounts.map((account) => Number(account.userNumber ?? 0))) + 1;
  const tags = actorId === 'professional' ? ['PROFESSIONAL'] : ['INDIVIDUAL'];
  return saveActiveAccount({
    accountId: `ACCT-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    fixture: false,
    demonstration: true,
    userNumber: nextUserNumber,
    label: `USER ${nextUserNumber}`,
    name,
    addressLine1,
    city,
    region,
    country: 'US',
    email: field('email') || null,
    tags,
    createdThroughActor: actorId,
  });
}

function readAnonymousContributions() {"""
text, count = storage_pattern.subn(storage_replacement, text, count=1)
if count != 1:
    raise SystemExit(f'shell storage block: expected 1 match, found {count}')

utility_pattern = re.compile(r"function utilityNav\(current\) \{.*?\n\}\n\nfunction libraryWorkstreamLine", re.S)
utility_replacement = """function accountSwitcher() {
  const accounts = readAccountRegistry();
  const active = readActiveAccount();
  return el('label', { className: 'account-switcher' }, [
    el('span', { className: 'hint', text: COPY.activeAccount }),
    el('select', {
      attrs: {
        'data-account-switcher': 'true',
        'aria-label': COPY.activeAccount,
      },
    }, [
      el('option', { attrs: { value: '' }, text: 'NO ACTIVE ACCOUNT' }),
      ...accounts.map((account) => el('option', {
        attrs: {
          value: account.accountId,
          ...(active?.accountId === account.accountId ? { selected: 'selected' } : {}),
        },
        text: accountLabel(account),
      })),
    ]),
  ]);
}

function utilityNav(current) {
  const items = [
    { id: 'home', label: COPY.home, href: ROUTES.landing },
    { id: 'begin', label: COPY.myProjects, href: ROUTES.begin },
    { id: 'account', label: COPY.account, href: ROUTES.account },
  ];
  return el('nav', { className: 'utility-nav', attrs: { 'aria-label': 'Home and account' } }, [
    ...items.map((item) => el('a', {
      className: current === item.id ? 'nav-current' : 'nav-link',
      attrs: {
        href: item.href,
        'data-utility-nav': item.id,
        ...(current === item.id ? { 'aria-current': 'page' } : {}),
      },
      text: item.label,
    })),
    accountSwitcher(),
  ]);
}

function libraryWorkstreamLine"""
text, count = utility_pattern.subn(utility_replacement, text, count=1)
if count != 1:
    raise SystemExit(f'shell utility nav: expected 1 match, found {count}')

# Show account tags on account screen.
text = replace_once(
    text,
    """        el('p', { text: `${account.city}, ${account.region}` }),
        account.email ? el('p', { text: account.email }) : null,
""",
    """        el('p', { text: `${account.city}, ${account.region}` }),
        el('p', { attrs: { 'data-account-tags': 'true' }, text: `${COPY.accountTags}: ${(account.tags ?? []).join(' / ') || 'NONE'}` }),
        account.email ? el('p', { text: account.email }) : null,
""",
    'shell account tags',
)

orientation_pattern = re.compile(r"function orientationScreen\(actor\) \{.*?\n\}\n\nfunction primaryNav", re.S)
orientation_replacement = """function orientationScreen(actor) {
  const accounts = readAccountRegistry();
  const active = readActiveAccount();
  const suggestedId = active?.accountId ?? ACTOR_DEMO_ACCOUNT_IDS[actor.id] ?? accounts[0]?.accountId ?? '';
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
      utilityNav(null),
      el('p', { className: 'orientation-actor', text: actor.label }),
      heading(actor.heading),
      actor.body ? el('p', { className: 'orientation-body', text: actor.body }) : null,
      el('section', { className: 'account-form orientation-account', attrs: { 'data-orientation-account-form': 'true' } }, [
        el('h2', { text: COPY.accountChooserHeading }),
        el('p', { className: 'hint', text: COPY.accountChooserIntro }),
        el('label', {}, [
          el('span', { text: COPY.accountChooserLabel }),
          el('select', { attrs: { 'data-orientation-account': 'true', 'aria-label': COPY.accountChooserLabel } }, [
            ...accounts.map((account) => el('option', {
              attrs: {
                value: account.accountId,
                ...(suggestedId === account.accountId ? { selected: 'selected' } : {}),
              },
              text: accountLabel(account),
            })),
          ]),
        ]),
        el('h2', { text: COPY.accountAddUser }),
        ...[
          ['name', COPY.accountName],
          ['addressLine1', COPY.accountAddress],
          ['city', COPY.accountCity],
          ['region', COPY.accountRegion],
          ['email', COPY.accountEmail],
        ].map(([name, label]) => el('label', {}, [
          el('span', { text: label }),
          el('input', { attrs: { type: name === 'email' ? 'email' : 'text', 'data-account-field': name } }),
        ])),
        el('button', { attrs: { type: 'button', 'data-action': 'create-demo-account' }, text: COPY.accountAddUser }),
      ]),
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

function primaryNav"""
text, count = orientation_pattern.subn(orientation_replacement, text, count=1)
if count != 1:
    raise SystemExit(f'shell orientation screen: expected 1 match, found {count}')

# Begin is account-scoped. No active account means only ownerless local drafts.
text = replace_once(
    text,
    """  } else if (screen.name === 'begin') {
    const saved = await listSavedProjects();
""",
    """  } else if (screen.name === 'begin') {
    const activeAccount = readActiveAccount();
    const saved = await listSavedProjects(activeAccount?.accountId ?? null);
""",
    'shell begin account scope',
)

# Direct project routes are also account-scoped.
text = replace_once(
    text,
    """  } else if (screen.name === 'project') {
    const project = screen.localRecordId ? await projectIndex(screen.localRecordId) : null;
    if (seq !== renderSeq) {
      return;
    }
    if (!project) {
""",
    """  } else if (screen.name === 'project') {
    const candidateProject = screen.localRecordId ? await projectIndex(screen.localRecordId) : null;
    const activeAccountId = readActiveAccount()?.accountId ?? null;
    const project = candidateProject && (candidateProject.ownerAccountId ?? null) === activeAccountId
      ? candidateProject
      : null;
    if (seq !== renderSeq) {
      return;
    }
    if (!project) {
""",
    'shell direct project account scope',
)

# New projects inherit private owner metadata from the active account only.
text = replace_once(
    text,
    """      createdAt: new Date().toISOString(),
      actorId: readViewSession().actorId,
    });
""",
    """      createdAt: new Date().toISOString(),
      actorId: readViewSession().actorId,
      ownerAccountId: readActiveAccount()?.accountId ?? null,
    });
""",
    'shell create owner metadata',
)

# Global account switching changes the private project view and clears stale current-project selection.
text = replace_once(
    text,
    """  root.addEventListener('change', async (event) => {
    const archive = event.target.closest('[data-archive-input]');
""",
    """  root.addEventListener('change', async (event) => {
    const switcher = event.target.closest('[data-account-switcher]');
    if (switcher) {
      const accountId = switcher.value;
      if (accountId) chooseAccount(accountId);
      else clearActiveAccount();
      setCurrentProject(null);
      navigate(ROUTES.begin);
      return;
    }
    const archive = event.target.closest('[data-archive-input]');
""",
    'shell account switch change handler',
)

# NEXT now activates the selected account before entering My Projects.
text = replace_once(
    text,
    """    if (action === 'next') {
      navigate(ROUTES.begin);
      return;
    }
""",
    """    if (action === 'next') {
      const selectedId = root.querySelector('[data-orientation-account]')?.value ?? readActiveAccount()?.accountId ?? null;
      if (!selectedId || !chooseAccount(selectedId)) {
        return;
      }
      setCurrentProject(null);
      navigate(ROUTES.begin);
      return;
    }
""",
    'shell orientation account activation',
)

# ADD A NEW USER works through any of the three doors; account-page add remains in place.
text = replace_once(
    text,
    """    if (action === 'create-demo-account') {
      createLocalDemoAccount(root);
      render();
      return;
    }
    if (action === 'clear-demo-account') {
      localStorage.removeItem(DEMO_ACCOUNT_KEY);
      render();
      return;
    }
""",
    """    if (action === 'create-demo-account') {
      const screen = screenFromLocation(window.location);
      const account = createLocalDemoAccount(root, screen.actor?.id ?? null);
      if (account && screen.name === 'orientation') {
        setCurrentProject(null);
        navigate(ROUTES.begin);
        return;
      }
      render();
      return;
    }
    if (action === 'clear-demo-account') {
      clearActiveAccount();
      setCurrentProject(null);
      render();
      return;
    }
""",
    'shell account creation and clear',
)
write(path, text)

# ---------------------------------------------------------------------------
# unit contract: prove first three fixtures and door suggestions are explicit
# ---------------------------------------------------------------------------
path = 'apps/stb/test/unit/account-commerce.test.mjs'
text = read(path)
text = replace_once(
    text,
    """  CUSTOMER_ZERO,
  PROJECT_LIBRARY_SEED,
""",
    """  ACTOR_DEMO_ACCOUNT_IDS,
  CUSTOMER_ZERO,
  DEMO_ACCOUNTS,
  PROJECT_LIBRARY_SEED,
""",
    'account unit imports',
)
text = replace_once(
    text,
    """test('Customer Zero is an explicit synthetic account fixture', () => {
  assert.equal(CUSTOMER_ZERO.fixture, true);
  assert.equal(CUSTOMER_ZERO.name, 'Sarah Smith');
  assert.equal(CUSTOMER_ZERO.addressLine1, '123 Alcove Lane');
  assert.equal(CUSTOMER_ZERO.city, 'Greensboro');
  assert.equal(CUSTOMER_ZERO.region, 'NC');
});
""",
    """test('Customer Zero is User 1 and three synthetic account fixtures seed all three doors', () => {
  assert.equal(DEMO_ACCOUNTS.length, 3);
  assert.equal(CUSTOMER_ZERO, DEMO_ACCOUNTS[0]);
  assert.equal(CUSTOMER_ZERO.fixture, true);
  assert.equal(CUSTOMER_ZERO.name, 'Sarah Smith');
  assert.equal(CUSTOMER_ZERO.addressLine1, '123 Alcove Lane');
  assert.equal(CUSTOMER_ZERO.city, 'Greensboro');
  assert.equal(CUSTOMER_ZERO.region, 'NC');
  assert.deepEqual([...CUSTOMER_ZERO.tags], ['INDIVIDUAL']);
  assert.deepEqual(ACTOR_DEMO_ACCOUNT_IDS, {
    new: 'ACCT-000001',
    returning: 'ACCT-000002',
    professional: 'ACCT-000003',
  });
  assert.deepEqual([...DEMO_ACCOUNTS[2].tags], ['PROFESSIONAL', 'CONTRACTOR']);
});
""",
    'account unit fixtures',
)
write(path, text)

# ---------------------------------------------------------------------------
# browser proof: 3 seeded users through 3 doors + User 4 created through a door,
# with strict project isolation and one shared anonymous library.
# ---------------------------------------------------------------------------
path = 'apps/stb/test/browser/multi-account.spec.mjs'
write(path, """import { expect, test } from '@playwright/test';

import { ACTORS, COPY, DEMO_ACCOUNTS } from '../../shared/contracts.mjs';

async function enterThrough(page, actorId, accountId) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS[actorId].label }).click();
  const picker = page.locator('[data-orientation-account]');
  await expect(picker).toBeVisible();
  await picker.selectOption(accountId);
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  await expect(page.locator('[data-account-switcher]')).toHaveValue(accountId);
}

async function createOwnProject(page) {
  await page.getByRole('button', { name: COPY.startOwn }).click();
  const workstreams = page.locator('main[data-screen="workstreams"]');
  await expect(workstreams).toBeVisible();
  const localRecordId = await workstreams.getAttribute('data-local-record-id');
  expect(localRecordId).toBeTruthy();
  await page.getByRole('button', { name: COPY.backToProjects }).click();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  return localRecordId;
}

async function expectOnlyProject(page, localRecordId) {
  const rows = page.locator('[data-project-list] [data-action="resume-project"]');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toHaveAttribute('data-local-record-id', localRecordId);
}

async function ownersByLocalRecord(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('stb-app-v1');
    const database = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = database.transaction('projects', 'readonly');
    const getAll = tx.objectStore('projects').getAll();
    const projects = await new Promise((resolve, reject) => {
      getAll.onsuccess = () => resolve(getAll.result ?? []);
      getAll.onerror = () => reject(getAll.error);
    });
    database.close();
    return Object.fromEntries(projects.map((project) => [project.localRecordId, project.ownerAccountId ?? null]));
  });
}

test('four users exercise all three doors while My Projects stays account-scoped', async ({ page }) => {
  const [user1, user2, user3] = DEMO_ACCOUNTS;

  await enterThrough(page, 'new', user1.accountId);
  const user1Project = await createOwnProject(page);
  await expectOnlyProject(page, user1Project);

  await enterThrough(page, 'returning', user2.accountId);
  await expect(page.locator('[data-empty-saved="true"]')).toBeVisible();
  const user2Project = await createOwnProject(page);
  await expectOnlyProject(page, user2Project);

  await enterThrough(page, 'professional', user3.accountId);
  await expect(page.locator('[data-empty-saved="true"]')).toBeVisible();
  const user3Project = await createOwnProject(page);
  await expectOnlyProject(page, user3Project);

  // User 4 proves account creation is available through an existing door rather than a fourth door.
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.returning.label }).click();
  await page.locator('[data-account-field="name"]').fill('Jordan Lee');
  await page.locator('[data-account-field="addressLine1"]').fill('321 Fourth Street');
  await page.locator('[data-account-field="city"]').fill('Greensboro');
  await page.locator('[data-account-field="region"]').fill('NC');
  await page.getByRole('button', { name: COPY.accountAddUser }).click();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  const user4AccountId = await page.locator('[data-account-switcher]').inputValue();
  expect(user4AccountId).toMatch(/^ACCT-DEMO-/);
  await expect(page.locator('[data-empty-saved="true"]')).toBeVisible();
  const user4Project = await createOwnProject(page);
  await expectOnlyProject(page, user4Project);

  const expected = [
    [user1.accountId, user1Project],
    [user2.accountId, user2Project],
    [user3.accountId, user3Project],
    [user4AccountId, user4Project],
  ];
  for (const [accountId, projectId] of expected) {
    await page.locator('[data-account-switcher]').selectOption(accountId);
    await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
    await expectOnlyProject(page, projectId);
  }

  const owners = await ownersByLocalRecord(page);
  expect(owners[user1Project]).toBe(user1.accountId);
  expect(owners[user2Project]).toBe(user2.accountId);
  expect(owners[user3Project]).toBe(user3.accountId);
  expect(owners[user4Project]).toBe(user4AccountId);

  await page.locator('[data-utility-nav="home"]').click();
  const library = page.locator('[data-project-library="true"]');
  await expect(library).toBeVisible();
  await expect(library).toContainText('Alcove shelf blanks');
  await expect(library).not.toContainText('Sarah Smith');
  await expect(library).not.toContainText('Marcus Reed');
  await expect(library).not.toContainText('Elena Torres');
  await expect(library).not.toContainText('Jordan Lee');
});


test('door choice does not become account identity or change an owned project', async ({ page }) => {
  const user1 = DEMO_ACCOUNTS[0];
  await enterThrough(page, 'new', user1.accountId);
  const projectId = await createOwnProject(page);

  for (const actorId of ['returning', 'professional', 'new']) {
    await enterThrough(page, actorId, user1.accountId);
    await expectOnlyProject(page, projectId);
  }
});
""")

print('multi-account project ownership patch applied')
