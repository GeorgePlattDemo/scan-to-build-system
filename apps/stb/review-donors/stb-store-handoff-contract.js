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
    startOwn: Object.freeze({projectId:'start-own', artifact:'stb-start-own-0.11.html', projectClass:'USER_DEFINED_BOARD'}),
    outdoor: Object.freeze({projectId:'outdoor-build', artifact:'stb-outdoor-build.html', projectClass:'BOUNDED_SOURCE_BACKED'}),
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
      materialCatalogPin:'4402abeb6b0299a5b6db2eec85ed04c3b0236bcc',
      capabilityBasis:'D001-BOARD-EDGE-MILL-REF-0.3',
      capabilityPin:'f88ec61c42446755d00259f88e7fd09f2702fd92',
      economicsModel:'STB-STORE-ZERO-WINDOW-SEAT-RECOVERY-0.1',
      economicsStatus:'DECLARED_REFERENCE',
      economicsPin:'f88ec61c42446755d00259f88e7fd09f2702fd92',
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
    ["2x4","STB-ZERO-SPF-2X4-72-001","board",72,null,null,3.13,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-96-001","board",96,null,null,4.18,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-108-001","board",108,null,null,4.7,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-120-001","board",120,null,null,5.69,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-144-001","board",144,null,null,6.8,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-168-001","board",168,null,null,7.31,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x4","STB-ZERO-SPF-2X4-192-001","board",192,null,null,8.36,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x6","STB-ZERO-SPF-2X6-72-001","board",72,null,null,5.66,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x6","STB-ZERO-SPF-2X6-96-001","board",96,null,null,7.55,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x6","STB-ZERO-SPF-2X6-120-001","board",120,null,null,9.44,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x6","STB-ZERO-SPF-2X6-144-001","board",144,null,null,11.33,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x6","STB-ZERO-SPF-2X6-192-001","board",192,null,null,15.1,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x8","STB-ZERO-SPF-2X8-96-001","board",96,null,null,9.95,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x8","STB-ZERO-SPF-2X8-120-001","board",120,null,null,12.44,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x8","STB-ZERO-SPF-2X8-144-001","board",144,null,null,14.93,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["2x8","STB-ZERO-SPF-2X8-192-001","board",192,null,null,19.91,["CROSSCUT","MITER_LIMITED","DRILL","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["4x4","STB-ZERO-SPF-4X4-96-001","board",96,null,null,9.2,["CROSSCUT","MITER_LIMITED"],["D-001"]],
    ["4x4","STB-ZERO-SPF-4X4-120-001","board",120,null,null,11.5,["CROSSCUT","MITER_LIMITED"],["D-001"]],
    ["4x4","STB-ZERO-SPF-4X4-144-001","board",144,null,null,13.79,["CROSSCUT","MITER_LIMITED"],["D-001"]],
    ["1x4p","STB-ZERO-PINE-1X4-72-001","board",72,null,null,8.65,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x4p","STB-ZERO-PINE-1X4-96-001","board",96,null,null,11.54,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x4p","STB-ZERO-PINE-1X4-120-001","board",120,null,null,14.43,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x4p","STB-ZERO-PINE-1X4-144-001","board",144,null,null,17.3,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6p","STB-ZERO-PINE-1X6-72-001","board",72,null,null,15.74,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6p","STB-ZERO-PINE-1X6-96-001","board",96,null,null,20.99,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6p","STB-ZERO-PINE-1X6-120-001","board",120,null,null,26.24,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6p","STB-ZERO-PINE-1X6-144-001","board",144,null,null,31.48,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x4o","STB-ZERO-OAK-1X4-72-001","board",72,null,null,18.1,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x4o","STB-ZERO-OAK-1X4-96-001","board",96,null,null,24.14,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x4o","STB-ZERO-OAK-1X4-120-001","board",120,null,null,30.18,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x6o","STB-ZERO-OAK-1X6-72-001","board",72,null,null,26.24,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x6o","STB-ZERO-OAK-1X6-96-001","board",96,null,null,34.99,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x6o","STB-ZERO-OAK-1X6-120-001","board",120,null,null,43.73,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x8o","STB-ZERO-OAK-1X8-72-001","board",72,null,null,34.59,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x8o","STB-ZERO-OAK-1X8-96-001","board",96,null,null,46.12,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x8o","STB-ZERO-OAK-1X8-120-001","board",120,null,null,57.65,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","MILL_END_PROFILE"],["D-001"]],
    ["1x4c","STB-ZERO-CHR-1X4-72-001","board",72,null,null,28.97,["CROSSCUT","MITER_LIMITED","DRILL","MILL_END_PROFILE"],["D-001"]],
    ["1x4c","STB-ZERO-CHR-1X4-96-001","board",96,null,null,38.62,["CROSSCUT","MITER_LIMITED","DRILL","MILL_END_PROFILE"],["D-001"]],
    ["1x6c","STB-ZERO-CHR-1X6-72-001","board",72,null,null,41.98,["CROSSCUT","MITER_LIMITED","DRILL","MILL_END_PROFILE"],["D-001"]],
    ["1x6c","STB-ZERO-CHR-1X6-96-001","board",96,null,null,55.98,["CROSSCUT","MITER_LIMITED","DRILL","MILL_END_PROFILE"],["D-001"]],
    ["1x6w","STB-ZERO-POP-1X6-72-001","board",72,null,null,24.14,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6w","STB-ZERO-POP-1X6-96-001","board",96,null,null,32.18,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6w","STB-ZERO-POP-1X6-120-001","board",120,null,null,40.24,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
    ["1x6w","STB-ZERO-POP-1X6-144-001","board",144,null,null,48.28,["CROSSCUT","MITER_LIMITED","DRILL","DADO","GROOVE","RABBET","MILL_LONGITUDINAL_PROFILE","MILL_END_PROFILE"],["D-001"]],
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
    pin:'4402abeb6b0299a5b6db2eec85ed04c3b0236bcc',
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
    return Object.freeze({
      materialDemand: Object.freeze({stockClass:String(part.stockClass || '')}),
      operationDemand: Object.freeze([
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
      ]),
      quantity:Number(part.quantity),
      requiredGeometryDatumFacts:Object.freeze({
        finishedLength:Number(part.finishedLength),
        endCondition:String(part.endCondition || ''),
        angleDegrees:Number(part.angleDegrees),
        angleReference:String(part.angleReference || ''),
        cutPlane:String(part.cutPlane || ''),
        endIdentity:String(part.endIdentity || ''),
        endRelation:String(part.endRelation || ''),
        lengthDatum:String(part.lengthDatum || '')
      })
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
    version:'0.5',
    actorOrder:ACTOR_ORDER,
    currentArtifacts:CURRENT_ARTIFACTS,
    storeAuthorities:STORE_AUTHORITIES,
    storeAuthority:storeAuthority,
    startOwnStoreCatalog:START_OWN_STORE_CATALOG,
    startOwnOfferings:startOwnOfferings,
    resolveStartOwnMaterial:resolveStartOwnMaterial,
    d001Cycle:D001_CYCLE,
    d001Envelope:D001_ENVELOPE,
    windowSeatRecovery:WINDOW_SEAT_RECOVERY,
    quoteModeledRecovery:quoteModeledRecovery,
    comparisonDemand:comparisonDemand,
    createComparisonHandoff:createComparisonHandoff,
    storeDemandIdentity:storeDemandIdentity,
    sameStoreDemand:sameStoreDemand
  });
})(window);
