import {
  ACTOR_DEMO_ACCOUNT_IDS,
  ACTOR_ORDER,
  ACTORS,
  CLASS_REFERENCES,
  COPY,
  CUSTOMER_ZERO,
  DEMO_ACCOUNTS,
  PROJECT_LIBRARY_SEED,
  PRIMARY_PAGES,
  PROJECT_SCOPED_PAGES,
  ROUTES,
  projectHref,
  screenFromLocation,
} from '/shared/contracts.mjs';
import { createProject } from '/domain/candidate.mjs';
import { destinationView, projectWorkView } from '/domain/classes.mjs';
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
  blobCustody,
  currentCandidate,
  currentProjection,
  listProjectEvidence,
  listProjectObservations,
  listSavedProjects,
  projectIndex,
} from '/data/selectors.mjs';
import { page1Main, page2Main, page5Main, projectMissingMain, projectWorkstreamsMain } from '/ui/panels.mjs';
import { page6Main, page7Main, applyUnappliedReviewLock } from '/ui/review-panel.mjs';
import { page8Main } from '/ui/record-panel.mjs';
import { renderSourceView } from '/ui/source-viewer.mjs';
import { loadStoreHistory, loadStorePresentation } from '/data/store-view.mjs';
import { loadReviewPresentation } from '/data/review-view.mjs';
import { loadRecordPresentation } from '/data/record-view.mjs';
import {
  recoverStoreOnOpen,
  retryCurrentStore,
  scheduleBoardStoreQuestion,
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

const DEMO_ACCOUNT_KEY = 'stb-demo-account-v1'; // legacy compatibility
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

function accountSwitcher() {
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
        el('p', { attrs: { 'data-account-tags': 'true' }, text: `${COPY.accountTags}: ${(account.tags ?? []).join(' / ') || 'NONE'}` }),
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

function orientationScreen(actor) {
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
    [utilityNav(screenName === 'begin' ? 'begin' : screenName === 'account' ? 'account' : null), primaryNav({ ...navContext, screenName }), inner],
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
let startProjectOpen = false;
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
    startProjectOpen = false;
    pendingSwitch = null;
    content = landingScreen();
  } else if (screen.name === 'orientation' && screen.actor) {
    content = orientationScreen(screen.actor);
  } else if (screen.name === 'account') {
    content = wrapShell(actor, accountScreen(), 'account');
  } else if (screen.name === 'begin') {
    const activeAccount = readActiveAccount();
    const saved = await listSavedProjects(activeAccount?.accountId ?? null);
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
        startProjectOpen,
        pendingSwitch,
        pendingCollision,
        importStatus,
      }),
      'begin',
      { project: current, view: null },
    );
  } else if (screen.name === 'project') {
    const candidateProject = screen.localRecordId ? await projectIndex(screen.localRecordId) : null;
    const activeAccountId = readActiveAccount()?.accountId ?? null;
    const project = candidateProject && (candidateProject.ownerAccountId ?? null) === activeAccountId
      ? candidateProject
      : null;
    if (seq !== renderSeq) {
      return;
    }
    if (!project) {
      content = wrapShell(actor, projectMissingMain(), 'begin');
    } else if (screen.view === 'hub') {
      content = wrapShell(
        actor,
        projectWorkstreamsMain({ project }),
        'hub',
        { project, view: 'hub' },
      );
    } else {
      await recoverStoreOnOpen(project.localRecordId);
      if (seq !== renderSeq) {
        return;
      }
      let scheduled = { status: 'skipped' };
      try {
        scheduled = await scheduleBoardStoreQuestion(project.localRecordId, {
          unapplied: boardDirty,
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
        unapplied: boardDirty,
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
        unapplied: boardDirty,
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
      } else {
        content = wrapShell(
          actor,
          page2Main({
            project,
            actor,
            view: screen.view,
            child: screen.child,
            workstream: screen.workstream,
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
      : screen.name === 'project' && screen.view === 'hub'
        ? `${COPY.workstreamsHeading} — Scan-to-Build`
      : screen.name === 'project' && screen.view === 'store'
        ? `${COPY.storeAskHeading} — Scan-to-Build`
        : screen.name === 'project' && screen.view === 'confirm'
          ? `${COPY.reviewHeading} — Scan-to-Build`
          : screen.name === 'project' && screen.view === 'result'
            ? `${COPY.resultHeading} — Scan-to-Build`
            : screen.name === 'project' && screen.view === 'record'
              ? `${COPY.recordHeading} — Scan-to-Build`
            : screen.name === 'project' && screen.view === 'order'
              ? `${COPY.orderHeading} — Scan-to-Build`
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
      ownerAccountId: readActiveAccount()?.accountId ?? null,
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
      const selectedId = root.querySelector('[data-orientation-account]')?.value ?? readActiveAccount()?.accountId ?? null;
      if (!selectedId || !chooseAccount(selectedId)) {
        return;
      }
      setCurrentProject(null);
      navigate(ROUTES.begin);
      return;
    }
    if (action === 'toggle-start-project') {
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
    if (action === 'open-workstream') {
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
        unapplied: boardDirty,
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
    if (action === 'use-customer-zero') {
      saveActiveAccount({ ...CUSTOMER_ZERO });
      render();
      return;
    }
    if (action === 'create-demo-account') {
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
