# Planned custody and permission mechanisms (0.1)

schemaActive: false for every object below. None is implemented in M1.

| Object or gate | Kind | Earliest activation | Prerequisites | Required future fixtures | Prohibited implications |
|---|---|---|---|---|---|
| DisclosureDecision | planned | first milestone that shares outside holder infrastructure | HumanAuthorityRecord; purpose statement | FIX disclosure min/neg | Not an authorization |
| DisclosureEvent | planned | same | DisclosureDecision | event fixture | Not evidence of consent reuse |
| ProcessingRoute | planned | first external processing | DisclosureDecision | route fixture | Not a model identity |
| SecondaryUseGrant | planned | first secondary use | explicit purpose + expiry | grant fixture | Not implied by project use |
| AggregateContribution | planned | first voluntary aggregate | SecondaryUseGrant | contribution fixture | Not source-record custody transfer |
| AggregateStewardshipRecord | planned | same | unresolved institutional choice recorded | stewardship fixture | Not automatic ownership by 3D Solutions |
| ModelUseRecord | planned | first model-assisted step | G-EXTERNAL-PROCESSING | model-use fixture | Not an authority |
| DerivedArtifact | planned | first derived output | provenance to source evidence | derived fixture | Not an observation |
| G-MINIMUM-DISCLOSURE | planned gate | first external share | field inventory | min-disclosure pass/fail | Not a ranking of holders |
| G-DISCLOSURE-AUTHORITY | planned gate | same | authority scope | authority fail fixture | Not production authority |
| G-EXTERNAL-PROCESSING | planned gate | first external processor | ProcessingRoute | external-processing fail | Not a safety gate substitute |
| G-SECONDARY-USE | planned gate | first secondary use | SecondaryUseGrant | secondary-use fail | Not model training permission by default |
| G-AGGREGATION-PERMISSION | planned gate | first aggregate | AggregateContribution | aggregation fail | Not statewide demand proof |
| G-RETENTION-TERMS | planned gate | first external processor | recorded retention terms | unresolved-terms fixture | Not solved by marketing claims |

Activation requires review, versioning, tests, and a recorded decision. Improvement observations cannot alter a rule automatically.
