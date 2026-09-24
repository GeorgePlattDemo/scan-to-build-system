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
    outdoor: Object.freeze({projectId:'outdoor-build', artifact:'stb-outdoor-bench-leg-0.1.html', projectClass:'BOUNDED_SOURCE_BACKED'}),
    alcove: Object.freeze({projectId:'alcove', artifact:'system-build-current.html#alcove-capture', projectClass:'ALCOVE_INSERT'}),
    windowSeat: Object.freeze({projectId:'window-seat', artifact:'stb-window-seat-space-utilization-0.7.4.html', projectClass:'SPACE_UTILIZATION'}),
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
      materialCatalogPin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
      capabilityBasis:'STB-D001-DIMENSIONAL-TRAVEL-0.1',
      capabilityPin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
      economicsModel:'STB-STORE-ZERO-PRICE-1',
      economicsVersion:'0.3.0',
      economicsStatus:'PINNED_STORE_ISSUED_REFERENCE',
      economicsPin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
      governingStandard:'DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md',
      acceptanceWorkflowRun:'35791021805',
      systemIntegrationPin:'59a9c0326c1afea7af3767e1ed89bf6465a4b809',
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
    windowSeat: Object.freeze({
      projectId:'window-seat',
      projectClass:'SPACE_UTILIZATION',
      materialCatalogPin:'4402abeb6b0299a5b6db2eec85ed04c3b0236bcc',
      capabilityBasis:'D001-BOARD-EDGE-MILL-REF-0.3',
      capabilityPin:'f88ec61c42446755d00259f88e7fd09f2702fd92',
      economicsModel:'STB-STORE-ZERO-WINDOW-SEAT-RECOVERY-0.1',
      economicsPin:'f88ec61c42446755d00259f88e7fd09f2702fd92',
      economicsStatus:'DECLARED_REFERENCE',
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
   * Source: store-zero-catalog.json at the pinned published-job/catalog commit.
   * Project UI data contains no material price authority of its own.
   */
  var START_OWN_CATALOG_ROWS = Object.freeze([
    ["2x4","STB-ZERO-SPF-2X4-60-001","board",60,null,null,2.61,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-72-001","board",72,null,null,3.13,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-96-001","board",96,null,null,4.18,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-108-001","board",108,null,null,4.7,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-120-001","board",120,null,null,5.69,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-144-001","board",144,null,null,6.8,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-168-001","board",168,null,null,7.31,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-192-001","board",192,null,null,8.36,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x6","STB-ZERO-SPF-2X6-72-001","board",72,null,null,5.66,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x6","STB-ZERO-SPF-2X6-96-001","board",96,null,null,7.55,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x6","STB-ZERO-SPF-2X6-120-001","board",120,null,null,9.44,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x6","STB-ZERO-SPF-2X6-144-001","board",144,null,null,11.33,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x6","STB-ZERO-SPF-2X6-192-001","board",192,null,null,15.1,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x8","STB-ZERO-SPF-2X8-96-001","board",96,null,null,9.95,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x8","STB-ZERO-SPF-2X8-120-001","board",120,null,null,12.44,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x8","STB-ZERO-SPF-2X8-144-001","board",144,null,null,14.93,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x8","STB-ZERO-SPF-2X8-192-001","board",192,null,null,19.91,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["4x4","STB-ZERO-SPF-4X4-96-001","board",96,null,null,9.2,["CROSSCUT","MITER_LIMITED"],["D-001"]],
    ["4x4","STB-ZERO-SPF-4X4-120-001","board",120,null,null,11.5,["CROSSCUT","MITER_LIMITED"],["D-001"]],
    ["4x4","STB-ZERO-SPF-4X4-144-001","board",144,null,null,13.79,["CROSSCUT","MITER_LIMITED"],["D-001"]],
    ["1x4p","STB-ZERO-PINE-1X4-72-001","board",72,null,null,8.65,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x4p","STB-ZERO-PINE-1X4-96-001","board",96,null,null,11.54,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x4p","STB-ZERO-PINE-1X4-120-001","board",120,null,null,14.43,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x4p","STB-ZERO-PINE-1X4-144-001","board",144,null,null,17.3,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6p","STB-ZERO-PINE-1X6-72-001","board",72,null,null,15.74,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6p","STB-ZERO-PINE-1X6-96-001","board",96,null,null,20.99,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6p","STB-ZERO-PINE-1X6-120-001","board",120,null,null,26.24,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6p","STB-ZERO-PINE-1X6-144-001","board",144,null,null,31.48,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x4o","STB-ZERO-OAK-1X4-72-001","board",72,null,null,18.1,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x4o","STB-ZERO-OAK-1X4-96-001","board",96,null,null,24.14,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x4o","STB-ZERO-OAK-1X4-120-001","board",120,null,null,30.18,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x6o","STB-ZERO-OAK-1X6-72-001","board",72,null,null,26.24,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x6o","STB-ZERO-OAK-1X6-96-001","board",96,null,null,34.99,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x6o","STB-ZERO-OAK-1X6-120-001","board",120,null,null,43.73,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x8o","STB-ZERO-OAK-1X8-72-001","board",72,null,null,34.59,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x8o","STB-ZERO-OAK-1X8-96-001","board",96,null,null,46.12,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x8o","STB-ZERO-OAK-1X8-120-001","board",120,null,null,57.65,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x4c","STB-ZERO-CHR-1X4-72-001","board",72,null,null,28.97,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_END_PROFILE"],["D-001"]],
    ["1x4c","STB-ZERO-CHR-1X4-96-001","board",96,null,null,38.62,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_END_PROFILE"],["D-001"]],
    ["1x6c","STB-ZERO-CHR-1X6-72-001","board",72,null,null,41.98,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_END_PROFILE"],["D-001"]],
    ["1x6c","STB-ZERO-CHR-1X6-96-001","board",96,null,null,55.98,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","MILL_END_PROFILE"],["D-001"]],
    ["1x6w","STB-ZERO-POP-1X6-72-001","board",72,null,null,24.14,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6w","STB-ZERO-POP-1X6-96-001","board",96,null,null,32.18,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6w","STB-ZERO-POP-1X6-120-001","board",120,null,null,40.24,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6w","STB-ZERO-POP-1X6-144-001","board",144,null,null,48.28,["CROSSCUT","MITER_LIMITED","SPOT_ON_LOCATION","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["p25","STB-ZERO-PLY-025-48X48-001","sheet",null,48,48,8.47,["CROSSCUT","RIP"],["S-001"]],
    ["p25","STB-ZERO-PLY-025-48X96-001","sheet",null,48,96,14.61,["CROSSCUT","RIP","DADO"],["S-001"]],
    ["p38","STB-ZERO-PLY-038-48X48-001","sheet",null,48,48,11.09,["CROSSCUT","RIP"],["S-001"]],
    ["p38","STB-ZERO-PLY-038-48X96-001","sheet",null,48,96,19.12,["CROSSCUT","RIP","DADO","ROUTE_PROFILE","RETAIN_TABS"],["S-001"]],
    ["p50","STB-ZERO-PLY-050-48X96-001","sheet",null,48,96,26.55,["CROSSCUT","RIP","ROUTE_PROFILE","RETAIN_TABS"],["S-001"]],
    ["p63","STB-ZERO-PLY-063-48X96-001","sheet",null,48,96,50.28,["CROSSCUT","RIP","DADO","GROOVE","ROUTE_PROFILE","RETAIN_TABS"],["S-001"]],
    ["p75","STB-ZERO-PLY-075-48X48-001","sheet",null,48,48,33.54,["CROSSCUT","RIP"],["S-001"]],
    ["p75","STB-ZERO-PLY-075-48X96-001","sheet",null,48,96,57.82,["CROSSCUT","RIP","DADO","ROUTE_PROFILE","RETAIN_TABS"],["S-001"]],
    ["o75","STB-ZERO-OSB-075-48X96-001","sheet",null,48,96,28.46,["CROSSCUT","RIP"],["S-001"]]
  ]);

  var START_OWN_STORE_CATALOG = Object.freeze({
    repository:'GeorgePlattDemo/scan-to-build-store',
    file:'store-zero-catalog.json',
    pin:'f88ccaf9a2624899e255e66b51111e2b02309dad',
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
        offered:true
      };
    });
  }

  function materialFail(code, details){
    return Object.freeze({
      status:'UNRESOLVED',
      code:code,
      details:details || null,
      source:Object.freeze({
        repository:START_OWN_STORE_CATALOG.repository,
        file:START_OWN_STORE_CATALOG.file,
        pin:START_OWN_STORE_CATALOG.pin,
        clock:START_OWN_STORE_CATALOG.clock
      })
    });
  }

  function validPart(part){
    return part && Number.isFinite(Number(part.len)) && Number(part.len)>0 &&
      Number.isFinite(Number(part.wid)) && Number(part.wid)>0 &&
      Number.isFinite(Number(part.qty)) && Number(part.qty)>0;
  }

  function sheetYield(parentW,parentL,pieceW,pieceL){
    var a=Math.floor(parentW/pieceW)*Math.floor(parentL/pieceL);
    var b=Math.floor(parentW/pieceL)*Math.floor(parentL/pieceW);
    return Math.max(a,b);
  }

  function resolveStartOwnMaterial(input){
    input=input || {};
    var parts=Array.isArray(input.parts)?input.parts.map(function(part){
      return {name:String(part.name || ''),len:Number(part.len),wid:Number(part.wid),qty:Number(part.qty)};
    }):[];
    if(!parts.length || parts.some(function(part){return !validPart(part)})){
      return materialFail('INVALID_PART_DEMAND','Start Your Own requires positive length, width and quantity.');
    }
    var offerings=startOwnOfferings(input.sizeKey);
    if(!offerings.length){
      return materialFail('STORE_OFFERING_NOT_MAPPED','No Store Zero offering is mapped to this material choice.');
    }

    var candidates=[];
    offerings.forEach(function(offering){
      if(offering.offered!==true || !Number.isFinite(Number(offering.sellingPrice))) return;
      if(offering.form==='board'){
        var pieces=[];
        parts.forEach(function(part){
          for(var i=0;i<part.qty;i++) pieces.push(part.len);
        });
        if(pieces.some(function(len){return len>offering.stockL_in+0.0001})) return;
        var useHold=input.sequence==='CROSSCUT_HOLD' || input.holdPolicy===D001_HOLD.id;
        if(useHold){
          var sequenced=sequenceCrosscuts({parentLengthIn:offering.stockL_in, parts:pieces});
          if(sequenced.status!=='SEQUENCED') return;
          candidates.push({
            form:'board',storeSku:offering.storeSku,stockLengthIn:offering.stockL_in,
            quantity:sequenced.sticks,unitPrice:offering.sellingPrice,
            materialTotal:Math.round(sequenced.sticks*offering.sellingPrice*100)/100,
            cuts:sequenced.cuts,left:sequenced.remain,waste:sequenced.waste,
            holdIn:sequenced.holdIn,kerfIn:sequenced.kerfIn,
            sequenceStatus:sequenced.status,
            supportedOps:clone(offering.supportedOps || []),cellFamily:clone(offering.cellFamily || [])
          });
          return;
        }
        pieces.sort(function(a,b){return b-a});
        var left=[], cuts=[];
        pieces.forEach(function(len){
          var index=-1;
          for(var i=0;i<left.length;i++){
            if(left[i]>=len-0.0001){index=i;break;}
          }
          if(index<0){
            left.push(offering.stockL_in-len);
            cuts.push([len]);
          }else{
            left[index]-=len;
            cuts[index].push(len);
          }
        });
        candidates.push({
          form:'board',storeSku:offering.storeSku,stockLengthIn:offering.stockL_in,
          quantity:left.length,unitPrice:offering.sellingPrice,
          materialTotal:Math.round(left.length*offering.sellingPrice*100)/100,
          cuts:cuts,left:left,waste:left.reduce(function(sum,value){return sum+value},0),
          supportedOps:clone(offering.supportedOps || []),cellFamily:clone(offering.cellFamily || [])
        });
      }else if(offering.form==='sheet'){
        var total=0, ok=true;
        parts.forEach(function(part){
          var per=sheetYield(offering.sheetW_in,offering.sheetL_in,part.wid,part.len);
          if(!per){ok=false;return;}
          total+=Math.ceil(part.qty/per);
        });
        if(!ok || !total) return;
        candidates.push({
          form:'sheet',storeSku:offering.storeSku,sheetWIn:offering.sheetW_in,sheetLIn:offering.sheetL_in,
          parentLabel:offering.sheetW_in+' × '+offering.sheetL_in,quantity:total,
          unitPrice:offering.sellingPrice,materialTotal:Math.round(total*offering.sellingPrice*100)/100,
          supportedOps:clone(offering.supportedOps || []),cellFamily:clone(offering.cellFamily || [])
        });
      }
    });

    if(!candidates.length){
      return materialFail('STORE_STOCK_CONTAINMENT_UNRESOLVED','No mapped Store Zero parent offering contains the current part demand.');
    }
    candidates.sort(function(a,b){
      if(a.materialTotal!==b.materialTotal) return a.materialTotal-b.materialTotal;
      var al=a.stockLengthIn || a.sheetLIn || 0;
      var bl=b.stockLengthIn || b.sheetLIn || 0;
      return al-bl;
    });
    var selected=candidates[0];
    selected.status='MAPPED';
    selected.source={
      repository:START_OWN_STORE_CATALOG.repository,file:START_OWN_STORE_CATALOG.file,
      pin:START_OWN_STORE_CATALOG.pin,clock:START_OWN_STORE_CATALOG.clock
    };
    return Object.freeze(selected);
  }


  /*
   * USER 1 STORE-ISSUED REFERENCE
   *
   * This static Review build does not execute the Store runtime. It may present
   * only the exact Store answer already proven on the exact Store SHA below.
   * Any changed governing demand must go back through Store. No browser-side
   * pricing, capability, motion, cycle-time, or refusal calculation is allowed.
   */
  var USER1_STORE_REFERENCE = Object.freeze({
    status:'STORE_ISSUED_REFERENCE',
    source:Object.freeze({
      repository:'GeorgePlattDemo/scan-to-build-store',
      storePin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
      pricingFile:'store-zero-pricing-engine.mjs',
      travelFile:'d001-travel-standard.mjs',
      governingStandard:'DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md',
      workflowRun:'35791021805',
      systemIntegrationPin:'59a9c0326c1afea7af3767e1ed89bf6465a4b809'
    }),
    demand:Object.freeze({
      configurationId:'SYO-USER1-XBRACE',
      configurationVersion:'0.1',
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
        pin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
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
        version:'0.1.0',
        basis:'DECLARED_STAGE2_MODEL',
        measured:false,
        commissioned:false,
        T_job_min:1.4128
      }),
      totals:Object.freeze({
        material:2.61,
        hardware:0,
        machine_service:5.89,
        Q:8.50,
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
        inputHash:'f0918ff545e3d77d8d5ec33055d7279bb01dbe172bb4e6cc4d498469d66b2e82',
        resultHash:'2abe991dbd5331f7fa3762018fed9cc707b637d4512ba62f7fc8fe1e4e28587a'
      })
    })
  });

  var USER1_STORE_REFERENCE_18 = Object.freeze({
    status:'STORE_ISSUED_REFERENCE',
    source:Object.freeze({
      repository:'GeorgePlattDemo/scan-to-build-store',
      storePin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
      pricingFile:'store-zero-pricing-engine.mjs',
      travelFile:'d001-travel-standard.mjs',
      governingStandard:'DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md',
      workflowRun:'35791021805',
      systemIntegrationPin:'59a9c0326c1afea7af3767e1ed89bf6465a4b809',
      systemDiagnosticRun:'35791336322'
    }),
    demand:Object.freeze({
      configurationId:'SYO-USER1-XBRACE',
      configurationVersion:'0.2',
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
        pin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
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
        version:'0.1.0',
        basis:'DECLARED_STAGE2_MODEL',
        measured:false,
        commissioned:false,
        T_job_min:1.4151
      }),
      totals:Object.freeze({
        material:3.13,
        hardware:0,
        machine_service:5.90,
        Q:9.03,
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
        inputHash:'4b3b498d86177ed5a13c2662778f232b2c11cfafa7f626a689b3823b6872a4cc',
        resultHash:'59c9988c42ffd2520f6c1931d735a31e07848d72ac602182c510a17c20b89e88'
      })
    })
  });

  var USER1_STORE_REFERENCES = Object.freeze([USER1_STORE_REFERENCE,USER1_STORE_REFERENCE_18]);

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
        'This static Review build carries only the two tested 16-in and 18-in Store references. Intermediate geometry requires the live System Store endpoint.',
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

  function requestUser1StoreEvaluation(input, request){
    request=request || {};
    var requestId=String(request.requestId || '').trim();
    var currentStorePin=String(request.currentStorePin || '').trim();
    var checkedAt=String(request.checkedAt || new Date().toISOString());

    var reference=user1StoreReferenceForDemand(input);
    var expectedStorePin=reference?.source?.storePin || USER1_STORE_REFERENCE.source.storePin;

    if(!requestId){
      return unresolvedUser1StoreAnswer(
        'STORE_EVALUATION_REQUEST_ID_REQUIRED',
        ['STORE_EVALUATION_REQUEST_ID_REQUIRED'],
        'Every formal Store request requires a new request identity. A prior Store answer cannot authorize a new request.',
        null
      );
    }

    if(!currentStorePin){
      return unresolvedUser1StoreAnswer(
        'CURRENT_STORE_AUTHORITY_REQUIRED',
        ['CURRENT_STORE_AUTHORITY_REQUIRED'],
        'Current Store authority could not be verified. The prior Store answer remains history only.',
        Object.freeze({
          freshnessRule:'EVERY_STORE_REQUEST_REEVALUATES_CURRENT_STORE_STATE',
          mode:'STATIC_PIN_REVALIDATION',
          requestId:requestId,
          checkedAt:checkedAt,
          currentStorePin:null,
          referenceStorePin:expectedStorePin,
          currentStoreMatchesReference:false
        })
      );
    }

    var reference=user1StoreReferenceForDemand(input);
    var expectedStorePin=reference?.source?.storePin || USER1_STORE_REFERENCE.source.storePin;
    if(currentStorePin!==expectedStorePin){
      return unresolvedUser1StoreAnswer(
        'STORE_AUTHORITY_CHANGED',
        ['STORE_REFRESH_REQUIRED','STORE_AUTHORITY_CHANGED'],
        'Store authority changed after this reference answer was issued. This static Review build must obtain a newly evaluated Store answer before continuing.',
        Object.freeze({
          freshnessRule:'EVERY_STORE_REQUEST_REEVALUATES_CURRENT_STORE_STATE',
          mode:'STATIC_PIN_REVALIDATION',
          requestId:requestId,
          checkedAt:checkedAt,
          currentStorePin:currentStorePin,
          referenceStorePin:expectedStorePin,
          currentStoreMatchesReference:false
        })
      );
    }

    var answer=resolveUser1StoreReference(input);
    if(answer.complete!==true){
      return Object.freeze(Object.assign({}, answer, {
        freshEvaluation:false,
        evaluationReceipt:Object.freeze({
          freshnessRule:'EVERY_STORE_REQUEST_REEVALUATES_CURRENT_STORE_STATE',
          mode:'STATIC_PIN_REVALIDATION',
          requestId:requestId,
          checkedAt:checkedAt,
          currentStorePin:currentStorePin,
          referenceStorePin:answer.source?.storePin || USER1_STORE_REFERENCE.source.storePin,
          currentStoreMatchesReference:true
        })
      }));
    }

    return Object.freeze(Object.assign({}, answer, {
      status:'CURRENT_STORE_REFERENCE_REVALIDATED',
      freshEvaluation:true,
      evaluationReceipt:Object.freeze({
        freshnessRule:'EVERY_STORE_REQUEST_REEVALUATES_CURRENT_STORE_STATE',
        mode:'STATIC_PIN_REVALIDATION',
        requestId:requestId,
        checkedAt:checkedAt,
        currentStorePin:currentStorePin,
        referenceStorePin:answer.source?.storePin || USER1_STORE_REFERENCE.source.storePin,
        currentStoreMatchesReference:true,
        machineEnvelopeId:'D001-STAGE2-ENVELOPE-0.3',
        travelStandardId:'STB-D001-DIMENSIONAL-TRAVEL-0.1',
        travelStandardVersion:'0.1.0',
        economicsId:answer.estimate?.economics?.id || USER1_STORE_REFERENCE.estimate.economics.id,
        economicsVersion:answer.estimate?.economics?.version || USER1_STORE_REFERENCE.estimate.economics.version,
        calculationIdentity:answer.calculationIdentity || USER1_STORE_REFERENCE.estimate.calculationIdentity
      })
    }));
  }

  function sameUser1StoreAnswerIdentity(a,b){
    return !!a && !!b &&
      String(a.source?.storePin || '')===String(b.source?.storePin || '') &&
      String(a.calculationIdentity?.inputHash || '')===String(b.calculationIdentity?.inputHash || '') &&
      String(a.calculationIdentity?.resultHash || '')===String(b.calculationIdentity?.resultHash || '');
  }

  var D001_CYCLE = Object.freeze({
    model:'STB-D001-CYCLE-MODEL-S2-0.1',
    basis:'CALCULATED / MODELED',
    measured:false,
    jobSetupMin:8.0,
    loadSeatMin:0.6,
    releaseLabelMin:0.4,
    crosscutMin:0.2548,
    cutsPerStick:2
  });

  var D001_ENVELOPE = Object.freeze({
    id:'D001-BOARD-EDGE-MILL-REF-0.3',
    cutterDiameterIn:0.375,
    cuttingEdges:2,
    spindleRpm:18000,
    feedFormula:'feed_rate_ipm = chip_load_in_per_tooth × cutting_edges × spindle_rpm'
  });

  var D001_HOLD = Object.freeze({
    id:'D-HOLD-OPEN-0.1',
    basis:'DECLARED REFERENCE / UNMEASURED',
    holdIn:24,
    kerfIn:0.125,
    rule:'LAST_REMAIN_GE_HOLD',
    details:'Nearest manipulating-rotor center to blade plane. Last remain on a driven stick is at least holdIn. Not a cull/substitution rule.',
    cutoffParents:Object.freeze({
      twelveFoot:Object.freeze({sku:'STB-ZERO-SPF-2X4-144-001', stockL_in:144, sellingPrice:6.80}),
      sixteenFoot:Object.freeze({sku:'STB-ZERO-SPF-2X4-192-001', stockL_in:192, sellingPrice:8.36})
    })
  });

  function sequenceCrosscuts(input){
    input = input || {};
    var parent = Number(input.parentLengthIn);
    var hold = Number(input.holdIn == null ? D001_HOLD.holdIn : input.holdIn);
    var kerf = Number(input.kerfIn == null ? D001_HOLD.kerfIn : input.kerfIn);
    var parts = Array.isArray(input.parts) ? input.parts.map(Number).filter(function(len){return len>0}) : [];
    if(!Number.isFinite(parent) || parent<=0){
      return Object.freeze({status:'UNRESOLVED', code:'PARENT_LENGTH_INVALID', sticks:0, cuts:[], remain:[]});
    }
    if(!Number.isFinite(hold) || hold<=0){
      return Object.freeze({status:'UNRESOLVED', code:'HOLD_LENGTH_UNPUBLISHED', sticks:0, cuts:[], remain:[]});
    }
    if(parts.some(function(len){return len>parent+0.0001})){
      return Object.freeze({status:'UNRESOLVED', code:'PART_LONGER_THAN_PARENT', sticks:0, cuts:[], remain:[]});
    }
    var pieces=parts.slice().sort(function(a,b){return b-a});
    var usable=[], cuts=[], remain=[];
    pieces.forEach(function(len){
      var whole=len>=parent-0.0001;
      var need=whole?len:len+kerf;
      var index=-1;
      for(var i=0;i<usable.length;i++){
        if(!whole && usable[i]>=need-0.0001){index=i;break;}
      }
      if(index<0){
        var first=whole?parent:parent-hold;
        if(first<need-0.0001){
          usable.push(NaN);
          cuts.push(null);
          return;
        }
        usable.push(first-need);
        cuts.push([len]);
      }else{
        usable[index]-=need;
        cuts[index].push(len);
      }
    });
    if(cuts.some(function(row){return !row})){
      return Object.freeze({status:'UNRESOLVED', code:'LAST_REMAIN_BELOW_ROTOR_SAW_CENTER', sticks:0, cuts:[], remain:[], holdIn:hold, kerfIn:kerf});
    }
    remain=cuts.map(function(row){
      var used=row.reduce(function(sum,len){return sum+len;},0);
      var cutKerf=row.some(function(len){return len<parent-0.0001})?row.length*kerf:0;
      return Math.round((parent-used-cutKerf)*1000)/1000;
    });
    return Object.freeze({
      status:'SEQUENCED',
      code:null,
      holdIn:hold,
      kerfIn:kerf,
      parentLengthIn:parent,
      sticks:cuts.length,
      cuts:cuts,
      usableLeft:usable,
      remain:remain,
      waste:remain.reduce(function(sum,value){return sum+value},0)
    });
  }

  function sequenceDefinedWorkpiece(input){
    input=input || {};
    var workpiece=Number(input.definedWorkpieceLengthIn);
    var hold=Number(input.holdIn == null ? D001_HOLD.holdIn : input.holdIn);
    var kerf=Number(input.kerfIn == null ? D001_HOLD.kerfIn : input.kerfIn);
    var parts=Array.isArray(input.parts)
      ? input.parts.map(Number).filter(function(value){return Number.isFinite(value) && value>0;})
      : [];
    var establish=!!input.establishAngledEnd;

    if(!Number.isFinite(workpiece) || workpiece<=0){
      return Object.freeze({status:'UNRESOLVED',code:'DEFINED_WORKPIECE_INVALID'});
    }
    if(!Number.isFinite(hold) || hold<=0 || !Number.isFinite(kerf) || kerf<0){
      return Object.freeze({status:'UNRESOLVED',code:'CONTROL_OR_KERF_UNRESOLVED'});
    }
    if(workpiece<hold-1e-9){
      return Object.freeze({status:'UNRESOLVED',code:'DEFINED_WORKPIECE_BELOW_CONTROL_TAIL'});
    }

    var rows=[];
    var remaining=workpiece;
    if(establish){
      var establishAfter=roundN(remaining-kerf,6);
      rows.push(Object.freeze({
        kind:'ESTABLISH_ANGLE',
        retainedBeforeIn:remaining,
        retainedAfterIn:establishAfter,
        kerfIn:kerf,
        holdRequiredIn:hold,
        pass:establishAfter>=hold-1e-9
      }));
      remaining=establishAfter;
    }
    for(var i=0;i<parts.length;i++){
      var before=remaining;
      remaining=roundN(remaining-parts[i]-kerf,6);
      rows.push(Object.freeze({
        kind:'PART_CUTOFF',
        partIndex:i+1,
        partLengthIn:parts[i],
        retainedBeforeIn:before,
        retainedAfterIn:remaining,
        kerfIn:kerf,
        holdRequiredIn:hold,
        pass:remaining>=hold-1e-9
      }));
    }
    var failed=rows.find(function(row){return row.pass!==true});
    if(failed){
      return Object.freeze({
        status:'UNRESOLVED',
        code:'LAST_REMAIN_BELOW_ROTOR_SAW_CENTER',
        definedWorkpieceLengthIn:workpiece,
        production:Object.freeze(rows),
        finalRemainderIn:remaining,
        holdIn:hold,
        kerfIn:kerf
      });
    }
    return Object.freeze({
      status:'SEQUENCED',
      code:null,
      definedWorkpieceLengthIn:workpiece,
      production:Object.freeze(rows),
      finalRemainderIn:remaining,
      holdIn:hold,
      kerfIn:kerf
    });
  }

  var WINDOW_SEAT_RECOVERY = Object.freeze({
    id:'STB-STORE-ZERO-WINDOW-SEAT-RECOVERY-0.1',
    basis:'DECLARED REFERENCE / UNMEASURED',
    fixedReferenceFulfillment:365.0,
    cellConsumptionBaseline:60.0,
    pineBaselineCycleMin:56.159065,
    hardwareDefault:18.0,
    components:Object.freeze({
      materialHandlingFabrication:110.0,
      inspectLabelBundleStage:75.0,
      facilityAdminRework:70.0,
      serviceCommercialReserve:110.0
    }),
    species:Object.freeze({
      pine:Object.freeze({chipClass:'SOFT WOOD',chipLoadIpt:0.00675,feedInPerMin:243,wearFactor:1.00,sizeKey:'1x6p'}),
      poplar:Object.freeze({chipClass:'HARD WOOD',chipLoadIpt:0.00600,feedInPerMin:216,wearFactor:1.05,sizeKey:'1x6w'}),
      cherry:Object.freeze({chipClass:'HARD WOOD',chipLoadIpt:0.00600,feedInPerMin:216,wearFactor:1.10,sizeKey:'1x6c'}),
      oak:Object.freeze({chipClass:'HARD WOOD',chipLoadIpt:0.00600,feedInPerMin:216,wearFactor:1.15,sizeKey:'1x6o'})
    }),
    formula:'recovery = 425 × (modeled_cycle_minutes / 56.16) × species_wear_factor'
  });

  function money2(v){
    return Math.round(Number(v)*100)/100;
  }

  function quoteModeledRecovery(input){
    input = input || {};
    var speciesKey = String(input.species || 'pine');
    var prof = WINDOW_SEAT_RECOVERY.species[speciesKey] || WINDOW_SEAT_RECOVERY.species.pine;
    var sticks = Math.max(0, Number(input.sticks) || 0);
    var millMinutes = Math.max(0, Number(input.millMinutes) || 0);
    var material = money2(input.material || 0);
    var hardware = money2(input.hardware == null ? 0 : input.hardware);
    var C = D001_CYCLE, R = WINDOW_SEAT_RECOVERY;
    var otherMinutesRaw = sticks ? (C.jobSetupMin + sticks * (C.loadSeatMin + C.releaseLabelMin + C.cutsPerStick * C.crosscutMin)) : 0;
    var minutesRaw = sticks ? (otherMinutesRaw + millMinutes) : 0;
    var cycleFactor = sticks ? minutesRaw / R.pineBaselineCycleMin : 0;
    var scale = cycleFactor * prof.wearFactor;
    var cellConsumption = sticks ? money2(R.cellConsumptionBaseline * scale) : 0;
    var recovery = sticks ? money2((R.fixedReferenceFulfillment + R.cellConsumptionBaseline) * scale) : 0;
    var breakdown = Object.freeze({
      materialHandlingFabrication: money2(R.components.materialHandlingFabrication * scale),
      inspectLabelBundleStage: money2(R.components.inspectLabelBundleStage * scale),
      facilityAdminRework: money2(R.components.facilityAdminRework * scale),
      serviceCommercialReserve: money2(R.components.serviceCommercialReserve * scale)
    });
    var feed = money2(prof.chipLoadIpt * D001_ENVELOPE.cuttingEdges * D001_ENVELOPE.spindleRpm);
    return Object.freeze({
      status:'DECLARED_REFERENCE',
      complete:sticks>0,
      material:material,
      hardware:hardware,
      recovery:recovery,
      cellConsumption:cellConsumption,
      total:money2(material + recovery + hardware),
      sticks:sticks,
      millMinutes:money2(millMinutes),
      otherMinutes:money2(otherMinutesRaw),
      minutes:money2(minutesRaw),
      cycleFactor:cycleFactor,
      profile:Object.freeze({
        species:speciesKey,
        chipClass:prof.chipClass,
        chipLoadIpt:prof.chipLoadIpt,
        feedInPerMin:feed,
        wearFactor:prof.wearFactor,
        cutterDiameterIn:D001_ENVELOPE.cutterDiameterIn,
        cuttingEdges:D001_ENVELOPE.cuttingEdges,
        spindleRpm:D001_ENVELOPE.spindleRpm
      }),
      recoveryBreakdown:breakdown || R.components,
      cycle:C,
      envelope:D001_ENVELOPE,
      recoveryModel:R,
      formula:R.formula
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
    resolveStartOwnMaterial:resolveStartOwnMaterial,
    user1StoreReference:USER1_STORE_REFERENCE,
    user1StoreReferences:USER1_STORE_REFERENCES,
    user1StoreReferenceForDemand:user1StoreReferenceForDemand,
    user1StoreDemandMatchesReference:user1StoreDemandMatchesReference,
    resolveUser1StoreReference:resolveUser1StoreReference,
    requestUser1StoreEvaluation:requestUser1StoreEvaluation,
    sameUser1StoreAnswerIdentity:sameUser1StoreAnswerIdentity,
    d001Cycle:D001_CYCLE,
    d001Envelope:D001_ENVELOPE,
    d001Hold:D001_HOLD,
    sequenceCrosscuts:sequenceCrosscuts,
    sequenceDefinedWorkpiece:sequenceDefinedWorkpiece,
    windowSeatRecovery:WINDOW_SEAT_RECOVERY,
    quoteModeledRecovery:quoteModeledRecovery,
    comparisonDemand:comparisonDemand,
    createComparisonHandoff:createComparisonHandoff,
    storeDemandIdentity:storeDemandIdentity,
    sameStoreDemand:sameStoreDemand
  });
})(window);
