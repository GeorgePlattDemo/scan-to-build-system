# Shell reaches into `#start-own-proof-frame`

Owner: System. Docs only. This file lists what is in the code; it does not change it.

Source: `apps/stb/public-build/system-build-current.html` at `main` `393b4bdd495c0eb7ddcc67a7bc93293af443feed`.
Frame page: `apps/stb/public-build/three-frames.html`. Its one `<script>` draws the bench geometry (R28) from a message the shell posts. Every other live behavior on it comes from the shell reaching in.

A *reach* is shell code that creates, styles, reads, writes, listens on, or posts to `#start-own-proof-frame` or anything inside its document.

## Dispositions

- **dead** — the reach does nothing today. Its target is not in `three-frames.html`, its branch cannot run, or nothing calls it. It can be deleted without a behavior change.
- **page-should-own** — the reach draws or words the page's own bench: geometry, specs, step copy, highlights, the intent copy on the bench, scrolling. When the page has a script, the page does this itself from the definition it is given, and the shell stops touching it.
- **page-owns** — the reach has moved: the page draws it from a message the shell posts, and the shell no longer touches it.
- **shell-must-keep until the page has a script** — the reach carries a fact or an action the shell owns: user input that becomes the definition, the trail step shown, navigation to shell pages, the Store inquiry, and the Store and runtime answer lines. The shell keeps the decision. When the page has a script, the reach becomes a message across the frame instead of a DOM reach. The frame host (R1–R3) stays in the shell after that.

Line numbers are in `system-build-current.html`.

## Frame host

| # | Line | Reads / writes | Disposition |
|---|------|----------------|-------------|
| R1 | 61 | Writes CSS for `.start-own-shell-frame` (size, border, background of the frame element) | shell-must-keep |
| R2 | 184–190 | Writes the `<iframe id="start-own-proof-frame">` into `#start-own-live` with `src="three-frames.html?v=5d58605a"` | shell-must-keep |
| R3 | 196–198 | Reads the frame `src`; rewrites it if it does not name `three-frames.html`. `#start-own-live` is never present before R2 creates it with that `src`, so the rewrite cannot run | dead |
| R4 | 205, 213–215 | Reads the frame element; writes `data-proof-observed` on it; listens for `load` (R5–R25 and R27–R41 run inside this listener, which ends at 1082) | shell-must-keep |
| R5 | 216–217 | Reads `contentDocument` as `childDoc` | shell-must-keep |

## Inside the frame: input and controls

| # | Line | Reads / writes | Disposition |
|---|------|----------------|-------------|
| R6 | 218, 298, 808–811 | Reads `.stb-bench-button`; writes `disabled` when the Store contract is unavailable; listens for click → `syncAndRender('BENCH_HANDOFF')`, `showStage('bench')` | shell-must-keep |
| R7 | 221, 812–814 | Reads `#stb-bench-back`; listens for click → `showStage('intent')` | shell-must-keep |
| R8 | 222, 815–818 | Reads `#stb-bench-library`; listens for click → `selectJourneyProject(null)`, shell page `projects` | shell-must-keep |
| R9 | 224, 356, 820–825 | Reads `#stb-config-length` and its `value` (finished length for the definition); listens for `input` → new revision, `syncAndRender('CUSTOMER_INPUT')` | shell-must-keep |
| R10 | 826–832 | Reads `[data-length]` buttons; listens for click → writes `#stb-config-length` `value`, new revision, `syncAndRender` | shell-must-keep |
| R11 | 833–839 | Reads `#stb-bench-species [data-species]`; listens for click → toggles `on`, new revision, `syncAndRender` | shell-must-keep |
| R12 | 234–235 | Reads `#stb-store-board-2x4` `data-material-form`, `data-material-nominal-t`, `data-material-nominal-w`, and the `on` species button, into `material.stated` | shell-must-keep |
| R13 | 225, 361 | Reads `#stb-config-boundary-note`; writes `hidden`. Id is not in `three-frames.html` | dead |
| R14 | 226, 362, 840–844 | Reads `#stb-config-reset`; writes `hidden`; listens for click → length `16`, `RESET_DEMO`. Id is not in `three-frames.html` | dead |
| R15 | 227, 368, 786–791 | Reads `#stb-confirm-store`; writes `disabled` and `title` from definition validity and runtime-bridge availability | shell-must-keep |
| R16 | 846–1081 | On `#stb-confirm-store`: writes `data-stb-host-confirm-bound`; listens for click → Store inquiry; writes `disabled` at 857, 865, 871, 899, 1076; on a complete answer goes to shell page `proof-store` (1077–1079) | shell-must-keep |

## Inside the frame: stage and scroll

| # | Line | Reads / writes | Disposition |
|---|------|----------------|-------------|
| R17 | 219–220, 323–324 | Reads `#stb-start-intent-screen` and `#stb-start-bench-screen`; writes `hidden` on each (which step shows) | shell-must-keep |
| R18 | 223, 325–332 | Reads `#stb-bench-intent-slot` and `#stb-start-intent-screen .stb-user1-body`; writes a clone of the intent copy into the slot, with `.stb-bench-button` and all `id`s removed | page-should-own |
| R19 | 336–340 | Reads `.confirm-block`; calls the frame's `requestAnimationFrame` and `scrollIntoView` | page-should-own |
| R20 | 342, 345 | Calls the frame's `scrollTo(0,0)` | page-should-own |

## Inside the frame: Store material and answer lines

| # | Line | Reads / writes | Disposition |
|---|------|----------------|-------------|
| R21 | 228, 297, 312–315 | Reads `#stb-store-glossary-status`; writes its text (Store catalog available or not) | shell-must-keep |
| R22 | 229, 302–310 | Reads `[data-store-size-key]`; writes `data-store-backed`, `data-store-catalog-pin`, `data-store-offering-count`, `hidden` from Store offerings | shell-must-keep |
| R23 | 748–772 | Writes text: `#stb-material-required`, `#stb-price-material`, `#stb-price-processing`, `#stb-price-total`, `#stb-price-basis`, `#stb-basis-sku`, `#stb-basis-source-stock`, `#stb-basis-unit-price`, `#stb-basis-cell-family`, `#stb-basis-supported-ops`, `#stb-basis-clock`, `#stb-basis-catalog-pin`, `#stb-basis-capability`, `#stb-basis-store-pin`, `#stb-basis-economics`, `#stb-basis-pricing-engine`, `#stb-basis-cycle-model`, `#stb-basis-job-time` | shell-must-keep |
| R24 | 775 | Writes `#stb-before-send` text from the definition's unresolved conditions | shell-must-keep |
| R25 | 852, 858, 870, 898 | Writes `#stb-before-send` text: runtime unavailable, asking, Store error, incomplete answer | shell-must-keep |
| R26 | 2450–2451 | Outside the `load` listener, in `startOwnInquire`: reads `#stb-before-send` through `contentDocument`; writes the not-sent / missing-facts text from admission | shell-must-keep |
| R27 | 779–784 | Reads `#stb-system-answer`; writes its HTML (Store reference matched, or live evaluation required) | shell-must-keep |

## Inside the frame: bench drawing and copy

| # | Line | Reads / writes | Disposition |
|---|------|----------------|-------------|
| R28 | — | Moved. The shell posts `STB_BENCH_GEOMETRY` (the definition's workpiece length, quantity, finished length, angle, spot demand) to the frame; `three-frames.html` draws its own parts, cuts and spots SVG into `#stb-bench-dynamic-geometry`. The shell no longer reads or writes that element | page-owns |
| R29 | 606–609 | Reads ten static geometry ids (`#stb-bench-static-parts` … `#stb-bench-part2-dim`); writes `style.display='none'` | page-should-own |
| R30 | 641–650 | Reads `#stb-bench-spare-label`, `#stb-bench-remain-label`; writes `x` | page-should-own |
| R31 | 674–680 | Writes text: `#stb-config-parts-value`, `#stb-config-length-value`, `#stb-config-angle-value`, `#stb-config-spot-value`. Ids are not in `three-frames.html` | dead |
| R32 | 681–686 | Writes text: `#stb-bench-workpiece-spec`, `#stb-bench-length-spec`, `#stb-bench-angle-spec`, `#stb-bench-stock-line`, `#stb-bench-parts-spec` | page-should-own |
| R33 | 687–697 | Writes text: `#stb-def-workpiece`, `#stb-def-parts`, `#stb-def-length`, `#stb-def-angle`, `#stb-def-spot`, `#stb-def-spot-location`, `#stb-def-retained` | page-should-own |
| R34 | 698–704 | Writes text: `#stb-bench-spare-label`, `#stb-bench-remain-label`, `#stb-bench-control-copy` | page-should-own |
| R35 | 705, 714 | Writes text: `#stb-bench-cut-copy`, `#stb-bench-workline` | page-should-own |
| R36 | 706–713 | Reads `#stb-bench-cut-step`, `#stb-bench-drill-step`, `#stb-bench-stub-step`; writes their HTML | page-should-own |
| R37 | 717–730 | Reads `#stb-bench-board-swap`; writes `hidden`, text, HTML (Store picked a longer board) | page-should-own |
| R38 | 735–736 | Writes `#stb-bench-price-line` text | page-should-own |
| R39 | 738–746 | Reads `#stb-user1-bench-svg`; writes `aria-label` | page-should-own |
| R40 | 291–293, 793 | `activate` helper: reads `[data-length]`; toggles `on` to match the current length | page-should-own |

## Helpers

| # | Line | Reads / writes | Disposition |
|---|------|----------------|-------------|
| R41 | 265–268 | `setText` helper: reads an id in `childDoc`; writes `textContent`. Callers are R23–R25 and R31–R35, R38 | shell-must-keep |

## Posted to the frame

| # | Line | Reads / writes | Disposition |
|---|------|----------------|-------------|
| R42 | 1232–1236 | Defines `win.__stbPostStartOwnPreview`: reads the frame, `postMessage` to its `contentWindow`. Nothing in the repository calls it, and `three-frames.html` does not receive its message | dead |

## Looked at, not a reach

- Lines 200–204 and 1085–1088 query `#start-own-live` for `[data-proof-job="1"]` and `#proof-job1-back`. Those are shell-page lookups, not frame lookups. Neither element exists in the shell page either.
- Line 321 writes `data-rev-stage` on `#start-own-live`, the shell page around the frame.

## Count

| Disposition | Rows |
|-------------|------|
| dead | R3, R13, R14, R31, R42 |
| page-should-own | R18, R19, R20, R29, R30, R32–R40 |
| page-owns (moved) | R28 |
| shell-must-keep (until the page has a script; R1–R2 stay after) | R1, R2, R4–R12, R15–R17, R21–R27, R41 |

Every row has one disposition.
