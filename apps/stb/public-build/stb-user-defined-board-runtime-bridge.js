(function(root){
  'use strict';

  // User 1's request shape only. Transport, the Store address (stb-store-runtime.json), the Store version
  // and every freshness check live in the shared stb-store-client.js.
  const REQUEST_TYPE = 'USER_DEFINED_BOARD_V1';
  const SCOPE = 'USER_DEFINED_BOARD_V1';
  const DEFINITION_KIND = 'user_defined_board.v1';
  const RULE_VERSION = '0.1';

  function canonicalInchString(value){
    if(typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError('canonical inch string requires a finite number');
    }
    const negative = value < 0 || Object.is(value,-0);
    const absolute = Math.abs(value);
    const parts = absolute.toFixed(12).split('.');
    const whole = parts[0].replace(/^0+(?=\d)/,'');
    const fraction = (parts[1] || '').replace(/0+$/,'');
    const digits = fraction ? whole+'.'+fraction : whole;
    if(digits === '0') return '0';
    return negative ? '-'+digits : digits;
  }

  function clone(value){
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function payloadFromDemand(demand){
    if(!demand || typeof demand !== 'object') throw new Error('USER_DEFINED_BOARD_DEMAND_REQUIRED');
    const spotCount = Number(demand.declaredSpotCount || 0);
    const spotDemand = spotCount > 0 ? {
      required:true,
      mode:'SPOT_ON_LOCATION',
      countPerPart:1,
      locationRule:'CENTERED_ON_PART',
      acrossWidthRule:'CENTERED_ON_WIDE_FACE',
      totalCount:spotCount
    } : null;
    return {
      line:{
        lineId:'SYO-USER1-XBRACE-LINE-1',
        configurationId:String(demand.configurationId || ''),
        configurationVersion:String(demand.configurationVersion || ''),
        materialDemand:{species:'spf',form:'board',nominalT:2,nominalW:4},
        quantity:1,
        unit:'ea',
        requiredOps:clone(demand.requiredOps || []),
        definedWorkpieceLength:{value:canonicalInchString(Number(demand.definedWorkpieceLengthIn)),unit:'in'},
        sawCuts:Number(demand.declaredSawCuts),
        sawAngleDeg:Number(demand.sawAngleDeg),
        drillCycles:0,
        drillDepthIn:null,
        cutPlane:demand.cutPlane == null ? null : String(demand.cutPlane),
        endIdentity:demand.endIdentity == null ? null : String(demand.endIdentity),
        endRelation:demand.endRelation == null ? null : String(demand.endRelation),
        lengthDatum:demand.lengthDatum == null ? null : String(demand.lengthDatum),
        datumCMethod:String(demand.datumCMethod || ''),
        parts:clone(demand.parts || []),
        spotDemand,
        unresolvedConditions:[],
        materialSource:'STORE_ZERO'
      },
      definitionKind:DEFINITION_KIND,
      ruleVersion:RULE_VERSION
    };
  }

  function signatureBody(payload){
    const line = payload.line;
    return ({
      definitionKind:payload.definitionKind,
      ruleVersion:payload.ruleVersion,
      requestType:REQUEST_TYPE,
      scope:SCOPE,
      lineId:line.lineId,
      configurationId:line.configurationId,
      configurationVersion:line.configurationVersion,
      materialDemand:line.materialDemand,
      quantity:line.quantity,
      unit:line.unit,
      requiredOps:line.requiredOps,
      definedWorkpieceLength:line.definedWorkpieceLength,
      sawCuts:line.sawCuts,
      sawAngleDeg:line.sawAngleDeg,
      drillCycles:line.drillCycles,
      drillDepthIn:line.drillDepthIn,
      cutPlane:line.cutPlane,
      endIdentity:line.endIdentity,
      endRelation:line.endRelation,
      lengthDatum:line.lengthDatum,
      datumCMethod:line.datumCMethod,
      parts:line.parts,
      spotDemand:line.spotDemand,
      unresolvedConditions:line.unresolvedConditions,
      materialSource:line.materialSource
    });
  }

  async function request(demand, options){
    options = options || {};
    const client = root.STBStoreClient;
    if(!client) throw new Error('STORE_CLIENT_UNAVAILABLE');
    const payload = payloadFromDemand(demand);
    return client.sendJob({
      projectId:'start-own',
      requestType:REQUEST_TYPE,
      requestId:options.requestId,
      candidateRevisionId:String(options.candidateRevisionId || demand.configurationVersion || crypto.randomUUID()),
      payload,
      signatureBody:signatureBody(payload),
      timeoutMs:20000
    });
  }

  root.STBUserDefinedBoardRuntimeBridge = Object.freeze({
    version:'0.2',
    requestType:REQUEST_TYPE,
    payloadFromDemand,
    request
  });
})(window);
