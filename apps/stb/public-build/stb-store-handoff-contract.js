(function(root){
  'use strict';

  var ACTOR_ORDER = Object.freeze([
    'project-definition',
    'store-answer',
    'accept-pay',
    'store-yard',
    'handoff-record',
    'project-library'
  ]);

  var CURRENT_ARTIFACTS = Object.freeze({
    startOwn: Object.freeze({projectId:'start-own', artifact:'stb-start-own-bench-leg-0.1.html', projectClass:'USER_DEFINED_BOARD'}),
    outdoor: Object.freeze({projectId:'outdoor-build', artifact:'stb-outdoor-picnic-0.4.html', projectClass:'BOUNDED_SOURCE_BACKED'}),
    alcove: Object.freeze({projectId:'alcove', artifact:'system-build-current.html#alcove-capture', projectClass:'ALCOVE_INSERT'}),
    sheetS001: Object.freeze({projectId:'sheet-s001', artifact:'system-build-current.html#playhouse-s001', projectClass:'SHEET_ROUTED_OPENING'})
  });

  /*
   * Store authority is path-specific. Do not collapse these into one universal
   * Store pin: the current Store master explicitly preserves different pins for
   * documentary doctrine, executable Stage-2 evidence, published jobs, and the
   * class-scoped Window Seat recovery model.
   */
  var STORE_AUTHORITIES = Object.freeze({
    canonical: Object.freeze({
      repository:'GeorgePlattDemo/scan-to-build-store',
      doctrineFile:'STORE-ZERO.md',
      doctrinePin:'f88ec61c42446755d00259f88e7fd09f2702fd92',
      catalogFile:'store-zero-catalog.json',
      catalogPin:'4402abeb6b0299a5b6db2eec85ed04c3b0236bcc',
      stage2ExecutablePin:'b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d',
      publishedJobsPin:'4402abeb6b0299a5b6db2eec85ed04c3b0236bcc'
    }),
    startOwn: Object.freeze({
      projectId:'start-own',
      projectClass:'USER_DEFINED_BOARD',
      materialCatalogPin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
      capabilityBasis:'STB-D001-DIMENSIONAL-TRAVEL-0.1',
      capabilityPin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
      economicsModel:'STB-STORE-ZERO-PRICE-1',
      economicsVersion:'0.3.0',
      economicsStatus:'PINNED_STORE_ISSUED_REFERENCE',
      economicsPin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
      governingStandard:'DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md',
      acceptanceWorkflowRun:'36479757210',
      systemIntegrationPin:null,
      legacyGeneralRecoverySelected:false
    }),
    outdoor: Object.freeze({
      projectId:'outdoor-build',
      projectClass:'BOUNDED_SOURCE_BACKED',
      materialCatalogPin:'4402abeb6b0299a5b6db2eec85ed04c3b0236bcc',
      capabilityBasis:'CURRENT_CANONICAL_STORE_ZERO',
      capabilityPin:'f88ec61c42446755d00259f88e7fd09f2702fd92',
      economicsModel:null,
      economicsStatus:'UNRESOLVED_CLASS_SCOPED_RECOVERY',
      legacyGeneralRecoverySelected:false
    }),
    alcove: Object.freeze({
      projectId:'alcove',
      projectClass:'ALCOVE_INSERT',
      materialCatalogPin:'4402abeb6b0299a5b6db2eec85ed04c3b0236bcc',
      capabilityBasis:'D001-BOARD-EDGE-MILL-REF-0.3',
      capabilityPin:'f88ec61c42446755d00259f88e7fd09f2702fd92',
      economicsModel:null,
      economicsStatus:'PROJECT_NATIVE_REFERENCE',
      economicsReason:'Alcove economics are owned by the Alcove implementation. The shared Store handoff contract may carry the identified Alcove answer forward but must not recalculate or replace it.',
      legacyGeneralRecoverySelected:false
    }),
    sheetS001: Object.freeze({
      projectId:'sheet-s001',
      projectClass:'SHEET_ROUTED_OPENING',
      materialCatalogPin:'4402abeb6b0299a5b6db2eec85ed04c3b0236bcc',
      capabilityBasis:'S001-MODE2-ARCHED-APERTURE-V0',
      capabilityPin:'4402abeb6b0299a5b6db2eec85ed04c3b0236bcc',
      economicsModel:null,
      economicsStatus:'BUDGETARY_MATERIAL_ONLY',
      legacyGeneralRecoverySelected:false
    })
  });


  /*
   * Exact Store Zero material rows needed by the Start Your Own browser surface.
   * Source: the existing mapped SKU subset of store-zero-catalog.json at System STORE_PIN.
   * Guarded against the pinned catalog by test/store/user1-reference-guard.test.mjs.
   * Project UI data contains no material price authority of its own.
   */
  var START_OWN_CATALOG_ROWS = Object.freeze([
    ["2x4","STB-ZERO-SPF-2X4-60-001","board",60,null,null,2.61,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x4","STB-ZERO-SPF-2X4-72-001","board",72,null,null,3.13,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x4","STB-ZERO-SPF-2X4-96-001","board",96,null,null,4.18,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x4","STB-ZERO-SPF-2X4-108-001","board",108,null,null,4.7,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x4","STB-ZERO-SPF-2X4-120-001","board",120,null,null,5.69,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x4","STB-ZERO-SPF-2X4-144-001","board",144,null,null,6.8,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x4","STB-ZERO-SPF-2X4-168-001","board",168,null,null,7.31,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x4","STB-ZERO-SPF-2X4-192-001","board",192,null,null,8.36,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x6","STB-ZERO-SPF-2X6-72-001","board",72,null,null,5.66,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x6","STB-ZERO-SPF-2X6-96-001","board",96,null,null,7.55,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x6","STB-ZERO-SPF-2X6-120-001","board",120,null,null,9.44,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x6","STB-ZERO-SPF-2X6-144-001","board",144,null,null,11.33,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x6","STB-ZERO-SPF-2X6-192-001","board",192,null,null,15.1,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x8","STB-ZERO-SPF-2X8-96-001","board",96,null,null,9.95,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x8","STB-ZERO-SPF-2X8-120-001","board",120,null,null,12.44,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x8","STB-ZERO-SPF-2X8-144-001","board",144,null,null,14.93,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["2x8","STB-ZERO-SPF-2X8-192-001","board",192,null,null,19.91,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["4x4","STB-ZERO-SPF-4X4-96-001","board",96,null,null,9.2,["CROSSCUT","MITER_LIMITED"],["D-001"],false],
    ["4x4","STB-ZERO-SPF-4X4-120-001","board",120,null,null,11.5,["CROSSCUT","MITER_LIMITED"],["D-001"],false],
    ["4x4","STB-ZERO-SPF-4X4-144-001","board",144,null,null,13.79,["CROSSCUT","MITER_LIMITED"],["D-001"],false],
    ["1x4p","STB-ZERO-PINE-1X4-72-001","board",72,null,null,8.65,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x4p","STB-ZERO-PINE-1X4-96-001","board",96,null,null,11.54,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x4p","STB-ZERO-PINE-1X4-120-001","board",120,null,null,14.43,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x4p","STB-ZERO-PINE-1X4-144-001","board",144,null,null,17.3,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x6p","STB-ZERO-PINE-1X6-72-001","board",72,null,null,15.74,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x6p","STB-ZERO-PINE-1X6-96-001","board",96,null,null,20.99,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x6p","STB-ZERO-PINE-1X6-120-001","board",120,null,null,26.24,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x6p","STB-ZERO-PINE-1X6-144-001","board",144,null,null,31.48,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x4o","STB-ZERO-OAK-1X4-72-001","board",72,null,null,18.1,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"],true],
    ["1x4o","STB-ZERO-OAK-1X4-96-001","board",96,null,null,24.14,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"],true],
    ["1x4o","STB-ZERO-OAK-1X4-120-001","board",120,null,null,30.18,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"],true],
    ["1x6o","STB-ZERO-OAK-1X6-72-001","board",72,null,null,26.24,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"],true],
    ["1x6o","STB-ZERO-OAK-1X6-96-001","board",96,null,null,34.99,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"],true],
    ["1x6o","STB-ZERO-OAK-1X6-120-001","board",120,null,null,43.73,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"],true],
    ["1x8o","STB-ZERO-OAK-1X8-72-001","board",72,null,null,34.59,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"],true],
    ["1x8o","STB-ZERO-OAK-1X8-96-001","board",96,null,null,46.12,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"],true],
    ["1x8o","STB-ZERO-OAK-1X8-120-001","board",120,null,null,57.65,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"],true],
    ["1x4c","STB-ZERO-CHR-1X4-72-001","board",72,null,null,28.97,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_END_PROFILE"],["D-001"],true],
    ["1x4c","STB-ZERO-CHR-1X4-96-001","board",96,null,null,38.62,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_END_PROFILE"],["D-001"],true],
    ["1x6c","STB-ZERO-CHR-1X6-72-001","board",72,null,null,41.98,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_END_PROFILE"],["D-001"],true],
    ["1x6c","STB-ZERO-CHR-1X6-96-001","board",96,null,null,55.98,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_END_PROFILE"],["D-001"],true],
    ["1x6w","STB-ZERO-POP-1X6-72-001","board",72,null,null,24.14,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x6w","STB-ZERO-POP-1X6-96-001","board",96,null,null,32.18,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x6w","STB-ZERO-POP-1X6-120-001","board",120,null,null,40.24,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["1x6w","STB-ZERO-POP-1X6-144-001","board",144,null,null,48.28,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"],true],
    ["p25","STB-ZERO-PLY-025-48X48-001","sheet",null,48,48,8.47,["CROSSCUT","RIP"],["S-001"],true],
    ["p25","STB-ZERO-PLY-025-48X96-001","sheet",null,48,96,14.61,["CROSSCUT","RIP","DADO","ROUTE_PROFILE"],["S-001"],true],
    ["p38","STB-ZERO-PLY-038-48X48-001","sheet",null,48,48,11.09,["CROSSCUT","RIP"],["S-001"],true],
    ["p38","STB-ZERO-PLY-038-48X96-001","sheet",null,48,96,19.12,["CROSSCUT","RIP","DADO","ROUTE_PROFILE"],["S-001"],true],
    ["p50","STB-ZERO-PLY-050-48X96-001","sheet",null,48,96,26.55,["CROSSCUT","RIP","ROUTE_PROFILE"],["S-001"],true],
    ["p63","STB-ZERO-PLY-063-48X96-001","sheet",null,48,96,50.28,["CROSSCUT","RIP","DADO","GROOVE","ROUTE_PROFILE"],["S-001"],true],
    ["p75","STB-ZERO-PLY-075-48X48-001","sheet",null,48,48,33.54,["CROSSCUT","RIP"],["S-001"],true],
    ["p75","STB-ZERO-PLY-075-48X96-001","sheet",null,48,96,57.82,["CROSSCUT","RIP","DADO","ROUTE_PROFILE"],["S-001"],true],
    ["o75","STB-ZERO-OSB-075-48X96-001","sheet",null,48,96,28.46,["CROSSCUT","RIP","ROUTE_PROFILE"],["S-001"],true]
  ]);

  var START_OWN_STORE_CATALOG = Object.freeze({
    repository:'GeorgePlattDemo/scan-to-build-store',
    file:'store-zero-catalog.json',
    pin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
    clock:"2026-09-10"
  });

  function startOwnOfferings(sizeKey){
    return START_OWN_CATALOG_ROWS.filter(function(row){return row[0]===String(sizeKey || '')}).map(function(row){
      return {
        sizeKey:row[0],
        storeSku:row[1],
        form:row[2],
        stockL_in:row[3],
        sheetW_in:row[4],
        sheetL_in:row[5],
        sellingPrice:row[6],
        supportedOps:clone(row[7] || []),
        cellFamily:clone(row[8] || []),
        offered:row[9]
      };
    });
  }

  /*
   * Store items a Start your own job can name by SKU: every nominal 2×4 board in
   * store-zero-catalog.json at System's STORE_PIN, row for row
   * ([storeSku, species, grade, stockL_in, sellingPrice, description]).
   * apps/stb/test/store/user1-reference-guard.test.mjs fails if any row differs
   * from the catalog at the pin. A lookup names a real Store item or nothing; it
   * never makes up a species, and it does not choose the board the Store selects.
   */
  var START_OWN_STORE_ITEMS_PIN = '9c62d9d6f7775deef83d47196d32c9b5174a352c';
  var START_OWN_STORE_ITEMS = Object.freeze([
    ["STB-ZERO-SPF-2X4-96-001","spf","construction",96,4.18,"2x4 x 96 in SPF construction"],
    ["STB-ZERO-SPF-2X4-120-001","spf","construction",120,5.69,"2x4 x 120 in SPF construction"],
    ["STB-ZERO-SPF-2X4-144-001","spf","construction",144,6.8,"2x4 x 144 in SPF construction"],
    ["STB-ZERO-SPF-2X4-60-001","spf","construction",60,2.61,"2x4 x 60 in SPF construction"],
    ["STB-ZERO-SPF-2X4-72-001","spf","construction",72,3.13,"2x4 x 72 in SPF construction"],
    ["STB-ZERO-SPF-2X4-108-001","spf","construction",108,4.7,"2x4 x 108 in SPF construction"],
    ["STB-ZERO-SPF-2X4-168-001","spf","construction",168,7.31,"2x4 x 168 in SPF construction"],
    ["STB-ZERO-SPF-2X4-192-001","spf","construction",192,8.36,"2x4 x 192 in SPF construction"],
    ["STB-ZERO-PT-2X4-96-001","syp-treated","above-ground",96,4.81,"2x4 x 96 in treated SYP above-ground"],
    ["STB-ZERO-PT-2X4-120-001","syp-treated","above-ground",120,6.01,"2x4 x 120 in treated SYP above-ground"],
    ["STB-ZERO-PT-2X4-144-001","syp-treated","above-ground",144,7.21,"2x4 x 144 in treated SYP above-ground"],
    ["STB-ZERO-PTGC-2X4-72-001","syp-treated","ground-contact",72,6.81,"2x4 x 72 in treated SYP ground-contact"],
    ["STB-ZERO-PTGC-2X4-96-001","syp-treated","ground-contact",96,7.5,"2x4 x 96 in treated SYP ground-contact"],
    ["STB-ZERO-PTGC-2X4-120-001","syp-treated","ground-contact",120,11.41,"2x4 x 120 in treated SYP ground-contact"],
    ["STB-ZERO-PTGC-2X4-144-001","syp-treated","ground-contact",144,14.07,"2x4 x 144 in treated SYP ground-contact"],
    ["STB-ZERO-PTGC-2X4-168-001","syp-treated","ground-contact",168,17.21,"2x4 x 168 in treated SYP ground-contact"],
    ["STB-ZERO-PTGC-2X4-192-001","syp-treated","ground-contact",192,19.15,"2x4 x 192 in treated SYP ground-contact"],
    ["STB-ZERO-PTAG-2X4-72-001","syp-treated","above-ground",72,5.15,"2x4 x 72 in SYP AC2 #2 Prime AG"],
    ["STB-ZERO-PTAG-2X4-168-001","syp-treated","above-ground",168,12.08,"2x4 x 168 in SYP AC2 #2 Prime AG"],
    ["STB-ZERO-PTAG-2X4-192-001","syp-treated","above-ground",192,15.96,"2x4 x 192 in SYP AC2 #2 Prime AG"],
    ["STB-ZERO-PTCT-2X4-96-001","syp-treated","ground-contact-cedartone",96,10.29,"2x4 x 96 in SYP AC2 #1 Prime GC CedarTone"],
    ["STB-ZERO-PTCT-2X4-120-001","syp-treated","ground-contact-cedartone",120,14.18,"2x4 x 120 in SYP AC2 #1 Prime GC CedarTone"],
    ["STB-ZERO-PTCT-2X4-144-001","syp-treated","ground-contact-cedartone",144,17.64,"2x4 x 144 in SYP AC2 #1 Prime GC CedarTone"],
    ["STB-ZERO-PTCT-2X4-192-001","syp-treated","ground-contact-cedartone",192,23.63,"2x4 x 192 in SYP AC2 #1 Prime GC CedarTone"],
    ["STB-ZERO-WRC-2X4-96-001","cedar","S4S",96,13.13,"2x4 x 96 in Western Red Cedar S4S"],
    ["STB-ZERO-WRC-2X4-120-001","cedar","S4S",120,17.64,"2x4 x 120 in Western Red Cedar S4S"],
    ["STB-ZERO-WRC-2X4-144-001","cedar","S4S",144,21.95,"2x4 x 144 in Western Red Cedar S4S"]
  ]);

  function startOwnStoreItem(storeSku){
    var sku=String(storeSku || '').trim().toUpperCase();
    for(var i=0;i<START_OWN_STORE_ITEMS.length;i++){
      var row=START_OWN_STORE_ITEMS[i];
      if(row[0]!==sku) continue;
      return Object.freeze({
        storeSku:row[0],species:row[1],grade:row[2],form:'board',nominalT:2,nominalW:4,
        stockL_in:row[3],sellingPrice:row[4],description:row[5],catalogPin:START_OWN_STORE_ITEMS_PIN
      });
    }
    return null;
  }

  /*
   * USER 1 STORE-ISSUED REFERENCE
   *
   * The browser may preview only the exact Store answers already proven on the
   * exact Store SHA below. Formal requests use the live admitted-job bridge.
   * apps/stb/test/store/user1-reference-guard.test.mjs re-runs every demand, each with
   * its stated wood, through the Store at System's STORE_PIN and fails if any value here differs.
   * Any changed governing demand must go back through Store. No browser-side
   * pricing, capability, motion, cycle-time, or refusal calculation is allowed.
   */
  var USER1_STORE_REFERENCE = Object.freeze({
    status:'STORE_ISSUED_REFERENCE',
    source:Object.freeze({
      repository:'GeorgePlattDemo/scan-to-build-store',
      storePin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
      pricingFile:'store-zero-pricing-engine.mjs',
      travelFile:'d001-travel-standard.mjs',
      governingStandard:'DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md',
      workflowRun:'36479757210',
      systemIntegrationPin:null
    }),
    demand:Object.freeze({
      configurationId:'SYO-USER1-XBRACE',
      configurationVersion:'0.1',
      materialDemand:Object.freeze({species:'spf',form:'board',nominalT:2,nominalW:4}),
      definedWorkpieceLengthIn:60,
      partQty:2,
      partLengthIn:16,
      sawAngleDeg:30,
      cutPlane:'miter-face',
      endIdentity:'both',
      endRelation:'parallel',
      lengthDatum:'long-long-outer-edge',
      datumCMethod:'REFERENCE_CUT',
      requiredOps:Object.freeze(['MITER_LIMITED','SPOT_ON_LOCATION']),
      spotMode:'SPOT_ON_LOCATION',
      spotLocationRule:'CENTERED_ON_PART',
      spotAcrossWidthRule:'CENTERED_ON_WIDE_FACE',
      spotXIn:8,
      declaredSawCuts:3,
      declaredSpotCount:2
    }),
    materialResolution:Object.freeze({
      status:'MAPPED',
      storeSku:'STB-ZERO-SPF-2X4-60-001',
      pricingReferenceSku:'STB-ZERO-SPF-2X4-60-001',
      pricingReferenceStockLengthIn:60,
      requestedMinimumWorkpieceLengthIn:60,
      requestedDefinedWorkpieceLengthIn:60,
      workpieceLengthIn:60,
      selectionPolicy:'SHORTEST_COMPLETE_STORE_OFFERING',
      consideredCandidates:Object.freeze([
        Object.freeze({storeSku:'STB-ZERO-SPF-2X4-60-001',stockLengthIn:60,candidateStatus:'SUPPORTABLE',reason:null})
      ]),
      quantity:1,
      stockLengthIn:60,
      unitPrice:2.61,
      materialTotal:2.61,
      allocationClaimed:false,
      cellFamily:Object.freeze(['D-001']),
      supportedOps:Object.freeze(['CROSSCUT','MITER_LIMITED','SPOT_ON_LOCATION','DRILL','MILL_LONGITUDINAL_PROFILE','MILL_END_PROFILE']),
      source:Object.freeze({
        repository:'GeorgePlattDemo/scan-to-build-store',
        file:'store-zero-catalog.json',
        pin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
        clock:'2026-09-10'
      })
    }),
    estimate:Object.freeze({
      status:'BUDGETARY_ESTIMATE',
      complete:true,
      completeness:'COMPLETE_FOR_TRAVEL_STANDARD',
      documentKind:'BudgetaryEstimate',
      engine:Object.freeze({
        id:'STB-STORE-ZERO-PRICE-1',
        version:'0.3.0',
        clock:'2026-09-22',
        documentKind:'BudgetaryEstimate'
      }),
      cycle:Object.freeze({
        model:'STB-D001-DIMENSIONAL-TRAVEL-0.1',
        version:'0.2.0',
        basis:'DECLARED_STAGE2_MODEL',
        measured:false,
        commissioned:false,
        T_job_min:1.4227
      }),
      totals:Object.freeze({
        material:2.61,
        hardware:0,
        machine_service:5.93,
        Q:8.54,
        Q_basis:'CALCULATED_FROM_DECLARED_STAGE2_MODEL'
      }),
      travel:Object.freeze({
        derivedSawCuts:3,
        derivedSpotCount:2,
        finalRemainderIn:27.625
      }),
      economics:Object.freeze({
        id:'STB-D001-STORE-ECONOMICS-S2-0.1',
        version:'0.1.0',
        basis:'DECLARED_STAGE2_MODEL',
        measured:false,
        forecastProductiveHours:600,
        annualCostPoolUsd:120000,
        targetGrossMargin:0.20,
        breakEvenPerHour:200,
        sellRatePerHour:250,
        setupCharge:0,
        setupTimeMin:0
      }),
      calculationIdentity:Object.freeze({
        inputHash:'bea3c0b3841d013b463277ebaa02121bef79b65abe5e46b05a40f337afa3b868',
        resultHash:'0fd6b7d19ef8f64d133486c9d2ccf72256b2993bb60aa14c77b3c3e8004973bc'
      })
    })
  });

  var USER1_STORE_REFERENCE_18 = Object.freeze({
    status:'STORE_ISSUED_REFERENCE',
    source:Object.freeze({
      repository:'GeorgePlattDemo/scan-to-build-store',
      storePin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
      pricingFile:'store-zero-pricing-engine.mjs',
      travelFile:'d001-travel-standard.mjs',
      governingStandard:'DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md',
      workflowRun:'36479757210',
      systemIntegrationPin:null,
      systemDiagnosticRun:'35791336322'
    }),
    demand:Object.freeze({
      configurationId:'SYO-USER1-XBRACE',
      configurationVersion:'0.2',
      materialDemand:Object.freeze({species:'spf',form:'board',nominalT:2,nominalW:4}),
      definedWorkpieceLengthIn:60,
      partQty:2,
      partLengthIn:18,
      sawAngleDeg:26.387799961242997,
      cutPlane:'miter-face',
      endIdentity:'both',
      endRelation:'parallel',
      lengthDatum:'long-long-outer-edge',
      datumCMethod:'REFERENCE_CUT',
      requiredOps:Object.freeze(['MITER_LIMITED','SPOT_ON_LOCATION']),
      spotMode:'SPOT_ON_LOCATION',
      spotLocationRule:'CENTERED_ON_PART',
      spotAcrossWidthRule:'CENTERED_ON_WIDE_FACE',
      spotXIn:9,
      declaredSawCuts:3,
      declaredSpotCount:2
    }),
    materialResolution:Object.freeze({
      status:'MAPPED',
      storeSku:'STB-ZERO-SPF-2X4-72-001',
      pricingReferenceSku:'STB-ZERO-SPF-2X4-72-001',
      pricingReferenceStockLengthIn:72,
      requestedMinimumWorkpieceLengthIn:60,
      requestedDefinedWorkpieceLengthIn:60,
      workpieceLengthIn:72,
      selectionPolicy:'SHORTEST_COMPLETE_STORE_OFFERING',
      consideredCandidates:Object.freeze([
        Object.freeze({storeSku:'STB-ZERO-SPF-2X4-60-001',stockLengthIn:60,candidateStatus:'REFUSED',reason:'LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL'}),
        Object.freeze({storeSku:'STB-ZERO-SPF-2X4-72-001',stockLengthIn:72,candidateStatus:'SUPPORTABLE',reason:null})
      ]),
      quantity:1,
      stockLengthIn:72,
      unitPrice:3.13,
      materialTotal:3.13,
      allocationClaimed:false,
      cellFamily:Object.freeze(['D-001']),
      supportedOps:Object.freeze(['CROSSCUT','MITER_LIMITED','SPOT_ON_LOCATION','DRILL','MILL_LONGITUDINAL_PROFILE','MILL_END_PROFILE']),
      source:Object.freeze({
        repository:'GeorgePlattDemo/scan-to-build-store',
        file:'store-zero-catalog.json',
        pin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
        clock:'2026-09-10'
      })
    }),
    estimate:Object.freeze({
      status:'BUDGETARY_ESTIMATE',
      complete:true,
      completeness:'COMPLETE_FOR_TRAVEL_STANDARD',
      documentKind:'BudgetaryEstimate',
      engine:Object.freeze({
        id:'STB-STORE-ZERO-PRICE-1',
        version:'0.3.0',
        clock:'2026-09-22',
        documentKind:'BudgetaryEstimate'
      }),
      cycle:Object.freeze({
        model:'STB-D001-DIMENSIONAL-TRAVEL-0.1',
        version:'0.2.0',
        basis:'DECLARED_STAGE2_MODEL',
        measured:false,
        commissioned:false,
        T_job_min:1.425
      }),
      totals:Object.freeze({
        material:3.13,
        hardware:0,
        machine_service:5.94,
        Q:9.07,
        Q_basis:'CALCULATED_FROM_DECLARED_STAGE2_MODEL'
      }),
      travel:Object.freeze({
        derivedSawCuts:3,
        derivedSpotCount:2,
        finalRemainderIn:35.625
      }),
      economics:Object.freeze({
        id:'STB-D001-STORE-ECONOMICS-S2-0.1',
        version:'0.1.0',
        basis:'DECLARED_STAGE2_MODEL',
        measured:false,
        forecastProductiveHours:600,
        annualCostPoolUsd:120000,
        targetGrossMargin:0.20,
        breakEvenPerHour:200,
        sellRatePerHour:250,
        setupCharge:0,
        setupTimeMin:0
      }),
      calculationIdentity:Object.freeze({
        inputHash:'e594a8fd7ca9de466c0f5e85fc929ec51221e45405add3e5707fa0277fbb2add',
        resultHash:'595b797784e7f97d11a16e70a6e202eddf2cd6f38c02a165159fe4ce2abf9a37'
      })
    })
  });

  var USER1_STORE_REFERENCE_SYP = Object.freeze({
    status:'STORE_ISSUED_REFERENCE',
    source:Object.freeze({
      repository:'GeorgePlattDemo/scan-to-build-store',
      storePin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
      pricingFile:'store-zero-pricing-engine.mjs',
      travelFile:'d001-travel-standard.mjs',
      governingStandard:'DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md',
      workflowRun:null,
      systemIntegrationPin:null
    }),
    demand:Object.freeze({
      configurationId:'SYO-USER1-XBRACE',
      configurationVersion:'0.1',
      materialDemand:Object.freeze({species:'syp-treated',form:'board',nominalT:2,nominalW:4}),
      definedWorkpieceLengthIn:60,
      partQty:2,
      partLengthIn:16,
      sawAngleDeg:30,
      cutPlane:'miter-face',
      endIdentity:'both',
      endRelation:'parallel',
      lengthDatum:'long-long-outer-edge',
      datumCMethod:'REFERENCE_CUT',
      requiredOps:Object.freeze(['MITER_LIMITED','SPOT_ON_LOCATION']),
      spotMode:'SPOT_ON_LOCATION',
      spotLocationRule:'CENTERED_ON_PART',
      spotAcrossWidthRule:'CENTERED_ON_WIDE_FACE',
      spotXIn:8,
      declaredSawCuts:3,
      declaredSpotCount:2
    }),
    materialResolution:Object.freeze({
      status:'MAPPED',
      storeSku:'STB-ZERO-PTAG-2X4-72-001',
      pricingReferenceSku:'STB-ZERO-PTAG-2X4-72-001',
      pricingReferenceStockLengthIn:72,
      requestedMinimumWorkpieceLengthIn:60,
      requestedDefinedWorkpieceLengthIn:60,
      workpieceLengthIn:72,
      selectionPolicy:'SHORTEST_COMPLETE_STORE_OFFERING',
      consideredCandidates:Object.freeze([
        Object.freeze({storeSku:'STB-ZERO-PTAG-2X4-72-001',stockLengthIn:72,candidateStatus:'SUPPORTABLE',reason:null})
      ]),
      quantity:1,
      stockLengthIn:72,
      unitPrice:5.15,
      materialTotal:5.15,
      allocationClaimed:false,
      cellFamily:Object.freeze(['D-001']),
      supportedOps:Object.freeze(['CROSSCUT','MITER_LIMITED','SPOT_ON_LOCATION']),
      source:Object.freeze({
        repository:'GeorgePlattDemo/scan-to-build-store',
        file:'store-zero-catalog.json',
        pin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
        clock:'2026-09-10'
      })
    }),
    estimate:Object.freeze({
      status:'BUDGETARY_ESTIMATE',
      complete:true,
      completeness:'COMPLETE_FOR_TRAVEL_STANDARD',
      documentKind:'BudgetaryEstimate',
      engine:Object.freeze({
        id:'STB-STORE-ZERO-PRICE-1',
        version:'0.3.0',
        clock:'2026-09-22',
        documentKind:'BudgetaryEstimate'
      }),
      cycle:Object.freeze({
        model:'STB-D001-DIMENSIONAL-TRAVEL-0.1',
        version:'0.2.0',
        basis:'DECLARED_STAGE2_MODEL',
        measured:false,
        commissioned:false,
        T_job_min:1.4227
      }),
      totals:Object.freeze({
        material:5.15,
        hardware:0,
        machine_service:5.93,
        Q:11.08,
        Q_basis:'CALCULATED_FROM_DECLARED_STAGE2_MODEL'
      }),
      travel:Object.freeze({
        derivedSawCuts:3,
        derivedSpotCount:2,
        finalRemainderIn:39.625
      }),
      economics:Object.freeze({
        id:'STB-D001-STORE-ECONOMICS-S2-0.1',
        version:'0.1.0',
        basis:'DECLARED_STAGE2_MODEL',
        measured:false,
        forecastProductiveHours:600,
        annualCostPoolUsd:120000,
        targetGrossMargin:0.20,
        breakEvenPerHour:200,
        sellRatePerHour:250,
        setupCharge:0,
        setupTimeMin:0
      }),
      calculationIdentity:Object.freeze({
        inputHash:'8b7dd9e5de4a8335a6f20e9ff5f2b02952f1dc3c5387f0363bb3eb80de07b906',
        resultHash:'f95709beb9f77cc8981bae4c501f6f4fa8a0f6a1d8f471f4b8794d0325d5bef5'
      })
    })
  });

  var USER1_STORE_REFERENCE_SYP_18 = Object.freeze({
    status:'STORE_ISSUED_REFERENCE',
    source:Object.freeze({
      repository:'GeorgePlattDemo/scan-to-build-store',
      storePin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
      pricingFile:'store-zero-pricing-engine.mjs',
      travelFile:'d001-travel-standard.mjs',
      governingStandard:'DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md',
      workflowRun:null,
      systemIntegrationPin:null
    }),
    demand:Object.freeze({
      configurationId:'SYO-USER1-XBRACE',
      configurationVersion:'0.2',
      materialDemand:Object.freeze({species:'syp-treated',form:'board',nominalT:2,nominalW:4}),
      definedWorkpieceLengthIn:60,
      partQty:2,
      partLengthIn:18,
      sawAngleDeg:26.387799961242997,
      cutPlane:'miter-face',
      endIdentity:'both',
      endRelation:'parallel',
      lengthDatum:'long-long-outer-edge',
      datumCMethod:'REFERENCE_CUT',
      requiredOps:Object.freeze(['MITER_LIMITED','SPOT_ON_LOCATION']),
      spotMode:'SPOT_ON_LOCATION',
      spotLocationRule:'CENTERED_ON_PART',
      spotAcrossWidthRule:'CENTERED_ON_WIDE_FACE',
      spotXIn:9,
      declaredSawCuts:3,
      declaredSpotCount:2
    }),
    materialResolution:Object.freeze({
      status:'MAPPED',
      storeSku:'STB-ZERO-PTAG-2X4-72-001',
      pricingReferenceSku:'STB-ZERO-PTAG-2X4-72-001',
      pricingReferenceStockLengthIn:72,
      requestedMinimumWorkpieceLengthIn:60,
      requestedDefinedWorkpieceLengthIn:60,
      workpieceLengthIn:72,
      selectionPolicy:'SHORTEST_COMPLETE_STORE_OFFERING',
      consideredCandidates:Object.freeze([
        Object.freeze({storeSku:'STB-ZERO-PTAG-2X4-72-001',stockLengthIn:72,candidateStatus:'SUPPORTABLE',reason:null})
      ]),
      quantity:1,
      stockLengthIn:72,
      unitPrice:5.15,
      materialTotal:5.15,
      allocationClaimed:false,
      cellFamily:Object.freeze(['D-001']),
      supportedOps:Object.freeze(['CROSSCUT','MITER_LIMITED','SPOT_ON_LOCATION']),
      source:Object.freeze({
        repository:'GeorgePlattDemo/scan-to-build-store',
        file:'store-zero-catalog.json',
        pin:'9c62d9d6f7775deef83d47196d32c9b5174a352c',
        clock:'2026-09-10'
      })
    }),
    estimate:Object.freeze({
      status:'BUDGETARY_ESTIMATE',
      complete:true,
      completeness:'COMPLETE_FOR_TRAVEL_STANDARD',
      documentKind:'BudgetaryEstimate',
      engine:Object.freeze({
        id:'STB-STORE-ZERO-PRICE-1',
        version:'0.3.0',
        clock:'2026-09-22',
        documentKind:'BudgetaryEstimate'
      }),
      cycle:Object.freeze({
        model:'STB-D001-DIMENSIONAL-TRAVEL-0.1',
        version:'0.2.0',
        basis:'DECLARED_STAGE2_MODEL',
        measured:false,
        commissioned:false,
        T_job_min:1.425
      }),
      totals:Object.freeze({
        material:5.15,
        hardware:0,
        machine_service:5.94,
        Q:11.09,
        Q_basis:'CALCULATED_FROM_DECLARED_STAGE2_MODEL'
      }),
      travel:Object.freeze({
        derivedSawCuts:3,
        derivedSpotCount:2,
        finalRemainderIn:35.625
      }),
      economics:Object.freeze({
        id:'STB-D001-STORE-ECONOMICS-S2-0.1',
        version:'0.1.0',
        basis:'DECLARED_STAGE2_MODEL',
        measured:false,
        forecastProductiveHours:600,
        annualCostPoolUsd:120000,
        targetGrossMargin:0.20,
        breakEvenPerHour:200,
        sellRatePerHour:250,
        setupCharge:0,
        setupTimeMin:0
      }),
      calculationIdentity:Object.freeze({
        inputHash:'30b6c02b11db30cf100be72ea4696c03b8ed7d2f217979c53cdae6ce73325e91',
        resultHash:'de1e0e0bdf0f77a6c5ea205191765ba0b846472fc0813fe71d9ddf28fd176333'
      })
    })
  });

  var USER1_STORE_REFERENCES = Object.freeze([USER1_STORE_REFERENCE,USER1_STORE_REFERENCE_18,USER1_STORE_REFERENCE_SYP,USER1_STORE_REFERENCE_SYP_18]);

  function roundN(value, places){
    var p=Math.pow(10, places == null ? 2 : places);
    return Math.round(Number(value)*p)/p;
  }

  function user1StoreDemandMatchesReference(input,reference){
    input=input || {};
    reference=reference || USER1_STORE_REFERENCE;
    var d=reference.demand;
    var parts=Array.isArray(input.parts)?input.parts:[];
    var ops=Array.isArray(input.requiredOps)?input.requiredOps.slice().sort():[];
    var expectedOps=d.requiredOps.slice().sort();
    var material=input.materialDemand||{};
    if(String(material.species||'')!==d.materialDemand.species) return false;
    if(String(material.form||'')!==d.materialDemand.form) return false;
    if(Number(material.nominalT)!==d.materialDemand.nominalT || Number(material.nominalW)!==d.materialDemand.nominalW) return false;
    if(String(input.configurationId||'')!==d.configurationId) return false;
    if(String(input.configurationVersion||'')!==d.configurationVersion) return false;
    if(Number(input.definedWorkpieceLengthIn)!==d.definedWorkpieceLengthIn) return false;
    if(Math.abs(Number(input.sawAngleDeg)-Number(d.sawAngleDeg))>1e-9) return false;
    if(String(input.cutPlane||'')!==d.cutPlane) return false;
    if(String(input.endIdentity||'')!==d.endIdentity) return false;
    if(String(input.endRelation||'')!==d.endRelation) return false;
    if(String(input.lengthDatum||'')!==d.lengthDatum) return false;
    if(String(input.datumCMethod||'')!==d.datumCMethod) return false;
    if(Number(input.declaredSawCuts)!==d.declaredSawCuts) return false;
    if(Number(input.declaredSpotCount)!==d.declaredSpotCount) return false;
    if(ops.join('|')!==expectedOps.join('|')) return false;
    if(parts.length!==2) return false;
    for(var i=0;i<parts.length;i++){
      var part=parts[i]||{};
      var features=Array.isArray(part.features)?part.features:[];
      if(String(part.partId||'')!=='PART-'+(i+1)) return false;
      if(Number(part.lengthIn)!==d.partLengthIn) return false;
      if(features.length!==1) return false;
      var feature=features[0]||{};
      if(String(feature.kind||'')!==d.spotMode) return false;
      if(Number(feature.xIn)!==d.spotXIn) return false;
      if(String(feature.locationRule||'')!==d.spotLocationRule) return false;
      if(String(feature.acrossWidthRule||'')!==d.spotAcrossWidthRule) return false;
    }
    return true;
  }

  function user1StoreReferenceForDemand(input){
    for(var i=0;i<USER1_STORE_REFERENCES.length;i++){
      if(user1StoreDemandMatchesReference(input,USER1_STORE_REFERENCES[i])) return USER1_STORE_REFERENCES[i];
    }
    return null;
  }

  function unresolvedUser1StoreAnswer(status, codes, reason, receipt){
    return Object.freeze({
      status:status,
      complete:false,
      freshEvaluation:false,
      capabilityStatus:'UNRESOLVED',
      economicsStatus:'UNRESOLVED',
      priceCompleteness:'UNAVAILABLE',
      material:null,
      machineService:null,
      combinedValue:null,
      estimate:null,
      calculationIdentity:null,
      materialResolution:null,
      refusalConditions:Object.freeze([]),
      unresolvedConditions:Object.freeze((codes || []).slice()),
      source:USER1_STORE_REFERENCE.source,
      evaluationReceipt:receipt || null,
      reason:reason
    });
  }

  function resolveUser1StoreReference(input){
    var reference=user1StoreReferenceForDemand(input);
    if(!reference){
      return unresolvedUser1StoreAnswer(
        'STORE_REFRESH_REQUIRED',
        ['STORE_REFRESH_REQUIRED'],
        'This static build carries only the tested 16-in and 18-in Store references, for SPF and treated SYP. Another wood or intermediate geometry requires the live System Store endpoint.',
        null
      );
    }
    var estimate=reference.estimate;
    return Object.freeze({
      status:'MATCHED_STORE_REFERENCE',
      complete:true,
      freshEvaluation:false,
      capabilityStatus:'SUPPORTABLE',
      economicsStatus:estimate.status,
      priceCompleteness:estimate.completeness,
      material:estimate.totals.material,
      machineService:estimate.totals.machine_service,
      combinedValue:estimate.totals.Q,
      estimate:estimate,
      calculationIdentity:estimate.calculationIdentity,
      materialResolution:reference.materialResolution,
      refusalConditions:Object.freeze([]),
      unresolvedConditions:Object.freeze([]),
      source:reference.source,
      evaluationReceipt:null
    });
  }

  function storeAuthority(key){
    return STORE_AUTHORITIES[key] || null;
  }

  function clone(value){
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function freezeCopy(value){
    var copy = clone(value);
    if(copy && typeof copy === 'object') Object.freeze(copy);
    return copy;
  }

  function comparisonDemand(part){
    if(!part) return null;
    var operations=[
      Object.freeze({kind:'STRAIGHT_CUT', required:part.straightCut !== false}),
      Object.freeze({
        kind:'ANGLED_CUT',
        endCondition:String(part.endCondition || ''),
        angleDegrees:Number(part.angleDegrees),
        angleReference:String(part.angleReference || ''),
        cutPlane:String(part.cutPlane || ''),
        endIdentity:String(part.endIdentity || ''),
        endRelation:String(part.endRelation || ''),
        lengthDatum:String(part.lengthDatum || '')
      })
    ];
    var spot=part.spotDemand && typeof part.spotDemand==='object' ? part.spotDemand : null;
    if(spot && spot.required!==false){
      operations.push(Object.freeze({
        kind:'SPOT_ON_LOCATION',
        mode:String(spot.mode || 'SPOT_ON_LOCATION'),
        required:true,
        countPerPart:Number.isFinite(Number(spot.countPerPart)) ? Number(spot.countPerPart) : null,
        locationRule:String(spot.locationRule || ''),
        locationAlongLengthIn:spot.locationAlongLengthIn == null ? null : Number(spot.locationAlongLengthIn),
        acrossWidthRule:String(spot.acrossWidthRule || ''),
        derivation:freezeCopy(spot.derivation || null),
        totalCount:Number.isFinite(Number(spot.totalCount)) ? Number(spot.totalCount) : null
      }));
    }
    var geometry={
      finishedLength:Number(part.finishedLength),
      endCondition:String(part.endCondition || ''),
      angleDegrees:Number(part.angleDegrees),
      angleReference:String(part.angleReference || ''),
      cutPlane:String(part.cutPlane || ''),
      endIdentity:String(part.endIdentity || ''),
      endRelation:String(part.endRelation || ''),
      lengthDatum:String(part.lengthDatum || '')
    };
    if(part.parentLengthIn != null && Number.isFinite(Number(part.parentLengthIn))){
      geometry.parentLengthIn=Number(part.parentLengthIn);
    }
    if(part.definedWorkpieceLengthIn != null && Number.isFinite(Number(part.definedWorkpieceLengthIn))){
      geometry.definedWorkpieceLengthIn=Number(part.definedWorkpieceLengthIn);
    }
    if(spot) geometry.spotDemand=freezeCopy(spot);
    if(part.datumCMethod) geometry.datumCMethod=String(part.datumCMethod);
    if(Array.isArray(part.requiredOps)) geometry.requiredOps=freezeCopy(part.requiredOps);
    if(Number.isFinite(Number(part.declaredSawCuts))) geometry.declaredSawCuts=Number(part.declaredSawCuts);
    if(Number.isFinite(Number(part.declaredSpotCount))) geometry.declaredSpotCount=Number(part.declaredSpotCount);
    if(Array.isArray(part.parts)) geometry.identifiedParts=freezeCopy(part.parts);
    return Object.freeze({
      materialDemand: Object.freeze({stockClass:String(part.stockClass || '')}),
      operationDemand: Object.freeze(operations),
      quantity:Number(part.quantity),
      requiredGeometryDatumFacts:Object.freeze(geometry)
    });
  }

  function createComparisonHandoff(input){
    input = input || {};
    var demand = comparisonDemand(input.physicalDemand);
    if(!demand) throw new Error('physicalDemand is required');
    if(!input.projectId) throw new Error('projectId is required');
    if(!input.definitionId) throw new Error('definitionId is required');
    return Object.freeze({
      protocol:'stb.store-handoff/0.1',
      actorOrder:ACTOR_ORDER,
      projectId:String(input.projectId),
      projectClass:String(input.projectClass || ''),
      definitionId:String(input.definitionId),
      versionId:String(input.versionId || input.definitionId),
      materialDemand:demand.materialDemand,
      operationDemand:demand.operationDemand,
      quantity:demand.quantity,
      requiredGeometryDatumFacts:demand.requiredGeometryDatumFacts,
      sourceAuthority:freezeCopy(input.sourceAuthority || null),
      unresolvedConditions:Object.freeze((input.unresolvedConditions || []).map(String)),
      requestedServices:Object.freeze((input.requestedServices || [
        'material-answer',
        'capability-answer',
        'economics',
        'availability-timing',
        'services'
      ]).map(String)),
      authority:Object.freeze({
        commercial:false,
        productionRelease:false,
        machineReadiness:false,
        cycleStart:false,
        physicalFabrication:false
      })
    });
  }

  function stable(value){
    if(Array.isArray(value)) return '['+value.map(stable).join(',')+']';
    if(value && typeof value === 'object'){
      return '{'+Object.keys(value).sort().map(function(key){
        return JSON.stringify(key)+':'+stable(value[key]);
      }).join(',')+'}';
    }
    return JSON.stringify(value);
  }

  function storeDemandIdentity(handoff){
    if(!handoff) return null;
    return stable({
      materialDemand:handoff.materialDemand,
      operationDemand:handoff.operationDemand,
      quantity:handoff.quantity,
      requiredGeometryDatumFacts:handoff.requiredGeometryDatumFacts,
      requestedServices:handoff.requestedServices
    });
  }

  function sameStoreDemand(a,b){
    var left=storeDemandIdentity(a), right=storeDemandIdentity(b);
    return !!left && left===right;
  }

  root.STBStoreHandoffContract = Object.freeze({
    version:'0.9',
    actorOrder:ACTOR_ORDER,
    currentArtifacts:CURRENT_ARTIFACTS,
    storeAuthorities:STORE_AUTHORITIES,
    storeAuthority:storeAuthority,
    startOwnStoreCatalog:START_OWN_STORE_CATALOG,
    startOwnOfferings:startOwnOfferings,
    startOwnStoreItems:START_OWN_STORE_ITEMS,
    startOwnStoreItem:startOwnStoreItem,
    user1StoreReference:USER1_STORE_REFERENCE,
    user1StoreReferences:USER1_STORE_REFERENCES,
    user1StoreReferenceForDemand:user1StoreReferenceForDemand,
    user1StoreDemandMatchesReference:user1StoreDemandMatchesReference,
    resolveUser1StoreReference:resolveUser1StoreReference,
    comparisonDemand:comparisonDemand,
    createComparisonHandoff:createComparisonHandoff,
    storeDemandIdentity:storeDemandIdentity,
    sameStoreDemand:sameStoreDemand
  });
})(window);
