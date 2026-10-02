// Every admission check that exists today, by layer. Owner: System.
// The table that gives each one an owner and a destination is docs/application/ADMISSION-REQUIREMENTS.md.
// test/trail/admission-requirements-table.test.mjs proves this list matches the code in both layers and
// that the table lists every entry. Data only: nothing here is read by the app.
//
//   P:<fact>@<scope>   a requirement in ADMISSION_PROFILES (shared/tile-host-admission-contract.mjs)
//   O:<row id>         a responsibility row in admitPublicStoreRequest (public-build/stb-public-admission.mjs)
//   G:<code>           an old-path failure code that applies to every tile
//   K:<fact>/<ask>     one kept ask, with its own disposition

export const PROFILE_CHECKS = Object.freeze([
  'P:start-own.material@USER_DEFINED_BOARD_V1',
  'P:start-own.workpiece-length@USER_DEFINED_BOARD_V1',
  'P:start-own.parts@USER_DEFINED_BOARD_V1',
  'P:start-own.operations@USER_DEFINED_BOARD_V1',
  'P:start-own.datum@USER_DEFINED_BOARD_V1',
  'P:start-own.spot-demand@USER_DEFINED_BOARD_V1',
  'P:alcove.opening@ALCOVE_INSERT_V1',
  'P:alcove.material@ALCOVE_INSERT_V1',
  'P:alcove.board-requirements@ALCOVE_INSERT_V1',
  'P:alcove.component-programs@ALCOVE_INSERT_V1',
  'P:alcove.spot-demand@ALCOVE_INSERT_V1',
  'P:alcove.hardware@ALCOVE_INSERT_V1',
  'P:window-seat.width@WINDOW_SEAT_COMMITTED',
  'P:window-seat.height@WINDOW_SEAT_COMMITTED',
  'P:window-seat.depth@WINDOW_SEAT_COMMITTED',
  'P:window-seat.boards@WINDOW_SEAT_COMMITTED',
  'P:window-seat.added-knobs@WINDOW_SEAT_COMMITTED',
  'P:window-seat.kept-asks@WINDOW_SEAT_COMMITTED',
  'P:outdoor.cut-packages@OUTDOOR_OPTIONS',
  'P:outdoor.plan@OUTDOOR_COMMITTED',
  'P:outdoor.cut-packages@OUTDOOR_COMMITTED',
  'P:outdoor.bench-work@OUTDOOR_COMMITTED',
  'P:playhouse.sheet@SHEET_PACKAGE_V1',
  'P:playhouse.opening@SHEET_PACKAGE_V1',
]);

export const OLD_PATH_ROWS = Object.freeze([
  'O:start-own.identity',
  'O:start-own.material',
  'O:start-own.workpiece-length',
  'O:start-own.operations',
  'O:start-own.parts',
  'O:start-own.datum',
  'O:start-own.spots',
  'O:start-own.unresolved',
  'O:start-own.scope',
  'O:alcove.identity',
  'O:alcove.material',
  'O:alcove.board-requirements',
  'O:alcove.component-programs',
  'O:alcove.hardware',
  'O:alcove.spot-demand',
  'O:alcove.unresolved',
  'O:alcove.scope',
  'O:window-seat.identity',
  'O:window-seat.required-values',
  'O:window-seat.local-definition-blockers',
  'O:window-seat.scope-accounting',
  'O:window-seat.generator-consistency',
  'O:window-seat.hardware',
  'O:window-seat.scope',
  'O:outdoor.identity',
  'O:outdoor.required-values',
  'O:outdoor.local-definition-blockers',
  'O:outdoor.generator-consistency',
  'O:outdoor.scope',
  'O:playhouse.identity',
  'O:playhouse.sheet',
  'O:playhouse.opening',
  'O:playhouse.scope',
]);

// Literal codes in stb-public-admission.mjs, plus 'SYSTEM_ADMISSION_' + each storeSubmissionReadiness reason.
export const OLD_PATH_GATES = Object.freeze([
  'G:SYSTEM_ADMISSION_PUBLIC_PROJECT_REQUIRED',
  'G:SYSTEM_ADMISSION_CANDIDATE_REVISION_REQUIRED',
  'G:SYSTEM_ADMISSION_STORE_PIN_REQUIRED',
  'G:SYSTEM_ADMISSION_PAYLOAD_REQUIRED',
  'G:SYSTEM_ADMISSION_REQUEST_TYPE_MISMATCH',
  'G:SYSTEM_ADMISSION_COVERAGE_GAP',
  'G:SYSTEM_ADMISSION_LEDGER_INVALID',
  'G:SYSTEM_ADMISSION_UNCLASSIFIED',
  'G:SYSTEM_ADMISSION_STORE_QUERY_CONTRACT_REQUIRED',
  'G:SYSTEM_ADMISSION_DEFINITION_BLOCKED',
  'G:SYSTEM_ADMISSION_STORE_SUBMISSION_BLOCKED',
]);

// Window Seat's kept asks (KEPT_ASKS in public-build/stb-window-seat-0.9.html), each with the disposition the page
// gives it today. The profile fact carries only their count.
export const KEPT_ASKS = Object.freeze([
  Object.freeze({ check: 'K:window-seat.kept-asks/label', disposition: 'excluded' }),
  Object.freeze({ check: 'K:window-seat.kept-asks/inspect', disposition: 'excluded' }),
  Object.freeze({ check: 'K:window-seat.kept-asks/bundle', disposition: 'excluded' }),
  Object.freeze({ check: 'K:window-seat.kept-asks/pack', disposition: 'excluded' }),
  Object.freeze({ check: 'K:window-seat.kept-asks/other', disposition: 'blocking' }),
]);
