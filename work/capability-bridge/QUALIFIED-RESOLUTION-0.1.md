# QUALIFIED RESOLUTION — HUMAN IN THE LOOP 0.1

`STB-QR-0.1` · specification · not issued

**Status:** draft for review. No implementation exists. Nothing here authorizes machine motion.

Adds a third outcome class to the governed core. Written to be usable by the Store, application, and transaction packet without redefining already-settled boundaries.

## 0. Why this exists

A configured project can be internally coherent, and the Store can price it correctly, while one bounded question still cannot be answered by either the project holder or a declared rule.

Worked example:

> Is a 27.125 in unsupported seat span acceptable in paired 1×6 cherry?

The holder does not know. No envelope check answers it. No arithmetic resolves it. It is a matter of professional judgment. Refusing every such condition is not always the honest or useful outcome; sometimes the right answer is to ask a person qualified to answer exactly that question.

The system therefore needs a way for a person to answer one bounded question, on the record, with their name on it, scoped to exactly what they answered.

This is not a new authority mechanism. It uses the declaration discipline already present elsewhere: author, date, basis, scope, and conditions that void the statement. Human-in-the-loop is declaration plus routing.

## 1. Three outcome classes

Every unresolved condition belongs to exactly one class:

| Class | Who answers |
| --- | --- |
| `RESOLVABLE_BY_HOLDER` | the person being asked about their own project |
| `RESOLVABLE_BY_RULE` | a declared rule or deterministic system check |
| `REQUIRES_QUALIFIED_PERSON` | a named person with declared standing for that condition class |

The third class is the gap. Conditions in it are not refusals merely because software cannot settle them. They are waiting states with an owner.

The distinction that decides the class:

> If a question needs a woodworker to answer it, we should not be asking the customer.

That rule already pushes professional-judgment questions away from the holder. This specification says where they go: to a person with declared standing to answer that class of question.

## 2. `PENDING_QUALIFIED_RESOLUTION`

A new condition state. Not a refusal code.

```text
PENDING_QUALIFIED_RESOLUTION
  condition        the exact unresolved code being escalated
  conditionClass   span | substitution | envelope | procurement | material | other
  question         the question as it will be asked, in plain words
  askedOf          nodeId | NETWORK | NOBODY_DECLARED
  raisedAt         timestamp
  blocksConfirm    true | false
```

Rules:

1. A pending condition is always visible to the holder, with the question shown in the words it will be asked in. Nothing escalates silently.
2. `blocksConfirm: true` means the holder may not confirm until it is resolved. Span and structural conditions are blocking. Procurement and lead-time conditions need not be.
3. A pending condition that nobody in the network can answer becomes a refusal with the gap named. It does not sit pending forever.
4. Pending is not progress. A job pending for a week is a job that is stuck, and the holder should be told so.

## 3. `QualifiedResolution`

The record a person produces when they answer.

```text
QualifiedResolution
  resolutionId
  resolvesCondition   the exact condition code resolved
  conditionClass
  question            what was asked, verbatim
  answer              what they said, verbatim
  author              { name, role }
  node                which Store or cell
  authorityBasis      why this person may answer this class
  scope               what this answer covers
  voidIf              [ conditions that end it ]
  resolvedAt          timestamp
  assertionBasis      DECLARED
  derivation          none, or a stated method
  establishes         what it does establish
  doesNotEstablish    what it does not
```

`scope` and `voidIf` are required and may not be empty. They prevent a resolution from becoming a blank cheque. An unscoped yes is indistinguishable from a guess.

### Worked example

```text
resolvesCondition: STRUCTURAL_SPAN_NOT_EVALUATED
conditionClass: span
question: "Seat span 27.125 in between tower and centre divider,
  paired 1×6 cherry deck at 0.750 in, seated use.
  Is this span acceptable?"
answer: "Yes for that deck and that span."
author: { name: "…", role: "yard owner / designer of record" }
node: store-zero
authorityBasis: "Node declares span-class resolution authority."
scope: "27.125 in maximum unsupported span, paired 1×6 cherry
  deck 0.750 in nominal, centre divider present."
voidIf: [
  "span > 27.125",
  "deck species or thickness changes",
  "divider removed or moved",
  "seat bay width changes"
]
assertionBasis: DECLARED
derivation: none
establishes: "A qualified person declared this span adequate for the stated construction."
doesNotEstablish: "Calculated structural adequacy, code compliance, a rated load,
  or suitability for any other construction."
```

The attachment rule: a declaration attaches to the thing declared. It does not travel to a different thing. If any `voidIf` condition becomes true, the resolution is void and the condition returns to `PENDING_QUALIFIED_RESOLUTION` — not to resolved-by-precedent.

## 4. `ResolutionAuthority`

What a node declares about the questions it can staff. This sits alongside other node declarations. Same discipline: declared, never inferred.

```text
ResolutionAuthority
  nodeId
  conditionClasses   [ classes this node resolves in-house ]
  authority          { role, named person or position }
  responseWindow     declared typical, not promised
  escalatesTo        [ nodeIds ] | NETWORK | NONE
  declaredOn
```

Example:

| Node | Resolves in-house | Escalates to |
| --- | --- | --- |
| store-zero | span, substitution, material | store-one |
| store-one | span, substitution, material, envelope, procurement | none |

A node unable to answer an out-of-envelope question may route it to another node that declares standing for that class.

Rules:

1. A node that declares no authority routes everything. That is valid, not a failure.
2. Authority is per class, never blanket. Declaring span authority does not declare fire-rating authority.
3. A node may not resolve a class it has not declared. The system should reject the answer, not just the question.
4. Declared authority is not a promise of response. `responseWindow` is typical, not committed.

## 5. Routing

```text
condition raised
    ↓
classify → HOLDER | RULE | QUALIFIED
                  ↓ qualified
does this node declare the class?
  ├── yes → ask here
  └── no  → escalate per ResolutionAuthority
              ├── a node declares it → ask there
              └── nobody declares it → REFUSED, gap named
    ↓
person answers, declines, or does not respond
    ↓
QualifiedResolution written | still pending | REFUSED
```

The holder remains in the loop. They see the question, who it went to, and the answer when it comes back. They may decline escalation and change the project instead.

Nobody-declared is a real outcome. A condition no node in the network can answer produces a refusal with the gap named. Aggregating those refusals yields the human-capability version of the refusal corpus: the questions the network cannot currently answer and therefore the expertise it lacks.

## 6. What a qualified person may not do

The boundaries matter more than the permissions.

- **May not change the holder's controlling dimensions.** If the right answer requires a different opening width, that returns to the holder as a new version. A resolution answers a question; it does not edit a project.
- **May not resolve anonymously.** No author, no resolution. Anonymous resolution is silent conversion wearing a hat.
- **May not answer outside their declared class.** The system rejects the answer, not just the question.
- **May not resolve by precedent.** “We said yes to one of these last month” is not a resolution of this one. Each condition is answered or it is not.
- **May not authorize machine motion.** Resolution is not release. Release is not readiness. Readiness is not Cycle Start.
- **May not convert a blocking condition to non-blocking.** Whether a class blocks confirmation belongs to the class, not to a counter judgment call.

## 7. A tenth collapse

Add:

> **Resolution is not release.**

A qualified person answering a question does not release the job into production. It removes one blocker. Commercial and production conditions still apply, in order, with their own owners.

## 8. Where it sits in the eight stages

**QUALIFIED RESOLUTION is not a ninth stage.** It is a loop available at any stage, most often at STORE.

| Boundary | Meaning |
| --- | --- |
| OWNS | Answers to bounded questions that neither the holder nor a rule can settle. |
| RECEIVES | One condition, one question, and the context needed to answer it. Never the whole job. |
| MAY DO | Answer within a declared class. Decline. Escalate. Say “I don't know.” |
| MAY NOT DO | Change the definition, answer anonymously, answer outside class, resolve by precedent, release the job, or authorize motion. |

“Receives one condition, not the whole job” is deliberate. A qualified person should answer the bounded question rather than inherit unrelated commercial or project authority.

## 9. What the holder sees

Plain language. The mechanism does not need to surface as internal schema.

> **One thing needs a person.**
>
> A 27-inch seat span with paired 1×6 cherry is a judgment call, not a calculation. We are not going to guess, and it is not a question you should have to answer.
>
> We can ask the yard.
>
> `[ ASK THE YARD ]  [ CHANGE THE DESIGN INSTEAD ]  [ LEAVE IT FOR NOW ]`

While pending:

> Waiting on the yard — asked 14 minutes ago. You cannot confirm this version until it comes back. Nothing else is holding it up.

After:

> Answered. The yard says 27 inches is fine for that deck. Their answer covers this span in this material with the divider in place — change any of those and we ask again.
>
> Answered by `[name]`, `[role]`, `[node]`, `[date]`.

Rules:

1. The person always sees the question in the words it will be asked.
2. “Change the design instead” is always offered. Escalation is never the only way forward.
3. The answer is shown with its author and scope, not as a green tick.
4. Never “approved.” Always “answered,” with who answered.

## 10. Intended placement

### Store

Future candidate implementation could include:

- this specification;
- node declarations of `ResolutionAuthority`;
- a bounded writer/validator for `QualifiedResolution`;
- Store-specific declared authority data;
- tests for unscoped resolution, out-of-class answers, `voidIf`, and nobody-declared refusal.

### Definitions

Never-equate additions:

- Pending qualified resolution ≠ refused
- Qualified resolution ≠ calculated result
- Declared authority ≠ guaranteed response
- Answering a question ≠ releasing a job
- Resolving a condition ≠ changing a definition
- One qualified answer ≠ a precedent

### Transaction packet

A qualified resolution belongs with the exact version it resolves, between evaluation and any later commercial/production transition. It should carry author, scope, `voidIf`, timestamp, and be visible at review and closeout.

### Application

Future candidate UI may include:

- pending block on the configurator, blocking confirm where the class says so;
- ask / change / leave controls;
- resolution shown at review with author and scope;
- tenth collapse on the responsibility/result page;
- qualified resolution shown as a loop around the eight-stage map, not a ninth stage.

## 11. Unresolved

- **Identity and standing.** How a node proves its declared authority is real. Out of scope here and still a real question.
- **Response when nobody answers.** A pending condition with no reply needs an expiry that turns it into refusal. The window is undeclared.
- **Liability.** A named person declaring a span has said something with weight. What that means legally is not a software question and is not answered here.
- **Compensation.** Whether a resolution is billable, and to whom.
- **Precedent, properly.** Resolving by precedent is forbidden. Whether a rule can later be derived from many similar resolutions is a separate future question.

## 12. Not claimed

No implementation exists in this specification. No node has declared authority. No resolution has been written merely because this file exists.

Qualified resolution does not authorize physical fabrication, machine readiness, or Cycle Start. It removes one blocker from one version of one project, on the record, with a name on it.

**NO BLOOD ON WOOD.**
