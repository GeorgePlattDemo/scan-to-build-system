# ADR-0015 No silent unit conversion

Status: accepted

Context: Metric observations may exist.

Decision: M1 does not convert mm/m into inches for APP-RULE.SHELF-SPAN.GEOM.v1.

Consequences: Metric-only width leaves geometric fit unresolved with METRIC_NOT_CONVERTED_IN_M1.

Does not establish: that metric values are invalid.

Affected: packages/gates, docs/architecture/metric-limitation-m1.md
