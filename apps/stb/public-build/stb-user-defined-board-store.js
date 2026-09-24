(function(root){
  "use strict";
  var DEFAULT_PRESENTATION = "WIDE_FACE_ON_TABLE_NARROW_EDGE_TO_FENCE";
  var EDGE_PRESENTATION = "NARROW_FACE_ON_TABLE_WIDE_FACE_TO_FENCE";
  var HOLD = 24;
  var KERF = 0.125;
  var OFFERINGS = [
    ["2x4","STB-ZERO-SPF-2X4-72-001",72,3.13,1.5,3.5],
    ["2x4","STB-ZERO-SPF-2X4-96-001",96,4.18,1.5,3.5],
    ["2x4","STB-ZERO-SPF-2X4-108-001",108,4.7,1.5,3.5],
    ["2x4","STB-ZERO-SPF-2X4-120-001",120,5.69,1.5,3.5],
    ["2x4","STB-ZERO-SPF-2X4-144-001",144,6.8,1.5,3.5],
    ["2x4","STB-ZERO-SPF-2X4-168-001",168,7.31,1.5,3.5],
    ["2x4","STB-ZERO-SPF-2X4-192-001",192,8.36,1.5,3.5],
    ["2x6","STB-ZERO-SPF-2X6-72-001",72,5.66,1.5,5.5],
    ["2x6","STB-ZERO-SPF-2X6-96-001",96,7.55,1.5,5.5],
    ["2x6","STB-ZERO-SPF-2X6-120-001",120,9.44,1.5,5.5],
    ["2x6","STB-ZERO-SPF-2X6-144-001",144,11.33,1.5,5.5],
    ["2x6","STB-ZERO-SPF-2X6-192-001",192,15.1,1.5,5.5],
    ["2x8","STB-ZERO-SPF-2X8-96-001",96,9.95,1.5,7.25],
    ["2x8","STB-ZERO-SPF-2X8-120-001",120,12.44,1.5,7.25],
    ["2x8","STB-ZERO-SPF-2X8-144-001",144,14.93,1.5,7.25],
    ["2x8","STB-ZERO-SPF-2X8-192-001",192,19.91,1.5,7.25],
    ["4x4","STB-ZERO-SPF-4X4-96-001",96,9.2,3.5,3.5],
    ["4x4","STB-ZERO-SPF-4X4-120-001",120,11.5,3.5,3.5],
    ["4x4","STB-ZERO-SPF-4X4-144-001",144,13.79,3.5,3.5]
  ].map(function(row){
    return {
      sizeKey:row[0], storeSku:row[1], stockL_in:row[2], sellingPrice:row[3],
      actualT:row[4], actualW:row[5], offered:true, form:"board",
      nominalT:Number(row[0].split("x")[0]), nominalW:Number(row[0].split("x")[1]),
      supportedOps:["CROSSCUT","MITER_LIMITED"]
    };
  });

  function sequenceCrosscuts(input){
    var parent = Number(input.parentLengthIn);
    var hold = Number(input.holdIn == null ? HOLD : input.holdIn);
    var kerf = Number(input.kerfIn == null ? KERF : input.kerfIn);
    var establish = !!input.establishAngledEnd;
    var pieces = (input.parts || []).map(Number).filter(function(len){return len > 0}).sort(function(a,b){return b-a});
    if(!Number.isFinite(parent) || parent <= 0 || !pieces.length){
      return {status:"UNRESOLVED", code:"INVALID_CUTOFF_SEQUENCE_INPUT", rows:[]};
    }
    var rows = [];
    for(var p = 0; p < pieces.length; p++){
      var len = pieces[p], selected = null;
      for(var r = 0; r < rows.length; r++){
        if(rows[r].remainingIn - len - kerf >= hold - 1e-9){ selected = rows[r]; break; }
      }
      if(!selected){
        var start = parent - (establish ? kerf : 0);
        if(start - len - kerf < hold - 1e-9){
          return {status:"UNRESOLVED", code:"LAST_REMAIN_BELOW_ROTOR_SAW_CENTER", holdIn:hold, parentLengthIn:parent, rows:rows};
        }
        selected = {parentLengthIn:parent, remainingIn:start, cuts:[]};
        rows.push(selected);
      }
      var before = selected.remainingIn;
      selected.remainingIn = Number((selected.remainingIn - len - kerf).toFixed(6));
      selected.cuts.push({
        partLengthIn:len, kerfIn:kerf,
        retainedBeforeIn:Number(before.toFixed(6)),
        retainedAfterIn:selected.remainingIn,
        holdRequiredIn:hold,
        pass:selected.remainingIn >= hold - 1e-9
      });
    }
    var minRetained = Math.min.apply(null, rows.flatMap(function(row){return row.cuts.map(function(cut){return cut.retainedAfterIn})}));
    return {
      status:"SEQUENCED", code:null, holdIn:hold, kerfIn:kerf, parentLengthIn:parent,
      sticks:rows.length, rows:rows, minRetainedAfterIn:minRetained
    };
  }

  function legality(sizeKey, finishedLengthIn, partQty, angleDeg){
    var rows = OFFERINGS.filter(function(item){return item.sizeKey === sizeKey});
    return rows.map(function(item){
      var sequence = sequenceCrosscuts({
        parentLengthIn:item.stockL_in,
        parts:Array.from({length:partQty}, function(){return finishedLengthIn}),
        establishAngledEnd:Number(angleDeg) !== 0
      });
      return {
        storeSku:item.storeSku,
        stockLengthIn:item.stockL_in,
        unitPrice:item.sellingPrice,
        legal:sequence.status === "SEQUENCED",
        oneStick:sequence.status === "SEQUENCED" && sequence.sticks === 1,
        sticks:sequence.sticks || 0,
        minRetainedAfterIn:sequence.minRetainedAfterIn || null,
        code:sequence.code || null
      };
    });
  }

  function evaluateUserDefinedBoardJob(spec){
    spec = spec || {};
    var sizeKey = String(spec.sizeKey || "");
    var finishedLengthIn = Number(spec.finishedLengthIn);
    var partQty = Number(spec.partQty);
    var angleDeg = Number(spec.angleDeg || 0);
    var cutPlane = String(spec.cutPlane || "");
    var endIdentity = String(spec.endIdentity || "");
    var endRelation = String(spec.endRelation || "");
    var lengthDatum = String(spec.lengthDatum || "");
    if(!sizeKey || !Number.isFinite(finishedLengthIn) || finishedLengthIn <= 0 || !Number.isInteger(partQty) || partQty <= 0){
      return {status:"UNRESOLVED", materialResolution:{status:"UNRESOLVED", code:"INVALID_PART_DEMAND"}};
    }
    if(endIdentity !== "both" || endRelation !== "parallel"){
      return {status:"UNRESOLVED", materialResolution:{status:"UNRESOLVED", code:"MATERIAL_NESTING_NOT_DECLARED_FOR_END_RELATION"}};
    }
    if(lengthDatum !== "long-long-outer-edge"){
      return {status:"UNRESOLVED", materialResolution:{status:"UNRESOLVED", code:"MATERIAL_NESTING_NOT_DECLARED_FOR_LENGTH_DATUM"}};
    }
    var presentation = cutPlane === "bevel-thickness" ? EDGE_PRESENTATION : DEFAULT_PRESENTATION;
    if(presentation === EDGE_PRESENTATION && sizeKey !== "2x4"){
      return {status:"REFUSED", capability:{status:"REFUSED", missing:["EDGE_PRESENTATION_RESERVED_FOR_NOMINAL_2X4"]}, workpiecePresentation:presentation};
    }
    var candidates = legality(sizeKey, finishedLengthIn, partQty, angleDeg).filter(function(row){return row.legal});
    if(!candidates.length){
      return {
        status:"UNRESOLVED",
        workpiecePresentation:presentation,
        parentLegality:legality(sizeKey, finishedLengthIn, partQty, angleDeg),
        materialResolution:{status:"UNRESOLVED", code:"LAST_REMAIN_BELOW_ROTOR_SAW_CENTER", holdIn:HOLD}
      };
    }
    candidates.sort(function(a,b){return a.unitPrice * a.sticks - b.unitPrice * b.sticks || a.stockLengthIn - b.stockLengthIn});
    var chosen = candidates[candidates.length - 1].stockLengthIn === 192 && candidates.some(function(row){return row.stockLengthIn === 192})
      ? candidates.filter(function(row){return row.stockLengthIn === 192})[0]
      : candidates[0];
    var prefer192 = candidates.filter(function(row){return row.stockLengthIn === 192})[0];
    if(prefer192) chosen = prefer192;
    var item = OFFERINGS.filter(function(row){return row.storeSku === chosen.storeSku})[0];
    var sequence = sequenceCrosscuts({
      parentLengthIn:item.stockL_in,
      parts:Array.from({length:partQty}, function(){return finishedLengthIn}),
      establishAngledEnd:angleDeg !== 0
    });
    var materialTotal=Math.round(sequence.sticks * item.sellingPrice * 100) / 100;
    var recovery = null;
    return {
      status:"SUPPORTABLE",
      stage:2,
      store:"Store Zero",
      jobType:"USER_DEFINED_BOARD_V1",
      workpiecePresentation:presentation,
      parentLegality:legality(sizeKey, finishedLengthIn, partQty, angleDeg),
      materialResolution:{
        status:"MAPPED",
        storeSku:item.storeSku,
        stockLengthIn:item.stockL_in,
        quantity:sequence.sticks,
        unitPrice:item.sellingPrice,
        materialTotal:materialTotal,
        sequence:sequence
      },
      capability:{status:"SUPPORTABLE", basis:"DECLARED_STAGE2_CAPABILITY"},
      estimate:{
        status: recovery==null ? "BUDGETARY_PARTIAL" : "REFERENCE",
        totals:{material:materialTotal, cell_recovery:recovery, Q: recovery==null?null:Math.round((materialTotal+recovery)*100)/100},
        economics:{status: recovery==null ? "UNRESOLVED_CLASS_SCOPED_RECOVERY" : "STB-STORE-ZERO-WINDOW-SEAT-RECOVERY-0.1"}
      },
      physicalExecutionAuthorized:false,
      storePin:"582afd22aef6a1909f2160957c58f6694351cac1"
    };
  }

  function previewFromDemand(demand){
    if(!demand) return {answer:null, diagnostic:"NO_PHYSICAL_DEMAND"};
    var job = evaluateUserDefinedBoardJob(demand);
    return {
      childDefinitionKey:null,
      answer:{
        rawEvaluation:job,
        physicalExecutionAuthorized:false,
        storePin:job.storePin || null
      },
      diagnostic:job.status === "SUPPORTABLE" ? null : (job.materialResolution && job.materialResolution.code) || job.status
    };
  }

  root.STBUserDefinedBoardStore = Object.freeze({
    version:"0.1",
    storePin:"582afd22aef6a1909f2160957c58f6694351cac1",
    holdIn:HOLD,
    kerfIn:KERF,
    sequenceCrosscuts:sequenceCrosscuts,
    evaluateUserDefinedBoardJob:evaluateUserDefinedBoardJob,
    previewFromDemand:previewFromDemand,
    legality:legality
  });
})(window);
