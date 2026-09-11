# Store Work Surface

**Status:** post-app working boundary  
**Current reference Store:** Stage-2 Store Zero  
**Current app Store pin:** `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d`

This folder is the working surface for **Store 1** and future Store expansion.

The Store is the membrane between a resolved project requirement and what a particular fulfillment node can actually offer, supply, support, price, source, or fulfill.

## Store owns

- material offerings and identifiers;
- inventory / availability assertions and their freshness;
- stock form and usable dimensions;
- declared capability and applicable envelope references;
- support / unresolved / refused / unavailable disposition;
- Store economics and budgetary estimate facts;
- sourcing and special-order facts;
- fulfillment facts;
- later real-Store adapter behavior.

## Store does not own

- user evidence custody;
- project meaning or governed gates;
- controller coordinates;
- servo setpoints;
- station coordinates;
- local work offsets;
- tool tables;
- postprocessor syntax;
- controller programs;
- E-stop / safety-relay logic;
- local Cycle Start;
- physical outcome truth.

## What should cross the Store → machine boundary

The Store should provide only the information required for a named downstream capability to understand the work request, for example:

- selected Store material/item identity;
- required stock form;
- part identity;
- finished part-relative dimensions/features;
- quantity and units;
- bounded required operations / machine-neutral sequence;
- declared capability/envelope identity where applicable;
- relevant Store disposition and fulfillment relationship.

The Store should not embed how a particular commissioned machine turns that work into axis motion.

## Store 1 planned work

Future post-baseline work may expand Store 1 with:

- a broader controlled SKU / inventory fixture set;
- clearer local-stock versus unavailable cases;
- additional material classes and stock forms where justified;
- special-order sourcing for requirements not satisfied locally;
- bounded capability declarations for the dimensional and later sheet machine;
- truthful budgetary economic consequences;
- fulfillment states required by User 1 paths.

None of those future items is current merely because it appears here.

## Special order

The intended special-order channel is a Store responsibility. It should complete a material/supply requirement when appropriate without changing project authority or pretending unavailable local stock is on hand.

A future special-order answer must remain distinguishable from:

- local on-hand stock;
- reservation;
- commercial order acceptance;
- fabricated output;
- Store capability;
- governed authorization.

## Machine engineering firewall

Detailed mechanics live under `../machines/engineering/`.

The Store may need a bounded declaration such as supported operation, material form, dimensional limit, installed capability identity, or envelope version. It does **not** need the full BOM, drive model, rack pitch, I/O map, postprocessor, controller configuration, or safety wiring to answer ordinary Store questions.

**Ask the Store for the answer, not the database. Give the machine the bounded work, not the Store.**
