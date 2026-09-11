# Disclosure traversal (planned, 0.1)

```
Holder-controlled record
        ↓
Proposed use
        ↓
Minimum necessary fields
        ↓
Permitted recipient or processor
        ↓
Disclosure decision
        ↓
Local processing or recorded disclosure event
        ↓
Derived result with provenance
        ↓
Permitted retention and reuse
        ↓
Optional bounded aggregate contribution
        ↓
Named steward and purpose
        ↓
Reviewed improvement candidate
```

| Step | Source | Planned object | Planned event | Planned gate | Refusal | Fixture | M1 status | Document |
|---|---|---|---|---|---|---|---|---|
| Holder-controlled record | Demand 0.3 | existing records | — | — | — | FIX.A-SHELF-SIM-PASS-MIN.v1 | implemented records | information-custody-0.1 |
| Proposed use | this note | DisclosureDecision | — | G-DISCLOSURE-AUTHORITY | CONSENT_REQUIRED | future | planned | planned-custody-mechanisms-0.1 |
| Minimum fields | this note | DisclosureDecision | — | G-MINIMUM-DISCLOSURE | over-disclosure | future | planned | planned-custody-mechanisms-0.1 |
| Recipient/processor | external-processing-0.1 | ProcessingRoute | DisclosureEvent | G-EXTERNAL-PROCESSING | unresolved terms | future | planned | external-processing-0.1 |
| Derived result | this note | DerivedArtifact | — | — | inference-as-observation | future | information-custody-0.1 |
| Aggregate | aggregate-stewardship-unresolved-0.1 | AggregateContribution | — | G-AGGREGATION-PERMISSION | automatic aggregation | future | planned | aggregate-stewardship-unresolved-0.1 |
| Improvement candidate | REF improvement governance | — | — | review, not automatic | silent rule change | future | conceptual | STB-REF-0.2.5 |

Improvement observations cannot alter a rule, prompt, schema, MachineEnvelope, recommendation, or gate automatically.
