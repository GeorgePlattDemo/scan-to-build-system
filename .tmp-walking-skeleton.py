from pathlib import Path

ROOT = Path('apps/stb')

def read(rel):
    return (ROOT / rel).read_text()

def write(rel, text):
    (ROOT / rel).write_text(text)

def replace_once(text, old, new, label):
    n = text.count(old)
    assert n == 1, f'{label}: expected 1, found {n}'
    return text.replace(old, new, 1)

# ---------------------------------------------------------------------------
# Shared contract: anonymous library, account seam, and order/payment gate.
# ---------------------------------------------------------------------------
p = 'shared/contracts.mjs'
s = read(p)
s = replace_once(
    s,
    "  begin: '/begin',\n  project: '/project',",
    "  begin: '/begin',\n  account: '/account',\n  project: '/project',",
    'account route',
)
s = replace_once(
    s,
    "export function workstreamsForClass(classId) {\n  return [...(PROJECT_WORKSTREAMS[classId] ?? [])];\n}\n\nexport const COPY",
    """export function workstreamsForClass(classId) {
  return [...(PROJECT_WORKSTREAMS[classId] ?? [])];
}

export const CUSTOMER_ZERO = Object.freeze({
  accountId: 'ACCT-000001',
  fixture: true,
  label: 'CUSTOMER ZERO',
  name: 'Sarah Smith',
  addressLine1: '123 Alcove Lane',
  city: 'Greensboro',
  region: 'NC',
  country: 'US',
});

export const PROJECT_LIBRARY_SEED = Object.freeze([
  Object.freeze({
    libraryId: 'LIB-ALCOVE-001',
    label: 'Alcove shelf blanks',
    classId: 'alcove-shelf-blanks',
    workstreams: Object.freeze(['dimensional']),
    source: 'CUSTOMER_ZERO_ANONYMIZED',
  }),
]);

export const COPY""",
    'customer zero and anonymous seed',
)
s = replace_once(s, "  beginHeading: 'Projects',", "  beginHeading: 'My Projects',", 'my projects heading')
s = replace_once(s, "  referenceDemonstration:\n    'Reference demonstration. Ordering, physical fabrication, and pickup notifications are not available in this build.',", "  referenceDemonstration:\n    'Reference demonstration. Account, order and payment screens are synthetic. No real charge, fabrication or pickup occurs in this build.',", 'reference demo copy')
s = replace_once(
    s,
    "  backToProjects: 'Back to projects',\n  backToWorkstreams: 'Back to workstreams',",
    """  backToProjects: 'Back to projects',
  backToWorkstreams: 'Back to workstreams',
  home: 'HOME',
  myProjects: 'MY PROJECTS',
  account: 'ACCOUNT',
  projectLibraryHeading: 'PROJECT LIBRARY',
  projectLibraryIntro: 'Reusable bounded projects. Library copies do not carry customer or contractor identity.',
  anonymousLibrarySource: 'Anonymous reusable project',
  accountHeading: 'Account',
  accountBrowse: 'You can browse and configure without an account. An account is required to continue to an order.',
  accountDemoOnly: 'Demonstration account layer. No live authentication or payment credentials are stored in this build.',
  useCustomerZero: 'USE CUSTOMER ZERO',
  addAccountHeading: 'Add an account',
  addAccount: 'ADD ACCOUNT',
  clearAccount: 'SIGN OUT OF DEMONSTRATION ACCOUNT',
  accountName: 'Name',
  accountAddress: 'Street address',
  accountCity: 'City',
  accountRegion: 'State / region',
  accountEmail: 'Email (optional)',
  libraryContributionHeading: 'Project library',
  libraryContributionBody: 'Optional. Add an anonymous reusable copy of this project to the library. Account, customer, contractor and address information are excluded.',
  addAnonymousLibrary: 'ADD ANONYMOUS COPY TO LIBRARY',
  keepPrivate: 'KEEP PRIVATE',
  libraryAdded: 'Anonymous project added to the local demonstration library.',
  libraryPrivate: 'Project kept out of the library.',
  continueToOrder: 'CONTINUE TO ORDER',
  orderHeading: 'Order and payment',
  orderDemoOnly: 'Demonstration commerce seam. No real charge is made.',
  orderNeedsReview: 'A current project review is required before an order can be created.',
  orderNeedsAccount: 'An account is required to continue to an order.',
  continueToPayment: 'CONTINUE TO PAYMENT',
  paymentZeroHeading: 'PAYMENT ZERO',
  paymentRule: 'PAYMENT IN FULL REQUIRED BEFORE PRODUCTION RELEASE.',
  paymentReceived: 'PAYMENT RECEIVED',
  fundsAvailable: 'FUNDS AVAILABLE',
  releasePermitted: 'RELEASE TO QUEUE PERMITTED',
  releasedToQueue: 'RELEASED TO QUEUE',
  receivePaymentInFull: 'RECEIVE PAYMENT IN FULL',
  markFundsAvailable: 'MARK FUNDS AVAILABLE',
  releaseToQueue: 'RELEASE TO QUEUE',
  settlementNote: 'After funds are available, settlement may separate the declared platform fee and performing yard proceeds.',
  queueBoundary: 'Queue release does not establish machine readiness and does not start a machine. Local Cycle Start remains separate.',""",
    'account library payment copy',
)
s = replace_once(
    s,
    "Object.freeze({ id: 'begin', label: 'Projects', route: ROUTES.begin, implemented: true }),",
    "Object.freeze({ id: 'begin', label: 'My Projects', route: ROUTES.begin, implemented: true }),",
    'primary my projects label',
)
s = replace_once(
    s,
    "export const PROJECT_VIEWS = Object.freeze(['hub', 'workspace', 'questions', 'store', 'confirm', 'result', 'record']);",
    "export const PROJECT_VIEWS = Object.freeze(['hub', 'workspace', 'questions', 'store', 'confirm', 'order', 'result', 'record']);",
    'order project view',
)
s = replace_once(s, "  '/begin': HTML,\n  '/project': HTML,", "  '/begin': HTML,\n  '/account': HTML,\n  '/project': HTML,", 'account static route')
s = replace_once(
    s,
    "  if (path === ROUTES.begin) {\n    return { name: 'begin', actor: null };\n  }",
    "  if (path === ROUTES.account) {\n    return { name: 'account', actor: null };\n  }\n  if (path === ROUTES.begin) {\n    return { name: 'begin', actor: null };\n  }",
    'account screen route',
)
write(p, s)

# ---------------------------------------------------------------------------
# Record page: explicit opt-in anonymous contribution. Default remains private.
# ---------------------------------------------------------------------------
p = 'browser/ui/record-panel.mjs'
s = read(p)
anchor = "      el('div', { className: 'actions record-actions' }, ["
contribution = """      el(
        'section',
        { className: 'record-section', attrs: { 'data-library-contribution': 'true' } },
        [
          el('h2', { text: COPY.libraryContributionHeading }),
          el('p', { className: 'hint', text: COPY.libraryContributionBody }),
          el('div', { className: 'actions' }, [
            el('button', {
              attrs: { type: 'button', 'data-action': 'contribute-library' },
              text: COPY.addAnonymousLibrary,
            }),
            el('button', {
              attrs: { type: 'button', 'data-action': 'keep-library-private' },
              text: COPY.keepPrivate,
            }),
          ]),
        ],
      ),
"""
assert s.count(anchor) == 1
s = s.replace(anchor, contribution + anchor, 1)
write(p, s)

# ---------------------------------------------------------------------------
# Result page: a current review can continue to the separate commerce seam.
# ---------------------------------------------------------------------------
p = 'browser/ui/review-panel.mjs'
s = read(p)
old = """      el('div', { className: 'actions' }, [
        el('button', {
          attrs: { type: 'button', 'data-action': 'open-confirm' },
          text: COPY.reviewOpenPage,
        }),"""
new = """      el('div', { className: 'actions' }, [
        current
          ? el('button', {
              attrs: { type: 'button', 'data-action': 'open-order' },
              text: COPY.continueToOrder,
            })
          : null,
        el('button', {
          attrs: { type: 'button', 'data-action': 'open-confirm' },
          text: COPY.reviewOpenPage,
        }),"""
s = replace_once(s, old, new, 'result order action')
write(p, s)

# ---------------------------------------------------------------------------
# Shell: utility navigation, anonymous library, demo account, and Payment Zero.
# ---------------------------------------------------------------------------
p = 'browser/ui/shell.mjs'
s = read(p)
s = replace_once(
    s,
    "  ACTORS,\n  COPY,",
    "  ACTORS,\n  CLASS_REFERENCES,\n  COPY,\n  CUSTOMER_ZERO,\n  PROJECT_LIBRARY_SEED,",
    'shell fixture imports',
)

# Insert storage and rendering helpers after heading().
marker = "function landingScreen() {"
idx = s.index(marker)
helpers = r'''const DEMO_ACCOUNT_KEY = 'stb-demo-account-v1';
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

function readActiveAccount() {
  const account = readStoredJson(DEMO_ACCOUNT_KEY, null);
  return account && account.accountId ? account : null;
}

function saveActiveAccount(account) {
  writeStoredJson(DEMO_ACCOUNT_KEY, account);
  return account;
}

function createLocalDemoAccount(root) {
  const field = (name) => root.querySelector(`[data-account-field="${name}"]`)?.value?.trim() ?? '';
  const name = field('name');
  const addressLine1 = field('addressLine1');
  const city = field('city');
  const region = field('region');
  if (!name || !addressLine1 || !city || !region) {
    return null;
  }
  return saveActiveAccount({
    accountId: `ACCT-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    fixture: false,
    demonstration: true,
    name,
    addressLine1,
    city,
    region,
    country: 'US',
    email: field('email') || null,
  });
}

function readAnonymousContributions() {
  const entries = readStoredJson(DEMO_LIBRARY_KEY, []);
  return Array.isArray(entries) ? entries : [];
}

function anonymousLibraryEntries() {
  return [...PROJECT_LIBRARY_SEED, ...readAnonymousContributions()];
}

function contributeAnonymousProject(project) {
  const reference = CLASS_REFERENCES.find((entry) => entry.classId === project.classId);
  const entry = {
    libraryId: `LIB-${crypto.randomUUID()}`,
    label: reference?.label ?? 'Anonymous project',
    classId: project.classId ?? null,
    workstreams: [...(project.workstreams ?? [])],
    source: 'ANONYMOUS_CONTRIBUTION',
  };
  const entries = readAnonymousContributions();
  entries.push(entry);
  writeStoredJson(DEMO_LIBRARY_KEY, entries);
  return entry;
}

function readCommerceMap() {
  const value = readStoredJson(DEMO_COMMERCE_KEY, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function readCommerce(localRecordId) {
  return readCommerceMap()[localRecordId] ?? null;
}

function writeCommerce(localRecordId, value) {
  const map = readCommerceMap();
  map[localRecordId] = value;
  writeStoredJson(DEMO_COMMERCE_KEY, map);
  return value;
}

function createDemoOrderState(project, account, currentReview) {
  return writeCommerce(project.localRecordId, {
    orderId: `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    projectId: project.projectId,
    accountId: account.accountId,
    reviewId: currentReview.id,
    demonstration: true,
    paymentTerm: 'PAYMENT_IN_FULL',
    paymentState: 'NOT_STARTED',
    fundsAvailable: false,
    queueRelease: 'BLOCKED',
    settlement: {
      platformFee: 'DECLARED_AT_ORDER',
      performingYard: 'REMAINDER_AFTER_DECLARED_FEES',
    },
  });
}

function updateCommerce(localRecordId, mutator) {
  const current = readCommerce(localRecordId);
  if (!current) return null;
  const next = mutator({ ...current });
  return next ? writeCommerce(localRecordId, next) : current;
}

function utilityNav(current) {
  const items = [
    { id: 'home', label: COPY.home, href: ROUTES.landing },
    { id: 'begin', label: COPY.myProjects, href: ROUTES.begin },
    { id: 'account', label: COPY.account, href: ROUTES.account },
  ];
  return el('nav', { className: 'utility-nav', attrs: { 'aria-label': 'Home and account' } },
    items.map((item) => el('a', {
      className: current === item.id ? 'nav-current' : 'nav-link',
      attrs: {
        href: item.href,
        'data-utility-nav': item.id,
        ...(current === item.id ? { 'aria-current': 'page' } : {}),
      },
      text: item.label,
    })),
  );
}

function libraryWorkstreamLine(entry) {
  const streams = new Set(entry.workstreams ?? []);
  return `D ${streams.has('dimensional') ? '✓' : '—'} · S ${streams.has('sheet') ? '✓' : '—'}`;
}

function anonymousLibrarySection() {
  const entries = anonymousLibraryEntries();
  return el('section', { className: 'project-library', attrs: { 'data-project-library': 'true' } }, [
    el('h2', { text: COPY.projectLibraryHeading }),
    el('p', { className: 'hint', text: COPY.projectLibraryIntro }),
    ...entries.map((entry) => el('article', {
      className: 'library-project',
      attrs: {
        'data-library-id': entry.libraryId,
        'data-library-class': entry.classId ?? '',
        'data-library-source': entry.source,
      },
    }, [
      el('strong', { text: entry.label }),
      el('span', { className: 'library-streams', text: libraryWorkstreamLine(entry) }),
      el('span', { className: 'hint', text: COPY.anonymousLibrarySource }),
    ])),
  ]);
}

function accountScreen() {
  const account = readActiveAccount();
  const accountBody = account
    ? [
        el('p', { className: 'account-state', attrs: { 'data-account-id': account.accountId }, text: `${account.name} · ${account.accountId}` }),
        el('p', { text: account.addressLine1 }),
        el('p', { text: `${account.city}, ${account.region}` }),
        account.email ? el('p', { text: account.email }) : null,
        account.fixture ? el('p', { className: 'hint', text: 'Synthetic Customer Zero fixture.' }) : null,
        el('button', { attrs: { type: 'button', 'data-action': 'clear-demo-account' }, text: COPY.clearAccount }),
      ]
    : [
        el('p', { text: COPY.accountBrowse }),
        el('button', { attrs: { type: 'button', 'data-action': 'use-customer-zero' }, text: COPY.useCustomerZero }),
        el('section', { className: 'account-form', attrs: { 'data-account-form': 'true' } }, [
          el('h2', { text: COPY.addAccountHeading }),
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
          el('button', { attrs: { type: 'button', 'data-action': 'create-demo-account' }, text: COPY.addAccount }),
        ]),
      ];
  return el('main', { className: 'screen screen-account', attrs: { 'data-screen': 'account' } }, [
    heading(COPY.accountHeading),
    el('p', { className: 'hint', attrs: { 'data-account-demo-only': 'true' }, text: COPY.accountDemoOnly }),
    ...accountBody,
  ]);
}

function orderScreen({ project, presentation }) {
  const currentReview = presentation?.currentReview ?? null;
  const account = readActiveAccount();
  const stored = readCommerce(project.localRecordId);
  const commerce = stored && currentReview && stored.reviewId === currentReview.id ? stored : null;
  const state = commerce?.paymentState ?? 'NOT_STARTED';
  const canRelease = commerce?.fundsAvailable === true && commerce?.queueRelease !== 'RELEASED_TO_QUEUE';
  const released = commerce?.queueRelease === 'RELEASED_TO_QUEUE';
  return el('main', {
    className: 'screen screen-order',
    attrs: {
      'data-screen': 'order',
      'data-page': 'order',
      'data-local-record-id': project.localRecordId,
      'data-project-id': project.projectId,
      'data-account-present': String(Boolean(account)),
      'data-review-current': String(Boolean(currentReview)),
      'data-payment-state': state,
      'data-funds-available': String(commerce?.fundsAvailable === true),
      'data-queue-release': commerce?.queueRelease ?? 'BLOCKED',
    },
  }, [
    heading(COPY.orderHeading),
    el('p', { className: 'project-name', text: project.title ?? 'Untitled project' }),
    el('p', { className: 'hint', text: COPY.orderDemoOnly }),
    !currentReview ? el('p', { attrs: { 'data-order-block': 'review' }, text: COPY.orderNeedsReview }) : null,
    currentReview && !account
      ? el('section', { attrs: { 'data-order-block': 'account' } }, [
          el('p', { text: COPY.orderNeedsAccount }),
          el('a', { attrs: { href: ROUTES.account }, text: COPY.account }),
        ])
      : null,
    currentReview && account
      ? el('section', { className: 'order-account', attrs: { 'data-order-account': account.accountId } }, [
          el('h2', { text: 'Account' }),
          el('p', { text: `${account.name} · ${account.accountId}` }),
        ])
      : null,
    currentReview && account && !commerce
      ? el('button', { attrs: { type: 'button', 'data-action': 'create-demo-order' }, text: COPY.continueToPayment })
      : null,
    commerce
      ? el('section', { className: 'payment-zero', attrs: { 'data-payment-zero': commerce.orderId } }, [
          el('h2', { text: COPY.paymentZeroHeading }),
          el('p', { className: 'payment-rule', text: COPY.paymentRule }),
          el('p', { attrs: { 'data-order-id': commerce.orderId }, text: `Order ${commerce.orderId}` }),
          el('p', { attrs: { 'data-payment-state-line': state }, text: `Payment state: ${state.replaceAll('_', ' ')}` }),
          state === 'NOT_STARTED'
            ? el('button', { attrs: { type: 'button', 'data-action': 'receive-payment-in-full' }, text: COPY.receivePaymentInFull })
            : null,
          state === 'PAYMENT_RECEIVED'
            ? el('button', { attrs: { type: 'button', 'data-action': 'mark-funds-available' }, text: COPY.markFundsAvailable })
            : null,
          commerce.fundsAvailable === true
            ? el('p', { className: 'payment-cleared', attrs: { 'data-funds-status': 'available' }, text: COPY.fundsAvailable })
            : null,
          canRelease
            ? el('div', {}, [
                el('p', { attrs: { 'data-release-permitted': 'true' }, text: COPY.releasePermitted }),
                el('button', { attrs: { type: 'button', 'data-action': 'release-to-queue' }, text: COPY.releaseToQueue }),
              ])
            : null,
          released ? el('p', { attrs: { 'data-queue-released': 'true' }, text: COPY.releasedToQueue }) : null,
          el('p', { className: 'hint', text: COPY.settlementNote }),
          el('p', { className: 'hint', attrs: { 'data-machine-boundary': 'true' }, text: COPY.queueBoundary }),
        ])
      : null,
  ]);
}

'''
s = s[:idx] + helpers + s[idx:]

# Replace landing and orientation functions as bounded chunks.
start = s.index('function landingScreen() {')
end = s.index('\nfunction orientationScreen', start)
landing = r'''function landingScreen() {
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
      utilityNav('home'),
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
      anonymousLibrarySection(),
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
'''
s = s[:start] + landing + s[end:]
start = s.index('function orientationScreen(actor) {')
end = s.index('\nfunction primaryNav', start)
orientation = r'''function orientationScreen(actor) {
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
'''
s = s[:start] + orientation + s[end:]

# Common shell always exposes boring HOME / MY PROJECTS / ACCOUNT utility nav.
s = replace_once(
    s,
    "    [primaryNav({ ...navContext, screenName }), inner],",
    "    [utilityNav(screenName === 'begin' ? 'begin' : screenName === 'account' ? 'account' : null), primaryNav({ ...navContext, screenName }), inner],",
    'utility nav in shell',
)

# Account render branch.
s = replace_once(
    s,
    "  } else if (screen.name === 'orientation' && screen.actor) {\n    content = orientationScreen(screen.actor);\n  } else if (screen.name === 'begin') {",
    "  } else if (screen.name === 'orientation' && screen.actor) {\n    content = orientationScreen(screen.actor);\n  } else if (screen.name === 'account') {\n    content = wrapShell(actor, accountScreen(), 'account');\n  } else if (screen.name === 'begin') {",
    'account render branch',
)

# Order render branch after record.
old = """      } else if (screen.view === 'record') {
        const recordPresentation = await loadRecordPresentation(project.localRecordId, {
          unapplied: boardDirty,
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
      } else {"""
new = """      } else if (screen.view === 'record') {
        const recordPresentation = await loadRecordPresentation(project.localRecordId, {
          unapplied: boardDirty,
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
      } else if (screen.view === 'order') {
        content = wrapShell(
          actor,
          orderScreen({ project, presentation: reviewPresentation }),
          'order',
          navContext,
        );
      } else {"""
s = replace_once(s, old, new, 'order render branch')

# Order document title.
s = replace_once(
    s,
    "            : screen.name === 'project' && screen.view === 'record'\n              ? `${COPY.recordHeading} — Scan-to-Build`",
    "            : screen.name === 'project' && screen.view === 'record'\n              ? `${COPY.recordHeading} — Scan-to-Build`\n            : screen.name === 'project' && screen.view === 'order'\n              ? `${COPY.orderHeading} — Scan-to-Build`",
    'order document title',
)

# Insert account/library/order/payment actions before retry-store.
action_anchor = "    if (action === 'retry-store') {"
assert s.count(action_anchor) == 1
actions = r'''    if (action === 'use-customer-zero') {
      saveActiveAccount({ ...CUSTOMER_ZERO });
      render();
      return;
    }
    if (action === 'create-demo-account') {
      createLocalDemoAccount(root);
      render();
      return;
    }
    if (action === 'clear-demo-account') {
      localStorage.removeItem(DEMO_ACCOUNT_KEY);
      render();
      return;
    }
    if (action === 'contribute-library' || action === 'keep-library-private') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId) return;
      projectIndex(screen.localRecordId).then((project) => {
        if (!project) return;
        if (action === 'contribute-library') {
          contributeAnonymousProject(project);
          pageStatus = COPY.libraryAdded;
        } else {
          pageStatus = COPY.libraryPrivate;
        }
        render();
      });
      return;
    }
    if (action === 'open-order') {
      const screen = screenFromLocation(window.location);
      if (screen.localRecordId) navigate(projectHref(screen.localRecordId, 'order'));
      return;
    }
    if (action === 'create-demo-order') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId) return;
      Promise.all([
        projectIndex(screen.localRecordId),
        loadReviewPresentation(screen.localRecordId, { unapplied: boardDirty }),
      ]).then(([project, presentation]) => {
        const account = readActiveAccount();
        const review = presentation?.currentReview ?? null;
        if (project && account && review) {
          createDemoOrderState(project, account, review);
          render();
        }
      });
      return;
    }
    if (action === 'receive-payment-in-full') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId) return;
      updateCommerce(screen.localRecordId, (state) => {
        if (state.paymentState !== 'NOT_STARTED') return state;
        state.paymentState = 'PAYMENT_RECEIVED';
        return state;
      });
      render();
      return;
    }
    if (action === 'mark-funds-available') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId) return;
      updateCommerce(screen.localRecordId, (state) => {
        if (state.paymentState !== 'PAYMENT_RECEIVED') return state;
        state.paymentState = 'FUNDS_AVAILABLE';
        state.fundsAvailable = true;
        return state;
      });
      render();
      return;
    }
    if (action === 'release-to-queue') {
      const screen = screenFromLocation(window.location);
      if (!screen.localRecordId) return;
      updateCommerce(screen.localRecordId, (state) => {
        if (state.fundsAvailable !== true) return state;
        state.queueRelease = 'RELEASED_TO_QUEUE';
        return state;
      });
      render();
      return;
    }
'''
s = s.replace(action_anchor, actions + action_anchor, 1)
write(p, s)

# ---------------------------------------------------------------------------
# Small visual frame only; no redesign.
# ---------------------------------------------------------------------------
p = 'browser/styles.css'
s = read(p)
s += r'''

.utility-nav {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.project-library,
.payment-zero,
.order-account,
.account-form {
  border: 1px solid #cfd5db;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.library-project {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.35rem 1rem;
  padding: 0.7rem 0;
  border-top: 1px solid #e5e8eb;
}

.library-project:first-of-type {
  border-top: 0;
}

.library-project .hint {
  grid-column: 1 / -1;
}

.account-form label {
  display: grid;
  gap: 0.25rem;
  margin: 0.7rem 0;
}

.payment-rule {
  font-weight: 700;
}
'''
write(p, s)

# ---------------------------------------------------------------------------
# Compatibility crossings: old tests now intentionally cross the project gate.
# ---------------------------------------------------------------------------
for rel in [
    'test/browser/narrative.spec.mjs',
    'test/browser/open-door.spec.mjs',
    'test/browser/published-job-trial.spec.mjs',
]:
    p = rel
    t = read(p)
    t = t.replace("await expect(page.locator('[data-screen=\"hub\"]')).toBeVisible();", "await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();")
    if rel.endswith('open-door.spec.mjs'):
        t = t.replace("const screen = page.locator('[data-screen=\"hub\"]');", "const screen = page.locator('[data-screen=\"workspace\"]');")
    write(p, t)

# Static route tests know about /account but no new served JS surface is added.
p = 'test/unit/static-resolve.test.mjs'
s = read(p)
s = replace_once(
    s,
    "  assert.equal(resolveStaticAsset('/begin').relativePath, 'browser/index.html');\n  assert.equal(resolveStaticAsset('/project').relativePath, 'browser/index.html');",
    "  assert.equal(resolveStaticAsset('/begin').relativePath, 'browser/index.html');\n  assert.equal(resolveStaticAsset('/account').relativePath, 'browser/index.html');\n  assert.equal(resolveStaticAsset('/project').relativePath, 'browser/index.html');",
    'static account assertion',
)
s = replace_once(s, "    '/app.mjs',\n    '/begin',", "    '/account',\n    '/app.mjs',\n    '/begin',", 'static exact account')
write(p, s)

# New unit contract: Customer Zero can be PII; the anonymous library seed cannot.
p = 'test/unit/account-commerce.test.mjs'
write(p, """import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CUSTOMER_ZERO,
  PROJECT_LIBRARY_SEED,
  ROUTES,
  screenFromPath,
} from '../../shared/contracts.mjs';

test('Customer Zero is an explicit synthetic account fixture', () => {
  assert.equal(CUSTOMER_ZERO.fixture, true);
  assert.equal(CUSTOMER_ZERO.name, 'Sarah Smith');
  assert.equal(CUSTOMER_ZERO.addressLine1, '123 Alcove Lane');
  assert.equal(CUSTOMER_ZERO.city, 'Greensboro');
  assert.equal(CUSTOMER_ZERO.region, 'NC');
});

test('anonymous project library seed contains no Customer Zero identity', () => {
  const serialized = JSON.stringify(PROJECT_LIBRARY_SEED);
  assert.doesNotMatch(serialized, /Sarah Smith|123 Alcove Lane|ACCT-000001|Greensboro/i);
  assert.equal(PROJECT_LIBRARY_SEED[0].classId, 'alcove-shelf-blanks');
  assert.deepEqual([...PROJECT_LIBRARY_SEED[0].workstreams], ['dimensional']);
});

test('account is a separate global route, not a project view', () => {
  assert.equal(ROUTES.account, '/account');
  assert.equal(screenFromPath('/account').name, 'account');
});
""")

# Walking-skeleton browser proof: home -> account -> project -> Store/Review -> Payment Zero -> queue -> anonymous library.
p = 'test/browser/walking-skeleton.spec.mjs'
write(p, """import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';

const STORE_IDLE = { timeout: 20_000 };

async function waitForStoreIdle(page) {
  const panel = page.locator('[data-store-panel=\"compact\"]').first();
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('data-pending', 'true', STORE_IDLE);
}

test('Customer Zero walking skeleton keeps library anonymous and payment gates queue release', async ({ page }) => {
  await page.goto('/');

  const library = page.locator('[data-project-library=\"true\"]');
  await expect(library).toBeVisible();
  await expect(library).toContainText('Alcove shelf blanks');
  await expect(library).toContainText('D ✓');
  await expect(library).not.toContainText('Sarah Smith');
  await expect(library).not.toContainText('123 Alcove Lane');

  await page.locator('[data-utility-nav=\"account\"]').click();
  await expect(page.locator('[data-screen=\"account\"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.useCustomerZero }).click();
  await expect(page.locator('[data-account-id=\"ACCT-000001\"]')).toContainText('Sarah Smith');
  await expect(page.locator('[data-screen=\"account\"]')).toContainText('123 Alcove Lane');

  await page.locator('[data-utility-nav=\"home\"]').click();
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
  await page.getByRole('button', { name: 'PICK A BOARD', exact: true }).click();
  await page.locator('[data-field=\"board-length\"]').fill('45');
  await page.locator('[data-field=\"board-unit\"]').fill('in');
  await page.getByRole('button', { name: COPY.boardApply }).click();
  await waitForStoreIdle(page);
  await expect(page.locator('[data-store-panel=\"compact\"]').first()).toHaveAttribute('data-current', 'true', STORE_IDLE);

  await page.locator('[data-nav-page=\"confirm\"]').click();
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-screen=\"result\"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.continueToOrder }).click();
  await expect(page.locator('[data-screen=\"order\"]')).toBeVisible();
  await expect(page.locator('[data-order-account=\"ACCT-000001\"]')).toContainText('Sarah Smith');
  await expect(page.locator('[data-release-permitted=\"true\"]')).toHaveCount(0);

  await page.getByRole('button', { name: COPY.continueToPayment }).click();
  await expect(page.locator('[data-payment-zero]')).toContainText(COPY.paymentRule);
  await expect(page.locator('[data-release-permitted=\"true\"]')).toHaveCount(0);
  await page.getByRole('button', { name: COPY.receivePaymentInFull }).click();
  await expect(page.locator('[data-payment-state=\"PAYMENT_RECEIVED\"]')).toBeVisible();
  await expect(page.locator('[data-release-permitted=\"true\"]')).toHaveCount(0);
  await page.getByRole('button', { name: COPY.markFundsAvailable }).click();
  await expect(page.locator('[data-funds-status=\"available\"]')).toHaveText(COPY.fundsAvailable);
  await expect(page.locator('[data-release-permitted=\"true\"]')).toHaveText(COPY.releasePermitted);
  await page.getByRole('button', { name: COPY.releaseToQueue }).click();
  await expect(page.locator('[data-queue-released=\"true\"]')).toHaveText(COPY.releasedToQueue);
  await expect(page.locator('[data-machine-boundary=\"true\"]')).toContainText('does not start a machine');

  await page.locator('[data-nav-page=\"record\"]').click();
  await page.getByRole('button', { name: COPY.addAnonymousLibrary }).click();
  await expect(page.locator('[data-record-status=\"true\"]')).toHaveText(COPY.libraryAdded);
  await page.locator('[data-utility-nav=\"home\"]').click();
  const updated = page.locator('[data-project-library=\"true\"]');
  await expect(updated.locator('[data-library-source=\"ANONYMOUS_CONTRIBUTION\"]')).toBeVisible();
  await expect(updated).not.toContainText('Sarah Smith');
  await expect(updated).not.toContainText('123 Alcove Lane');
});
""")

print('walking skeleton patch applied')
