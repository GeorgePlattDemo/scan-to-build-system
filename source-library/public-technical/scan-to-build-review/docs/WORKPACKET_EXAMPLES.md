# WorkPacket Examples — Annotated Reference

> **Review status:** Illustrative reference contracts for pilot evaluation, not implementation guarantees. The values below are demonstration data; economic and sustainability figures are pilot-measurable variables, not validated results.

**Companion documents:** [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`MATERIAL_AND_LABOR_ONTOLOGY.md`](MATERIAL_AND_LABOR_ONTOLOGY.md)

---

## Why this file exists

The demonstration app and architecture documents describe the system in prose. This file shows the actual artifact that moves through it: a **WorkPacket** — the versioned, validated unit of work the homeowner's record produces and routes — and the **Outcome** it returns when the work is done.

You do not need to read the JSON to understand the system. Each example is wrapped in a plain-language description; the JSON is included so a technical reviewer can confirm the packet is a real, machine-readable contract rather than a concept. Read the descriptions; open the code blocks only if you want the proof.

Two proof cases run through the entire package, and they appear here in full:

- **Woodwork (Sarah's alcove)** is the *fabrication* proof — everything is made locally inside a bounded machine cell.
- **Windows (full-frame replacement)** is the *orchestration* proof — a vendor unit, locally fabricated trim, and specialized install labor are coordinated as one governed project.

Both follow the same pattern: the homeowner-controlled record produces a versioned packet → the packet routes through eligible channels in a shared language → refusals are preserved, not hidden → the finished outcome returns to the record.

---

## 1. Woodwork WorkPacket — Sarah's alcove built-in

**What this is:** A built-in shelving unit fabricated to fit an alcove that is out of square. Every part is cut from sheet stock and dimensional lumber on bounded local machinery, so the whole packet routes to a single fabrication cell.

**What to notice, in plain terms:**

- The packet is **version 3**, and it carries its own history: a prior version was *refused* because the original design specified a solid-wood top that would crack as humidity changed it. That refusal is preserved in the record (`priorRefusals`), with a plain-language explanation for the owner. **Refusals are data, not errors** — this is the "earlier refusal of unsuitable stock" the workforce brief describes.
- Each material line names an **ontology node** (e.g. `mat.sheet.plywood.cabinet.0750`), never a store SKU. The packet is portable across vendors by design.
- Fabrication steps declare a **mode** and a **required tolerance**; the orchestrator matches those against what a machine cell can actually do before any atoms move.
- Labor lines name **tiers** (`OP-MS` for material confirmation, `CS` for the mode-3 edge profile), and the final assembly is an owner task (`OA`) with a mandatory instruction sheet — the patent's "labeled, ready-to-assemble" output.

```json
{
  "packetId": "pkt_wd_alcove_001",
  "projectId": "prj_alcove_sarah",
  "version": 3,
  "schemaVersion": "packet/v2",
  "ontologyVersion": "2026.05",
  "summary": "Alcove built-in: three fixed shelves, scribed sides, profiled top edge, painted white.",
  "deliverable": {
    "class": "finished_good",
    "node": "fin.builtin.alcove",
    "warrantyTargetYears": 5
  },
  "capture": [
    {
      "ref": "doc:scan/A-128",
      "kind": "3d_scan",
      "subjects": [
        "site.alcove.walls",
        "site.alcove.floor"
      ],
      "confidence": 0.97,
      "verified": true,
      "capturedAt": "2026-05-28T14:02:00Z"
    }
  ],
  "siteInterfaces": [
    {
      "lineId": "site.1",
      "class": "site_interface",
      "node": "site.opening.alcove",
      "findings": {
        "outOfSquareIn": 0.375,
        "floorLevelDeltaIn": 0.125
      },
      "constraintFor": [
        "bom.c1",
        "bom.c2"
      ]
    }
  ],
  "bom": [
    {
      "lineId": "bom.r1",
      "class": "raw",
      "node": "mat.sheet.plywood.cabinet.0750",
      "qty": 3,
      "unit": "sheet",
      "useClass": "interior",
      "substitution": "spec_equivalent",
      "routable": "cell"
    },
    {
      "lineId": "bom.r2",
      "class": "raw",
      "node": "mat.raw.edgeband.birch.preglued",
      "qty": 40,
      "unit": "lf",
      "useClass": "interior",
      "substitution": "spec_equivalent",
      "routable": "cell"
    },
    {
      "lineId": "bom.i1",
      "class": "ingredient",
      "node": "mat.ing.paint.acrylic.interior.white",
      "qty": 1,
      "unit": "gal",
      "useClass": "interior",
      "substitution": "spec_equivalent",
      "routable": "cell"
    },
    {
      "lineId": "bom.c1",
      "class": "component",
      "node": "cmp.panel.side.scribed",
      "qty": 2,
      "unit": "ea",
      "useClass": "interior",
      "consumes": [
        "bom.r1"
      ],
      "fabrication": [
        {
          "type": "rout.stencil",
          "mode": 2,
          "params": {
            "profileRef": "doc:cam/side-A128",
            "scribeAllowanceIn": 0.5
          },
          "requiredToleranceIn": 0.03125
        }
      ],
      "tolerance": [
        {
          "dim": "height",
          "plusMinusIn": 0.03125
        }
      ],
      "substitution": "exact",
      "routable": "cell"
    },
    {
      "lineId": "bom.c2",
      "class": "component",
      "node": "cmp.panel.shelf.fixed",
      "qty": 3,
      "unit": "ea",
      "useClass": "interior",
      "consumes": [
        "bom.r1"
      ],
      "fabrication": [
        {
          "type": "rout.stencil",
          "mode": 2,
          "params": {
            "w_in": 44.75,
            "d_in": 11.25
          },
          "requiredToleranceIn": 0.03125
        },
        {
          "type": "drill.pattern",
          "mode": 2,
          "params": {
            "pattern": "shelfpin.32mm"
          },
          "requiredToleranceIn": 0.015625
        }
      ],
      "substitution": "exact",
      "routable": "cell"
    },
    {
      "lineId": "bom.c3",
      "class": "component",
      "node": "cmp.panel.top.profiled",
      "qty": 1,
      "unit": "ea",
      "useClass": "interior",
      "consumes": [
        "bom.r1"
      ],
      "fabrication": [
        {
          "type": "rout.stencil",
          "mode": 2,
          "params": {
            "w_in": 46.25,
            "d_in": 12.0
          },
          "requiredToleranceIn": 0.03125
        },
        {
          "type": "edge.profile",
          "mode": 3,
          "params": {
            "profile": "roundover.0250.front"
          },
          "requiredToleranceIn": 0.015625
        }
      ],
      "substitution": "exact",
      "routable": "cell"
    },
    {
      "lineId": "bom.c4",
      "class": "component",
      "node": "cmp.nailer.dimensional",
      "qty": 2,
      "unit": "ea",
      "useClass": "interior",
      "consumes": [],
      "fabrication": [
        {
          "type": "crosscut",
          "params": {
            "len_in": 44.75,
            "stock": "1x4.pine"
          },
          "requiredToleranceIn": 0.0625
        }
      ],
      "substitution": "spec_equivalent",
      "routable": "cell"
    }
  ],
  "materialConfirmation": {
    "required": true,
    "tier": "OP-MS",
    "checks": [
      "sheet.flatness.longpanel",
      "grade.match"
    ]
  },
  "labor": [
    {
      "lineId": "lab.1",
      "task": "confirm.material",
      "tier": "OP-MS",
      "riskClass": "standard",
      "estHours": 0.3
    },
    {
      "lineId": "lab.2",
      "task": "fabricate",
      "tier": "OP",
      "riskClass": "standard",
      "estHours": 2.5
    },
    {
      "lineId": "lab.3",
      "task": "mode3.fixture_and_profile",
      "tier": "CS",
      "riskClass": "standard",
      "estHours": 0.5
    },
    {
      "lineId": "lab.4",
      "task": "prefinish.spray",
      "tier": "OP",
      "riskClass": "standard",
      "estHours": 1.0
    },
    {
      "lineId": "lab.5",
      "task": "assemble.labeled_kit",
      "tier": "OA",
      "riskClass": "standard",
      "verificationRequired": {
        "tier": "VER",
        "method": "owner.self_verify"
      }
    }
  ],
  "machineRequirements": [
    {
      "forLine": "bom.c1",
      "envelopeClass": "sheet_cell",
      "ops": [
        {
          "type": "rout.stencil",
          "mode": 2,
          "params": {},
          "requiredToleranceIn": 0.03125
        }
      ]
    },
    {
      "forLine": "bom.c3",
      "envelopeClass": "sheet_cell",
      "ops": [
        {
          "type": "edge.profile",
          "mode": 3,
          "params": {},
          "requiredToleranceIn": 0.015625
        }
      ]
    },
    {
      "forLine": "bom.c4",
      "envelopeClass": "dimensional_cell",
      "ops": [
        {
          "type": "crosscut",
          "params": {},
          "requiredToleranceIn": 0.0625
        }
      ]
    }
  ],
  "serviceInputs": [
    {
      "lineId": "svc.1",
      "class": "service_input",
      "node": "svc.transport.owner_pickup",
      "qty": 1,
      "unit": "ea",
      "useClass": "interior",
      "substitution": "owner_approval",
      "routable": "site"
    }
  ],
  "validation": {
    "ok": true,
    "checkedAt": "2026-06-03T10:15:00Z",
    "priorRefusals": [
      {
        "code": "MATERIAL_UNSUITABLE",
        "packetVersion": 1,
        "lineRef": "bom.c3",
        "message": "Solid edge-glued panel at 46.25in width, fixed cross-grain attachment: movement risk.",
        "ownerExplanation": "The originally specified solid-wood top would move with humidity and could crack. Plywood with a profiled edge meets the same look without the risk.",
        "raisedBy": "system:orchestrator.validate",
        "raisedAt": "2026-06-01T09:40:00Z",
        "suggestedActions": [
          "substitute_node:mat.sheet.plywood.cabinet.0750"
        ]
      }
    ]
  },
  "releasePolicy": {
    "escrow": "held_until_owner_verification",
    "verification": "owner",
    "dataScope": "packet_only"
  }
}
```

---

## 2. Windows WorkPacket — full-frame replacement

**What this is:** Replacing a failing window. The capture revealed deteriorated sill flashing, so the project became a *full-frame* replacement rather than a simple insert — and that scope change is recorded, explained, and priced **before** purchase rather than discovered on site.

**What to notice, in plain terms:**

- This packet **mixes routabilities** — the inversion inside one project. The window unit (`routable: "vendor"`) is a manufactured good that has to travel; the interior trim (`routable: "cell"`) is fabricated locally because it needn't travel. The `decompositionHint` at the bottom shows how the one project splits into vendor, cell, and labor scopes.
- The vendor unit is specified by **performance** (U-factor, SHGC, glazing type), not by brand — so equivalent units can compete, and substituting one requires explicit owner approval.
- The scope flip from insert to full-frame appears as a preserved refusal (`SITE_CONDITION_UNRESOLVED`) that an elevated-risk installer (`INST-S`) resolved through assessment.
- Closure is gated on an **independent water-test verification** (`VER`) — the countermeasure to the classic window-install callback.

```json
{
  "packetId": "pkt_win_dh3660_001",
  "projectId": "prj_window_main_bedroom",
  "version": 2,
  "schemaVersion": "packet/v2",
  "ontologyVersion": "2026.05",
  "summary": "Full-frame replacement of failing 36x60 double-hung; WRB/flashing integration; locally fabricated extension jambs and casing.",
  "deliverable": {
    "class": "finished_good",
    "node": "fin.window.installed.fullframe",
    "warrantyTargetYears": 10
  },
  "capture": [
    {
      "ref": "doc:measure/RO-MB1",
      "kind": "laser_measure",
      "subjects": [
        "site.rough_opening.mb1"
      ],
      "confidence": 0.98,
      "verified": true,
      "capturedAt": "2026-05-20T16:10:00Z"
    },
    {
      "ref": "doc:photo/sill-MB1",
      "kind": "photo_assessment",
      "subjects": [
        "site.sill.mb1"
      ],
      "confidence": 0.9,
      "verified": true,
      "capturedAt": "2026-05-20T16:25:00Z"
    }
  ],
  "siteInterfaces": [
    {
      "lineId": "site.1",
      "class": "site_interface",
      "node": "site.rough_opening.window",
      "findings": {
        "ro_w_in": 36.5,
        "ro_h_in": 60.25,
        "wallDepthIn": 5.5625
      },
      "constraintFor": [
        "bom.v1",
        "bom.c1"
      ]
    },
    {
      "lineId": "site.2",
      "class": "site_interface",
      "node": "site.sill.condition",
      "findings": {
        "condition": "flashing.deteriorated",
        "resolvedAs": "fullframe.scope"
      },
      "resolution": {
        "by": "INST-S:assess",
        "event": "ev_assess_0520"
      },
      "constraintFor": [
        "lab.2"
      ]
    }
  ],
  "bom": [
    {
      "lineId": "bom.v1",
      "class": "vendor_product",
      "node": "vnd.window.dh.36x60",
      "qty": 1,
      "unit": "ea",
      "useClass": "exterior",
      "performance": {
        "uFactorMax": 0.3,
        "shgcMax": 0.4,
        "glazing": "dual.lowE.argon",
        "cladding": "exterior_clad"
      },
      "substitution": "owner_approval",
      "routable": "vendor"
    },
    {
      "lineId": "bom.v2",
      "class": "vendor_product",
      "node": "vnd.flashing.pan.sloped",
      "qty": 1,
      "unit": "ea",
      "useClass": "exterior",
      "performance": {
        "systemCompatibility": "wrb.tie_in.classA"
      },
      "substitution": "spec_equivalent",
      "routable": "vendor"
    },
    {
      "lineId": "bom.v3",
      "class": "vendor_product",
      "node": "vnd.flashing.tape.classA",
      "qty": 1,
      "unit": "ea",
      "useClass": "exterior",
      "performance": {
        "systemCompatibility": "wrb.tie_in.classA"
      },
      "substitution": "spec_equivalent",
      "routable": "vendor"
    },
    {
      "lineId": "bom.c1",
      "class": "component",
      "node": "cmp.jamb.extension",
      "qty": 4,
      "unit": "ea",
      "useClass": "interior",
      "consumes": [
        "bom.r1"
      ],
      "fabrication": [
        {
          "type": "rip",
          "params": {
            "width_in": 5.5625
          },
          "requiredToleranceIn": 0.03125
        },
        {
          "type": "crosscut",
          "params": {},
          "requiredToleranceIn": 0.03125
        }
      ],
      "substitution": "exact",
      "routable": "cell"
    },
    {
      "lineId": "bom.c2",
      "class": "component",
      "node": "cmp.casing.interior.set",
      "qty": 1,
      "unit": "ea",
      "useClass": "interior",
      "consumes": [
        "bom.r2"
      ],
      "fabrication": [
        {
          "type": "miter",
          "params": {
            "profile": "casing.colonial.214"
          },
          "requiredToleranceIn": 0.03125
        }
      ],
      "substitution": "spec_equivalent",
      "routable": "cell"
    },
    {
      "lineId": "bom.r1",
      "class": "raw",
      "node": "mat.raw.pine.primed.1x6",
      "qty": 24,
      "unit": "lf",
      "useClass": "interior",
      "substitution": "spec_equivalent",
      "routable": "cell"
    },
    {
      "lineId": "bom.r2",
      "class": "raw",
      "node": "mat.raw.casing.colonial.214",
      "qty": 18,
      "unit": "lf",
      "useClass": "interior",
      "substitution": "spec_equivalent",
      "routable": "cell"
    },
    {
      "lineId": "bom.i1",
      "class": "ingredient",
      "node": "mat.ing.sealant.exterior.polyurethane",
      "qty": 2,
      "unit": "ea",
      "useClass": "exterior",
      "substitution": "spec_equivalent",
      "routable": "site"
    }
  ],
  "labor": [
    {
      "lineId": "lab.1",
      "task": "fabricate.trim",
      "tier": "OP",
      "riskClass": "standard",
      "estHours": 1.0
    },
    {
      "lineId": "lab.2",
      "task": "install.window.fullframe",
      "tier": "INST-S",
      "scope": "install.window.fullframe",
      "riskClass": "elevated",
      "estHours": 5.0,
      "verificationRequired": {
        "tier": "VER",
        "method": "flashing.water_test"
      }
    },
    {
      "lineId": "lab.3",
      "task": "haul_away.old_unit",
      "tier": "SVC",
      "scope": "disposal.manifest",
      "riskClass": "standard"
    }
  ],
  "machineRequirements": [
    {
      "forLine": "bom.c1",
      "envelopeClass": "dimensional_cell",
      "ops": [
        {
          "type": "rip",
          "params": {},
          "requiredToleranceIn": 0.03125
        }
      ]
    }
  ],
  "serviceInputs": [
    {
      "lineId": "svc.1",
      "class": "service_input",
      "node": "svc.finance.escrow",
      "qty": 1,
      "unit": "ea",
      "useClass": "interior",
      "substitution": "exact",
      "routable": "site"
    },
    {
      "lineId": "svc.2",
      "class": "service_input",
      "node": "svc.permit.check",
      "qty": 1,
      "unit": "ea",
      "useClass": "interior",
      "substitution": "exact",
      "routable": "site",
      "result": {
        "jurisdictionChecked": true,
        "permitRequired": false,
        "checkedEvent": "ev_permit_check_0521"
      }
    }
  ],
  "validation": {
    "ok": true,
    "checkedAt": "2026-05-22T09:00:00Z",
    "priorRefusals": [
      {
        "code": "SITE_CONDITION_UNRESOLVED",
        "packetVersion": 1,
        "lineRef": "site.2",
        "message": "Sill flashing deterioration observed; insert scope cannot be confirmed.",
        "ownerExplanation": "Photos show the flashing under the old window has failed. An insert replacement would seal over the problem. An assessment resolved the scope to full-frame so the flashing is rebuilt correctly.",
        "raisedBy": "system:orchestrator.validate",
        "raisedAt": "2026-05-20T17:00:00Z",
        "suggestedActions": [
          "route_assessment:INST-S",
          "rescope:fullframe"
        ]
      }
    ]
  },
  "decompositionHint": [
    {
      "scope": "vendor.unit_and_flashing",
      "lines": [
        "bom.v1",
        "bom.v2",
        "bom.v3"
      ]
    },
    {
      "scope": "cell.trim",
      "lines": [
        "bom.c1",
        "bom.c2",
        "bom.r1",
        "bom.r2"
      ]
    },
    {
      "scope": "labor.install",
      "lines": [
        "lab.2",
        "lab.3",
        "bom.i1"
      ]
    }
  ],
  "releasePolicy": {
    "escrow": "held_until_owner_verification",
    "verification": "independent_VER.flashing.water_test",
    "dataScope": "packet_only"
  }
}
```

---

## 3. Woodwork Outcome — what returns to the record

**What this is:** The preserved result of the alcove project. When work closes, the record keeps the warranty, the as-built deltas (what was actually built vs. specified), and the outcome metrics — so the *next* project starts from better information.

**What to notice:** Every metric carries a `basis` (`measured`, `channel_reported`, or `derived`) and the `sourceEvents` it was computed from. Nothing is asserted; everything is auditable. `first_fit: true` means the scribed sides met the out-of-square wall without site rework — the headline claim of the whole architecture, bound to its source event rather than merely promised.

Note: These WorkPacket examples are public-review fixtures. Outcome metrics shown here demonstrate record shape and source-event binding, not validated field results. In this package, example values are labeled modeled, simulation, mock_fixture, or reference unless and until a future pilot produces measured records.

```json
{
  "outcomeId": "out_wd_alcove_001",
  "projectId": "prj_alcove_sarah",
  "finalPacketVersion": 3,
  "ontologyVersion": "2026.05",
  "channelId": "store.cell.gso_006",
  "archivedAt": "2026-06-09T18:30:00Z",
  "warranty": {
    "years": 5,
    "scope": "fabricated components, finish adhesion",
    "docRef": "doc:warranty/wd-alcove"
  },
  "asBuilt": {
    "deltas": [
      {
        "line": "bom.c1",
        "field": "scribe.left.in",
        "specified": 0.5,
        "actual": 0.4375
      }
    ],
    "serviceNote": "Touch-up paint (same batch) stored: garage shelf B."
  },
  "metrics": [
    {
      "name": "first_fit",
      "value": true,
      "basis": "simulation",
      "sourceEvents": [
        "ev_ms_verify_0609"
      ]
    },
    {
      "name": "atom_miles",
      "value": 6.2,
      "basis": "modeled",
      "sourceEvents": [
        "ev_leg_pickup_0608"
      ]
    },
    {
      "name": "site_visits",
      "value": 1,
      "basis": "derived",
      "sourceEvents": [
        "ev_assemble_0609"
      ]
    },
    {
      "name": "scrap_fraction",
      "value": 0.11,
      "basis": "channel_reported",
      "sourceEvents": [
        "ev_scrap_0607"
      ]
    },
    {
      "name": "local_value_share",
      "value": 1.0,
      "basis": "derived",
      "sourceEvents": [
        "ev_order_0604"
      ]
    },
    {
      "name": "lead_time_days",
      "value": 6,
      "basis": "derived",
      "sourceEvents": [
        "ev_pkt_v1_0601",
        "ev_close_0609"
      ]
    },
    {
      "name": "refusal_count",
      "value": 1,
      "basis": "derived",
      "sourceEvents": [
        "ev_refusal_0601"
      ]
    }
  ]
}
```

---

## 4. Windows Outcome — multi-channel result preserved

**What this is:** The preserved result of the window project, closing a job that involved three different channels (vendor, local cell, installer) plus finance and independent verification.

**What to notice:** The outcome binds **separate warranties** (the vendor's unit warranty and the installer's workmanship warranty), records the **escrow release** tied to verified completion, and splits **atom-miles by scope** — so the freight the vendor unit required is visible and separable from the local trim that traveled almost nothing. `callback_rate: 0` with a passing water test is the result the verification gate was designed to produce.

```json
{
  "outcomeId": "out_win_dh3660_001",
  "projectId": "prj_window_main_bedroom",
  "finalPacketVersion": 2,
  "ontologyVersion": "2026.05",
  "channels": {
    "vendor.unit_and_flashing": "vendor.fenestration_net_012",
    "cell.trim": "store.cell.gso_006",
    "labor.install": "svc.tiered.install_044"
  },
  "archivedAt": "2026-06-18T20:05:00Z",
  "warranty": {
    "vendorUnit": {
      "years": 10,
      "terms": "doc:warranty/vnd-unit-MB1"
    },
    "installWorkmanship": {
      "years": 2,
      "terms": "doc:warranty/install-MB1"
    }
  },
  "finance": {
    "escrow": "released",
    "releaseEvent": "ev_escrow_release_0618",
    "instrument": "svc.finance.escrow"
  },
  "asBuilt": {
    "deltas": [
      {
        "line": "bom.c1",
        "field": "wallDepthIn",
        "specified": 5.5625,
        "actual": 5.5
      }
    ],
    "verification": {
      "method": "flashing.water_test",
      "result": "pass",
      "verifier": "VER:cert_8841",
      "event": "ev_ver_watertest_0617"
    }
  },
  "metrics": [
    {
      "name": "first_fit",
      "value": true,
      "basis": "simulation",
      "sourceEvents": [
        "ev_ver_watertest_0617"
      ]
    },
    {
      "name": "site_visits",
      "value": 2,
      "basis": "derived",
      "sourceEvents": [
        "ev_assess_0520",
        "ev_install_0617"
      ]
    },
    {
      "name": "atom_miles",
      "value": 318.4,
      "basis": "modeled",
      "sourceEvents": [
        "ev_leg_vendor_0612",
        "ev_leg_trim_0615",
        "ev_leg_install_0617"
      ]
    },
    {
      "name": "local_value_share",
      "value": 0.46,
      "basis": "derived",
      "sourceEvents": [
        "ev_order_0606"
      ]
    },
    {
      "name": "callback_rate",
      "value": 0,
      "basis": "simulation",
      "sourceEvents": []
    },
    {
      "name": "time_to_resolved_scope_days",
      "value": 2,
      "basis": "derived",
      "sourceEvents": [
        "ev_capture_0520",
        "ev_rescope_0522"
      ]
    },
    {
      "name": "refusal_count",
      "value": 1,
      "basis": "derived",
      "sourceEvents": [
        "ev_refusal_0520"
      ]
    }
  ]
}
```

---

## How these connect to the rest of the package

| Layer | Document | What it gives you |
|---|---|---|
| Experience | `index.html`, `home-twin-app.html` | See the system work, end to end |
| Architecture | `ARCHITECTURE.md` | How the record, orchestrator, gates, and channels are built |
| Language | `MATERIAL_AND_LABOR_ONTOLOGY.md` | The shared vocabulary these packets speak |
| **Evidence** | **this file** | **The actual contracts, proving the language is real and machine-readable** |

The packet is the contract. The ontology is the language that lets the contract survive each boundary crossing. These four examples are that contract, filled in.
