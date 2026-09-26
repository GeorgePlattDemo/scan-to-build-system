export const FIXED_ORIGIN = 'http://localhost:4317';
export const FIXED_HOST = 'localhost:4317';
export const FIXED_PORT = 4317;
export const LOOPBACK_ADDRESSES = Object.freeze(['127.0.0.1', '::1']);

export const DATABASE_NAME = 'stb-app-v1';
export const SCHEMA_VERSION = 1;
export const OBJECT_STORES = Object.freeze(['blobs', 'drafts', 'projects', 'records']);
export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
export const MAX_PROJECT_EVIDENCE_BYTES = 100 * 1024 * 1024;
export const MAX_ARCHIVE_RECORDS = 10_000;
export const MAX_ARCHIVE_RECORD_JSON_BYTES = 20 * 1024 * 1024;
export const MAX_ARCHIVE_SERIALIZED_BYTES = 160 * 1024 * 1024;

export const SOURCE_DISPLAY_TYPES = Object.freeze({
  'text/plain': 'text',
  'image/jpeg': 'image-jpeg',
  'image/png': 'image-png',
  'application/pdf': 'pdf',
});

export function classifyDisplayType(mime) {
  const normalized = String(mime ?? '')
    .toLowerCase()
    .split(';')[0]
    .trim();
  return SOURCE_DISPLAY_TYPES[normalized] ?? 'opaque';
}

export const ROUTES = Object.freeze({
  landing: '/',
  startNew: '/start/new',
  startReturning: '/start/returning',
  startProfessional: '/start/professional',
  begin: '/begin',
  project: '/project',
});

export const ACTORS = Object.freeze({
  new: Object.freeze({
    id: 'new',
    label: 'NEW USER',
    route: ROUTES.startNew,
    heading: 'Bring what you know.',
    body: 'We keep what you provide and show what remains unknown. Measurements stay tied to their source. Fit, load, and code suitability need appropriate evidence and qualified review where required.',
  }),
  returning: Object.freeze({
    id: 'returning',
    label: 'RETURNING USER',
    route: ROUTES.startReturning,
    heading: 'Open your saved project, inspect what changed, or begin another.',
    body: '',
  }),
  professional: Object.freeze({
    id: 'professional',
    label: 'PROFESSIONAL',
    route: ROUTES.startProfessional,
    heading: 'Bring your drawing, takeoff or dimensions.',
    body: 'We retain the source and show what can become a definition. A file does not authorize fabrication.',
  }),
});

export const ACTOR_ORDER = Object.freeze(['new', 'returning', 'professional']);

export const COPY = Object.freeze({
  title: 'SCAN TO BUILD',
  tagline: 'Your idea. Your measurements. Your parts.',
  sequence: Object.freeze([
    'YOU SCAN',
    'YOU DEFINE',
    'YOU SELECT',
    'YOU CONFIRM YOUR DEFINITION',
    'YOUR DEFINITION REACHES THE CUT',
    'WE CUT · MILL · DRILL · LABEL',
    'YOU BUILD.',
  ]),
  service:
    'WE CUT · MILL · DRILL · LABEL — Within stated limits. Staged for pickup. We tell you when YOUR parts are ready.',
  referenceDemonstration:
    'Reference demonstration. Ordering, physical fabrication, and pickup notifications are not available in this build.',
  howStarting: 'HOW ARE YOU STARTING?',
  next: 'NEXT',
  back: 'Back',
  beginHeading: 'Begin your project',
  invariant: 'NO BLOOD ON WOOD',
  notYetImplemented: 'Not yet implemented',
  chooseMapped: 'Choose a mapped project',
  mappedHint: 'The bounded questions are already prepared.',
  mappedStatus: 'Candidate/reference. Store path unresolved.',
  startOwn: 'START YOUR OWN PROJECT',
  ownHint: 'Bring what you already have.',
  resumeHeading: 'Resume saved project',
  emptySaved: 'No saved projects.',
  keepAndStart: 'Keep this project and start another',
  cancel: 'Cancel',
  hubHeading: 'Bring what you have',
  hubStatus: 'Bring what you have. We keep the source and show what this build can read.',
  questionsHeading: 'Project questions',
  questionsStatus: 'Enter the project details below. Unanswered Store and production questions remain visible.',
  switchPrompt: 'This project will be kept. Start another, or cancel.',
  page2Prompt: 'What information do you already have?',
  sourcePane: 'What you gave us',
  candidatePane: 'What we can use',
  needsPane: 'What still needs you',
  addEvidence: 'Add evidence',
  noSourceYet: 'No source attached yet.',
  candidateEmpty: 'Nothing derived yet. Sources are not parts.',
  needsEmpty: 'Nothing required beyond what you choose to add.',
  sourceNotCandidate: 'This is the original source. It has not become a proposed part definition.',
  viewingCreatesNoObservation: 'Viewing or selecting a source does not create an observation.',
  originalRetained: 'Original retained',
  sourceUnavailable: 'Original source unavailable',
  attachFile: 'Attach existing evidence',
  typedNeedLabel: 'What do you need?',
  typedNeedSubmit: 'Keep this original',
  boardStatus: 'Board definition is available for the bounded 24–60 in square-cut slice.',
  scanStatus: 'Capture not available in this build.',
  cadStatus: 'Structured extraction is not available.',
  opaqueKept: 'Original file kept. This build cannot interpret its contents.',
  pdfUnreadable: 'This PDF could not be displayed. Original bytes remain retained.',
  pdfPassword: 'This PDF is password-protected. Original bytes remain retained. It cannot be displayed.',
  imageUnreadable: 'This image could not be displayed. Original bytes remain retained.',
  measurementValueLabel: 'Value',
  measurementUnitLabel: 'Unit',
  measurementRoleLabel: 'What this number describes',
  keepObservation: 'Keep this observation',
  keepTakeoffRow: 'Keep this row',
  useInCandidate: 'Use this in the candidate',
  correctValue: 'Correct this value',
  applyCorrection: 'Apply correction',
  detachSource: 'Remove from candidate',
  unappliedChanges: 'Unapplied changes',
  mappedAccepted: 'Used in the candidate. This is not a verified measurement.',
  notMapped: 'Retained. Not yet used in the candidate.',
  missingUnit: 'Unit is missing. This stays unresolved.',
  unsupportedUnit: 'This unit is not supported. The original remains. It stays unresolved.',
  invalidNumber: 'This value is not a usable number. The original remains.',
  unclassifiedKept: 'Unknown need kept. No parts were created.',
  detachKept: 'Removed from the candidate. Historical attachment remains.',
  earlierValues: 'Earlier values remain inspectable.',
  takeoffLabel: 'Label',
  takeoffQuantity: 'Quantity',
  takeoffQuantityUnit: 'Quantity unit',
  takeoffDimensions: 'Dimensions',
  takeoffMaterial: 'Material description',
  noPhantomParts: 'No parts were created from this need.',
  storeUnavailable: 'Store connection not available',
  boardLengthLabel: 'Finished length',
  boardUnitLabel: 'Unit',
  boardApply: 'Apply finished length',
  boardCut001: 'Use CUT-001 reference: 60.000 in',
  boardSlice:
    'This Board example accepts lengths from 24 through 60 inches, inclusive. Other lengths are kept as requested; we do not shorten or lengthen them to fit.',
  boardBlank: 'Finished length is blank. No valid part has been created.',
  boardUnresolved: 'This length is retained. It is not an accepted Board definition in this slice.',
  boardSquareCut: 'square cut',
  boardCrosscut: 'CROSSCUT',
  boardQuantity: '1 ea',
  boardNotToScale:
    'Length-only schematic. Not to scale. Width and thickness are not depicted. See Store material details.',
  boardOnePart: 'One desired finished board',
  boardNoValidPart: 'No valid Board part in this candidate.',
  storeAskHeading: 'Ask Store Zero',
  storeAskPrompt:
    'Can this Store support this version, and what budgetary estimate does it return?',
  storePending: 'Asking Store Zero for this revision.',
  storeTransport: 'Store Zero could not be reached.',
  storeAdapter: 'Store integration is not available on this host.',
  storeMalformed: 'This Store response could not be applied to this revision.',
  storeCorrelation: 'This Store response could not be applied to this project or revision.',
  storeInterrupted: 'This Store attempt was interrupted. Retry is required.',
  storeIncomplete: 'Store is not asked until this Board requirement is complete.',
  storeRetry: 'Retry',
  storeInspect: 'Inspect Store detail',
  storeHistorical: 'Historical Store answer',
  storeCurrent: 'Store answer for this revision.',
  storeBudgetary: 'Budgetary estimate',
  storeNotQuote: 'Not a quote, sale price, or reservation.',
  storeModeledTime: 'Modeled / reference time. Not measured production time.',
  storeBasisLine: 'Stage-2 reference; fixture stock; modeled time; budgetary estimate.',
  storeReferenceScope: 'Stage-2 reference evaluation; no order is placed.',
  storeSupportable: 'This Store can support this Stage-2 requirement sent for evaluation.',
  storeUnresolved: 'This Store cannot resolve this requirement sent for evaluation.',
  storeRefused: 'This Store refused this requirement sent for evaluation.',
  storeUnavailableJob: 'Fixture stock cannot cover this requirement sent for evaluation.',
  storeNoQ: 'No budgetary estimate is available.',
  storeEstimateFailed: 'Budgetary estimate is unavailable.',
  storeOfferingHeading: 'Material offering',
  storeStockHeading: 'Fixture stock',
  storeCapabilityHeading: 'Capability / envelope',
  storeEstimateHeading: 'Budgetary estimate',
  storeBasisHeading: 'Store basis',
  storeDetailHeading: 'Request and response detail',
  storeFixtureStock: 'Fixture-declared stock. Not a live inventory count.',
  storeNotApproved:
    'Support for this Stage-2 question sent for evaluation is not machine approval, production readiness, or fabrication authorization.',
  storeListed: 'Listed by this Store',
  storeEstimatedMaterial: 'Estimated material amount',
  storeModeledRecovery: 'Modeled service/recovery charge',
  storeUnapplied:
    'Unapplied changes. The Store answer shown is for the committed revision, not the typed value.',
  storeSourceTime: 'Store source / asOf',
  storeWrapperTime: 'Wrapper responded',
  storeReceivedTime: 'Application received',
  storeNotReturned: 'Not returned',
  storeHistoryHeading: 'Earlier Store answers',
  reviewHeading: 'Review your definition',
  reviewYouSupplied: 'You supplied',
  reviewYouChose: 'You chose',
  reviewPartsResulted: 'These parts resulted',
  reviewStoreEvaluation: 'Store evaluation',
  reviewStillUnresolved: 'Still unresolved',
  reviewMeaning: 'Meaning of this action',
  reviewConfirm: 'Confirm this definition',
  reviewUnresolved: 'Save unresolved definition',
  reviewMeaningBody:
    'Recording this review affirms the intended definition and acknowledges the displayed Store basis and disclosures. It does not place an order, reserve inventory, authorize fabrication, or start a machine.',
  reviewNoOrder: 'This is not an order, payment, or Store commercial acceptance.',
  reviewHistorical: 'Historical review',
  reviewCurrent: 'Current review of this revision.',
  reviewNone: 'No review is recorded for this revision.',
  reviewBlockedUnapplied: 'Unapplied changes. Review is disabled until the typed value is applied.',
  reviewCompleteReady: 'This definition can be reviewed against the current Store answer.',
  reviewUnresolvedOnly: 'A complete supported review is not available. The definition can still be saved as unresolved.',
  reviewNothingToRecord: 'Nothing to record until a project exists.',
  resultHeading: 'Follow the result',
  resultRetained: 'Your definition is retained.',
  resultEvents: "This project's recorded events",
  resultReference: 'Reference example',
  resultFuture: 'Future fulfillment',
  resultFutureBody: 'Pickup, delivery, and contractor fulfillment are not offered in this build.',
  resultPhysicalAbsent: 'This build stops before physical fabrication or pickup.',
  resultPickupAbsent: 'No pickup, staging, or reservation is recorded.',
  resultNoProduction: 'Store support or a budgetary estimate does not establish production, machine, or fulfillment status.',
  reviewOpenResult: 'Open result',
  reviewOpenPage: 'Review this definition',
  recordHeading: 'Keep your project record',
  recordExport: 'Save/export record',
  recordImport: 'Open owner archive',
  recordResume: 'Resume project',
  recordLocalOnly:
    'Saved in this browser on this device. Export a copy to keep elsewhere; this record is not synchronized to cloud storage or held permanently for you.',
  recordCurrentVsHistorical: 'Current versus historical',
  recordSources: 'Original sources',
  recordHistory: 'Chronological history',
  recordMissingBytes: 'Original source unavailable. Metadata remains inspectable; bytes were not invented.',
  recordIncompleteExport: 'Export is incomplete. Missing original bytes are named and were not invented.',
  recordExportReady: 'Archive ready. Download requested.',
  recordExportFailed: 'Save failed. The previous project record is unchanged.',
  recordImportFailed: 'Import failed. Existing local projects were not changed.',
  recordImportOk: 'Owner archive imported as a separate local copy.',
  recordIdempotent: 'This archive is already present. Opening the existing imported copy.',
  recordCollision: 'A project with this identity already exists on this device.',
  recordOpenExisting: 'Open existing',
  recordImportCopy: 'Import separate copy',
  recordHistoricalStore: 'Imported Store answers remain historical. They are not a current Store answer.',
  recordHistoricalReview: 'Imported reviews remain historical. They do not confer a current review.',
  recordOwnerArchive: 'This is an owner-controlled local record, not a production packet.',
  recordUnknownClass: 'Unknown class version. Inspectable only. Editing and derivation are disabled.',
  recordNotCurrent: 'This imported record is historical. It is not current authority.',
});

export const PDFJS = Object.freeze({
  version: '4.10.38',
  libraryPath: '/vendor/pdfjs/pdf.min.mjs',
  workerPath: '/vendor/pdfjs/pdf.worker.min.mjs',
  cdn: false,
  enableScripting: false,
});

export const INTAKE_CARDS = Object.freeze([
  Object.freeze({
    id: 'board',
    name: 'PICK A BOARD',
    status: 'active',
    availability: 'Available. Enter a finished length in inches.',
  }),
  Object.freeze({
    id: 'measurements',
    name: 'MEASUREMENTS',
    status: 'active',
    availability: 'Available. Enter what you have.',
  }),
  Object.freeze({
    id: 'scan',
    name: 'SCAN A SPACE',
    status: 'planned',
    availability: 'Capture not available in this build.',
  }),
  Object.freeze({
    id: 'sketch',
    name: 'SKETCH / PHOTO',
    status: 'active',
    availability: 'Available. JPEG and PNG display only.',
  }),
  Object.freeze({
    id: 'drawing',
    name: 'DRAWING / PDF',
    status: 'active',
    availability: 'Available. PDF display only.',
  }),
  Object.freeze({
    id: 'takeoff',
    name: 'TAKEOFF / CUT LIST',
    status: 'active',
    availability: 'Available. Manual rows only. File parsing is not available.',
  }),
  Object.freeze({
    id: 'cad',
    name: 'CAD / BIM / STRUCTURED FILE',
    status: 'planned',
    availability: 'Structured extraction is not available.',
  }),
]);

export const ACTOR_CARD_ORDER = Object.freeze({
  new: Object.freeze(['board', 'measurements', 'scan', 'sketch', 'drawing', 'takeoff', 'cad']),
  returning: Object.freeze(['board', 'measurements', 'scan', 'sketch', 'drawing', 'takeoff', 'cad']),
  professional: Object.freeze(['drawing', 'takeoff', 'cad', 'measurements', 'board', 'scan', 'sketch']),
});

export const PRIMARY_PAGES = Object.freeze([
  Object.freeze({ id: 'begin', label: 'Begin', route: ROUTES.begin, implemented: true }),
  Object.freeze({ id: 'evidence', label: 'Evidence', route: null, implemented: false }),
  Object.freeze({ id: 'choices', label: 'Choices', route: null, implemented: false }),
  Object.freeze({ id: 'parts', label: 'Parts', route: null, implemented: false }),
  Object.freeze({ id: 'store', label: 'Store', route: null, implemented: true }),
  Object.freeze({ id: 'confirm', label: 'Review', route: null, implemented: true }),
  Object.freeze({ id: 'result', label: 'Result', route: null, implemented: true }),
  Object.freeze({ id: 'record', label: 'Record', route: null, implemented: true }),
]);

export const GR_SOURCE = Object.freeze({
  repository: 'GeorgePlattDemo/scan-to-build-governed-reference',
  pin: '18949f163718a937f072f4be3a654bb303e53160',
});

export const CLASS_REFERENCES = Object.freeze([
  Object.freeze({
    kind: 'mapped',
    classId: 'alcove-shelf-blanks',
    classVersion: '0.1-reference',
    ruleVersion: null,
    label: 'Alcove shelf blanks — bounded reference',
    status: 'candidate-reference',
    storePath: 'unresolved',
    hint: 'The bounded questions are already prepared.',
    source: Object.freeze({
      repository: GR_SOURCE.repository,
      pin: GR_SOURCE.pin,
      basis: 'GR dimensional definition from roadmap §5.2 (bounded alcove shelf blanks)',
      ruleVersion: null,
      sourceFile: null,
      executable: false,
      authority: false,
    }),
  }),
  Object.freeze({
    kind: 'mapped',
    classId: 'classic-picnic-table-fixture',
    classVersion: '0.1-software-fixture',
    ruleVersion: 'classic.picnic-table.fixture/0.1',
    label: 'Classic Picnic Table — configurable demonstration',
    status: 'candidate-software-fixture',
    storePath: 'unresolved',
    hint: 'Explore a broader project using example geometry. Structural suitability, material, Store support, and production remain unresolved. This is not an approved furniture design.',
    source: Object.freeze({
      repository: 'GeorgePlattDemo/scan-to-build-system',
      pin: null,
      basis: 'STB-APP-STRUCTURE-0.1 §6 synthetic geometry proof; numeric seeds are candidate software-fixture assumptions',
      ruleVersion: 'classic.picnic-table.fixture/0.1',
      sourceFile: 'source-library/application-current/STB-APP-STRUCTURE-0.1.md',
      executable: false,
      authority: false,
    }),
  }),
]);

export const OWN_ENTRY = Object.freeze({
  kind: 'own',
  classId: null,
  classVersion: null,
  ruleVersion: null,
  source: null,
  label: 'START YOUR OWN PROJECT',
  hint: 'Bring what you already have.',
  unclassified: true,
});

export const BOARD_INPUT_KEY = 'finished length';

export const BOARD_DEFINITION = Object.freeze({
  kind: 'board.square.v1',
  ruleVersion: '0.1',
  derivationVersion: 'board.square.v1/0.1',
  inputKey: BOARD_INPUT_KEY,
  unit: 'in',
  minInches: 24,
  maxInches: 60,
  inclusive: true,
  quantity: 1,
  quantityUnit: 'ea',
  requiredOps: Object.freeze(['CROSSCUT']),
  squareCut: true,
  occurrenceRole: 'desired-finished-board',
});

export const USER_DEFINED_BOARD_DEFINITION = Object.freeze({
  kind: 'user_defined_board.v1',
  ruleVersion: '0.1',
  unit: 'in',
  minWorkpieceInches: 24,
  maxWorkpieceInches: 60,
  quantity: 1,
  quantityUnit: 'ea',
  allowedOps: Object.freeze(['CROSSCUT', 'MITER_LIMITED', 'SPOT_ON_LOCATION', 'DRILL']),
  occurrenceRole: 'user-defined-board-workpiece',
});

export const USER_DEFINED_BOARD_MATERIAL_DEMAND = Object.freeze({
  species: 'spf',
  form: 'board',
  nominalT: 2,
  nominalW: 4,
});

export const ALCOVE_INSERT_DEFINITION = Object.freeze({
  kind: 'alcove_insert.v1',
  ruleVersion: '0.1',
  classId: 'alcove.insert.square_shelves',
  materialForm: 'board',
  nominalT: 1,
  nominalW: 6,
});

export const CUT001_DOCUMENTARY_REFERENCE = Object.freeze({
  id: 'CUT-001',
  repository: 'GeorgePlattDemo/scan-to-build-store',
  pin: 'a6c7bef784c0468555735a1ad620d163aae9feea',
  finishedLengthRaw: '60.000',
  finishedLengthUnit: 'in',
  method: 'documentary-reference',
  authority: false,
  storeSupport: false,
  machineCommissioning: false,
  fabricationAuthorization: false,
  physicalExecution: false,
  label: 'Use CUT-001 reference: 60.000 in',
});

export const STORE_PROTOCOL_VERSION = 'stb-store-zero-http/1';
export const STORE_REPOSITORY = 'GeorgePlattDemo/scan-to-build-store';
export const STORE_PIN = 'fc3f555b8f1f329bcf2dd81fa26995230d12a527';
export const STORE_FRESH_EVALUATION_RULE_ID = 'STB-STORE-FRESH-EVALUATION-0.1';
export const WRAPPER_BUILD_ID = 'stb-app-build-6';
export const APP_BUILD_ID = 'stb-app-build-7';
export const PUBLISHED_BOARD_SKU = 'STB-ZERO-SPF-2X4-72-001';
export const BOARD_OFFERING_QUERY = Object.freeze({
  species: 'spf',
  form: 'board',
  nominalT: 2,
  nominalW: 4,
  stockL_in: 72,
});
export const STORE_REQUEST_TYPES = Object.freeze({
  OFFERING_LOOKUP: 'OFFERING_LOOKUP',
  BOARD_SQUARE_V1: 'BOARD_SQUARE_V1',
  USER_DEFINED_BOARD_V1: 'USER_DEFINED_BOARD_V1',
  ALCOVE_INSERT_V1: 'ALCOVE_INSERT_V1',
  CUT_PACKAGE_V1: 'CUT_PACKAGE_V1',
});
export const STORE_SCOPES = Object.freeze({
  OFFERING_LOOKUP: 'OFFERING_LOOKUP',
  BOARD_SQUARE_V1: 'BOARD_SQUARE_V1',
  USER_DEFINED_BOARD_V1: 'USER_DEFINED_BOARD_V1',
  ALCOVE_INSERT_V1: 'ALCOVE_INSERT_V1',
  CUT_PACKAGE_V1: 'CUT_PACKAGE_V1',
});
// A la carte cut packages and item lines. System sends what the project needs; the Store answers
// each line on its own. System checks only the shape; every decision about boards, time and price is Store's.
export const CUT_PACKAGE_DEFINITION = Object.freeze({
  kind: 'cut_package.v1',
  ruleVersion: '0.1',
  maxPackages: 60,
  maxPartsPerPackage: 120,
  maxSpotsPerPart: 24,
  maxItemLines: 60,
  lineStatuses: Object.freeze(['SUPPORTABLE', 'NOT_ALL_LINES_SUPPORTABLE', 'UNRESOLVED']),
});
export const STORE_JOB_STATUSES = Object.freeze([
  'SUPPORTABLE',
  'UNRESOLVED',
  'REFUSED',
  'UNAVAILABLE',
]);
export const STORE_PATHS = Object.freeze({
  offering: '/api/store-zero/offering',
  job: '/api/store-zero/job',
});
export const MAX_STORE_REQUEST_BYTES = 64 * 1024;
export const MAX_STORE_RESPONSE_BYTES = 1024 * 1024;
export const STORE_CLIENT_TIMEOUT_MS = 10_000;

export const STORE_UNAVAILABLE = Object.freeze({
  connected: false,
  reason: 'Store connection not available',
  offering: null,
  price: null,
  availability: null,
  supportability: null,
});

export const REVIEW_KIND = 'review';
export const REVIEW_DIGEST_VERSION = 'review-digest/v1';
export const REVIEW_ACTIONS = Object.freeze({
  CONFIRM_DEFINITION: 'CONFIRM_DEFINITION',
  ACKNOWLEDGE_UNRESOLVED: 'ACKNOWLEDGE_UNRESOLVED',
});
export const REVIEW_RECORD_TYPES = Object.freeze({
  DefinitionReviewRecorded: 'DefinitionReviewRecorded',
  UnresolvedDefinitionAcknowledged: 'UnresolvedDefinitionAcknowledged',
});
export const PROJECT_VIEWS = Object.freeze(['hub', 'questions', 'store', 'confirm', 'result', 'record']);
export const PROJECT_SCOPED_PAGES = Object.freeze(['store', 'confirm', 'result', 'record']);

export const ARCHIVE_FORMAT = 'stb-owner-archive';
export const ARCHIVE_VERSION = 1;
export const ARCHIVE_FILENAME_SUFFIX = '.stb.json';
export const ARCHIVE_MIME = 'application/json';

const HTML = Object.freeze({
  relativePath: 'browser/index.html',
  contentType: 'text/html; charset=utf-8',
});
const JS = (relativePath) =>
  Object.freeze({
    relativePath,
    contentType: 'text/javascript; charset=utf-8',
  });

export const STATIC_ASSETS = Object.freeze({
  '/': HTML,
  '/index.html': HTML,
  '/integration/store-client.mjs': JS('browser/integration/store-client.mjs'),
  '/integration/store-coordinator.mjs': JS('browser/integration/store-coordinator.mjs'),
  '/begin': HTML,
  '/project': HTML,
  '/start/new': HTML,
  '/start/returning': HTML,
  '/start/professional': HTML,
  '/app.mjs': JS('browser/app.mjs'),
  '/styles.css': Object.freeze({
    relativePath: 'browser/styles.css',
    contentType: 'text/css; charset=utf-8',
  }),
  '/ui/shell.mjs': JS('browser/ui/shell.mjs'),
  '/ui/view-state.mjs': JS('browser/ui/view-state.mjs'),
  '/ui/panels.mjs': JS('browser/ui/panels.mjs'),
  '/ui/source-viewer.mjs': JS('browser/ui/source-viewer.mjs'),
  '/ui/candidate-view.mjs': JS('browser/ui/candidate-view.mjs'),
  '/ui/store-panel.mjs': JS('browser/ui/store-panel.mjs'),
  '/ui/review-panel.mjs': JS('browser/ui/review-panel.mjs'),
  '/ui/narrative.mjs': JS('browser/ui/narrative.mjs'),
  '/ui/open-door.mjs': JS('browser/ui/open-door.mjs'),
  '/ui/future-chain.mjs': JS('browser/ui/future-chain.mjs'),
  '/ui/project-configurator.mjs': JS('browser/ui/project-configurator.mjs'),
  '/ui/project-renderer.mjs': JS('browser/ui/project-renderer.mjs'),
  '/domain/classes.mjs': JS('browser/domain/classes.mjs'),
  '/domain/candidate.mjs': JS('browser/domain/candidate.mjs'),
  '/domain/derive.mjs': JS('browser/domain/derive.mjs'),
  '/domain/board.mjs': JS('browser/domain/board.mjs'),
  '/domain/user1-xbrace.mjs': JS('browser/domain/user1-xbrace.mjs'),
  '/domain/user1-xbrace-engine.mjs': JS('browser/domain/user1-xbrace-engine.mjs'),
  '/domain/evidence.mjs': JS('browser/domain/evidence.mjs'),
  '/domain/observation.mjs': JS('browser/domain/observation.mjs'),
  '/domain/review.mjs': JS('browser/domain/review.mjs'),
  '/domain/configurator.mjs': JS('browser/domain/configurator.mjs'),
  '/domain/class-runner.mjs': JS('browser/domain/class-runner.mjs'),
  '/domain/alcove-engine.mjs': JS('browser/domain/alcove-engine.mjs'),
  '/domain/picnic-engine.mjs': JS('browser/domain/picnic-engine.mjs'),
  '/data/repository.mjs': JS('browser/data/repository.mjs'),
  '/data/selectors.mjs': JS('browser/data/selectors.mjs'),
  '/data/store-view.mjs': JS('browser/data/store-view.mjs'),
  '/data/review-view.mjs': JS('browser/data/review-view.mjs'),
  '/data/archive.mjs': JS('browser/data/archive.mjs'),
  '/data/record-view.mjs': JS('browser/data/record-view.mjs'),
  '/ui/record-panel.mjs': JS('browser/ui/record-panel.mjs'),
  '/shared/contracts.mjs': JS('shared/contracts.mjs'),
  '/shared/canonical.mjs': JS('shared/canonical.mjs'),
  '/shared/board-rule.mjs': JS('shared/board-rule.mjs'),
  '/shared/user1-xbrace-rule.mjs': JS('shared/user1-xbrace-rule.mjs'),
  '/shared/alcove-rule.mjs': JS('shared/alcove-rule.mjs'),
  '/shared/picnic-rule.mjs': JS('shared/picnic-rule.mjs'),
  '/shared/class-config.mjs': JS('shared/class-config.mjs'),
  '/shared/store-wire.mjs': JS('shared/store-wire.mjs'),
  '/shared/store-present.mjs': JS('shared/store-present.mjs'),
  '/shared/store-calculation-identity.mjs': JS('shared/store-calculation-identity.mjs'),
  '/shared/review-digest.mjs': JS('shared/review-digest.mjs'),
  '/shared/archive-format.mjs': JS('shared/archive-format.mjs'),
  '/vendor/pdfjs/pdf.min.mjs': JS('browser/vendor/pdfjs/pdf.min.mjs'),
  '/vendor/pdfjs/pdf.worker.min.mjs': JS('browser/vendor/pdfjs/pdf.worker.min.mjs'),
});

export function isAllowedHost(host) {
  return host === FIXED_HOST;
}

export function isAllowedOrigin(origin) {
  return origin === FIXED_ORIGIN;
}

export function actorFromPath(pathname) {
  if (pathname === ROUTES.startNew) {
    return ACTORS.new;
  }
  if (pathname === ROUTES.startReturning) {
    return ACTORS.returning;
  }
  if (pathname === ROUTES.startProfessional) {
    return ACTORS.professional;
  }
  return null;
}

export function screenFromPath(pathname) {
  const path = pathname === '/index.html' ? ROUTES.landing : pathname;
  if (path === ROUTES.landing) {
    return { name: 'landing', actor: null };
  }
  const oriented = actorFromPath(path);
  if (oriented) {
    return { name: 'orientation', actor: oriented };
  }
  if (path === ROUTES.begin) {
    return { name: 'begin', actor: null };
  }
  if (path === ROUTES.project) {
    return { name: 'project', actor: null };
  }
  return { name: 'unknown', actor: null };
}

export function screenFromLocation(location) {
  const screen = screenFromPath(location.pathname);
  if (screen.name !== 'project') {
    return screen;
  }
  const params = new URLSearchParams(location.search);
  const viewParam = params.get('view');
  const view = PROJECT_VIEWS.includes(viewParam) ? viewParam : 'hub';
  const child = params.get('child');
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

