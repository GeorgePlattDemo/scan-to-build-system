# Working Principle — Store / Machine Boundary

The Store is allowed to know enough about a machine/cell to answer a bounded capability question. It is not allowed to become the machine implementation.

## Upstream-visible machine facts

Examples of facts that may belong in a Store-facing capability declaration:

- machine/cell identity and capability version;
- material form/class supported;
- bounded operations supported;
- dimensional/work envelope relevant to routing;
- declared prerequisites;
- explicit unsupported/refusal conditions;
- evidence status: reference/model/commissioned/measured;
- fulfillment consequences where Store owns them.

## Machine-local facts

Examples that normally remain machine/cell-local:

- axis coordinates and homing details;
- station transforms;
- kerf/local kept-face compensation;
- controller program text;
- postprocessor syntax;
- servo tuning;
- drive/motor part numbers;
- I/O map;
- safety relay / PLC wiring;
- work-offset implementation;
- local probe routines;
- tool-change mechanics;
- real-time interlocks and motion state.

## Chain

```text
project requirement
  → Store material/capability/economic resolution
  → bounded machine-neutral work
  → local lowering
  → local controller
  → physical machine
  → observed outcome
```

No later layer is allowed to backfill authority missing from an earlier layer.
