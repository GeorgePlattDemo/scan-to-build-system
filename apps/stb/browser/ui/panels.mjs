import {
  ACTOR_CARD_ORDER,
  CLASS_REFERENCES,
  COPY,
  INTAKE_CARDS,
  OWN_ENTRY,
} from '/shared/contracts.mjs';
import { renderSharedCandidateView } from '/ui/candidate-view.mjs';
import { renderStorePanel } from '/ui/store-panel.mjs';
import { presentStoreAnswer } from '/shared/store-present.mjs';
import { renderInlineReview } from '/ui/review-panel.mjs';
import {
  USER1_XBRACE_CONFIGURATION_KIND,
  USER1_XBRACE_MAX_PART_LENGTH_IN,
  USER1_XBRACE_MIN_PART_LENGTH_IN,
  USER1_XBRACE_STEP_IN,
} from '/shared/user1-xbrace-rule.mjs';

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
        if (name === 'value' && 'value' in node) {
          node.value = value;
        }
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

function resumeSection(saved, actorId) {
  const empty = saved.length === 0;
  const list = empty
    ? [el('p', { className: 'empty-saved', attrs: { 'data-empty-saved': 'true' }, text: COPY.emptySaved })]
    : saved.map((project) =>
        el('button', {
          className: 'resume-item',
          attrs: {
            type: 'button',
            'data-action': 'resume-project',
            'data-local-record-id': project.localRecordId,
          },
          text: `${project.title ?? 'Untitled project'} (${project.updatedAt})`,
        }),
      );
  return el(
    'section',
    {
      className: 'saved-projects',
      attrs: { 'data-resume-order': actorId === 'returning' ? 'first' : 'later' },
    },
    [el('h2', { text: COPY.resumeHeading }), ...list],
  );
}

function mappedSection(mappedOpen) {
  const classes = mappedOpen
    ? CLASS_REFERENCES.map((entry) =>
        el('li', {}, [
          el('button', {
            className: 'mapped-class',
            attrs: {
              type: 'button',
              'data-action': 'choose-mapped',
              'data-class-id': entry.classId,
            },
            text: entry.label,
          }),
          el('p', { className: 'mapped-status', text: COPY.mappedStatus }),
        ]),
      )
    : [];
  return el('section', { className: 'start-card mapped-card' }, [
    el('button', {
      className: 'start-mapped',
      attrs: {
        type: 'button',
        'data-action': 'expand-mapped',
        'aria-expanded': mappedOpen ? 'true' : 'false',
      },
      text: COPY.chooseMapped,
    }),
    el('p', { className: 'hint', text: COPY.mappedHint }),
    mappedOpen
      ? el('ul', { className: 'mapped-list', attrs: { id: 'mapped-class-list' } }, classes)
      : null,
  ]);
}

function ownSection() {
  return el('section', { className: 'start-card own-card' }, [
    el('button', {
      className: 'start-own',
      attrs: { type: 'button', 'data-action': 'start-own' },
      text: COPY.startOwn,
    }),
    el('p', { className: 'hint', text: OWN_ENTRY.hint }),
  ]);
}

export function page1Main({
  actor,
  saved,
  current,
  mappedOpen,
  pendingSwitch,
  pendingCollision,
  importStatus,
}) {
  const actorId = actor ? actor.id : 'none';
  const help = actor
    ? el('p', {
        className: 'actor-help',
        attrs: { 'data-actor-help': actor.id },
        text: actor.body ? `${actor.heading} ${actor.body}` : actor.heading,
      })
    : null;
  const currentLine = current
    ? el('p', {
        className: 'current-project',
        attrs: { 'data-current-project': current.localRecordId },
        text: current.title ?? 'Untitled project',
      })
    : null;
  const resume = resumeSection(saved, actorId);
  const mapped = mappedSection(mappedOpen);
  const own = ownSection();
  const starts = actorId === 'returning' ? [resume, mapped, own] : [mapped, own, resume];
  const dialog = pendingSwitch
    ? el(
        'div',
        {
          className: 'switch-dialog',
          attrs: { role: 'dialog', 'aria-labelledby': 'switch-title', 'aria-modal': 'true' },
        },
        [
          el('h2', { attrs: { id: 'switch-title' }, text: COPY.keepAndStart }),
          el('p', { text: COPY.switchPrompt }),
          el('div', { className: 'actions' }, [
            el('button', {
              attrs: { type: 'button', 'data-action': 'switch-keep' },
              text: COPY.keepAndStart,
            }),
            el('button', {
              attrs: { type: 'button', 'data-action': 'switch-cancel' },
              text: COPY.cancel,
            }),
          ]),
        ],
      )
    : null;
  const collision = pendingCollision
    ? el(
        'div',
        {
          className: 'switch-dialog',
          attrs: {
            role: 'dialog',
            'aria-labelledby': 'collision-title',
            'aria-modal': 'true',
            'data-collision-dialog': 'true',
          },
        },
        [
          el('h2', { attrs: { id: 'collision-title' }, text: COPY.recordCollision }),
          el('p', { text: COPY.recordCollision }),
          el('div', { className: 'actions' }, [
            el('button', {
              attrs: { type: 'button', 'data-action': 'collision-open-existing' },
              text: COPY.recordOpenExisting,
            }),
            el('button', {
              attrs: { type: 'button', 'data-action': 'collision-import-copy' },
              text: COPY.recordImportCopy,
            }),
          ]),
        ],
      )
    : null;
  return el('main', { className: 'screen screen-begin' }, [
    heading(COPY.beginHeading),
    help,
    currentLine,
    ...starts,
    el('section', { className: 'start-card import-card' }, [
      el('button', {
        className: 'start-import',
        attrs: { type: 'button', 'data-action': 'import-archive' },
        text: COPY.recordImport,
      }),
      el('p', { className: 'hint', text: COPY.recordOwnerArchive }),
      importStatus
        ? el('p', {
            className: 'save-line',
            attrs: { 'data-import-status': 'true' },
            text: importStatus,
          })
        : null,
      el('input', {
        attrs: {
          type: 'file',
          accept: '.stb.json,application/json',
          'data-archive-input': 'true',
          hidden: 'true',
        },
      }),
    ]),
    dialog,
    collision,
  ]);
}

export function projectHandoffMain({ project, view }) {
  const isQuestions = view === 'questions';
  return el(
    'main',
    {
      className: 'screen screen-handoff',
      attrs: {
        'data-screen': isQuestions ? 'questions' : 'hub',
        'data-entry-mode': project.entryMode,
        'data-local-record-id': project.localRecordId,
        'data-project-id': project.projectId,
        'data-class-id': project.classId ?? '',
      },
    },
    [
      heading(isQuestions ? COPY.questionsHeading : COPY.hubHeading),
      el('p', {
        className: 'project-name',
        text: project.title ?? 'Untitled project',
      }),
      el('p', {
        className: 'handoff-status',
        text: isQuestions ? COPY.questionsStatus : COPY.hubStatus,
      }),
      el('button', {
        attrs: { type: 'button', 'data-action': 'back-to-begin' },
        text: COPY.back,
      }),
    ],
  );
}

export function projectMissingMain() {
  return el('main', { className: 'screen screen-handoff' }, [
    heading(COPY.beginHeading),
    el('p', { text: 'Saved project could not be read. It was not deleted.' }),
    el('button', {
      attrs: { type: 'button', 'data-action': 'back-to-begin' },
      text: COPY.back,
    }),
  ]);
}

function orderedCards(actorId) {
  const order = ACTOR_CARD_ORDER[actorId] ?? ACTOR_CARD_ORDER.new;
  return order.map((id) => INTAKE_CARDS.find((card) => card.id === id)).filter(Boolean);
}

function sourceList(evidence, viewingId, candidate) {
  if (!evidence || evidence.length === 0) {
    return [el('p', { className: 'empty-source', attrs: { 'data-empty-source': 'true' }, text: COPY.noSourceYet })];
  }
  const active = new Set(candidate?.payload?.activeEvidenceIds ?? []);
  return evidence.map((record) =>
    el('div', { className: 'source-row', attrs: { 'data-source-row': record.id } }, [
      el('button', {
        className: viewingId === record.id ? 'source-item current' : 'source-item',
        attrs: {
          type: 'button',
          'data-action': 'view-source',
          'data-evidence-id': record.id,
          'data-display-type': record.payload.displayType,
        },
        text: record.payload.originalFilename
          ?? (record.payload.rawText ? record.payload.rawText.slice(0, 48) : record.payload.displayType),
      }),
      active.has(record.id)
        ? el('button', {
            className: 'source-detach',
            attrs: {
              type: 'button',
              'data-action': 'detach-evidence',
              'data-evidence-id': record.id,
            },
            text: COPY.detachSource,
          })
        : el('p', { className: 'hint', text: COPY.detachKept }),
    ]),
  );
}

function intakeCard(card) {
  const planned = card.status === 'planned';
  return el('section', {
    className: planned ? 'intake-card planned' : 'intake-card active',
    attrs: { 'data-intake-card': card.id, 'data-card-status': card.status },
  }, [
    el('button', {
      className: 'intake-open',
      attrs: {
        type: 'button',
        'data-action': 'open-child',
        'data-child': card.id,
        'aria-disabled': 'false',
      },
      text: card.name,
    }),
    el('p', {
      className: 'availability',
      attrs: { 'data-availability': card.id },
      text: card.availability,
    }),
  ]);
}

function childBody(child, {
  typedText,
  takeoffText,
  measurementBuffer,
  takeoffBuffer,
  correctingId,
  boardBuffer,
  user1Buffer,
  candidate,
  projection,
  selectedOccurrenceId,
  storeView,
  reviewPresentation,
}) {
  if (child === 'board') {
    const user1Active =
      candidate?.payload?.configuration?.kind === USER1_XBRACE_CONFIGURATION_KIND;
    if (user1Active) {
      const configuration = candidate.payload.configuration;
      const derived = projection?.payload?.derived ?? null;
      const rawPartLength =
        user1Buffer?.raw !== undefined && user1Buffer.raw !== ''
          ? user1Buffer.raw
          : String(configuration.partLengthIn ?? USER1_XBRACE_MIN_PART_LENGTH_IN);
      const angleDeg = Number(derived?.angleDeg);
      const spotIn = Number(derived?.centerSpotIn?.value);
      const angleLabel = Number.isFinite(angleDeg)
        ? String(Number(angleDeg.toFixed(3)))
        : '—';
      const spotLabel = Number.isFinite(spotIn)
        ? String(Number(spotIn.toFixed(3)))
        : '—';
      return [
        el('p', {
          className: 'hint',
          attrs: {
            'data-child-status': 'job1-xbrace',
            'data-user1-configure': 'true',
          },
          text: 'Job 1 · X-brace. The definition is the source of Store demand; Store remains the source of stock, capability, modeled work, remnant, and Q.',
        }),
        el('p', {
          text: 'Store-origin SPF 2×4 · one 60 in defined workpiece · two parts · parallel face-miter ends.',
        }),
        el('label', {
          attrs: { for: 'user1-part-length' },
          text: 'Part length (16–18 in)',
        }),
        el('input', {
          attrs: {
            id: 'user1-part-length',
            name: 'user1-part-length',
            type: 'number',
            min: String(USER1_XBRACE_MIN_PART_LENGTH_IN),
            max: String(USER1_XBRACE_MAX_PART_LENGTH_IN),
            step: String(USER1_XBRACE_STEP_IN),
            'data-field': 'user1-part-length',
            value: rawPartLength,
            autocomplete: 'off',
          },
        }),
        el('p', {
          className: 'hint',
          attrs: { 'data-unapplied': 'user1', hidden: 'true' },
          text: COPY.unappliedChanges,
        }),
        el('ul', { attrs: { 'data-user1-project-facts': 'true' } }, [
          el('li', { text: 'Defined workpiece: 60 in minimum request; Store selects the offered stock that satisfies the demand.' }),
          el('li', { text: `Parts: 2 × ${rawPartLength || '—'} in` }),
          el('li', { text: `Face-miter angle: ${angleLabel}° · fixed horizontal span: 8 in` }),
          el('li', { text: 'Saw demand: 3 cuts · cut 2 shared · datum method REFERENCE_CUT' }),
          el('li', { text: `Spot demand: one SPOT_ON_LOCATION per part · centered at ${spotLabel} in · centered on wide face` }),
          el('li', { text: 'Ends: both · parallel · cut plane: miter-face · length datum: long-long-outer-edge' }),
        ]),
        el('div', { className: 'actions' }, [
          el('button', {
            attrs: { type: 'button', 'data-action': 'apply-user1-xbrace' },
            text: 'UPDATE DEFINITION',
          }),
          el('button', {
            attrs: { type: 'button', 'data-action': 'clear-user1-xbrace' },
            text: 'BACK TO BOARD INPUT',
          }),
        ]),
        renderStorePanel(
          storeView
            ?? presentStoreAnswer(
              { status: 'none' },
              { projectionValid: projection?.payload?.valid === true },
            ),
          { mode: 'compact' },
        ),
        reviewPresentation ? renderInlineReview(reviewPresentation) : null,
        renderSharedCandidateView(projection, { selectedOccurrenceId }),
      ];
    }

    const buffer = boardBuffer ?? { raw: '', unit: 'in' };
    const reason = projection?.payload?.unresolvedReason ?? null;
    const unresolvedText =
      projection && !projection.payload.valid
        ? reason === 'missing-finished-length' || reason === 'blank'
          ? COPY.boardBlank
          : COPY.boardUnresolved
        : null;
    return [
      el('p', {
        className: 'hint',
        attrs: { 'data-child-status': 'board', id: 'board-slice-help' },
        text: COPY.boardSlice,
      }),
      el('form', {
        className: 'board-form',
        attrs: { 'data-board-form': 'true' },
      }, [
        el('label', { attrs: { for: 'board-length' }, text: COPY.boardLengthLabel }),
        el('input', {
          attrs: {
            id: 'board-length',
            name: 'board-length',
            type: 'text',
            inputmode: 'decimal',
            'data-field': 'board-length',
            value: buffer.raw ?? '',
            autocomplete: 'off',
            'aria-describedby': 'board-slice-help',
          },
        }),
        el('label', { attrs: { for: 'board-unit' }, text: COPY.boardUnitLabel }),
        el('input', {
          attrs: {
            id: 'board-unit',
            name: 'board-unit',
            type: 'text',
            'data-field': 'board-unit',
            value: buffer.unit ?? 'in',
            autocomplete: 'off',
          },
        }),
        el('p', {
          className: 'hint',
          attrs: { 'data-unapplied': 'board', hidden: 'true' },
          text: COPY.unappliedChanges,
        }),
        el('div', { className: 'actions' }, [
          el('button', {
            attrs: { type: 'button', 'data-action': 'apply-board-length' },
            text: COPY.boardApply,
          }),
          el('button', {
            attrs: { type: 'button', 'data-action': 'apply-cut001' },
            text: COPY.boardCut001,
          }),
          el('button', {
            attrs: { type: 'button', 'data-action': 'start-user1-xbrace' },
            text: 'TAKE THIS 2×4 TO THE BENCH',
          }),
        ]),
      ]),
      unresolvedText
        ? el('p', {
            className: 'unresolved',
            attrs: {
              'data-board-unresolved': reason ?? 'missing-finished-length',
            },
            text: unresolvedText,
          })
        : null,
      renderStorePanel(
        storeView
          ?? presentStoreAnswer(
            { status: 'none' },
            { projectionValid: projection?.payload?.valid === true },
          ),
        { mode: 'compact' },
      ),
      reviewPresentation ? renderInlineReview(reviewPresentation) : null,
      renderSharedCandidateView(projection, { selectedOccurrenceId }),
    ];
  }
  if (child === 'scan') {
    return [
      el('p', { attrs: { 'data-child-status': 'scan' }, text: COPY.scanStatus }),
      el('p', { text: 'Existing scan files may be retained as opaque attachments. No room is inferred.' }),
      el('div', { className: 'actions' }, [
        el('button', {
          attrs: { type: 'button', 'data-action': 'attach-opaque', 'data-child': 'scan' },
          text: COPY.attachFile,
        }),
        el('button', {
          attrs: { type: 'button', 'data-action': 'open-child', 'data-child': 'measurements' },
          text: 'MEASUREMENTS',
        }),
      ]),
    ];
  }
  if (child === 'cad') {
    return [
      el('p', { attrs: { 'data-child-status': 'cad' }, text: COPY.cadStatus }),
      el('p', { text: COPY.opaqueKept }),
      el('button', {
        attrs: { type: 'button', 'data-action': 'attach-opaque', 'data-child': 'cad' },
        text: COPY.attachFile,
      }),
    ];
  }
  if (child === 'sketch') {
    return [
      el('p', { text: 'JPEG and PNG only. Display does not measure the image.' }),
      el('button', {
        attrs: { type: 'button', 'data-action': 'attach-image' },
        text: 'Attach JPEG or PNG',
      }),
    ];
  }
  if (child === 'drawing') {
    return [
      el('p', { text: 'PDF display only. No OCR and no scale extraction.' }),
      el('button', {
        attrs: { type: 'button', 'data-action': 'attach-pdf' },
        text: 'Attach PDF',
      }),
    ];
  }
  if (child === 'measurements') {
    const buffer = measurementBuffer ?? { raw: '', unit: '', role: '' };
    return [
      el('label', { attrs: { for: 'typed-need' }, text: COPY.typedNeedLabel }),
      el('textarea', {
        attrs: {
          id: 'typed-need',
          name: 'typed-need',
          rows: '3',
          'data-field': 'typed-need',
        },
        text: typedText ?? '',
      }),
      el('p', { className: 'hint', text: 'The original text is kept. Mapping a number is a later explicit act.' }),
      el('button', {
        attrs: { type: 'button', 'data-action': 'submit-typed' },
        text: COPY.typedNeedSubmit,
      }),
      el('form', {
        className: 'measurement-form',
        attrs: {
          'data-measurement-form': 'true',
          'data-correcting': correctingId ?? '',
        },
      }, [
        el('label', { attrs: { for: 'measurement-raw' }, text: COPY.measurementValueLabel }),
        el('input', {
          attrs: {
            id: 'measurement-raw',
            name: 'measurement-raw',
            type: 'text',
            'data-field': 'measurement-raw',
            value: buffer.raw ?? '',
            autocomplete: 'off',
          },
        }),
        el('label', { attrs: { for: 'measurement-unit' }, text: COPY.measurementUnitLabel }),
        el('input', {
          attrs: {
            id: 'measurement-unit',
            name: 'measurement-unit',
            type: 'text',
            'data-field': 'measurement-unit',
            value: buffer.unit ?? '',
            autocomplete: 'off',
          },
        }),
        el('label', { attrs: { for: 'measurement-role' }, text: COPY.measurementRoleLabel }),
        el('input', {
          attrs: {
            id: 'measurement-role',
            name: 'measurement-role',
            type: 'text',
            'data-field': 'measurement-role',
            value: buffer.role ?? '',
            autocomplete: 'off',
          },
        }),
        el('p', {
          className: 'hint',
          attrs: { 'data-unapplied': 'measurement', hidden: 'true' },
          text: COPY.unappliedChanges,
        }),
        el('p', { className: 'hint', text: 'Missing unit stays unresolved. Units are not guessed.' }),
        el('button', {
          attrs: { type: 'button', 'data-action': correctingId ? 'apply-correction' : 'submit-measurement' },
          text: correctingId ? COPY.applyCorrection : COPY.keepObservation,
        }),
      ]),
    ];
  }
  if (child === 'takeoff') {
    const buffer = takeoffBuffer ?? {
      label: '',
      quantity: '',
      unit: '',
      dimensions: '',
      material: '',
    };
    return [
      el('p', { text: 'Manual rows only. This is not a derived parts list or Store catalog.' }),
      el('label', { attrs: { for: 'takeoff-raw' }, text: 'Raw takeoff text' }),
      el('textarea', {
        attrs: {
          id: 'takeoff-raw',
          name: 'takeoff-raw',
          rows: '3',
          'data-field': 'takeoff-raw',
        },
        text: takeoffText ?? '',
      }),
      el('button', {
        attrs: { type: 'button', 'data-action': 'submit-takeoff' },
        text: COPY.typedNeedSubmit,
      }),
      el('form', {
        className: 'takeoff-form',
        attrs: { 'data-takeoff-form': 'true' },
      }, [
        el('label', { attrs: { for: 'takeoff-label' }, text: COPY.takeoffLabel }),
        el('input', {
          attrs: {
            id: 'takeoff-label',
            name: 'takeoff-label',
            type: 'text',
            'data-field': 'takeoff-label',
            value: buffer.label ?? '',
            autocomplete: 'off',
          },
        }),
        el('label', { attrs: { for: 'takeoff-quantity' }, text: COPY.takeoffQuantity }),
        el('input', {
          attrs: {
            id: 'takeoff-quantity',
            name: 'takeoff-quantity',
            type: 'text',
            'data-field': 'takeoff-quantity',
            value: buffer.quantity ?? '',
            autocomplete: 'off',
          },
        }),
        el('label', { attrs: { for: 'takeoff-unit' }, text: COPY.takeoffQuantityUnit }),
        el('input', {
          attrs: {
            id: 'takeoff-unit',
            name: 'takeoff-unit',
            type: 'text',
            'data-field': 'takeoff-unit',
            value: buffer.unit ?? '',
            autocomplete: 'off',
          },
        }),
        el('label', { attrs: { for: 'takeoff-dimensions' }, text: COPY.takeoffDimensions }),
        el('input', {
          attrs: {
            id: 'takeoff-dimensions',
            name: 'takeoff-dimensions',
            type: 'text',
            'data-field': 'takeoff-dimensions',
            value: buffer.dimensions ?? '',
            autocomplete: 'off',
          },
        }),
        el('label', { attrs: { for: 'takeoff-material' }, text: COPY.takeoffMaterial }),
        el('input', {
          attrs: {
            id: 'takeoff-material',
            name: 'takeoff-material',
            type: 'text',
            'data-field': 'takeoff-material',
            value: buffer.material ?? '',
            autocomplete: 'off',
          },
        }),
        el('p', {
          className: 'hint',
          attrs: { 'data-unapplied': 'takeoff', hidden: 'true' },
          text: COPY.unappliedChanges,
        }),
        el('button', {
          attrs: { type: 'button', 'data-action': 'submit-takeoff-row' },
          text: COPY.keepTakeoffRow,
        }),
      ]),
    ];
  }
  return [];
}

function unresolvedReasonText(reason) {
  if (reason === 'missing-unit') {
    return COPY.missingUnit;
  }
  if (reason === 'unsupported-unit') {
    return COPY.unsupportedUnit;
  }
  if (reason === 'blank' || reason === 'malformed' || reason === 'nonfinite') {
    return COPY.invalidNumber;
  }
  if (reason === 'unclassified-need') {
    return COPY.unclassifiedKept;
  }
  return reason ? `Unresolved: ${reason}` : null;
}

function observationItems(observations, candidate) {
  const activeIds = new Set(candidate?.payload?.activeObservationIds ?? []);
  const mappings = candidate?.payload?.mappings ?? [];
  const active = observations.filter((record) => activeIds.has(record.id));
  const historical = observations.filter((record) => !activeIds.has(record.id));
  if (active.length === 0 && historical.length === 0) {
    return [el('p', { attrs: { 'data-candidate-empty': 'true' }, text: COPY.candidateEmpty })];
  }
  const items = active.map((record) => {
    const mapping = mappings.find((entry) => entry.observationId === record.id);
    const payload = record.payload;
    const summary = payload.role
      ? `${payload.rawText}${payload.declaredUnit ? ` ${payload.declaredUnit}` : ''} — ${payload.role}`
      : `${payload.rawText}${payload.declaredUnit ? ` ${payload.declaredUnit}` : ''}`;
    return el('article', {
      className: 'observation-item',
      attrs: {
        'data-observation-id': record.id,
        'data-observation-kind': payload.kind,
        'data-unresolved': payload.unresolvedReason ?? '',
      },
    }, [
      el('p', { text: summary }),
      payload.interpretedValue != null
        ? el('p', {
            className: 'hint',
            attrs: { 'data-interpreted': String(payload.interpretedValue) },
            text: `Entered value ${payload.interpretedValue}${payload.interpretedUnit ? ` ${payload.interpretedUnit}` : ''}. No fit allowance was added.`,
          })
        : null,
      payload.unresolvedReason
        ? el('p', { className: 'unresolved', text: unresolvedReasonText(payload.unresolvedReason) })
        : null,
      mapping
        ? el('p', { className: 'hint', attrs: { 'data-mapped-input': mapping.inputKey }, text: COPY.mappedAccepted })
        : el('p', { className: 'hint', text: COPY.notMapped }),
      el('div', { className: 'actions' }, [
        !mapping && payload.role && !payload.unresolvedReason
          ? el('button', {
              attrs: {
                type: 'button',
                'data-action': 'map-observation',
                'data-observation-id': record.id,
                'data-input-key': payload.role,
              },
              text: COPY.useInCandidate,
            })
          : null,
        el('button', {
          attrs: {
            type: 'button',
            'data-action': 'correct-observation',
            'data-observation-id': record.id,
            'data-observation-kind': payload.kind,
          },
          text: COPY.correctValue,
        }),
      ]),
    ]);
  });
  if (historical.length > 0) {
    items.push(
      el('details', { className: 'earlier-values' }, [
        el('summary', { text: COPY.earlierValues }),
        ...historical.map((record) =>
          el('p', {
            attrs: {
              'data-historical-observation': record.id,
              'data-supersedes': record.payload.supersedesObservationId ?? '',
            },
            text: `${record.payload.rawText}${record.payload.declaredUnit ? ` ${record.payload.declaredUnit}` : ''}`,
          }),
        ),
      ]),
    );
  }
  return items;
}

function needsItems(observations, candidate) {
  const activeIds = new Set(candidate?.payload?.activeObservationIds ?? []);
  const unresolved = observations.filter(
    (record) => activeIds.has(record.id) && record.payload.unresolvedReason,
  );
  const unclassified = unresolved.filter((record) => record.payload.kind === 'typed-need');
  if (unresolved.length === 0) {
    return [el('p', { text: COPY.needsEmpty })];
  }
  const nodes = unresolved.map((record) =>
    el('p', {
      attrs: { 'data-need': record.id, 'data-need-reason': record.payload.unresolvedReason },
      text: unresolvedReasonText(record.payload.unresolvedReason) ?? record.payload.rawText,
    }),
  );
  if (unclassified.length > 0) {
    nodes.push(el('p', { attrs: { 'data-no-parts': 'true' }, text: COPY.noPhantomParts }));
  }
  return nodes;
}

export function page2Main({
  project,
  actor,
  view,
  child,
  evidence,
  observations,
  candidate,
  viewingId,
  status,
  typedText,
  takeoffText,
  measurementBuffer,
  takeoffBuffer,
  correctingId,
  boardBuffer,
  user1Buffer,
  projection,
  selectedOccurrenceId,
  storeView,
  reviewPresentation,
}) {
  const actorId = actor ? actor.id : 'none';
  const isQuestions = view === 'questions';
  const cards = orderedCards(actorId).map(intakeCard);
  const childCard = child ? INTAKE_CARDS.find((entry) => entry.id === child) : null;
  return el(
    'main',
    {
      className: 'screen screen-page2',
      attrs: {
        'data-screen': isQuestions ? 'questions' : 'hub',
        'data-page': 'page2',
        'data-entry-mode': project.entryMode,
        'data-local-record-id': project.localRecordId,
        'data-project-id': project.projectId,
        'data-class-id': project.classId ?? '',
        'data-child': child ?? '',
        'data-actor-order': actorId,
      },
    },
    [
      heading(isQuestions ? COPY.questionsHeading : COPY.hubHeading),
      el('p', { className: 'project-name', text: project.title ?? 'Untitled project' }),
      isQuestions
        ? el('p', { className: 'handoff-status', text: COPY.questionsStatus })
        : el('p', { className: 'page2-prompt', text: COPY.page2Prompt }),
      status
        ? el('p', { className: 'save-line', attrs: { 'data-page-status': status }, text: status })
        : null,
      el('section', { className: 'pane source-pane', attrs: { 'aria-label': COPY.sourcePane } }, [
        el('h2', { text: COPY.sourcePane }),
        ...sourceList(evidence, viewingId, candidate),
        el('div', { className: 'source-view', attrs: { 'data-source-view': 'true' } }),
      ]),
      el('section', { className: 'pane candidate-pane', attrs: { 'aria-label': COPY.candidatePane } }, [
        el('h2', { text: COPY.candidatePane }),
        ...observationItems(observations ?? [], candidate),
      ]),
      el('section', { className: 'pane needs-pane', attrs: { 'aria-label': COPY.needsPane } }, [
        el('h2', { text: COPY.needsPane }),
        ...needsItems(observations ?? [], candidate),
      ]),
      actorId === 'returning'
        ? el('h2', { text: COPY.addEvidence })
        : null,
      childCard
        ? el('section', { className: 'child-panel', attrs: { 'data-child-panel': child } }, [
            el('h2', { text: childCard.name }),
            ...childBody(child, {
              typedText,
              takeoffText,
              measurementBuffer,
              takeoffBuffer,
              correctingId,
              boardBuffer,
              user1Buffer,
              candidate,
              projection,
              selectedOccurrenceId,
              storeView,
              reviewPresentation,
            }),
            el('button', {
              attrs: { type: 'button', 'data-action': 'back-to-hub' },
              text: COPY.back,
            }),
          ])
        : el('div', { className: 'intake-grid', attrs: { 'data-intake-grid': actorId } }, cards),
      el('button', {
        attrs: { type: 'button', 'data-action': 'back-to-begin' },
        text: COPY.back,
      }),
      el('input', {
        attrs: {
          type: 'file',
          'data-file-input': 'true',
          hidden: 'true',
        },
      }),
    ],
  );
}

export function page5Main({ project, storeView, storeHistory = [] }) {
  return el(
    'main',
    {
      className: 'screen screen-page5',
      attrs: {
        'data-screen': 'store',
        'data-page': 'page5',
        'data-entry-mode': project.entryMode,
        'data-local-record-id': project.localRecordId,
        'data-project-id': project.projectId,
        'data-class-id': project.classId ?? '',
      },
    },
    [
      renderStorePanel(storeView, { mode: 'full' }),
      storeHistory.length > 0
        ? el(
            'section',
            {
              className: 'store-history',
              attrs: {
                'data-store-history': 'true',
                'aria-label': COPY.storeHistoryHeading,
              },
            },
            [
              el('h2', { text: COPY.storeHistoryHeading }),
              ...storeHistory.map((view) => renderStorePanel(view, { mode: 'compact' })),
            ],
          )
        : null,
      el('button', {
        attrs: { type: 'button', 'data-action': 'back-to-hub' },
        text: COPY.back,
      }),
    ],
  );
}
