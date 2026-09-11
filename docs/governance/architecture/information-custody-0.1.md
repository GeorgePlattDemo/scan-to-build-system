# Information custody (0.1)

Informative companion to Demand as Architecture 0.3. The 0.3 paper is unchanged and remains the frozen source.

Connecting useful information does not by itself transfer ownership, custody, authority, or unrestricted reuse rights. A record may remain with its holder while a bounded assertion, permission, or response is made callable. Immediate project use does not imply permission for research, model improvement, aggregation, marketing, or another secondary purpose.

| Proposition | Planned record / event / gate | M1 status |
|---|---|---|
| Holder-controlled records | HumanAuthorityRecord; future DisclosureDecision | Active authority records only; no disclosure object |
| Purpose limitation | SecondaryUseGrant (planned) | Planned |
| Minimum disclosure | G-MINIMUM-DISCLOSURE (planned) | Planned |
| Explicit secondary-use permission | SecondaryUseGrant (planned) | Planned |
| Provenance | record headers, inputProvenance | Active on M1 records |
| Revocation or expiration | HumanAuthorityRecord.validThrough; future grant expiry | Partial (authority dates) |
| No automatic customer graph | refusal of customer-list fields | Active prohibition; no graph object |
| No conversion of a project record into a training set | ModelUseRecord; G-SECONDARY-USE | Planned; M1 has no model calls |
| No automatic collection of private refusals | RefusalRecord remains holder-scoped | Active rule; no aggregate |
| No promotion of inference into observation or authority | status materializer | Active |
| No weakening of I0 through an information-use agreement | G-I0 + eligibility policy | Active |

M1 contains no model calls and no external processing.
